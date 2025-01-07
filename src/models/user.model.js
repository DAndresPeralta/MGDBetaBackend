// -- Modules
import mongoose from "mongoose";

const userBetaCollection = "userBeta";

const userBetaSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: String,
  email: String,
  role: String,
  password: String,
});

const userBetaModel = mongoose.model(userBetaCollection, userBetaSchema);

export default userBetaModel;
