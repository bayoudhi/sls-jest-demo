import axios from "axios";
import {
  dynamodbItem,
  eventBridgeSpy,
  EventBridgeSpy,
  s3Object,
} from "sls-jest";
import { Todo } from "../types";

jest.setTimeout(60000);

let spy: EventBridgeSpy;

//TODO: replace with your own values
const HttpApiUrl = "https://8huj323wdh.execute-api.us-east-1.amazonaws.com";
const TableName = "hamza-sls-jest-demo-with-sst-table";
const BusName = "hamza-sls-jest-demo-with-sst-bus";
const BucketName =
  "hamza-sls-jest-demo-with-sst--bucketbucketf19722a9-dmbrtg5h4zwq";

beforeAll(async () => {
  // create a spy. This will also deploy the required infrastructure, if need be.
  spy = await eventBridgeSpy({
    eventBusName: BusName,
  });
});

afterAll(async () => {
  // stop spying on the bus.
  await spy.stop();
});

it("should create a todo in dynamodb, send an event to eventbridge, and back it up in s3", async () => {
  const response = await axios.post(`${HttpApiUrl}/todos`, {
    text: "Watch a movie",
  });

  const todo = response.data as Todo;
  console.log('todo', todo);

  // check that the todo was created in dynamodb
  await expect(
    dynamodbItem({
      tableName: TableName,
      key: { id: todo.id },
    })
  ).toExistAndMatchObject({
    id: todo.id,
    text: "Watch a movie",
    completed: false,
    createdAt: todo.createdAt,
  });

  // check that the event was sent to eventbridge
  await expect(spy).toHaveEventMatchingObject({
    "detail-type": "TodoCreated",
    detail: {
      payload: expect.objectContaining({
        id: todo.id,
        text: "Watch a movie",
        completed: false,
      }),
    },
  });
  await expect(spy).toHaveEventMatchingObjectTimes(
    {
      "detail-type": "TodoCreated",
    },
    1
  );

  // check that the todo was stored in S3
  await expect(
    s3Object({
      bucketName: BucketName,
      key: `${todo.id}.json`,
    })
  ).toExistAndMatchObject({
    id: todo.id,
    text: "Watch a movie",
    completed: false,
    createdAt: expect.any(String),
  });
});
