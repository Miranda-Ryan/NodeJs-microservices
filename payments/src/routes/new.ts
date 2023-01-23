import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus
} from "@rjmtix/common";
import { Order } from "../models/order";
import { stripe } from "../stripe";
import { IPaymentAttrs, Payment } from "../models/payments";
import { PaymentCreatedPublisher } from "../events/publishers/paymentCreatedPublisher";
import { natsWrapper } from "../natsWrapper";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError("Order");
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token
    });

    const payment = new Payment<IPaymentAttrs>({
      orderId,
      stripeId: charge.id
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: orderId,
      stripeId: payment.stripeId
    });

    return res.status(201).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
