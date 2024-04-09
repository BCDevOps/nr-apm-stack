import * as fs from 'fs';
import * as path from 'path';
import AwsService from './aws.service';

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

export default class OpenSearchNotificationsService extends AwsService {
  public async sync(settings: NotificationSettings) {
    for (const notificationFile of fs.readdirSync(NOTIFICATION_CONFIG_DIR)) {
      const config = JSON.parse(
        fs.readFileSync(
          path.resolve(NOTIFICATION_CONFIG_DIR, notificationFile),
          { encoding: 'utf8' },
        ),
      );
      await this.createSnsChannel(settings, config);
    }
  }

  public async createSnsChannel(
    settings: NotificationSettings,
    config: NotificationConfig,
  ): Promise<any> {
    return this.executeSignedHttpRequest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_plugins/_notifications/configs/`,
      body: JSON.stringify(this.configToBody(settings, config)),
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Status code: [${res.statusCode}]`);
      });
  }

  private configToBody(
    settings: NotificationSettings,
    config: NotificationConfig,
  ): any {
    const commonBody: any = {
      config_id: config.id,
      config: {
        name: config.name,
        description: config.description,
        config_type: config.configType,
        is_enabled: config.isEnabled,
      },
    };
    if (config.configType === 'sns') {
      commonBody.config.sns = {
        topic_arn: `arn:aws:sns:${settings.region}:${settings.accountNumber}:${config.sns.topicArn}`,
        role_arn: `arn:aws:iam::${settings.accountNumber}:role/${config.sns.roleArn}`,
      };
    } else if (config.configType === 'microsoft_teams') {
      commonBody.config.microsoft_teams = config.microsoft_teams;
    }
    return commonBody;
  }
}
