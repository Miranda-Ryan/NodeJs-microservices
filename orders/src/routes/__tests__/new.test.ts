import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket, ITicketAttrs } from "../../models/ticket";
import { IOrderAttrs, Order } from "../../models/order";
import { OrderStatus } from "@rjmtix/common";
import { natsWrapper } from "../../natsWrapper";

it("returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const createdTicket = await Ticket.create<ITicketAttrs>({
    title: "concert",
    price: 100
  });
  await Order.create<IOrderAttrs>({
    userId: "testUser",
    ticket: createdTicket,
    status: OrderStatus.Created,
    expiresAt: new Date()
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: createdTicket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const createdTicket = await Ticket.create<ITicketAttrs>({
    title: "concert",
    price: 100
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: createdTicket.id })
    .expect(201);
});

it("emits an order created event", async () => {
  const createdTicket = await Ticket.create<ITicketAttrs>({
    title: "concert",
    price: 100
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: createdTicket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
