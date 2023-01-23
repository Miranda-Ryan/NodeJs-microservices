import { OrderStatus } from "@rjmtix/common";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { ITicketAttrs, Ticket } from "../../models/ticket";
import { natsWrapper } from "../../natsWrapper";

const createTicket = async () => {
  const ticket = await Ticket.create<ITicketAttrs>({
    title: "concert",
    price: 20
  });
  return ticket;
};

it("updates an existing order as cancelled", async () => {
  const ticketOne = await createTicket();
  const userOne = global.signin();

  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const response = await request(app)
    .patch(`/api/orders/${order.body.id}`)
    .set("Cookie", userOne)
    .expect(200);

  const updatedOrder = await Order.findById(order.body.id);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an Order Cancelled Event", async () => {
  const ticketOne = await createTicket();
  const userOne = global.signin();

  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .patch(`/api/orders/${order.body.id}`)
    .set("Cookie", userOne)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
