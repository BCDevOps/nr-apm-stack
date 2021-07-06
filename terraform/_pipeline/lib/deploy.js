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

const GenericError = require.main.exports.GenericError
const BasicDeployer = require.main.exports.BasicDeployer
const path = require('path');
const fs = require('fs');

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

async function createHttpRequest(httpRequestParams) {
  const { HttpRequest } = require.main.require("@aws-sdk/protocol-http")
  const httpRequest = new HttpRequest(httpRequestParams);
  return httpRequest;
}
async function executeHttpRequest(httpRequestParams) {
  const signedHttpRequest = await createHttpRequest(httpRequestParams)
  const { NodeHttpHandler } = require.main.require("@aws-sdk/node-http-handler")
  const nodeHttpHandler = new NodeHttpHandler();
  return nodeHttpHandler.handle(signedHttpRequest);
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

  async getElasticSearchDomain() {
    const settings = this.settings
    const phases = settings.phases
    const phase = phases[settings.phase]
    const client = new ElasticsearchServiceClient({ region: "ca-central-1" });
    const domainName = `${phase.name}${phase.suffix}`
    return await waitForDomainStatusReady(client, domainName)
  }
  async deployElasticSearchDomain() {
    const settings = this.settings
    const phases = settings.phases
    const phase = phases[settings.phase]
    const client = new ElasticsearchServiceClient({ region: "ca-central-1" });
    const domainName = `${phase.name}${phase.suffix}`
    const keycloakBaseUrl = new URL(phase.keycloak.baseURL)
    const keycloakRealmUrl = new URL(path.posix.join(keycloakBaseUrl.pathname, 'auth', 'realms', phase.keycloak.realmName), phase.keycloak.baseURL)
    // console.dir(`Connecting to ${keycloakRealmUrl}`)
    let samlMetadataContent = (await executeHttpRequest({
      method: 'GET',
      hostname: keycloakRealmUrl.hostname,
      port:443,
      // body: '',
      path: path.posix.join(keycloakRealmUrl.pathname, 'protocol/saml/descriptor'),
      headers:{host: keycloakRealmUrl.hostname,}
    })
    .then(waitAndReturnResponseBody)).body
    samlMetadataContent=samlMetadataContent.substring(samlMetadataContent.indexOf('<EntitiesDescriptor'))
    const samlOptionsDef = {EntityId:keycloakRealmUrl.toString(), MetadataContent:samlMetadataContent}
    const createCmdParams = require('../aws-elasticsearch-domain-config').process({DomainName:domainName, stsCallerIdentity: this.#stsCallerIdentity, samlOptions: samlOptionsDef})
    // SAML options CANNOT be defined when creating a domain, so we remove it to be used by the creation call
    const samlOptions = createCmdParams.AdvancedSecurityOptions.SAMLOptions
    delete createCmdParams.AdvancedSecurityOptions.SAMLOptions
    // check if domain already exists if the provided name
    let domainConfig = await describeDomain(client, createCmdParams.DomainName)
    if (!domainConfig){
      // if a domain doesn't exist with the same name, create one
      //const createCmd = new CreateElasticsearchDomainCommand(createCmdParams);
      //domainConfig = (await client.send(createCmd))
      throw new Error(`An ElasticSearch domain must have been created: '${createCmdParams.DomainName}'`)
    }
    // wait for domain to be up and ready
    await waitForDomainStatusReady(client, domainName)
    // update domain configuration. Only AdvancedSecurityOptions/SAMLOptions is updated!!!
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
    const expectedMappers = keycloakClientConfig.protocolMappers
    delete keycloakClientConfig.roles
    delete keycloakClientConfig.protocolMappers
    const keycloakBaseUrl = new URL(phase.keycloak.baseURL)
    const keycloakRealmUrl = new URL(path.posix.join(keycloakBaseUrl.pathname, 'auth'), phase.keycloak.baseURL)
    // console.dir(`Connecting to ${keycloakRealmUrl}`)
    const kcAdminClient = new KcAdminClient({baseUrl:keycloakRealmUrl.toString(), realmName:phase.keycloak.realmName});
    try{
      await kcAdminClient.auth({clientId: phase.keycloak.clientId, clientSecret: phase.keycloak.clientSecret, grantType: 'client_credentials'})
      console.log(`Searching for client: ${clientId}`)
      // Look for a client with the defined clientId
      let keycloakRealmClients = await kcAdminClient.clients.find({clientId:clientId, max: 2});
      if (keycloakRealmClients.length === 0 ) {
        // Create a client if one is not found
        console.log(`Creating keycloak client: ${clientId}`)
        await kcAdminClient.clients.create({clientId,...keycloakClientConfig})
        keycloakRealmClients = await kcAdminClient.clients.find({clientId:clientId, max: 2});
      }

      // Update the client
      const {id: clientUniqueId} = keycloakRealmClients[0];
      //console.dir(keycloakRealmClients[0])
      console.log(`Updating keycloak client: ${clientId} (${clientUniqueId})`)
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
      let keycloakProtocolMappers = await kcAdminClient.clients.listProtocolMappers({id:clientUniqueId});
      // Create any missing client role
      for (const mapper of expectedMappers) {
        const index = keycloakProtocolMappers.findIndex(element => element.name === mapper.name)
        if (index >= 0){
          keycloakProtocolMappers.splice(index, 1)
        } else {
          console.log(`Creating mapper ${mapper.name}`)
          await kcAdminClient.clients.addProtocolMapper({id: clientUniqueId}, mapper);
        }
      }
      // Whatever mappers are left, delete them (we don't want things that are not documented)
      for (const mapper of keycloakProtocolMappers) {
        console.log(`Deleting role ${mapper.name}`)
        await kcAdminClient.clients.delProtocolMapper({id: clientUniqueId, mapperId: mapper.id});
      }
    } catch (error) {
      throw new GenericError(`${error.message}: ${error.config.method} ${error.config.url}`, error)
    }
  } //end deployKeycloakClientUsingAdmin

  async loadElasticSearchTenants(hostname, tenantsDirPath) {
    const tenantsDirItems = fs.readdirSync(tenantsDirPath, {withFileTypes: true})
    for (const tenantDirItem of tenantsDirItems) {
      if (tenantDirItem.isDirectory()) {
        const tenantName = tenantDirItem.name
        //TODO: I don't know why the direct URL/path didn't work, but it works through through the console proxy
        await executeSignedHttpRequest({
          method: "POST",
          body: fs.readFileSync(path.join(tenantsDirPath, tenantName, 'meta.json'), {encoding:'utf8'}),
          headers: {
            "Content-Type": "application/json",
            "kbn-xsrf":"true",
            host: hostname,
          },
          hostname,
          path: '/_plugin/kibana/api/console/proxy',
          query: {path:`/_opendistro/_security/api/tenants/${tenantName}`, method:'PUT'}
        })
        .then(waitAndReturnResponseBody)
        .then(()=>console.log(`Tenant Loaded - ${tenantName}`))

        const indexPatternDirItems = fs.readdirSync(path.join(tenantsDirPath, tenantName, 'index-pattern'), {withFileTypes: true})
        for (const indexPatternItem of indexPatternDirItems) {
          if (indexPatternItem.isFile() && indexPatternItem.name.endsWith('.json')) {
            const indexPatternPath = path.join(tenantsDirPath, tenantName, 'index-pattern', indexPatternItem.name)
            const indexPatternName = path.basename(indexPatternPath, '.json')
            const indexPattern = JSON.parse(fs.readFileSync(indexPatternPath, {encoding:'utf8'}))
            // https://search-nress-prod-vknktapr2rxt3aze4bqa3pfirq.ca-central-1.es.amazonaws.com/_plugin/kibana/api/index_patterns/_fields_for_wildcard?pattern=*-logs-access-*&meta_fields=_source&meta_fields=_id&meta_fields=_type&meta_fields=_index&meta_fields=_score
            await executeSignedHttpRequest({
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                host: hostname,
              },
              hostname,
              path: `/_plugin/kibana/api/index_patterns/_fields_for_wildcard`,
              query: {pattern:'*-logs-access-*', meta_fields:['_source', '_id', 'type', 'index', '_score']}
            })
            .then(waitAndReturnResponseBody)
            .then((response)=>{
              // console.log(`Index Pattern Loaded - ${tenantName}/${indexPatternName}`)
              if (response.statusCode === 200 ){
                const body = JSON.parse(response.body)
                if (body.fields.length > indexPattern.attributes.fields.length) {
                indexPattern.attributes.fields = JSON.stringify(body.fields)
                }
              }else{
                throw new Error(JSON.stringify(body.errors))
              }
            })
            //console.dir({indexPatternFile,indexPatternName})
            await executeSignedHttpRequest({
              method: "POST",
              body: JSON.stringify(indexPattern),
              headers: {
                "Content-Type": "application/json",
                "securitytenant": tenantName,
                "kbn-xsrf":"true",
                host: hostname,
              },
              hostname,
              path: `/_plugin/kibana/api/saved_objects/index-pattern/${indexPatternName}`,
              query: {overwrite: 'true'}
            })
            .then(waitAndReturnResponseBody)
            .then(()=>console.log(`Index Pattern Loaded - ${tenantName}/${indexPatternName}`))
          }
        }

        const visualizationsDirItems = fs.readdirSync(path.join(tenantsDirPath, tenantName, 'visualizations'), {withFileTypes: true})
        for (const visualizationItem of visualizationsDirItems) {
          if (visualizationItem.isFile() && visualizationItem.name.endsWith('.ndjson')) {
            const visualizationPath = path.join(tenantsDirPath, tenantName, 'visualizations', visualizationItem.name)
            const visualizationFileName = path.basename(visualizationPath)
            const visualizationName = path.basename(visualizationPath, '.ndjson')
            const form = new FormData();
            form.append("file", fs.readFileSync(visualizationPath,{encoding:'utf8'}), {contentType:'application/json', filename: visualizationFileName});
            const buffer = form.getBuffer()
            //console.dir({visualizationPath, form})
            await executeSignedHttpRequest({
              method: "POST",
              body: buffer,
              headers: {
                "securitytenant": tenantName,
                "kbn-xsrf":"true",
                host: hostname,
                ...form.getHeaders()
              },
              hostname,
              path: '/_plugin/kibana/api/saved_objects/_import',
              //path: '/api/saved_objects/_import',
              query: {overwrite: 'true'}
            })
            .then(waitAndReturnResponseBody)
            .then((response)=>{
              if (response.statusCode === 200 ){
                const body = JSON.parse(response.body)
                if (body.success !== true ) {
                  throw new Error(JSON.stringify(body.errors))
                }
              }
            })
            .then(()=>console.log(`Vizualization File Loaded - ${tenantName}/${visualizationName}`))
          }
        } // end for
        const dashboardsDirPath = path.join(tenantsDirPath, tenantName, 'dashboards')
        const dashboardsDirItems = fs.readdirSync(dashboardsDirPath, {withFileTypes: true})
        for (const dashboardItem of dashboardsDirItems) {
          if (dashboardItem.isFile() && dashboardItem.name.endsWith('.ndjson')) {
            const dashboardPath = path.join(dashboardsDirPath, dashboardItem.name)
            const dashboardFileName = path.basename(dashboardPath)
            const form = new FormData();
            form.append("file", fs.readFileSync(dashboardPath,{encoding:'utf8'}), {contentType:'application/json', filename: dashboardFileName})
            const buffer = form.getBuffer()
            //console.dir({visualizationPath, form})
            await executeSignedHttpRequest({
              method: "POST",
              body: buffer,
              headers: {
                "securitytenant": tenantName,
                "kbn-xsrf":"true",
                host: hostname,
                ...form.getHeaders()
              },
              hostname,
              path: '/_plugin/kibana/api/saved_objects/_import',
              //path: '/api/saved_objects/_import',
              query: {overwrite: 'true'}
            })
            .then(waitAndReturnResponseBody)
            .then((response)=>{
              if (response.statusCode === 200 ){
                const body = JSON.parse(response.body)
                if (body.success !== true ) {
                  throw new Error(JSON.stringify(body.errors))
                }                
              }
            })
            .then(()=>console.log(`Dashboard File Loaded - ${tenantName}/${dashboardFileName}`))
          }
        }// end for
      }
    } // end tenants for
  }
  async configureElasticSearch(hostname){
    /*
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
    */
    const indexTemplateFile = path.resolve(__dirname, '../../configurations/index-template/logs-access.json')
    const indexTemplateName = path.basename(indexTemplateFile, '.json')
    // console.dir({indexTemplateFile,indexTemplateName})
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
    .then(()=>console.log(`Index Template Loaded - ${indexTemplateName}`))
    //.then(output=>console.dir(output))

    const ingestPipelineFile = path.resolve(__dirname, '../../configurations/ingest-pipeline/filebeat-7.7.0-apache-access-pipeline.json')
    const ingestPipelineName = path.basename(ingestPipelineFile, '.json')
    // console.dir({ingestPipelineFile,ingestPipelineName})
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
    .then(()=>console.log(`Ingest Pipeline Loaded - ${ingestPipelineName}`))
    //.then(output=>console.dir(output))

    // loadElasticSearchTenants(hostname, path.resolve(__dirname, '../../configurations/tenants'))

    //.then(output=>console.dir(output))
    //const indexPatternFile = path.resolve(__dirname, '../../configurations/index-pattern/logs-access.json')
    //.then(output=>console.dir(output))

    /*
    await executeSignedHttpRequest({
      method: "POST",
      body: JSON.stringify({type:['index-pattern']}),
      headers: {
        "Content-Type": "application/json",
        "securitytenant": "infraops",
        "kbn-xsrf":"true",
        host: hostname,
      },
      hostname,
      path: `/_plugin/kibana/api/saved_objects/_export`,
    })
    .then(waitAndReturnResponseBody)
    .then(output=>console.dir(output))
    */


    //.then(output=>console.dir(output, {depth:1}))
  }

  async init() {
    const { STSClient, GetCallerIdentityCommand, AssumeRoleCommand } = require.main.require("@aws-sdk/client-sts")
    if (process.env.AWS_ASSUME_ROLE) {
      const stsClient1 = new STSClient({region:'ca-central-1',});
      const stsAssumeRoleCommand = new AssumeRoleCommand({RoleArn: process.env.AWS_ASSUME_ROLE, RoleSessionName: 'nrdk'});
      const stsAssumedRole = await stsClient1.send(stsAssumeRoleCommand);
      process.env.AWS_ACCESS_KEY_ID = stsAssumedRole.Credentials.AccessKeyId
      process.env.AWS_SECRET_ACCESS_KEY = stsAssumedRole.Credentials.SecretAccessKey
      process.env.AWS_SESSION_TOKEN = stsAssumedRole.Credentials.SessionToken
      // console.dir(stsAssumedRole)
    }
    const stsClient = new STSClient({region:'ca-central-1',});
    const stsGetCallerIdentityCommand = new GetCallerIdentityCommand();
    const stsCallerIdentity = await stsClient.send(stsGetCallerIdentityCommand);
    delete stsCallerIdentity.$metadata
    const stsAssumeRoleIndex = stsCallerIdentity.Arn.indexOf(':assumed-role/')
    if (stsAssumeRoleIndex > 0) {
      stsCallerIdentity.AssumedRole = `arn:aws:iam::${stsCallerIdentity.Account}:role/${stsCallerIdentity.Arn.split('/')[1]}`
    }
    this.#stsCallerIdentity = stsCallerIdentity
  }

  async deploy() {
    await this.init()
    const { SecretsManagerClient, GetSecretValueCommand } = require.main.require("@aws-sdk/client-secrets-manager")
    const awsSecretManagerclient = new SecretsManagerClient({region:'ca-central-1',})
    const secretId = `${this.settings.phase}/nrdk/config/keycloak`
    const awsGetSecretValueCommand = new GetSecretValueCommand({SecretId: secretId})
    const awsSecrets = await awsSecretManagerclient.send(awsGetSecretValueCommand).catch(() =>{ return {SecretString: '{}'}})
    const keycloakConfigOverrides = JSON.parse(awsSecrets.SecretString)
    if (Object.keys(keycloakConfigOverrides).length === 0) {
      throw new Error(`Missing AWS SecretId '${secretId}'`)
    }
    Object.assign(this.settings.phases[this.settings.phase].keycloak, keycloakConfigOverrides)
    const domainConfig = await this.getElasticSearchDomain()
    await this.configureElasticSearch(domainConfig.DomainStatus.Endpoint)
    await this.deployKeycloakClientUsingAdmin(domainConfig.DomainStatus.DomainEndpointOptions.CustomEndpoint)
  } //end deploy
}

module.exports = async (settings) => {
  await new MyDeployer(settings).deploy();
}
