import api from "../api/axios";

export const login = async (formData) => {
  const response = await api.post("/users/login", formData);
  return response.data;
};

export const register = async (formData) => {
  const response = await api.post("/users/register", formData);
  return response.data;
};