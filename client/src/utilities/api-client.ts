import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initSocketConnection = () => {
  // socket = io('https://moveo-task-bice.vercel.app'); 
  // socket = io('https://moveo-task-seven.vercel.app'); 
  socket = io('http://localhost:3000'); 

  return socket;
};
