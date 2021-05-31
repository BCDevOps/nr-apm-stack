import { Context, KinesisStreamEvent } from "aws-lambda";

export interface KinesisStreamHandler {
    transformToElasticCommonSchema (event: KinesisStreamEvent): Promise<any[]>;
    handle(event: KinesisStreamEvent, context: Context): Promise<void>;
}
