import { Context, KinesisStreamRecord } from 'aws-lambda'
import * as index from  './src/index'
import { APACHE_ACCESS_LOG_EVENT_SIGNATURE } from './src/parser.apache.svc'
const message1 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [20/Apr/2021:15:10:40 -0700] "POST /int/fncs/activities/details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"'
const event1 = Object.assign({message: message1}, APACHE_ACCESS_LOG_EVENT_SIGNATURE)
const record1 = {
    kinesis:{
        sequenceNumber: '123',
        data: Buffer.from(JSON.stringify(event1), 'utf8').toString('base64')
    }
} as any as KinesisStreamRecord

index.kinesisStreamHandler({Records:[record1]}, {} as Context)
