// -- Modules
import mongoose from "mongoose";

const orderBetaCollection = "orderBeta";

const orderBetaSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clientBeta",
      default: [],
    },
    serie: String,
    date: Date,
    product: [
      {
        name: String,
        quantity: Number,
        price: Number,
        discount: Number,
      },
    ],
    subtotal: Number,
    total: Number,
    attach: Buffer,
    status: Boolean,
  },
  { timestamps: true }
);

const orderBetaModel = mongoose.model(orderBetaCollection, orderBetaSchema);

export default orderBetaModel;
