import { Listener, OrderCreatedEvent, Subjects } from "@rjmtix/common";
import { Message } from "node-nats-streaming";
import { IOrderAttrs, Order } from "../../models/order";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = new Order<IOrderAttrs>({
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version
    });
    order._id = data.id;
    await order.save();

    msg.ack();
  }
}
