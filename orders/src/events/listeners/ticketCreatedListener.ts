import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@rjmtix/common";
import { ITicketAttrs, Ticket } from "../../models/ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    // Create a ticket in orders DB
    const { id, title, price } = data;
    const ticket = new Ticket<ITicketAttrs>({ title, price });
    ticket._id = id;
    await ticket.save();

    // Acknowledge message
    msg.ack();
  }
}
