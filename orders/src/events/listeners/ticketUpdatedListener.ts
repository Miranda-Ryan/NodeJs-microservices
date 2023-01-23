import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@rjmtix/common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    // Update a ticket in orders DB

    const ticket = await Ticket.findByEvent({
      id: data.id,
      version: data.version
    });
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    // Acknowledge message
    msg.ack();
  }
}
