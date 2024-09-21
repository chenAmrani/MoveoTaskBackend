import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initSocketConnection = () => {
  socket = io('https://moveo-task-pink.vercel.app'); 
  return socket;
};
