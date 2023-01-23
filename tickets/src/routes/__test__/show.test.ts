import request from "supertest";
import { app } from "../../app";
import { ITicketAttrs, Ticket } from "../../models/ticket";

it("returns 404 if the ticket is not found", async () => {
  await request(app).get("/api/tickets/13df9").send({}).expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "Event 1", price: 100 })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual("Event 1");
  expect(ticketResponse.body.price).toEqual(100);
});
