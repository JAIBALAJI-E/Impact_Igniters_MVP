import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

export const predictSign = (landmarks) => {
  return API.post("/predict-sign", { landmarks });
};
