"use strict";
// import initApp from "./app";
// import http from "http";
// import { Server } from "socket.io";
// import CodeBlock from "./models/codeBlock";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// initApp().then((app) => {
//   const server = http.createServer(app);
//   const io = new Server(server, {
//     path: '/socket.io',
//     cors: {
//       origin: "https://moveo-task-frontend-theta.vercel.app",  
//       methods: ["GET", "POST"],
//       allowedHeaders: ["Content-Type"],
//       credentials: true
//     }
//   });
//   const codeBlockRooms = new Map<string,string[]>();
//   io.on('connection', (socket) => {
//     console.log('A user connected:', socket.id);
//     socket.on('joinCodeBlock', (codeBlockId) => {
//       if(!codeBlockRooms.has(codeBlockId)){
//         codeBlockRooms.set(codeBlockId, []); 
//       }
//       const codeBlockMembers = codeBlockRooms.get(codeBlockId) || [];
//       const role = codeBlockMembers.length === 0 ? 'mentor' : 'student'; 
//       console.log(`User ${socket.id} joining code block room: ${codeBlockId} as ${role}`);
//       console.log(`Code block members:`, codeBlockMembers.length);
//       codeBlockMembers.push(socket.id); 
//       codeBlockRooms.set(codeBlockId, codeBlockMembers); 
//       socket.join(codeBlockId); 
//       socket.emit('roleAssignment', { role });
//       const studentCount = codeBlockMembers.length - 1; 
//       io.to(codeBlockId).emit('studentCount', { studentCount });
//       console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
//     });
//     socket.on('codeChange', async({ codeBlockId, newCode }) => {
//       try{
//         await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
//         socket.to(codeBlockId).emit('codeUpdate', newCode);
//         console.log(`Broadcasting code change for code block: ${codeBlockId}`);
//       }catch(err){
//         console.error(`Error updating code block ${codeBlockId}:`, err);
//         socket.emit('error', 'Failed to update code block');
//       }
//     });
//     socket.on('disconnect', () => {
//       console.log('User disconnected:', socket.id);
//       for (const room of codeBlockRooms.keys()) {
//         const members = codeBlockRooms.get(room);
//         if (members?.includes(socket.id)) {
//           const filteredMembers = members.filter(member => member !== socket.id);
//           codeBlockRooms.set(room, filteredMembers);
//           console.log(`User ${socket.id} removed from room: ${room}`);
//           if (filteredMembers.length === 0) {
//             codeBlockRooms.delete(room); 
//           } else {
//             const studentCount = filteredMembers.length - 1; 
//             io.to(room).emit('studentCount', { studentCount });
//           }
//         }
//       }
//     });
//   });
//   const port = process.env.PORT || 3000;
//   server.listen(port,() => {
//     console.log(`Server running on http://localhost:${port}`);
//   });
// });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const redis_1 = require("redis");
const codeBlock_1 = __importDefault(require("./models/codeBlock"));
// Initialize Redis client
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || 'redis://localhost:6379', // Use your Redis URL here
});
redisClient.connect().catch(console.error);
// Helper functions for Redis operations
const getRoomMembers = (codeBlockId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield redisClient.lRange(`codeBlock:${codeBlockId}`, 0, -1);
});
const addMemberToRoom = (codeBlockId, memberId) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.rPush(`codeBlock:${codeBlockId}`, memberId);
});
const removeMemberFromRoom = (codeBlockId, memberId) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.lRem(`codeBlock:${codeBlockId}`, 0, memberId);
});
(0, app_1.default)().then((app) => {
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        path: '/socket.io',
        cors: {
            origin: "https://moveo-task-frontend-theta.vercel.app", // Update this to your frontend URL
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        socket.on('joinCodeBlock', (codeBlockId) => __awaiter(void 0, void 0, void 0, function* () {
            let codeBlockMembers = yield getRoomMembers(codeBlockId);
            // Assign role based on the number of members already in the room
            const role = codeBlockMembers.length === 0 ? 'mentor' : 'student';
            console.log(`User ${socket.id} joining code block room: ${codeBlockId} as ${role}`);
            console.log(`Code block members count: ${codeBlockMembers.length}`);
            // Add the new member to Redis
            yield addMemberToRoom(codeBlockId, socket.id);
            // Join the room and emit role assignment
            socket.join(codeBlockId);
            socket.emit('roleAssignment', { role });
            const studentCount = codeBlockMembers.length; // Count excludes the mentor
            io.to(codeBlockId).emit('studentCount', { studentCount });
            console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
        }));
        // Handle code change and broadcast it to the room
        socket.on('codeChange', (_a) => __awaiter(void 0, [_a], void 0, function* ({ codeBlockId, newCode }) {
            try {
                yield codeBlock_1.default.findByIdAndUpdate(codeBlockId, { code: newCode });
                socket.to(codeBlockId).emit('codeUpdate', newCode);
                console.log(`Broadcasting code change for code block: ${codeBlockId}`);
            }
            catch (err) {
                console.error(`Error updating code block ${codeBlockId}:`, err);
                socket.emit('error', 'Failed to update code block');
            }
        }));
        // Handle user disconnect
        socket.on('disconnect', () => __awaiter(void 0, void 0, void 0, function* () {
            console.log('User disconnected:', socket.id);
            // Check all rooms to see if the user was part of any room
            for (const room of yield redisClient.keys('codeBlock:*')) {
                const codeBlockId = room.split(':')[1];
                const members = yield getRoomMembers(codeBlockId);
                if (members.includes(socket.id)) {
                    // Remove the member from the room in Redis
                    yield removeMemberFromRoom(codeBlockId, socket.id);
                    const remainingMembers = yield getRoomMembers(codeBlockId);
                    console.log(`User ${socket.id} removed from room: ${codeBlockId}`);
                    // If no members are left, delete the room
                    if (remainingMembers.length === 0) {
                        yield redisClient.del(`codeBlock:${codeBlockId}`);
                    }
                    else {
                        const studentCount = remainingMembers.length - 1; // Exclude mentor
                        io.to(codeBlockId).emit('studentCount', { studentCount });
                    }
                }
            }
        }));
    });
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
