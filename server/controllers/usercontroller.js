import User from "../models/usermodel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId; // Get from auth middleware, not req.body
        
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        
        res.json({
            success: true,
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                isExpert: user.isExpert,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in getUserData:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.userId; // From auth middleware

        if (!name || !email) {
            return res.json({ success: false, message: "Name and email are required" });
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return res.json({ success: false, message: "Email already taken by another user" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { name, email },
            { new: true }
        );

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                isExpert: user.isExpert
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}