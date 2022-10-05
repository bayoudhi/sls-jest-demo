import { EventBridgeHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import { TodoCreatedEvent } from "../utils/events";

const s3 = new S3();

export const handler: EventBridgeHandler<
  TodoCreatedEvent["eventType"],
  TodoCreatedEvent,
  void
> = async (event) => {
  const { detail } = event;
  await s3
    .putObject({
      Bucket: process.env.BUCKET_NAME as string,
      Key: `${detail.eventId}.json`,
      Body: JSON.stringify(detail),
    })
    .promise();
};
