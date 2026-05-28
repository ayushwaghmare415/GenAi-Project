import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // Removes extra spaces
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"], // Email validation
    },

    avatar: {
      type: String,
      default: "",
    },

    credits: {
      type: Number,
      default: 100,
      min: [0, "Credits cannot be negative"],
    },

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    lastPurchasedSessionId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Prevent model overwrite error in development
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;