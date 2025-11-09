import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;
    
    if (!token) {
        return res.json({
            success: false,
            message: "Not Authorised. Login Again"
        });
    }
    
    try {
        const tokendecode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (tokendecode.id) {
            // Set both patterns to support all controllers
            req.userId = tokendecode.id;
            req.body.userId = tokendecode.id;
        } else {
            return res.json({
                success: false,
                message: "Not Authorised. Login Again",
            });
        }
        
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.json({
            success: false,
            message: error.message
        });
    }
}

export default userAuth;