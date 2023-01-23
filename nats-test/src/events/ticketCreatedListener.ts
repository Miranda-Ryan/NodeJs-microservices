import { Listener } from "./baseListener";
import { Message } from "node-nats-streaming";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticketCreatedEvent";

class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = "payments-service";

  onMessage(data: TicketCreatedEvent["data"], msg: Message): void {
    console.log("Event Data!", data);
    msg.ack();
  }
}

export { TicketCreatedListener };
