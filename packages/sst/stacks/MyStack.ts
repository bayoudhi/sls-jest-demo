import { StackContext, Api, EventBus, Bucket, Table } from "sst/constructs";

export function MyStack({ stack }: StackContext) {
  const bucket = new Bucket(stack, "bucket");
  const bus = new EventBus(stack, "bus");

  const table = new Table(stack, "table", {
    fields: {
      id: "string",
      text: "string",
    },
    primaryIndex: { partitionKey: "id" },
  });

  stack.addDefaultFunctionPermissions([bucket, bus, table]);
  stack.addDefaultFunctionEnv({
    BUCKET_NAME: bucket.bucketName,
    BUS_NAME: bus.eventBusName,
    TABLE_NAME: table.tableName,
  });

  const api = new Api(stack, "api", {
    routes: {
      "POST /todos": "functions/create-todo.handler",
    },
  });

  bus.subscribe("TodoCreated", {
    handler: "functions/backup-todo.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    BucketName: bucket.bucketName,
    BusName: bus.eventBusName,
    TableName: table.tableName,
  });
}
