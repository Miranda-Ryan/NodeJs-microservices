import { Publisher, OrderCreatedEvent, Subjects } from "@rjmtix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
