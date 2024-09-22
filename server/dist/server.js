"use strict";
// import initApp from "./app";
// import http from "http";
// import { Server } from "socket.io";
// import CodeBlock from "./models/codeBlock"
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
// // Initialize the application
// const startServer = async () => {
//   try {
//     const app = await initApp();
//     // Create the HTTP server
//     const server = http.createServer(app);
//     // Initialize Socket.IO with CORS options
//     const io = new Server(server, {
//       cors: {
//         origin: "*", 
//         methods: ["GET", "POST"],
//         allowedHeaders: ["Content-Type"],
//         credentials: true
//       }
//     });
//     const codeBlockRooms = new Map<string, string[]>(); 
//     // Example structure: { block1: ['user123', 'user456'] }
//     // Socket.IO connection handler
//     io.on("connection", (socket) => {
//       console.log("User connected:", socket.id);
//       // Join a code block room
//       socket.on("joinCodeBlock", (codeBlockId: string) => {
//         if (!codeBlockRooms.has(codeBlockId)) {
//           codeBlockRooms.set(codeBlockId, []);
//         }
//         const codeBlockMembers = codeBlockRooms.get(codeBlockId);
//         const role = codeBlockMembers?.length === 0 ? "mentor" : "student";
//         codeBlockMembers?.push(socket.id);
//         socket.join(codeBlockId);
//         socket.emit("roleAssignment", { role });
//         console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
//       });
//       // Handle code changes
//       socket.on("codeChange", async ({ codeBlockId, newCode }: { codeBlockId: string; newCode: string }) => {
//         try {
//           await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
//           socket.to(codeBlockId).emit("codeUpdate", newCode);
//           console.log(`Broadcasting code change for code block: ${codeBlockId}`);
//         } catch (err) {
//           console.error(`Error updating code block ${codeBlockId}:`, err);
//           socket.emit("error", "Failed to update code block");
//         }
//       });
//       // Handle user disconnection
//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//         for (const [room, members] of codeBlockRooms.entries()) {
//           if (members.includes(socket.id)) {
//             const filteredMembers = members.filter((member) => member !== socket.id);
//             codeBlockRooms.set(room, filteredMembers);
//             console.log(`User ${socket.id} removed from room: ${room}`);
//             // If no members are left in the room, delete the room
//             if (filteredMembers.length === 0) {
//               codeBlockRooms.delete(room);
//             }
//           }
//         }
//       });
//     });
//     // Start the server
//     const port = process.env.PORT || 3000;
//     server.listen(port, () => {
//       console.log(`Server running on http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error("Error starting the server:", error);
//   }
// };
// // Run the server
// startServer();
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const codeBlock_1 = __importDefault(require("./models/codeBlock"));
// Initialize the application
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const app = yield (0, app_1.default)();
        // Create the HTTP server
        const server = http_1.default.createServer(app);
        // Initialize Socket.IO with CORS options
        const io = new socket_io_1.Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type"],
                credentials: true
            }
        });
        const codeBlockRooms = new Map();
        // Example structure: { block1: { mentor: 'user123', students: ['user456', 'user789'] } }
        // Socket.IO connection handler
        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);
            // Join a code block room
            socket.on("joinCodeBlock", (codeBlockId) => {
                if (!codeBlockRooms.has(codeBlockId)) {
                    // Initialize the room with no mentor and empty student list
                    codeBlockRooms.set(codeBlockId, { mentor: null, students: [] });
                }
                const room = codeBlockRooms.get(codeBlockId);
                // Assign role based on the current state of the room
                let role;
                if (!(room === null || room === void 0 ? void 0 : room.mentor)) {
                    role = "mentor";
                    room.mentor = socket.id; // Assign this user as the mentor
                }
                else {
                    role = "student";
                    room.students.push(socket.id); // Add this user as a student
                }
                socket.join(codeBlockId);
                socket.emit("roleAssignment", { role });
                // Broadcast the updated number of students in the room
                io.in(codeBlockId).emit("studentCount", { studentCount: (room === null || room === void 0 ? void 0 : room.students.length) || 0 });
                console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
            });
            // Handle code changes
            socket.on("codeChange", (_a) => __awaiter(void 0, [_a], void 0, function* ({ codeBlockId, newCode }) {
                try {
                    yield codeBlock_1.default.findByIdAndUpdate(codeBlockId, { code: newCode });
                    socket.to(codeBlockId).emit("codeUpdate", newCode);
                    console.log(`Broadcasting code change for code block: ${codeBlockId}`);
                }
                catch (err) {
                    console.error(`Error updating code block ${codeBlockId}:`, err);
                    socket.emit("error", "Failed to update code block");
                }
            }));
            // Handle user disconnection
            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
                for (const [roomId, room] of codeBlockRooms.entries()) {
                    if (room.mentor === socket.id) {
                        // If the mentor leaves, reset the room and notify the students
                        console.log(`Mentor ${socket.id} left the room: ${roomId}`);
                        room.mentor = null;
                        io.in(roomId).emit("mentorLeft"); // Notify students to leave the room
                        room.students.forEach((studentId) => {
                            var _a;
                            (_a = io.sockets.sockets.get(studentId)) === null || _a === void 0 ? void 0 : _a.leave(roomId); // Remove all students from the room
                        });
                        room.students = []; // Clear the students list
                    }
                    else if (room.students.includes(socket.id)) {
                        // If a student leaves, update the student list
                        room.students = room.students.filter((studentId) => studentId !== socket.id);
                        io.in(roomId).emit("studentCount", { studentCount: room.students.length }); // Broadcast updated student count
                        console.log(`Student ${socket.id} left the room: ${roomId}`);
                    }
                    // If no members are left in the room, delete the room
                    if (!room.mentor && room.students.length === 0) {
                        codeBlockRooms.delete(roomId);
                        console.log(`Room ${roomId} has been deleted`);
                    }
                }
            });
        });
        // Start the server
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error("Error starting the server:", error);
    }
});
// Run the server
startServer();
