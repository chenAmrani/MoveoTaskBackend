import { io } from 'socket.io-client';
var socket;
export var initSocketConnection = function () {
    socket = io('https://moveo-task-33v4.vercel.app');
    return socket;
};
