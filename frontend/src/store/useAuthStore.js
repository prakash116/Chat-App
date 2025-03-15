import { create } from "zustand";
import { axioxInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001": "/";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  onlineUsers: [],
  isUpdateingProfile: false,
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axioxInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth", error);
      get().disconnectSocket();
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    const user = {
      fullName: data.fullname,
      email: data.email,
      password: data.password,
    };
    set({ isSigningUp: true });
    try {
      const res = await axioxInstance.post("/auth/signup", user);
      set({ authUser: res.data });
      toast.success("Signup successful");
      get().connectSocket();
    } catch (error) {
      get().disconnectSocket();
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axioxInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Login successful");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
      get().disconnectSocket();
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axioxInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout successful");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  },

  updateProfile: async (data) => {
    console.log(data);
    set({ isUpdateingProfile: true });
    try {
      const res = await axioxInstance.put("/auth/update-profile", data);
      console.log(res);

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log(error);
    } finally {
      set({ isUpdateingProfile: false });
    }
  },

  connectSocket: async () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query:{
        userId: authUser._id,
      }
    });
    socket.connect();
    set({ socket: socket })

    socket.on("getOnileUsers", (userIds) => {
      set({ onlineUsers: userIds })
    })
  },

  disconnectSocket: async () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null })
  },
}));
