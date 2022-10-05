import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB, EventBridge } from "aws-sdk";
import { randomUUID } from "crypto";
import { Todo } from "../types";
import { events } from "../utils/events";

const dynamoDb = new DynamoDB.DocumentClient();

const eventBridge = new EventBridge();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const data = JSON.parse(event.body || "{}");

  if (typeof data.text !== "string") {
    console.error("Validation Failed");
    throw new Error("Couldn't create the todo item.");
  }

  const todo: Todo = {
    id: randomUUID(),
    text: data.text,
    createdAt: new Date().toISOString(),
  };

  await dynamoDb
    .put({
      TableName: process.env.DYNAMODB_TABLE as string,
      Item: todo,
    })
    .promise();

  const todoCreatedEvent = events.TodoCreated(todo);

  await eventBridge
    .putEvents({
      Entries: [
        {
          Source: "demo1",
          DetailType: todoCreatedEvent.eventType,
          Detail: JSON.stringify(todoCreatedEvent),
          EventBusName: process.env.EVENT_BRIDGE_NAME,
        },
      ],
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ todo, event: todoCreatedEvent }),
  };
};
