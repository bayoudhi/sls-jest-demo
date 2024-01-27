import { S3 } from "@aws-sdk/client-s3";
import { EventBridgeHandler } from "aws-lambda";
import { TodoCreatedEvent } from "../types";

const s3 = new S3();

const BUCKET_NAME = process.env.BUCKET_NAME;

export const handler: EventBridgeHandler<
  TodoCreatedEvent["eventType"],
  TodoCreatedEvent,
  void
> = async (event) => {
  const todo = event.detail.payload;

  await s3.putObject({
    Bucket: BUCKET_NAME,
    Key: `${todo.id}.json`,
    Body: JSON.stringify(todo),
  });
};
