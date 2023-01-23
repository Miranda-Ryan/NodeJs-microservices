import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { ITicketAttrs, Ticket } from "../../models/ticket";

const createTicket = async () => {
  const ticket = await Ticket.create<ITicketAttrs>({
    title: "concert",
    price: 20
  });
  return ticket;
};

it("fetches a particular order", async () => {
  const ticketOne = await createTicket();
  const userOne = global.signin();

  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${order.body.id}`)
    .set("Cookie", userOne)
    .expect(200);

  expect(response.body.id).toEqual(order.body.id);
});

it("throws an error if the order is not found", async () => {
  const userOne = global.signin();
  const orderId = new mongoose.Types.ObjectId();

  const response = await request(app)
    .get(`/api/orders/${orderId}`)
    .set("Cookie", userOne)
    .expect(404);
});
