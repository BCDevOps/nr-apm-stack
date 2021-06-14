import { myContainer, TYPES } from "./inversify.config";
import { KinesisStreamEvent, Context } from "aws-lambda";
import { KinesisStreamHandler } from "./kinesisStreamHandler.isvc";

export const kinesisStreamHandler = async (event: KinesisStreamEvent, context: Context):Promise<void> => {
    return myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler).handle(event, context)
    .catch(error => {
        console.error(error)
    })
}
