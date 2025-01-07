// -- Model
import UserBetaModel from "../models/user.model.js";

export const getAllUsers = async () => {
  return await UserBetaModel.find();
};

export const getUserById = async (id) => {
  return await UserBetaModel.findById({ _id: id });
};

export const getUserByUsername = async (username) => {
  return await UserBetaModel.findOne({ userName: username });
};

export const getUserByEmail = async (email) => {
  return await UserBetaModel.findOne({ email });
};

export const createUser = async (user) => {
  return await UserBetaModel.create(user);
};

export const updateUser = async (id, user) => {
  return await UserBetaModel.update({ _id: id }, user);
};

export const updateUserPassword = async (id, password) => {
  return await UserBetaModel.update({ _id: id }, { $set: { password } });
};

export const deleteUser = async (id) => {
  return await UserBetaModel.deleteOne({ _id: id });
};
