import jwt from 'jsonwebtoken';
import User from '../models/users.js';

export const verifyToken = async (req, res, next) => {
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
        req.user = await User.findById(decoded.id).select('-password');

        if(!req.user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }
        
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
            error: 'User not Authorized'
        })
    }
}