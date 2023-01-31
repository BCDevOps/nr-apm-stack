/* eslint-disable @typescript-eslint/no-explicit-any */

import {domainToASCII} from 'url';
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
    console.log('return from API call');
    const responseBody=await this.getTotalDocumentsOfIndices(settings);
    console.log(responseBody);
    await this.getFieldsDocsOfIndices(responseBody, settings);
  }

  private async getFieldsDocsOfIndices(resStr: any, settings: settings): Promise<any> {
    return this.executeSignedHttpRequest({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      data: JSON.stringify({
        'size': 0,
        'aggs': {
          'response_codes': {
            'terms': {
              'field': settings.fieldname,
              'size': 100,
            },
          },
        },
      }),
      query: {
        format: 'json',
      },
      hostname: settings.hostname,
      path: `${settings.indicesname}/_search`,
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(res);
        // return res;
        console.log(`started`);
      });
  }


  private async getTotalDocumentsOfIndices(settings: settings): Promise<any> {
    // const timeStamp = this.getTimeStamp();
    return this.executeSignedHttpRequest({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'host': settings.hostname,
      },
      hostname: settings.hostname,
      path: `/_cat/indices/${settings.indicesname}`,
      query: {
        format: 'json',
      },
    })
      .then((res) => this.waitAndReturnResponseBody(res))
      .then((res) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        // console.log(res);
        return res;
        console.log(`started`);
      });
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
