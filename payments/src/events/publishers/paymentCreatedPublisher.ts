import { PaymentCreatedEvent, Publisher, Subjects } from "@rjmtix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
