import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';
export const protectRoute = async(req, res, next) => {
    try {
        const bearerToken = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : null
        const token = req.cookies.jwt || bearerToken
        if (!token) {
            return res.status(401).json({ msg: 'Not authorized, token is required' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (!decoded) {
            return res.status(401).json({ msg: 'Not authorized, token is invalid' });
        }
        const user = await User.findById(decoded.userId)
        if (!user) {
            return res.status(401).json({ msg: 'Not authorized, user not found' });
        }
        req.user = user
        next()
    } catch (error) {
        console.error(error)
        res.status(500).json({ msg: 'Internal Server Error (Protect Route)', error: error.message });
    }
}
