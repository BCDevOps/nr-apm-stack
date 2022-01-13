import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import KcAdminClient from '@keycloak/keycloak-admin-client';

const KEYCLOAK_CONFIG_BASEPATH = path.resolve(__dirname, '../../configuration-keycloak/');
const KEYCLOAK_CONFIG_CLIENT_PATH = path.resolve(KEYCLOAK_CONFIG_BASEPATH, 'keycloak-client.json');
const KEYCLOAK_CONFIG_ROLES_PATH = path.resolve(KEYCLOAK_CONFIG_BASEPATH, 'keycloak-client-roles.json');
const KEYCLOAK_CONFIG_MAPPERS_PATH = path.resolve(KEYCLOAK_CONFIG_BASEPATH, 'keycloak-client-mappers.json');
const TERRAFORM_TENANTS_PATH = path.resolve(__dirname, '../../../terraform/', 'tenants.json');

export interface settings {
  adminId: string;
  adminSecret: string;
  realm: string;
  targetId: string;
  targetUrl: string;
  url: string;
}

export default class KeycloakSyncService {
  async sync(settings: settings): Promise<void> {
    const keycloakBaseUrl = new URL(settings.url);
    const keycloakRealmUrl = new URL(path.posix.join(keycloakBaseUrl.pathname, 'auth'), settings.url);
    // console.dir(`Connecting to ${keycloakRealmUrl}`)
    const kcAdminClient = new KcAdminClient({baseUrl: keycloakRealmUrl.toString(), realmName: settings.realm});
    try {
      await kcAdminClient.auth({
        clientId: settings.adminId,
        clientSecret: settings.adminSecret,
        grantType: 'client_credentials'});

      const clientUniqueId = await this.syncClient(kcAdminClient, settings);
      await this.syncRoles(kcAdminClient, clientUniqueId, settings);
      await this.syncMappers(kcAdminClient, clientUniqueId, settings);
    } catch (error) {
      throw error;
    }
  }

  private async clientUniqueId(kcAdminClient: KcAdminClient, clientId: string): Promise<string | undefined> {
    console.log(`Searching for client: ${clientId}`);
    // Look for a client with the defined clientId
    const keycloakRealmClients = await kcAdminClient.clients.find({clientId, max: 2});
    if (keycloakRealmClients.length === 0 ) {
      return undefined;
    } else {
      return keycloakRealmClients[0].id;
    }
  }

  private async syncClient(kcAdminClient: KcAdminClient, settings: settings): Promise<string> {
    const keycloakClientConfigStr = fs.readFileSync(KEYCLOAK_CONFIG_CLIENT_PATH, 'utf8');
    const keycloakClientConfig = JSON.parse(ejs.render(keycloakClientConfigStr, settings));
    let clientUniqueId = await this.clientUniqueId(kcAdminClient, settings.targetId);
    if (clientUniqueId === undefined) {
      // Create a client if one is not found
      console.log(`Creating keycloak client: ${settings.targetId}`);
      await kcAdminClient.clients.create({clientId: settings.targetId, ...keycloakClientConfig});
    }
    clientUniqueId = await this.clientUniqueId(kcAdminClient, settings.targetId);
    if (clientUniqueId === undefined) {
      throw new Error('Could not create client');
    }

    console.log(`Updating keycloak client: ${settings.targetId} (${clientUniqueId})`);
    await kcAdminClient.clients.update(
      {id: clientUniqueId},
      keycloakClientConfig,
    );

    return clientUniqueId;
  }
  private async syncRoles(kcAdminClient: KcAdminClient, clientUniqueId: string, settings: settings): Promise<void> {
    const keycloakClientConfigStr = fs.readFileSync(KEYCLOAK_CONFIG_ROLES_PATH, 'utf8');
    const tenants = JSON.parse(fs.readFileSync(TERRAFORM_TENANTS_PATH, 'utf8'));
    const roles = JSON.parse(ejs.render(keycloakClientConfigStr, {...settings, tenants}));
    // Lookup client roles
    const kcExistingroles = await kcAdminClient.clients.listRoles({id: clientUniqueId});
    // Create any missing client role
    for (const role of roles) {
      const index = kcExistingroles.findIndex((element) => element.name === role.name);
      if (index >= 0) {
        kcExistingroles.splice(index, 1);
      } else {
        console.log(`Creating role ${role.name as string}`);
        await kcAdminClient.clients.createRole({id: clientUniqueId, ...role});
      }
    }
    // Whatever roles are left, delete them (we don't want things that are not documented)
    // TODO: we may make exceptions to roles ending with '-developers' as those may be managed outside
    for (const role of kcExistingroles) {
      console.log(`Deleting role ${role.name as string}`);
      if (role.name) {
        await kcAdminClient.clients.delRole({id: clientUniqueId, roleName: role.name});
      }
    }
  }

  private async syncMappers(kcAdminClient: KcAdminClient, clientUniqueId: string, settings: settings): Promise<void> {
    const keycloakClientConfigStr = fs.readFileSync(KEYCLOAK_CONFIG_MAPPERS_PATH, 'utf8');
    const expectedMappers = JSON.parse(ejs.render(keycloakClientConfigStr, settings));
    const keycloakProtocolMappers = await kcAdminClient.clients.listProtocolMappers({id: clientUniqueId});
    // Create any missing client role
    for (const mapper of expectedMappers) {
      const index = keycloakProtocolMappers.findIndex((element) => element.name === mapper.name);
      if (index >= 0) {
        keycloakProtocolMappers.splice(index, 1);
      } else {
        console.log(`Creating mapper ${mapper.name as string}`);
        await kcAdminClient.clients.addProtocolMapper({id: clientUniqueId}, mapper);
      }
    }
    // Whatever mappers are left, delete them (we don't want things that are not documented)
    for (const mapper of keycloakProtocolMappers) {
      console.log(`Deleting role ${mapper.name as string}`);
      if (mapper.id) {
        await kcAdminClient.clients.delProtocolMapper({id: clientUniqueId, mapperId: mapper.id});
      }
    }
  }
}
