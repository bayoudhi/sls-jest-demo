export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface TodoCreatedEvent {
  eventId: string;
  eventType: "TodoCreated";
  payload: Todo;
}
