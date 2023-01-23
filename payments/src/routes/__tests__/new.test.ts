import { OrderStatus } from "@rjmtix/common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { IOrderAttrs, Order } from "../../models/order";
import { Payment } from "../../models/payments";
import { stripe } from "../../stripe";

jest.mock("../../stripe.ts");

it("returns a 404 when purchasing an order that doesn't exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "12324",
      orderId: new mongoose.Types.ObjectId().toHexString()
    })
    .expect(404);
});

it("returns a 401 when purchasing an order that doesn't belong to the user", async () => {
  const order = new Order<IOrderAttrs>({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    price: 10
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "12324",
      orderId: order.id
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = new Order<IOrderAttrs>({
    userId,
    status: OrderStatus.Cancelled,
    version: 0,
    price: 10
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "12324",
      orderId: order.id
    })
    .expect(400);
});

it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = new Order<IOrderAttrs>({
    userId,
    status: OrderStatus.Created,
    version: 0,
    price: 10
  });
  order.id = order._id;
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(10 * 100);
  expect(chargeOptions.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id
  });
  expect(payment).not.toBeNull();
});
