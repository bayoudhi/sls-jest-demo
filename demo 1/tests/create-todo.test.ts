import axios from "axios";
import {
  dynamodbItem,
  eventBridgeSpy,
  EventBridgeSpy,
  s3Object,
} from "sls-jest";
import { Todo } from "../src/types";
import { TodoCreatedEvent } from "../src/utils/events";

jest.setTimeout(60000);

// TODO: get the following parameters from the environment
const API_URL = "https://1ayfmev0jc.execute-api.us-east-1.amazonaws.com";
const DYNAMODB_TABLE = "sls-jest-demo-1-dev-Table-3QLBKHFY83NJ";
const BUCKET_NAME = "sls-jest-demo-1-dev-bucket-sf8vzhm2kwn9";
const EVENT_BRIDGE_NAME = "sls-jest-demo-1-dev";

let spy: EventBridgeSpy;

beforeAll(async () => {
  // create a spy. This will also deploy the required infrastructure, if need be.
  spy = await eventBridgeSpy({
    eventBusName: EVENT_BRIDGE_NAME,
    config: {},
  });
});

afterAll(async () => {
  // stop spying on the bus.
  await spy.stop();
});

it("should create a todo in dynamodb, send an event to eventbridge, and store a new event in s3", async () => {
  const response = await axios.post(`${API_URL}/todos`, {
    text: "Test Todo",
  });
  const todo = response.data.todo as Todo;
  const event = response.data.event as TodoCreatedEvent;

  // check that the todo was created in dynamodb
  await expect(
    dynamodbItem({
      key: { id: todo.id },
      tableName: DYNAMODB_TABLE,
    })
  ).toExistAndMatchObject({
    createdAt: todo.createdAt,
    id: todo.id,
    text: "Test Todo",
  });

  // check that the event was sent to eventbridge
  await expect(spy).toHaveEventMatchingObject({
    "detail-type": "TodoCreated",
    detail: {
      payload: expect.objectContaining({
        id: todo.id,
      }),
    },
  });

  // check that the event was stored in S3
  await expect(
    s3Object({
      bucketName: BUCKET_NAME,
      key: `${event.eventId}.json`,
    })
  ).toExistAndMatchObject(event as any);
});
