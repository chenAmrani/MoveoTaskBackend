import { io } from 'socket.io-client';
var socket;
export var initSocketConnection = function () {
    // socket = io('https://moveo-task-bice.vercel.app');
    socket = io('http://localhost:3000'); 
    return socket;
};
