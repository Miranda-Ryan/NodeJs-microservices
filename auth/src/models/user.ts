import * as mongoose from "mongoose";
import { Password } from "../services/password";

// Use this when creating a new user object to enforce type checking
// ex: new User<IUserAttrs>
interface IUserAttrs {
  email: string;
  password: string;
}

// We have created an interface and extended from Document
// to ensure that our returned value has the type we expect
interface IUserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      }
    }
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

const User = mongoose.model<IUserDoc>("User", userSchema);

export { User, IUserAttrs };
