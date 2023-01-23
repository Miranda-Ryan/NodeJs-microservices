import mongoose, { version } from "mongoose";
import { OrderStatus } from "@rjmtix/common";
import { ITicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface IOrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: ITicketDoc;
}

interface IOrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  version: number;
  ticket: ITicketDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created
    },
    expiresAt: { type: mongoose.Schema.Types.Date },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }
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

export { IOrderAttrs, Order };
