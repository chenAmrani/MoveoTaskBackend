import initApp from "./app";
import http from 'http';
import { Server } from 'socket.io';
import CodeBlock from './models/codeBlock';


initApp().then((app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"], 
      credentials: true 
    }
  });

  const codeBlockRooms = new Map<string,string[]>();
  //{ block1: ['user123', 'user456'] }
  
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinCodeBlock', (codeBlockId) => {
      if(!codeBlockRooms.has(codeBlockId)){
        codeBlockRooms.set(codeBlockId,[]);
      }
      const codeBlockMembers = codeBlockRooms.get(codeBlockId);
      const role= codeBlockMembers?.length === 0? 'mentor' : 'student';
      codeBlockMembers?.push(socket.id);
      socket.join(codeBlockId);
      socket.emit('roleAssignment', { role });
      console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
    });

    socket.on('codeChange', async({ codeBlockId, newCode }) => {
      try{
        await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
        socket.to(codeBlockId).emit('codeUpdate', newCode);
        console.log(`Broadcasting code change for code block: ${codeBlockId}`);
      }catch(err){
        console.error(`Error updating code block ${codeBlockId}:`, err);
        socket.emit('error', 'Failed to update code block');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      for (const room of codeBlockRooms.keys()) {
        const members = codeBlockRooms.get(room);
        if (members?.includes(socket.id)) {
          const filteredMembers = members.filter((member)=> member !== socket.id);
          codeBlockRooms.set(room,filteredMembers);
          console.log(`User ${socket.id} removed from room: ${room}`);
          if (members.length === 0) {
            codeBlockRooms.delete(room);
          }
        }
      }
    });
  });

  server.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
});
