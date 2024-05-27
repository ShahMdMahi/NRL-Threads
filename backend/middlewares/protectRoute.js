import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWR_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        req.user = user;

        next();

    } catch (err) {
        res.status(500).json({ nessage: err.message });
        console.log("Error in protectRoute: ", err.message);
    }
};

export default protectRoute;