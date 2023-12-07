/* eslint-disable @typescript-eslint/no-explicit-any */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import {ElasticsearchServiceClient, DescribeElasticsearchDomainCommand}
  from '@aws-sdk/client-elasticsearch-service';
import AwsService from './aws.service';

export interface Settings {
  hostname: string;
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  arn: string | undefined;
}

const MONITORS_URL = 'https://raw.githubusercontent.com/bcgov-nr/nr-funbucks/main/monitor/monitors.json';
const MONITORS_FILE = path.resolve(__dirname, 'agent-monitor.json');

export default class OpenSearchSyncService extends AwsService {
  public async getDomain(settings: Settings): Promise<any> {
    const client = new ElasticsearchServiceClient(this.configureClientProxy({region: settings.region}));
    return await this.waitForDomainStatusReady(client, settings.domainName);
  }

  public async syncComponentTemplates(settings: Settings): Promise<any> {
    await Promise.all([
      this.syncEcsComponentTemplates(settings, '8.4'),
      this.syncEcsComponentTemplates(settings, '8.9'),
      this.syncNrmEcsComponentTemplates(settings),
    ]);

    await this.syncIndexTemplates(settings);
  }

  public async syncEcsComponentTemplates(settings: Settings, version: string): Promise<any> {
    const componentDir = path.resolve(__dirname, `../../configuration-opensearch/ecs_${version}`);
    for (const filePath of fs.readdirSync(componentDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      // Read ECS file
      // Replaces match_only_text with text as OpenSearch does not support it.
      const text = fs.readFileSync(path.resolve(componentDir, filePath), {encoding: 'utf8'})
        .replace(/match\_only\_text/g, 'text')
        .replace(/wildcard/g, 'keyword')
        .replace(/constant_keyword/g, 'keyword')
        .replace(/flattened/g, 'flat_object');

      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: text,
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_component_template/ecs_${basename}_${version}`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        .then((res) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`[${res.statusCode}] Component Template Loaded - ecs_${basename}_${version}`);
        });
    }
  }

  public async syncNrmEcsComponentTemplates(settings: Settings): Promise<any> {
    const componentDir = path.resolve(__dirname, '../../configuration-opensearch/ecs_nrm_1.0');
    for (const filePath of fs.readdirSync(componentDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: fs.readFileSync(path.resolve(componentDir, filePath), {encoding: 'utf8'}),
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_component_template/ecs_nrm_${basename}_1.0`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .then((res) => console.log(`[${res.statusCode}] Component Template Loaded - ecs_nrm_${basename}_1.0`));
    }
  }

  public async syncIndexTemplates(settings: Settings): Promise<any> {
    const templateDir = path.resolve(__dirname, '../../configuration-opensearch/index_template');
    for (const filePath of fs.readdirSync(templateDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');
      await this.executeSignedHttpRequest({
        method: 'PUT',
        body: fs.readFileSync(path.resolve(templateDir, filePath), {encoding: 'utf8'}),
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_index_template/nrm_${basename}`,
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        .then((res) => console.log(`[${res.statusCode}] Index Template Loaded - nrm_${basename}`));
    }
  }

  public async syncStateManagementPolicy(settings: Settings): Promise<any> {
    const templateDir = path.resolve(__dirname, '../../configuration-opensearch/state_management_policy');
    for (const filePath of fs.readdirSync(templateDir)) {
      if (!filePath.endsWith('.json')) {
        continue;
      }
      const basename = path.basename(filePath, '.json');

      const existing = await this.executeSignedHttpRequest({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_plugins/_ism/policies/${basename}`,
      }).then((res) => this.waitAndReturnResponseBody(res, [404]));

      if (existing.statusCode === 404) {
        // Create
        await this.executeSignedHttpRequest({
          method: 'PUT',
          body: fs.readFileSync(path.resolve(templateDir, filePath), {encoding: 'utf8'}),
          headers: {
            'Content-Type': 'application/json',
            'host': settings.hostname,
          },
          hostname: settings.hostname,
          path: `/_plugins/_ism/policies/${basename}`,
        })
          .then((res) => this.waitAndReturnResponseBody(res))
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          .then((res) => console.log(`[${res.statusCode}] State Management Policy Added - ${basename}`));
      } else {
        // Update
        const bodyJson = JSON.parse(existing.body);
        await this.executeSignedHttpRequest({
          method: 'PUT',
          body: fs.readFileSync(path.resolve(templateDir, filePath), {encoding: 'utf8'}),
          headers: {
            'Content-Type': 'application/json',
            'host': settings.hostname,
          },
          hostname: settings.hostname,
          path: `/_plugins/_ism/policies/${basename}`,
          query: {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            if_seq_no: `${bodyJson._seq_no}`,
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            if_primary_term: `${bodyJson._primary_term}`,
          },
        })
          .then((res) => this.waitAndReturnResponseBody(res))
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          .then((res) => console.log(`[${res.statusCode}] State Management Policy Update - ${basename}`));
      }
    }
  }

  public async syncMonitors(settings: Settings): Promise<any> {
    const monitors = (await axios.get(MONITORS_URL)).data;
    console.log(monitors);

    for (const monitor of monitors) {
      const existing = await this.executeSignedHttpRequest({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'host': settings.hostname,
        },
        hostname: settings.hostname,
        path: '/_plugins/_alerting/monitors/_search',
        body: JSON.stringify({
          'query': {
            'match': {
              'monitor.name': monitor.name,
            },
          },
        }),
      }).then((res) => this.waitAndReturnResponseBody(res, [404]));

      const body = JSON.parse(existing.body);
      console.log(body);
      const monitorJson = JSON.parse(fs.readFileSync(MONITORS_FILE, {encoding: 'utf8'}));
      monitorJson.name = monitor.name;
      monitorJson.inputs[0].search.query.query.bool.filter[1].term['host.hostname'].value = monitor.server;
      monitorJson.inputs[0].search.query.query.bool.filter[2].term['agent.name'].value = monitor.agent;
      monitorJson.triggers[0].query_level_trigger.id = monitors.query_level_trigger_id;
      monitorJson.triggers[0].query_level_trigger.name =
        `No logs from server ${monitor.server}, agent ${monitor.agent}`;
      monitorJson.triggers[0].query_level_trigger.actions[0].id = monitor.teams_channel_action_id;
      monitorJson.triggers[0].query_level_trigger.actions[0].destination_id = '031jXoEBrs4PMVtpxqUP';
      monitorJson.triggers[0].query_level_trigger.actions[1].id = monitor.automation_queue_action_id;
      monitorJson.triggers[0].query_level_trigger.actions[1].destination_id = 'JOSvT4EBMZyC3ZT-Xubu';
      // eslint-disable-next-line max-len
      monitorJson.triggers[0].query_level_trigger.actions[1].message_template.source = `{ \"type\": \"agent_down\", \"server\": \"${monitor.server}\", \"agent\": \"${monitor.agent}\", \"periodStart\": \"{{ctx.periodStart}}\", \"periodEnd\": \"{{ctx.periodEnd}}\" }`;

      // console.log(JSON.stringify(monitorJson));

      if (body.hits.total.value === 0) {
        // Add
        // POST _plugins/_alerting/monitors
        console.log(`Add monitor: ${monitor.name}`);
        await this.executeSignedHttpRequest({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'host': settings.hostname,
          },
          hostname: settings.hostname,
          path: '/_plugins/_alerting/monitors',
          body: JSON.stringify(monitorJson),
        }).then((res) => this.waitAndReturnResponseBody(res, [404]));
      } else {
        // Update
        // PUT _plugins/_alerting/monitors/<monitor_id>
        console.log(`Update monitor: ${monitor.name} /_plugins/_alerting/monitors/${body.hits.hits[0]._id}`);
        await this.executeSignedHttpRequest({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'host': settings.hostname,
          },
          hostname: settings.hostname,
          path: `/_plugins/_alerting/monitors/${body.hits.hits[0]._id}`,
          body: JSON.stringify(monitorJson),
        }).then((res) => this.waitAndReturnResponseBody(res, [404]));
      }
    }
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
