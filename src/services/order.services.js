// -- Model
import orderBetaModel from "../models/order.model.js";

export const getAllOrders = async () => {
  return await orderBetaModel.find({ status: true });
};

export const getOrderById = async (id) => {
  return await orderBetaModel.findById({ _id: id });
};

export const getOrderBySerie = async (serie) => {
  return await orderBetaModel.findOne({ serie: serie });
};

export const getLastOrder = async () => {
  return await orderBetaModel.findOne().sort({ _id: -1 });
};

export const createOrder = async (order) => {
  return await orderBetaModel.create(order);
};

export const updateOrder = async (id, order) => {
  return await orderBetaModel.updateOne({ _id: id }, { $set: order });
};

export const updateOrderStatus = async (id, status) => {
  return await orderBetaModel.updateOne({ _id: id }, { $set: { status } });
};
