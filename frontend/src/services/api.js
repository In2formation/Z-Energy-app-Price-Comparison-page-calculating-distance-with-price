// Frontend routes //
//Gen ai imports start line 4 - hi Zeus, once your import done move to 
// 👇🏻                           line 40 for your block:









//Station & fuel price routes:
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const getStations = async () => {
  const res = await axios.get(`${API_URL}/stations`);
  return res.data;
};


export const getStationById = async (id) => {
  const res = await axios.get(`${API_URL}/stations/${id}`);
  return res.data;
};

export const getCheapestFuel = async (fuelType) => {
  const res = await axios.get(`${API_URL}/stations/cheapest/${fuelType}`);
  return res.data;
};










//Zeus AI routes:
// Chatbot API call to backend, which then calls genai.js to get the response from Gemini and returns it to the frontend
export const askChatbot = async (message, context = {}) => {
  const res = await axios.post(`${API_URL}/stations/ai/chat`, { message, context });
  return res.data;
};

export const getChatbotStatus = async () => {
  const res = await axios.get(`${API_URL}/stations/ai/status`, {
    timeout: 5000,
  });
  return res.data;
};