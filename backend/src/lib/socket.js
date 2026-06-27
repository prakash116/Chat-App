import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL
      ? ["http://localhost:5173", process.env.CLIENT_URL]
      : true,
    credentials: true,
    methods: ["GET", "POST"],
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

function emitToUser(userId, event, payload) {
  const socketIds = getReceiverSocketIds(userId);
  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
  return socketIds.length;
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

  socket.on("call:offer", ({ to, from, offer, callerName, callType = "video", callId }) => {
    const delivered = emitToUser(to, "call:incoming", {
      from,
      offer,
      callerName,
      callType,
      callId,
    });
    if (delivered === 0) {
      socket.emit("call:unavailable", { callId });
    }
  });

  socket.on("call:answer", ({ to, from, answer, callId }) => {
    emitToUser(to, "call:answer", { from, answer, callId });
  });

  socket.on("call:ice-candidate", ({ to, from, candidate, callId }) => {
    emitToUser(to, "call:ice-candidate", { from, candidate, callId });
  });

  socket.on("call:busy", ({ to, callId }) => {
    emitToUser(to, "call:busy", { callId });
  });

  socket.on("call:reject", ({ to, callId }) => {
    emitToUser(to, "call:rejected", { callId });
  });

  socket.on("call:end", ({ to, callId }) => {
    emitToUser(to, "call:ended", { callId });
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
