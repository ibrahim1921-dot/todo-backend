import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    // Get token from cookies
    const token = req.cookies.jwt;

    if(!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.user = decoded;
        next();
    } catch(error){
        // Handle specific JWT errors
        if(error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid authentication token'
            })
        }

        return res.status(401).json({
            success: false,
            error: 'Token verification failed'
        })
    }
}