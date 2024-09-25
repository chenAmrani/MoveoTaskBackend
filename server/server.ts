// import initApp from "./app";
// import http from "http";
// import { Server } from "socket.io";
// import CodeBlock from "./models/codeBlock";


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




import initApp from "./app";
import http from "http";
import { Server } from "socket.io";
import { createClient } from 'redis';
import CodeBlock from "./models/codeBlock";

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',  // Use your Redis URL here
});

redisClient.connect().catch(console.error);

// Helper functions for Redis operations
const getRoomMembers = async (codeBlockId: string): Promise<string[]> => {
  return await redisClient.lRange(`codeBlock:${codeBlockId}`, 0, -1);
};

const addMemberToRoom = async (codeBlockId: string, memberId: string) => {
  await redisClient.rPush(`codeBlock:${codeBlockId}`, memberId);
};

const removeMemberFromRoom = async (codeBlockId: string, memberId: string) => {
  await redisClient.lRem(`codeBlock:${codeBlockId}`, 0, memberId);
};

initApp().then((app) => {
  const server = http.createServer(app);
  const io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin: "https://moveo-task-frontend-sandy.vercel.app",  
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinCodeBlock', async (codeBlockId) => {
      let codeBlockMembers = await getRoomMembers(codeBlockId);

      // Assign role based on the number of members already in the room
      const role = codeBlockMembers.length === 0 ? 'mentor' : 'student';
      console.log(`User ${socket.id} joining code block room: ${codeBlockId} as ${role}`);
      console.log(`Code block members count: ${codeBlockMembers.length}`);

      // Add the new member to Redis
      await addMemberToRoom(codeBlockId, socket.id);

      // Join the room and emit role assignment
      socket.join(codeBlockId);
      socket.emit('roleAssignment', { role });

      const studentCount = codeBlockMembers.length; // Count excludes the mentor
      io.to(codeBlockId).emit('studentCount', { studentCount });

      console.log(`User ${socket.id} joined code block room: ${codeBlockId} as ${role}`);
    });

    // Handle code change and broadcast it to the room
    socket.on('codeChange', async ({ codeBlockId, newCode }) => {
      try {
        await CodeBlock.findByIdAndUpdate(codeBlockId, { code: newCode });
        socket.to(codeBlockId).emit('codeUpdate', newCode);
        console.log(`Broadcasting code change for code block: ${codeBlockId}`);
      } catch (err) {
        console.error(`Error updating code block ${codeBlockId}:`, err);
        socket.emit('error', 'Failed to update code block');
      }
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);

      // Check all rooms to see if the user was part of any room
      for (const room of await redisClient.keys('codeBlock:*')) {
        const codeBlockId = room.split(':')[1];
        const members = await getRoomMembers(codeBlockId);

        if (members.includes(socket.id)) {
          // Remove the member from the room in Redis
          await removeMemberFromRoom(codeBlockId, socket.id);
          const remainingMembers = await getRoomMembers(codeBlockId);

          console.log(`User ${socket.id} removed from room: ${codeBlockId}`);

          // If no members are left, delete the room
          if (remainingMembers.length === 0) {
            await redisClient.del(`codeBlock:${codeBlockId}`);
          } else {
            const studentCount = remainingMembers.length - 1; // Exclude mentor
            io.to(codeBlockId).emit('studentCount', { studentCount });
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

