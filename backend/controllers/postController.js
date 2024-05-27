import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

// Create Post
const createPost = async (req, res) => {
    try {
        const { postedBy, text } = req.body;
        let { img } = req.body;

        if (!postedBy) {
            return res.status(400).json({ error: "Postedby field required" });
        }

        if (!text) {
            return res.status(400).json({ error: "Text field required" });
        }

        const user = await User.findById(postedBy);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to create post" });
        }

        const maxLength = 500;
        if (text.lenght > maxLength) {
            return res.status(400).json({ error: `Text must be less than ${maxLength} character` });
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({ postedBy, text, img });

        await newPost.save();

        res.status(201).json({ message: "Post created successfully", newPost });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in createPost: ", err.message);
    }
};

// Get Post
const getPost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        res.status(200).json(post);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getPost: ", err.message);
    }
};

// Delete Post
const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized to delete this post" });
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);

        res.status(200).json({ message: "Post deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in deletePost: ", err.message);
    }
};

// Like Unlike Post
const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Unlike Post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ message: "Post unliked successfully" });
        } else {
            // Like Post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ message: "Post liked successfully" });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in likeUnlikePost: ", err.message);
    }
};

// Reply To Post
const replyToPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
        const username = req.user.username;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const reply = { userId, text, userProfilePic, username };

        post.replies.push(reply);

        await post.save();

        res.status(200).json({ message: "Reply added successfully", reply });


    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in replyToPost: ", err.message);
    }
};

// Get Feed Posts
const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;

        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

        if (!feedPosts) {
            return res.status(404).json({ error: "No post found" });
        }

        res.status(200).json(feedPosts);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getFeedPost: ", err.message);
    }
};

// Get User Posts
const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });
        if (!posts) {
            return res.status(404).json({ error: "No post found" });
        }

        res.status(200).json(posts);

    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in getUserPosts: ", err.message);
    }
};


export {
    createPost,
    getPost,
    deletePost,
    likeUnlikePost,
    replyToPost,
    getFeedPosts,
    getUserPosts,
};