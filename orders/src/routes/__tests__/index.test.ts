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

it("fetches orders for a particular user", async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  //   Create one order as User#1
  const userOne = global.signin();
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //   Create two orders as User#2
  const userTwo = global.signin();
  const orderOne = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const orderTwo = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  //   Make request to get orders for User#2
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  //   Make sure response has orders of User#2 only
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.body.id);
  expect(response.body[1].id).toEqual(orderTwo.body.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
