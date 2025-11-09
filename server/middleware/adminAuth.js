import jwt from 'jsonwebtoken';
import User from '../models/usermodel.js';

const adminAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ success: false, message: "Not Authorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access denied. Admin role required."
            });
        }
        
        req.user = user;
        req.userId = user._id;     // Set both patterns for consistency
        req.body.userId = user._id; // Set userId for consistency
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: error.message });
    }
};

export default adminAuth; 