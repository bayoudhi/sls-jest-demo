import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { EventBridge } from "@aws-sdk/client-eventbridge";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { randomUUID } from "crypto";
import { Todo, TodoCreatedEvent } from "../types";

const dynamoDb = DynamoDBDocument.from(new DynamoDBClient());
const eventBridge = new EventBridge();

const TABLE_NAME = process.env.TABLE_NAME;
const BUS_NAME = process.env.BUS_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
  const data = JSON.parse(event.body || "{}");

  const todo: Todo = {
    id: randomUUID(),
    text: data.text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await dynamoDb.put({
    TableName: TABLE_NAME,
    Item: todo,
  });

  const todoCreatedEvent: TodoCreatedEvent = {
    eventId: randomUUID(),
    eventType: "TodoCreated",
    payload: todo,
  };

  await eventBridge.putEvents({
    Entries: [
      {
        EventBusName: BUS_NAME,
        Source: "demo1",
        DetailType: todoCreatedEvent.eventType,
        Detail: JSON.stringify(todoCreatedEvent),
      },
    ],
  });

  return {
    statusCode: 200,
    body: JSON.stringify(todo),
  };
};
