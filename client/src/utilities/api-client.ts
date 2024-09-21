import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initSocketConnection = () => {
  socket = io('https://moveo-task-33v4.vercel.app'); 
  return socket;
};
