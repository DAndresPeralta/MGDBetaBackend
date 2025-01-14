// -- Modules
import mongoose from "mongoose";

const orderBetaCollection = "orderBeta";

const orderBetaSchema = new mongoose.Schema(
  {
    serie: String,
    date: Date,
    client: String,
    cuil: String,
    email: String,
    taxpayer: String,
    product: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    total: Number,
    attach: Buffer,
    status: Boolean,
  },
  { timestamps: true }
);

const orderBetaModel = mongoose.model(orderBetaCollection, orderBetaSchema);

export default orderBetaModel;
