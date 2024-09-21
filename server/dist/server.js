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
                credentials: true
            }
        });
        const codeBlockRooms = new Map();
        // Example structure: { block1: ['user123', 'user456'] }
        // Socket.IO connection handler
        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);
            // Join a code block room
            socket.on("joinCodeBlock", (codeBlockId) => {
                if (!codeBlockRooms.has(codeBlockId)) {
                    codeBlockRooms.set(codeBlockId, []);
                }
                const codeBlockMembers = codeBlockRooms.get(codeBlockId);
                const role = (codeBlockMembers === null || codeBlockMembers === void 0 ? void 0 : codeBlockMembers.length) === 0 ? "mentor" : "student";
                codeBlockMembers === null || codeBlockMembers === void 0 ? void 0 : codeBlockMembers.push(socket.id);
                socket.join(codeBlockId);
                socket.emit("roleAssignment", { role });
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
                for (const [room, members] of codeBlockRooms.entries()) {
                    if (members.includes(socket.id)) {
                        const filteredMembers = members.filter((member) => member !== socket.id);
                        codeBlockRooms.set(room, filteredMembers);
                        console.log(`User ${socket.id} removed from room: ${room}`);
                        // If no members are left in the room, delete the room
                        if (filteredMembers.length === 0) {
                            codeBlockRooms.delete(room);
                        }
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
