import { io } from 'socket.io-client';
var socket;
export var initSocketConnection = function () {
    socket = io('https://moveo-task-pink.vercel.app');
    return socket;
};
