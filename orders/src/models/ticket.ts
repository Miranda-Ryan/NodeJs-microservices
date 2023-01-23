import mongoose, { version } from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "@rjmtix/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface ITicketAttrs {
  title: string;
  price: number;
}

interface ITicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<Boolean>;
}

interface TicketModel extends mongoose.Model<ITicketDoc> {
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<ITicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
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

// Optional: Alternative to using updateIfCurrentPlugin
// ticketSchema.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1
//   };

//   done();
// });

ticketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Completed
      ]
    }
  });

  return !!existingOrder;
};

ticketSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

const Ticket = mongoose.model<ITicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket, ITicketAttrs, ITicketDoc };
