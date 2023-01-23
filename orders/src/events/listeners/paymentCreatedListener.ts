import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects
} from "@rjmtix/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queueGroupName";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(
    data: PaymentCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Order.findById(data.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Completed });
    await order.save();
    msg.ack();
  }
}
