/* eslint-disable @typescript-eslint/no-explicit-any, quotes */

import {OpenSearchNotificationsSettings} from '../types/settings';
import AwsService from './aws.service';

export default class OpenSearchNotificationsService extends AwsService {
  public async createSnsChannel(settings: OpenSearchNotificationsSettings): Promise<any> {
    return this.executeSignedHttpRequest({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_plugins/_notifications/configs/`,
      body: JSON.stringify({
        "config_id": `${settings.configId}`,
        "name": `${settings.configIdName}`,
        "config": {
          "name": `${settings.configNameLong}`,
          "description": `${settings.configDescription}`,
          "config_type": `${settings.configType}`,
          "is_enabled": settings.isEnabled,
          "sns": {
            "topic_arn": `arn:aws:sns:${settings.region}:${settings.accountNumber}:${settings.configTopicArnId}`,
            "role_arn": `arn:aws:iam::${settings.accountNumber}:role/${settings.configRoleArnId}`,
          },
        },
      }),
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Status code: [${res.statusCode}]`);
      });
  }
}
