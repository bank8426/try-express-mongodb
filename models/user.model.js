import mongoose from "mongoose";
import { isEmail } from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User Name is required"],
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: [true, "User Email is required"],
      unique: true,
      trim: true,
      minLength: 5,
      maxLength: 255,
      lowercase: true,
      validate: {
        validator: isEmail,
        message: "Please fill a valid email address",
        // isAsync: false
      },
    },
    password: {
      type: String,
      required: [true, "User Password is required"],
      minLength: 6,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
