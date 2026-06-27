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
  getReceiverSocketIds(userId).forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
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
    emitToUser(to, "call:incoming", {
      from,
      offer,
      callerName,
      callType,
    });
  });

  socket.on("call:answer", ({ to, answer }) => {
    emitToUser(to, "call:answer", { answer });
  });

  socket.on("call:ice-candidate", ({ to, candidate }) => {
    emitToUser(to, "call:ice-candidate", { candidate });
  });

  socket.on("call:reject", ({ to }) => {
    emitToUser(to, "call:rejected");
  });

  socket.on("call:end", ({ to }) => {
    emitToUser(to, "call:ended");
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
