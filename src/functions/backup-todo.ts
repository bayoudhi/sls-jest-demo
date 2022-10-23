import { EventBridgeHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import { TodoCreatedEvent } from "../types";

const s3 = new S3();

export const handler: EventBridgeHandler<
  TodoCreatedEvent["eventType"],
  TodoCreatedEvent,
  void
> = async (event) => {
  const todo = event.detail.payload;

  await s3
    .putObject({
      Bucket: process.env.BUCKET_NAME as string,
      Key: `${todo.id}.json`,
      Body: JSON.stringify(todo),
    })
    .promise();
};
