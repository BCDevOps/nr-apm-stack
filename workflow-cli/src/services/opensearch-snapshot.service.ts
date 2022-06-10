/* eslint-disable @typescript-eslint/no-explicit-any */

import AwsService from './aws.service';

export interface settings {
  hostname: string;
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  accountNumber: string;
  arn: string | undefined;
}

export default class OpenSearchSnapshotService extends AwsService {
  public async setupSnapshot(settings: settings): Promise<any> {
    await this.executeSignedHttpRequest({
      method: 'PUT',
      body: JSON.stringify({
        type: 's3',
        settings: {
          bucket: `${settings.domainName}-snapshot-${settings.accountNumber}`,
          region: settings.region,
          role_arn: `arn:aws:iam::${settings.accountNumber}:role/${settings.domainName}-opensearch-snapshot`,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_snapshot/s3-backup`,
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`[${res.statusCode}] Snapshot setup`);
      });
  }
}
