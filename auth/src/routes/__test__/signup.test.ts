import request from "supertest";
import { app } from "../../app";

it("returns 201 on successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "john@123.com", password: "password" });
  expect(response.status).toBe(201);
});

it("returns a 400 with an invalid email", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ password: "password" });
  expect(response.status).toBe(400);
  expect(response.body.errors[0].message).toBe("Email must be valid");
});

it("returns a 400 with an invalid password", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "john@123.com" });
  expect(response.status).toBe(400);
  expect(response.body.errors[0].message).toBe(
    "Password must be between 4 and 20 characters"
  );
});

it("returns a 400 with an invalid body", async () => {
  const response = await request(app).post("/api/users/signup").send({});
  expect(response.status).toBe(400);
  expect(response.body.errors.length).toBe(2);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "john@123.com", password: "password" })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "john@123.com", password: "password" });
  expect(response.status).toBe(400);
  expect(response.body.errors[0].message).toBe("Email in use");
});

it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({ email: "john@123.com", password: "password" });
  expect(response.get("Set-Cookie")).toBeDefined();
});
