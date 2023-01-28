/* eslint-disable @typescript-eslint/no-explicit-any */

import AwsService from './aws.service';

export interface settings {
  hostname: string;
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  accountNumber: string,
  arn: string | undefined;
  indicesname: string;
  fieldname: string;
  fieldvalue: string;
}

export default class OpenSearchIndicesUsageService extends AwsService {
  public async getIndicesUsage(settings: settings): Promise<any> {
    const responseBody=await this.getTotalDocumentsOfIndices(settings);
    console.log(responseBody);
  }

  private async getTotalDocumentsOfIndices(settings: settings): Promise<any> {
    // const timeStamp = this.getTimeStamp();
    const res=await this.executeSignedHttpRequest({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_cat/indices/${settings.indicesname}?v&bytes=mb&h=index,docs.count`,
    });
    console.log(res);
  }
/*
  private getTimeStamp(): string {
    const date = new Date();
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${year}.${month}.${day}t${hours}h${minutes}m${seconds}s`;
  }
  */
}
