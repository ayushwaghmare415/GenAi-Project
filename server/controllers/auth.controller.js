import User from "../model/user.model.js";
import jwt from "jsonwebtoken";

// Google Auth
export const googleAuth = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // Create new user if not found
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar,
      });
    }
    else {
      // Update avatar if provided (keeps profile image in sync with Google)
      if (avatar && avatar !== user.avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ ...user.toObject ? user.toObject() : user, token });

  } catch (error) {
    console.error("googleAuth error:", error);
    return res.status(500).json({
      message: `googleAuth error: ${error.message}`,
    });
  }
};

// Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Logout error: ${error.message}`,
    });
  }
};

