import { Publisher, Subjects, TicketUpdatedEvent } from "@rjmtix/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
