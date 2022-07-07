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
          'bucket': `${settings.domainName}-snapshot-${settings.accountNumber}`,
          'region': settings.region,
          'role_arn': `arn:aws:iam::${settings.accountNumber}:role/${settings.domainName}-opensearch-snapshot`,
          'server-side-encryption': true,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_snapshot/${settings.domainName}-snapshot-${settings.accountNumber}`,
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`[${res.statusCode}] Snapshot setup`);
      });
  }

  public async createSnapshot(settings: settings, timeStamp: string): Promise<any> {
    await this.executeSignedHttpRequest({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_snapshot/${settings.domainName}-snapshot-${settings.accountNumber}/${timeStamp}`,
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`[${res.statusCode}] Snapshot service started`);
      });
  }

  public getTimeStamp(): string {
    const date = new Date();
    const day = `0${String(date.getDate()).slice(-2)}`;
    const month = `0${String(date.getMonth()+1).slice(-2)}`;
    const year = `${String(date.getFullYear())}`;
    const hours = `${String(date.getHours())}`;
    const minutes = `${String(date.getMinutes())}`;
    const seconds = `${String(date.getSeconds())}`;
    return `${year}.${month}.${day}t${hours}.${minutes}.${seconds}`;
  };
}
