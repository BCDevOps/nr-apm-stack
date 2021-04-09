'use strict';
/**
 * References:
 *  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-elasticsearch-service/classes/createelasticsearchdomaincommand.html
 *  - https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-elasticsearch-service/globals.html#createelasticsearchdomaincommandinput
 *  - How to send signed AWS Elasticsearch request? - https://github.com/aws/aws-sdk-js-v3/issues/2099
 */


const { ElasticsearchServiceClient, CreateElasticsearchDomainCommand, DescribeElasticsearchDomainCommand, UpdateElasticsearchDomainConfigCommand} = require.main.require("@aws-sdk/client-elasticsearch-service")
const KcAdminClient = require.main.require('keycloak-admin').default
const FormData = require.main.require("form-data");

const BasicDeployer = require.main.exports.BasicDeployer
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');



async function describeDomain(client, domainName){
  const cmdParams= {DomainName:domainName}
  const cmd = new DescribeElasticsearchDomainCommand(cmdParams);
  try{
    const domainConfig = await client.send(cmd);
    return domainConfig
  }catch(error){
    if (error.name === 'ResourceNotFoundException') return null
    if (error.errno === 'ENOTFOUND' && error.syscall === 'getaddrinfo') return describeDomain(client, domainName)
    console.dir(error, {depth:5})
  }  
}

async function waitForDomainStatusReady(client, domainName){
  let cmdOutput = await describeDomain(client, domainName);
  while (cmdOutput.DomainStatus.Processing === true || !cmdOutput.DomainStatus.Endpoint) {
    await new Promise(r => setTimeout(r, 5000));
    console.dir(cmdOutput)
    cmdOutput = await describeDomain(client, domainName);
  }
  return cmdOutput
}

async function createSignedHttpRequest(httpRequestParams) {
  const { HttpRequest } = require.main.require("@aws-sdk/protocol-http")
  const { Sha256 } = require.main.require("@aws-crypto/sha256-js")
  const { defaultProvider } = require.main.require("@aws-sdk/credential-provider-node");
  const { SignatureV4 } = require.main.require("@aws-sdk/signature-v4");

  const httpRequest = new HttpRequest(httpRequestParams);
  const sigV4Init = {
    credentials: defaultProvider(),
    region: process.env.AWS_DEFAULT_REGION  || 'ca-central-1',
    service: 'es',
    sha256: Sha256,
  }
  const signer = new SignatureV4(sigV4Init);
  return signer.sign(httpRequest);
}

async function executeSignedHttpRequest(httpRequestParams) {
  const signedHttpRequest = await createSignedHttpRequest(httpRequestParams)
  const { NodeHttpHandler } = require.main.require("@aws-sdk/node-http-handler")
  const nodeHttpHandler = new NodeHttpHandler();
  return nodeHttpHandler.handle(signedHttpRequest);
}

async function waitAndReturnStatusCode(res) {
  return new Promise((resolve, reject) => {
    resolve({statusCode:res.response.statusCode})
  });
}

async function waitAndReturnResponseBody(res) {
  return new Promise((resolve, reject) => {
    const incomingMessage = res.response.body;
    let body = "";
    incomingMessage.on("data", (chunk) => {
      body += chunk;
    });
    incomingMessage.on("end", (a1, a2) => {
      resolve({statusCode: res.response.statusCode, body:body});
    });
    incomingMessage.on("error", (err) => {
      reject(err);
    });
  });
}

const MyDeployer = class extends BasicDeployer {
  #stsCallerIdentity = null;
  async deployElasticSearchDomain() {
    const settings = this.settings
    const phases = settings.phases
    const phase = phases[settings.phase]
    const client = new ElasticsearchServiceClient({ region: "ca-central-1" });
    const domainName = `${phase.name}${phase.suffix}`
    const createCmdParams = require('../aws-elasticsearch-domain-config').process({DomainName:domainName, stsCallerIdentity: this.#stsCallerIdentity})
    // SAML options CANNOT be defined when creating a domain, so we remove it to be used by the creation call
    const samlOptions = createCmdParams.AdvancedSecurityOptions.SAMLOptions
    delete createCmdParams.AdvancedSecurityOptions.SAMLOptions
    // check if domain already exists if the provided name
    let domainConfig = await describeDomain(client, createCmdParams.DomainName)
    if (!domainConfig){
      // if a domain doesn't exist with the same name, create one
      const createCmd = new CreateElasticsearchDomainCommand(createCmdParams);
      domainConfig = (await client.send(createCmd))
    }
    // wait for domain to be up and ready
    await waitForDomainStatusReady(client, domainName)
    // update domain configuration
    const updateCmdParams = {DomainName:domainName, AdvancedSecurityOptions:{SAMLOptions:samlOptions}}
    const updateCmd = new UpdateElasticsearchDomainConfigCommand(updateCmdParams)
    domainConfig = (await client.send(updateCmd))
    return await waitForDomainStatusReady(client, domainName)
  }

  async deployKeycloakClientUsingAdmin(endpoint) {
    const settings = this.settings
    const phases = settings.phases
    const phase = phases[settings.phase]

    const keycloakClientConfig = require('../keycloak-client-config').process({endpoint:endpoint})
    let clientId = keycloakClientConfig.clientId
    const roles = keycloakClientConfig.roles
    delete keycloakClientConfig.roles
    const kcAdminClient = new KcAdminClient({baseUrl:phase.keycloak.baseURL, realmName:phase.keycloak.realmName});
    await kcAdminClient.auth({clientId: phase.keycloak.clientId, clientSecret: phase.keycloak.clientSecret, grantType: 'client_credentials'})
    
    // Look for a client with the defined clientId
    let keycloakRealmClients = await kcAdminClient.clients.find({clientId:clientId, max: 2});
    if (keycloakRealmClients.length === 0 ) {
      // Create a client if one is not found
      console.log(`Creating keycloak client: ${clientId}`)
      await kcAdminClient.clients.create({clientId})
      keycloakRealmClients = await kcAdminClient.clients.find({clientId:clientId, max: 2});
    }

    // Update the client
    const {id: clientUniqueId} = keycloakRealmClients[0];
    await kcAdminClient.clients.update(
      {id: clientUniqueId},
      keycloakClientConfig,
    );
    // Lookup client roles
    const kcExistingroles = await kcAdminClient.clients.listRoles({id:clientUniqueId,});
    // Create any missing client role
    for (const role of roles) {
      const index = kcExistingroles.findIndex(element => element.name === role.name)
      if (index >= 0){
        kcExistingroles.splice(index, 1)
      } else {
        console.log(`Creating role ${role.name}`)
        await kcAdminClient.clients.createRole({id: clientUniqueId, ...role});
      }
    }
    // Whatever roles are left, delete them (we don't want things that are not documented)
    // TODO: we may make exceptions to roles ending with '-developers' as those may be managed outside
    for (const role of kcExistingroles) {
      console.log(`Deleting role ${role.name}`)
      await kcAdminClient.clients.delRole({id: clientUniqueId,roleName: role.name});
    }
  }
  async configureElasticSearch(hostname){
    await executeSignedHttpRequest({
      method: "POST",
      body: JSON.stringify({
        query: {
          match_all: {},
        },
      }),
      headers: {
        "Content-Type": "application/json",
        host: hostname,
      },
      hostname,
      path: "_search",
    })
    .then(waitAndReturnResponseBody)
    const indexTemplateFile = path.resolve(__dirname, '../../configurations/index-template/logs-access.json')
    const indexTemplateName = path.basename(indexTemplateFile, '.json')
    console.dir({indexTemplateFile,indexTemplateName})
    await executeSignedHttpRequest({
      method: "POST",
      body: fs.readFileSync(indexTemplateFile, {encoding:'utf8'}),
      headers: {
        "Content-Type": "application/json",
        host: hostname,
      },
      hostname,
      path: `/_template/${indexTemplateName}`,
    })
    .then(waitAndReturnResponseBody)
    .then(output=>console.dir(output))

    const ingestPipelineFile = path.resolve(__dirname, '../../configurations/ingest-pipeline/filebeat-7.7.0-apache-access-pipeline.json')
    const ingestPipelineName = path.basename(ingestPipelineFile, '.json')
    console.dir({ingestPipelineFile,ingestPipelineName})
    await executeSignedHttpRequest({
      method: "PUT",
      body: fs.readFileSync(ingestPipelineFile, {encoding:'utf8'}),
      headers: {
        "Content-Type": "application/json",
        host: hostname,
      },
      hostname,
      path: `/_ingest/pipeline/${ingestPipelineName}`,
    })
    .then(waitAndReturnResponseBody)
    .then(output=>console.dir(output))

    // Create Tenants
    //TODO: I don't know why the direct URL/path didn't work, but it works through through the console proxy
    await executeSignedHttpRequest({
      method: "POST",
      body: JSON.stringify({description:"Infrastructure and Operations"}),
      headers: {
        "Content-Type": "application/json",
        "kbn-xsrf":"true",
        host: hostname,
      },
      hostname,
      path: '/_plugin/kibana/api/console/proxy',
      query: {path:'/_opendistro/_security/api/tenants/infraops', method:'PUT'}
    })
    .then(waitAndReturnResponseBody)
    .then(output=>console.dir(output))
    const indexPatternFile = path.resolve(__dirname, '../../configurations/index-pattern/logs-access.json')
    const indexPatternName = path.basename(indexPatternFile, '.json')
    console.dir({indexPatternFile,indexPatternName})
    await executeSignedHttpRequest({
      method: "POST",
      body: fs.readFileSync(indexPatternFile, {encoding:'utf8'}),
      headers: {
        "Content-Type": "application/json",
        "securitytenant": "infraops",
        "kbn-xsrf":"true",
        host: hostname,
      },
      hostname,
      path: `/_plugin/kibana/api/saved_objects/index-pattern/${indexPatternName}`,
      query: {overwrite: 'true'}
    })
    .then(waitAndReturnResponseBody)
    .then(output=>console.dir(output))

    const form = new FormData();
    const vizualizationFile = path.resolve(__dirname, '../../configurations/visualizations/applications.ndjson')
    form.append("file", fs.readFileSync(vizualizationFile,{encoding:'utf8'}), {contentType:'application/json'});
    const buffer = form.getBuffer()
    console.dir({indexPatternFile, readble: form instanceof Readable})
    await executeSignedHttpRequest({
      method: "POST",
      body: buffer,
      headers: {
        "securitytenant": "infraops",
        "kbn-xsrf":"true",
        host: hostname,
        ...form.getHeaders()
      },
      hostname,
      path: '/_plugin/kibana/api/saved_objects/_import',
      query: {overwrite: 'true'}
    })
    .then(waitAndReturnResponseBody)
    .then(output=>console.dir(output))
  }

  async init() {
    const { STSClient, GetCallerIdentityCommand } = require.main.require("@aws-sdk/client-sts")
    const stsClient = new STSClient();
    const stsGetCallerIdentityCommand = new GetCallerIdentityCommand();
    const stsCallerIdentity = await stsClient.send(stsGetCallerIdentityCommand);
    delete stsCallerIdentity.$metadata
    const stsAssumeRoleIndex = stsCallerIdentity.Arn.indexOf(':assumed-role/')
    if (stsAssumeRoleIndex > 0) {
      stsCallerIdentity.AssumedRole = `arn:aws:iam::${stsCallerIdentity.Account}:role/${stsCallerIdentity.Arn.split('/')[1]}`
    }
    this.#stsCallerIdentity = stsCallerIdentity
    //console.dir(this.#stsCallerIdentity)
  }
  async deploy() {
    await this.init()
    const domainConfig = await deployElasticSearchDomain()
    await this.configureElasticSearch(domainConfig.DomainStatus.Endpoint)
    
    //await this.deployKeycloakClientUsingAdmin(domainConfig.DomainStatus.Endpoint)
  } //end deploy
}

module.exports = async (settings) => {  
  await new MyDeployer(settings).deploy();
}
