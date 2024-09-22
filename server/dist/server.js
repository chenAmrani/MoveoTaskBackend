"use strict";
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
                credentials: true,
            },
        });
        const codeBlockRooms = new Map();
        // Socket.IO connection handler
        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);
            // Join a code block room
            socket.on("joinCodeBlock", (codeBlockId) => __awaiter(void 0, void 0, void 0, function* () {
                if (!codeBlockRooms.has(codeBlockId)) {
                    codeBlockRooms.set(codeBlockId, { mentor: null, students: [] });
                }
                const room = codeBlockRooms.get(codeBlockId);
                const codeBlock = yield codeBlock_1.default.findById(codeBlockId); // Get the code block details
                const solution = codeBlock === null || codeBlock === void 0 ? void 0 : codeBlock.correctSolution; // Assuming the correct solution is stored here
                // Assign role based on room state
                let role;
                if (!(room === null || room === void 0 ? void 0 : room.mentor)) {
                    role = "mentor";
                    room.mentor = socket.id;
                }
                else {
                    role = "student";
                    room.students.push(socket.id);
                }
                socket.join(codeBlockId);
                socket.emit("roleAssignment", { role });
                io.in(codeBlockId).emit("studentCount", { studentCount: (room === null || room === void 0 ? void 0 : room.students.length) || 0 });
                // Handle code changes from students
                socket.on("codeChange", (_a) => __awaiter(void 0, [_a], void 0, function* ({ codeBlockId, newCode }) {
                    try {
                        yield codeBlock_1.default.findByIdAndUpdate(codeBlockId, { code: newCode });
                        // Broadcast the new code to all clients except the sender
                        socket.to(codeBlockId).emit("codeChange", newCode);
                        // Check if the new code matches the solution
                        if (newCode === solution) {
                            // If the code matches the solution, emit the 'showSmiley' event
                            io.in(codeBlockId).emit("showSmiley");
                            console.log(`Solution matched for code block ${codeBlockId}, showing smiley.`);
                        }
                    }
                    catch (err) {
                        console.error(`Error updating code block ${codeBlockId}:`, err);
                        socket.emit("error", "Failed to update code block");
                    }
                }));
                // Handle mentor leaving the session
                socket.on("mentorLeft", ({ codeBlockId }) => {
                    if ((room === null || room === void 0 ? void 0 : room.mentor) === socket.id) {
                        room.mentor = null;
                        io.in(codeBlockId).emit("mentorLeft"); // Notify students to leave
                        room.students = []; // Clear the students list
                    }
                });
                // Handle user disconnecting
                socket.on("disconnect", () => {
                    console.log("User disconnected:", socket.id);
                    for (const [roomId, room] of codeBlockRooms.entries()) {
                        if (room.mentor === socket.id) {
                            io.in(roomId).emit("mentorLeft");
                            codeBlockRooms.delete(roomId);
                        }
                        else if (room.students.includes(socket.id)) {
                            room.students = room.students.filter((studentId) => studentId !== socket.id);
                            io.in(roomId).emit("studentCount", { studentCount: room.students.length });
                        }
                    }
                });
            }));
        });
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
