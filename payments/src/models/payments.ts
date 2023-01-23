import mongoose from "mongoose";

interface IPaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface IPaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    stripeId: { type: String, required: true }
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

paymentSchema.set("versionKey", "version");

const Payment = mongoose.model<IPaymentDoc>("payment", paymentSchema);

export { Payment, IPaymentAttrs };
