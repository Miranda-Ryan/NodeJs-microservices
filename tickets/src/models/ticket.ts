import * as mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ITicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ITicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    orderId: {
      type: String
    }
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

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);

const Ticket = mongoose.model<ITicketDoc>("Ticket", ticketSchema);

export { ITicketAttrs, Ticket };
