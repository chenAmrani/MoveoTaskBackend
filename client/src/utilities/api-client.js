import { io } from 'socket.io-client';
var socket;
export var initSocketConnection = function () {
    socket = io('https://live-code-tom.netlify.app');
    return socket;
};
