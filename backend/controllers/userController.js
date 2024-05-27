import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const { query } = req.params;

        let user;

        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
        } else {
            user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
        }

        if (!user) return res.status(400).json({ error: "User doesn't exists" });

        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserProfile: ", err.message);
    }
};

// Get Suggested Users
const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ]);

        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));

        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => user.password = null)

        res.status(200).json(suggestedUsers);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getSuggestedUsers: ", err.message);
    }
};

// Signup User
const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        if (!name) return res.status(400).json({ error: "Name is required" });
        if (!username) return res.status(400).json({ error: "Username is required" });
        if (!email) return res.status(400).json({ error: "Email is required" });
        if (!password) return res.status(400).json({ error: "Password is required" });

        const user = await User.findOne({ $or: [{ email }, { username }] });

        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
        });

        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res);
            res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    bio: newUser.bio,
                    profilePic: newUser.profilePic,
                }
            });
        } else {
            res.status(400).json({ error: "Invalid user data" })
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in signupUser: ", err.message);
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        const isPassowrdCorrect = await bcrypt.compare(password, user?.password || "");

        if (!user || !isPassowrdCorrect) return res.status(400).json({ error: "Invalid username or password" });

        if(user.isFrozen) {
            user.isFrozen = false;
            await user.save();
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(201).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                profilePic: user.profilePic,
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in loginUser: ", err.message);
    }

};

// Logout User
const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ message: "User logged out successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in logoutUser: ", err.message);
    }
};

// Follow Unfollow User
const followUnFollowUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (req.user._id.toString() === id) return res.status(400).json({ error: "You can't follow/unfollow yourself" });

        if (!userToModify || !currentUser) return res.status(404).json({ error: "User not found" });

        const isFollowing = currentUser.following.includes(id);

        if (isFollowing) {
            // unfollow user
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

            // modify current user following, modify followers of userToModfiy
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

            res.status(200).json({ message: "User unfollowed successfull" });
        } else {
            // follow user
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

            // modify current user following, modify followers of userToModfiy
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

            res.status(200).json({ message: "User followed successfull" });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in followUnFollowUser: ", err.message);
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { name, email, username, password, bio } = req.body;
        let { profilePic } = req.body;
        const userId = req.user._id;

        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (req.params.id !== userId.toString()) return res.status(400).json({ error: "You can't update other user's profile" })

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if (profilePic) {
            if (user.profilePic) {
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            user.profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;

        user = await user.save();

        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic,
                }
            },
            { arrayFilters: [{ "reply.userId": userId }] }
        );

        user.password = null;

        res.status(200).json({ message: "User profile updated successfully", user });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in updateUser: ", err.message);
    }
};

// Freeze Account 
const freezeAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if(!user) {
            res.status(404).json({error: "User not found"});
            return;
        }

        user.isFrozen = true;

        await user.save();

        res.status(200).json({message: "Account freezed successfully"});

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in freezeAccount: ", err.message);
    }
};


export {
    signupUser,
    loginUser,
    logoutUser,
    followUnFollowUser,
    updateUser,
    getUserProfile,
    getSuggestedUsers,
    freezeAccount,
};