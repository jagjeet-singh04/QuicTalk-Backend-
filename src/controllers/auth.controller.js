import { generateToken } from "../lib/utils.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // Validate input
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing email only
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      fullName,
      email,
      password: hashedPassword,
      profilePic: ""
    };

    const createdUser = await User.create(newUser);

    generateToken(createdUser._id, res);

    res.status(201).json({
      _id: createdUser._id,
      fullName: createdUser.fullName,
      email: createdUser.email,
      profilePic: createdUser.profilePic,
    });
  } catch (error) {
    console.error("Error in signup controller", error);
    
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Duplicate key error",
        field: Object.keys(error.keyPattern)[0]
      });
    }
    
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// In backend/src/controllers/auth.controller.js
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const imageUrl = profilePic.startsWith('http') 
      ? profilePic 
      : (await cloudinary.uploader.upload(profilePic)).secure_url;

    await User.update(
      { _id: userId },
      { profilePic: imageUrl }
    );

    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.log("Update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const checkAuth = (req, res) => {
  try {
    // Remove password from user object
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};