import * as fs from 'fs';
import * as path from 'path';
import ejs from 'ejs';
import { injectable } from 'inversify';

export interface NotificationSettings {
  hostname: string;
  region: string;
  accountNumber: string;
}

export interface NotificationConfig {
  id: string;
  name: string;
  description: string;
  configType: string;
  isEnabled: boolean;
  sns: {
    topicArn: string;
    roleArn: string;
  };
  microsoft_teams: {
    url: string;
  };
}

const NOTIFICATION_CONFIG_DIR = path.resolve(
  __dirname,
  '../../configuration-opensearch/notification',
);

@injectable()
export default class NotificationService {
  public renderConfigs(secrets: any): NotificationConfig[] {
    const configs: NotificationConfig[] = [];
    for (const notificationFile of fs.readdirSync(NOTIFICATION_CONFIG_DIR)) {
      const configStr = fs.readFileSync(
        path.resolve(NOTIFICATION_CONFIG_DIR, notificationFile),
        { encoding: 'utf8' },
      );

      const config = JSON.parse(
        this.renderConfig(notificationFile, configStr, secrets),
      );
      configs.push(config);
    }
    return configs;
  }

  private renderConfig(file: string, configStr: string, secrets: any) {
    if (file.endsWith('microsoft_teams.json')) {
      const key = `notification_teams_${file.slice(0, -21).replaceAll(/[^a-zA-Z_0-9]/gi, '_')}`;
      return ejs.render(configStr, {
        url: secrets[key] ?? '',
      });
    }
    return configStr;
  }
}
