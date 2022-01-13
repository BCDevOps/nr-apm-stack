/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs';
import * as path from 'path';
import {HttpRequest} from '@aws-sdk/protocol-http';
import {Sha256} from '@aws-crypto/sha256-js';
import {defaultProvider} from '@aws-sdk/credential-provider-node';
import {SignatureV4} from '@aws-sdk/signature-v4';
import {NodeHttpHandler} from '@aws-sdk/node-http-handler';
import {STSClient, AssumeRoleCommand} from '@aws-sdk/client-sts';
import {ElasticsearchServiceClient, DescribeElasticsearchDomainCommand, UpdateElasticsearchDomainConfigCommand}
  from '@aws-sdk/client-elasticsearch-service';

export interface settings {
  hostname: string;
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  arn: string | undefined;
}

export default class OpenSearchSyncService {
  private identityAssumed = false;

  /**
   * Assume the identity required to make OpenSearch API requests
   * @param settings
   */
  public async assumeIdentity(settings: settings): Promise<void> {
    if (!this.identityAssumed && settings.arn) {
      const stsClient1 = new STSClient({region: settings.region});
      const stsAssumeRoleCommand = new AssumeRoleCommand({
        RoleArn: settings.arn,
        RoleSessionName: 'nrdk',
      });
      const stsAssumedRole = await stsClient1.send(stsAssumeRoleCommand);
      if (stsAssumedRole && stsAssumedRole.Credentials) {
        // Overwrite the environment variables so later requests use assumed identity
        process.env.AWS_ACCESS_KEY_ID = stsAssumedRole.Credentials.AccessKeyId;
        process.env.AWS_SECRET_ACCESS_KEY = stsAssumedRole.Credentials.SecretAccessKey;
        process.env.AWS_SESSION_TOKEN = stsAssumedRole.Credentials.SessionToken;
        this.identityAssumed = true;
        console.log('Identity assumed');
      }
    }
  }

  public async getDomain(settings: settings): Promise<any> {
    const client = new ElasticsearchServiceClient({region: settings.region});
    return await this.waitForDomainStatusReady(client, settings.domainName);
  }

  public async syncComponentTemplates(settings: settings): Promise<any> {
    const componentDir = path.resolve(__dirname, '../../configuration-opensearch/ecs_1.12');
    for (const filePath of fs.readdirSync(componentDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      await this.executeSignedHttpRequest({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_component_template/ecs_${basename}.json_1.12`,
      });
      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: fs.readFileSync(path.resolve(componentDir, filePath), {encoding: 'utf8'}),
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_component_template/ecs_${basename}_1.12`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        .then(() => console.log(`Component Template Loaded - ${basename}`));
    }
  }

  public async syncIndexTemplates(hostname: string): Promise<void> {
    const indexTemplateFile = path.resolve(__dirname, '../../configurations/index-template/logs-access.json');
    const indexTemplateName = path.basename(indexTemplateFile, '.json');

    await this.executeSignedHttpRequest({
      method: 'POST',
      body: fs.readFileSync(indexTemplateFile, {encoding: 'utf8'}),
      headers: {
        'Content-Type': 'application/json',
        'host': hostname,
      },
      hostname,
      path: `/_template/${indexTemplateName}`,
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then(() => console.log(`Index Template Loaded - ${indexTemplateName}`));
  }

  private async createSignedHttpRequest(httpRequestParams: any) {
    const httpRequest = new HttpRequest(httpRequestParams);
    const sigV4Init = {
      credentials: defaultProvider(),
      region: process.env.AWS_DEFAULT_REGION || 'ca-central-1',
      service: 'es',
      sha256: Sha256,
    };
    const signer = new SignatureV4(sigV4Init);
    return signer.sign(httpRequest);
  }

  private async executeSignedHttpRequest(httpRequestParams: any) {
    const signedHttpRequest = await this.createSignedHttpRequest(httpRequestParams);
    const nodeHttpHandler = new NodeHttpHandler();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return nodeHttpHandler.handle(signedHttpRequest as any);
  }

  private async waitAndReturnResponseBody(res: any) {
    return new Promise((resolve, reject) => {
      const incomingMessage = res.response.body;
      let body = '';
      incomingMessage.on('data', (chunk: any) => {
        body += chunk;
      });
      incomingMessage.on('end', () => {
        resolve({statusCode: res.response.statusCode, body});
      });
      incomingMessage.on('error', (err: any) => {
        reject(err);
      });
    });
  }

  private async describeDomain(client: ElasticsearchServiceClient, domainName: string): Promise<any> {
    const cmdParams = {DomainName: domainName};
    const cmd = new DescribeElasticsearchDomainCommand(cmdParams);
    try {
      const domainConfig = await client.send(cmd);
      return domainConfig;
    } catch (error) {
      if ((error as any).name === 'ResourceNotFoundException') return null;
      if ((error as any).errno === 'ENOTFOUND' && (error as any).syscall === 'getaddrinfo') {
        return this.describeDomain(client, domainName);
      }
      console.dir(error, {depth: 5});
    }
  }

  private async waitForDomainStatusReady(client: ElasticsearchServiceClient, domainName: string): Promise<any> {
    let cmdOutput = await this.describeDomain(client, domainName);
    while (cmdOutput.DomainStatus.Processing === true || !cmdOutput.DomainStatus.Endpoint) {
      await new Promise((r) => setTimeout(r, 5000));
      console.dir(cmdOutput);
      cmdOutput = await this.describeDomain(client, domainName);
    }
    return cmdOutput;
  }
}
