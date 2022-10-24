import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDB, EventBridge } from "aws-sdk";
import { randomUUID } from "crypto";
import { Todo, TodoCreatedEvent } from "../types";

const dynamoDb = new DynamoDB.DocumentClient();

const eventBridge = new EventBridge();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const data = JSON.parse(event.body || "{}");

  const todo: Todo = {
    id: randomUUID(),
    text: data.text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await dynamoDb
    .put({
      TableName: process.env.TABLE_NAME,
      Item: todo,
    })
    .promise();

  const todoCreatedEvent: TodoCreatedEvent = {
    eventId: randomUUID(),
    eventType: "TodoCreated",
    payload: todo,
  };

  await eventBridge
    .putEvents({
      Entries: [
        {
          EventBusName: process.env.BUS_NAME,
          Source: "demo1",
          DetailType: todoCreatedEvent.eventType,
          Detail: JSON.stringify(todoCreatedEvent),
        },
      ],
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify(todo),
  };
};
