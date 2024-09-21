import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initSocketConnection = () => {
  socket = io('https://live-code-tom.netlify.app'); 
  return socket;
};
