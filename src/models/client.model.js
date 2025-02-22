// -- Modules
import mongoose from "mongoose";

const clientBetaCollection = "clientBeta";

const clientBetaSchema = new mongoose.Schema({
  code: String,
  companyName: String,
  cuil: String,
  email: String,
  address: String,
  taxpayer: String,
  status: Boolean,
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "orderBeta", // Aquí haces la referencia a "orderBeta"
    default: [],
  },
});

const clientBetaModel = mongoose.model(clientBetaCollection, clientBetaSchema);

export default clientBetaModel;
