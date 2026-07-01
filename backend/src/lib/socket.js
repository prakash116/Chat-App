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
// Pending "peer left the call" notifications, keyed by userId. A short grace
// period lets a socket.io reconnect (new socket id) resume the call instead of
// tearing it down on a brief network blip.
const pendingCallTeardowns = {};
const CALL_DISCONNECT_GRACE_MS = 6000;

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

// Fan out to every socket of a user EXCEPT the one that handled the call.
// Used so a callee's other logged-in devices stop ringing once one of them
// accepts or rejects the call.
function emitToUserExcept(userId, exceptSocketId, event, payload) {
  getReceiverSocketIds(userId).forEach((socketId) => {
    if (socketId !== exceptSocketId) {
      io.to(socketId).emit(event, payload);
    }
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
    // The user is back within the grace window: cancel a pending call teardown.
    if (pendingCallTeardowns[userId]) {
      clearTimeout(pendingCallTeardowns[userId]);
      delete pendingCallTeardowns[userId];
    }
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
      return;
    }
    // Remember the peer so we can tear the call down for them if this socket
    // (the caller) drops before the call ends.
    socket.data.call = { peerId: to, callId };
  });

  socket.on("call:answer", ({ to, from, answer, callId }) => {
    emitToUser(to, "call:answer", { from, answer, callId });
    // This device answered; bind the call so a disconnect notifies the caller.
    socket.data.call = { peerId: to, callId };
    // Tell this user's OTHER devices to stop ringing for this call.
    if (from) {
      emitToUserExcept(from, socket.id, "call:handled", { callId });
    }
  });

  socket.on("call:ice-candidate", ({ to, from, candidate, callId }) => {
    emitToUser(to, "call:ice-candidate", { from, candidate, callId });
  });

  socket.on("call:busy", ({ to, callId }) => {
    emitToUser(to, "call:busy", { callId });
  });

  socket.on("call:reject", ({ to, from, callId }) => {
    emitToUser(to, "call:rejected", { callId });
    // Stop the rejecting user's other devices from ringing too.
    if (from) {
      emitToUserExcept(from, socket.id, "call:handled", { callId });
    }
  });

  socket.on("call:end", ({ to, callId }) => {
    emitToUser(to, "call:ended", { callId });
    socket.data.call = null;
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }

    // If this socket was in a call, let the peer know it dropped so they are not
    // stranded on a dead call — but wait out a short grace period first so a
    // socket.io reconnect (transient network blip) does not kill a live call.
    const activeCall = socket.data.call;
    socket.data.call = null;
    if (activeCall && activeCall.peerId && userId) {
      if (pendingCallTeardowns[userId]) {
        clearTimeout(pendingCallTeardowns[userId]);
      }
      pendingCallTeardowns[userId] = setTimeout(() => {
        delete pendingCallTeardowns[userId];
        // Still fully offline after the grace window: end the call for the peer.
        if (!userSocketMap[userId] || userSocketMap[userId].size === 0) {
          emitToUser(activeCall.peerId, "call:ended", { callId: activeCall.callId });
        }
      }, CALL_DISCONNECT_GRACE_MS);
    }

    emitOnlineUsers();
  });
});

export { io, app, server };
