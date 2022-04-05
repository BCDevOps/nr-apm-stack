import {Command, Flags} from '@oclif/core';
import KeycloakSyncService from '../services/keycloak-sync.service';

export default class KeycloakSync extends Command {
  static description = 'Sync keycloak client details';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    adminId: Flags.string({description: 'Keycloak client id', env: 'KEYCLOAK_ADMIN_CLIENT_ID', required: true}),
    adminSecret:
      Flags.string({description: 'Keycloak client secret', env: 'KEYCLOAK_ADMIN_CLIENT_SECRET', required: true}),
    realm: Flags.string({description: 'Keycloak realm', env: 'KEYCLOAK_REALM', required: true}),
    targetId: Flags.string({description: 'Target client id', env: 'KEYCLOAK_TARGET_CLIENT_ID', required: true}),
    targetUrl: Flags.string({description: 'Target client url', env: 'KEYCLOAK_TARGET_CLIENT_URL', required: true}),
    url: Flags.string({description: 'Keycloak url', env: 'KEYCLOAK_URL', required: true}),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(KeycloakSync);

    const service = new KeycloakSyncService();

    await service.sync(flags);
  }
}
