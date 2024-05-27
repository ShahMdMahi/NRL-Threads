import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true,
    },
    username: {
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        require: true,
        minLength: 6,
        trim: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    followers: {
        type: [String],
        default: [],
    },
    following: {
        type: [String],
        default: [],
    },
    bio: {
        type: String,
        default: ""
    },
    isFrozen: {
        type: Boolean,
        default: false,
    }

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;