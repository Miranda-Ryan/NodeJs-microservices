import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[];
}

jest.mock("../natsWrapper.ts");

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "secretkey";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  };
  // Create ther JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build session object {jwt: JWT}
  const session = { jwt: token };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Encode JSON as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // Return string which is the cookie that has the encoded data
  return [`session=${base64}`];
};
