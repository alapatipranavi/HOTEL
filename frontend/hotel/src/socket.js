// src/socket.js
import { io } from 'socket.io-client';

export const connectSocket = (token) => {
  const socket = io('http://localhost:5000', {
    auth: { token }
  });
  return socket;
};
