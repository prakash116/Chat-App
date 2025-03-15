import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import multer from "multer";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Genrate Token
      generateToken(newUser._id, res);
      await newUser.save();
      return res
        .status(201)
        .json({ message: "User created successfully", data: newUser });
    } else {
      return res.status(500).json({ message: "Failed to create user" });
    }
  } catch (error) {
    console.error(error, "Error in signup controller");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    } else {
      generateToken(user._id, res);
      return res.json({ message: "Logged in successfully", data: user });
    }
  } catch (error) {
    console.error(error, "Error in login controller");
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); // Fixed method name
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const storage = multer.memoryStorage();

export const userMulter = multer({ storage: storage }).single("profilePic");

export const updateProfile = async (req, res) => {
  try {
    if (!req.file){
      return res.status(400).json({ message: "Profile picture is required" });
    }
    const userId = req.user._id;
    const fileBase64 = req.file.buffer.toString("base64");

    const uploadResponse = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileBase64}`,
      {
        folder: "profile_pics",
        resource_type: "auto",
      }
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update profile" });
    }
    return res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateProfile controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
