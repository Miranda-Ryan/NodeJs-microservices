import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  const cookie = await global.signin();

  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send({ email: "test@test.com", password: "password" })
    .expect(200);
  expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if user is not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(401);
});
