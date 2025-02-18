import clientBetaModel from "../models/client.model.js";

export const getAllClients = async () => {
  return await clientBetaModel.find({ status: true });
};

export const getClientById = async (id) => {
  return await clientBetaModel.findById({ _id: id });
};

export const getClientByCode = async (code) => {
  return await clientBetaModel.findOne({ code: code });
};

export const getClientByCuil = async (cuil) => {
  return await clientBetaModel.findOne({ cuil: cuil });
};

export const getClientByEmail = async (email) => {
  return await clientBetaModel.findOne({ email: email });
};

export const getLastClient = async () => {
  return await clientBetaModel.findOne().sort({ _id: -1 });
};

export const createClient = async (client) => {
  return await clientBetaModel.create(client);
};

export const updateClient = async (id, client) => {
  return await clientBetaModel.updateOne({ _id: id }, { $set: client });
};

export const updateClientStatus = async (id, status) => {
  return await clientBetaModel.updateOne({ _id: id }, { $set: { status } });
};

export const deleteOrderFromClient = async (id, orderId) => {
  return await clientBetaModel.findByIdAndUpdate(
    id,
    { $pull: { orders: orderId } },
    { new: true }
  );
};
