import express, { Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth
} from "@rjmtix/common";
import { Order } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/orderCancelledPublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.patch(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event to inform other services that this order was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: { id: order.ticket.id }
    });

    return res.status(200).send(order);
  }
);

export { router as deleteOrderRouter };
