import AwsService from './aws.service';
import NotificationService, {
  NotificationConfig,
  NotificationSettings,
} from './notification.service';
import { inject } from 'inversify';
import { TYPES } from '../inversify.types';

export default class OpenSearchNotificationsService extends AwsService {
  constructor(
    @inject(TYPES.NotificationService)
    private notificationService: NotificationService,
  ) {
    super();
  }

  public async sync(settings: NotificationSettings, secrets: any) {
    for (const config of this.notificationService.renderConfigs(secrets)) {
      await this.createSnsChannel(settings, config);
    }
  }

  public async createSnsChannel(
    settings: NotificationSettings,
    config: NotificationConfig,
  ): Promise<any> {
    const status = await this.executeSignedHttpRequest({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        host: settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_plugins/_notifications/configs/${config.id}`,
    })
      .then((res) => this.waitAndReturnResponseBody(res, [404]))
      .then((res) => {
        // console.log(`Status code: [${res.statusCode}]`);
        return res.statusCode;
      });

    // console.log(status);

    if (status === 200) {
      // Update
      return this.executeSignedHttpRequest({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          host: settings.hostname,
        },
        hostname: settings.hostname,
        path: `/_plugins/_notifications/configs/${config.id}`,
        body: JSON.stringify(this.configToBody(settings, config)),
      })
        .then((res) => this.waitAndReturnResponseBody(res))
        .then((res) => {
          console.log(`[${res.statusCode}] Notification Update - ${config.id}`);
        });
    } else {
      // Create
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
          console.log(`[${res.statusCode}] Notification Create - ${config.id}`);
        });
    }
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
