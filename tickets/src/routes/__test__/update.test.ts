import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided ID does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({ title: "event 1", price: 200 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "event 1", price: 200 })
    .expect(401);
});

it("returns 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", global.signin())
    .send({ title: "event 1", price: 100 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({ title: "event 1", price: 200 })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const userCookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", userCookie)
    .send({ title: "event 1", price: 100 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", userCookie)
    .send({ title: "", price: 200 })
    .expect(400);
});

it("updates the ticket when provided with valid inputs", async () => {
  const userCookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", userCookie)
    .send({ title: "event 1", price: 100 })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", userCookie)
    .send({ title: "Event 1", price: 200 })
    .expect(200);
});

it("rejects an update if the ticket is reserved", async () => {
  const userCookie = global.signin();
  const response = await request(app)
    .post(`/api/tickets`)
    .set("Cookie", userCookie)
    .send({ title: "event 1", price: 100 })
    .expect(201);

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", userCookie)
    .send({ title: "Event 1", price: 200 })
    .expect(400);
});
