import { Publisher, OrderCancelledEvent, Subjects } from "@rjmtix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
