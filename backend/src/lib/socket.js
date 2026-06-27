import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return Array.from(userSocketMap[userId] || [])[0];
}

export function getReceiverSocketIds(userId) {
  return Array.from(userSocketMap[userId] || []);
}

const userSocketMap = {}; //

function getOnlineUserIds() {
  return Object.keys(userSocketMap);
}

function emitOnlineUsers() {
  const onlineUserIds = getOnlineUserIds();
  io.emit("getOnlineUsers", onlineUserIds);
  io.emit("getOnileUsers", onlineUserIds);
}

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  // io.emit() is used to send events to all the connected clients
  emitOnlineUsers();

  socket.on("online:request", () => {
    socket.emit("getOnlineUsers", getOnlineUserIds());
    socket.emit("getOnileUsers", getOnlineUserIds());
  });

  socket.on("call:offer", ({ to, from, offer, callerName, callType = "video" }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:incoming", {
        from,
        offer,
        callerName,
        callType,
      });
    }
  });

  socket.on("call:answer", ({ to, answer }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:answer", { answer });
    }
  });

  socket.on("call:ice-candidate", ({ to, candidate }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:ice-candidate", { candidate });
    }
  });

  socket.on("call:reject", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:rejected");
    }
  });

  socket.on("call:end", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:ended");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }
    emitOnlineUsers();
  });
});

export { io, app, server };
