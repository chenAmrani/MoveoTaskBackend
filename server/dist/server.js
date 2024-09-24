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
(0, app_1.default)().then((app) => {
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type"],
            credentials: true
        }
    });
    const codeBlockRooms = new Map();
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        socket.on('joinCodeBlock', (codeBlockId) => {
            if (!codeBlockRooms.has(codeBlockId)) {
                codeBlockRooms.set(codeBlockId, []);
            }
            const codeBlockMembers = codeBlockRooms.get(codeBlockId) || [];
            const role = codeBlockMembers.length === 0 ? 'mentor' : 'student';
            console.log(`User ${socket.id} joining code block room: ${codeBlockId} as ${role}`);
            console.log(`Code block members:`, codeBlockMembers.length);
            codeBlockMembers.push(socket.id);
            codeBlockRooms.set(codeBlockId, codeBlockMembers);
            socket.join(codeBlockId);
            socket.emit('roleAssignment', { role });
            const studentCount = codeBlockMembers.length - 1;
            io.to(codeBlockId).emit('studentCount', { studentCount });
            console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
        });
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
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
            for (const room of codeBlockRooms.keys()) {
                const members = codeBlockRooms.get(room);
                if (members === null || members === void 0 ? void 0 : members.includes(socket.id)) {
                    const filteredMembers = members.filter(member => member !== socket.id);
                    codeBlockRooms.set(room, filteredMembers);
                    console.log(`User ${socket.id} removed from room: ${room}`);
                    if (filteredMembers.length === 0) {
                        codeBlockRooms.delete(room);
                    }
                    else {
                        const studentCount = filteredMembers.length - 1;
                        io.to(room).emit('studentCount', { studentCount });
                    }
                }
            }
        });
    });
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});
