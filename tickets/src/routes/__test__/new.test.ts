import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../natsWrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toBe(404);
});

it("can not be accessed if the user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).toBe(401);
});

it("can only be accessed if the user is signed in", async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toBe(401);
});

it("returns an error if an invalid title is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "", price: 100 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 100 })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Event 1", price: -100 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Event 1" })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  const cookie = global.signin();
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Event 1", price: 100 })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(100);
  expect(tickets[0].title).toEqual("Event 1");
});

it("publishes an event", async () => {
  const cookie = global.signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Event 1", price: 100 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
