import mongoose from "mongoose";
import { OrderStatus } from "@rjmtix/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface IOrderAttrs {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

interface IOrderDoc extends mongoose.Document {
  status: OrderStatus;
  version: number;
  userId: string;
  price: number;
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: String, required: true }
  },
  {
    toJSON: {
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);

const Order = mongoose.model<IOrderDoc>("Order", orderSchema);

export { Order, IOrderAttrs };
