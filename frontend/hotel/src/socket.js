// src/socket.js
import { io } from 'socket.io-client';

export const connectSocket = (token) => {
  const socket = io('https://hotel-zbnp.onrender.com', {
    auth: { token }
  });
  return socket;
};
