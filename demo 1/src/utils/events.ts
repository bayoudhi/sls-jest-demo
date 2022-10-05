import { randomUUID } from "crypto";
import { Todo } from "../types";

export interface TodoCreatedEvent {
  eventId: string;
  eventType: "TodoCreated";
  payload: Todo;
}

export const events = {
  TodoCreated: (todo: Todo): TodoCreatedEvent => {
    return {
      eventId: randomUUID(),
      eventType: "TodoCreated",
      payload: todo,
    };
  },
};
