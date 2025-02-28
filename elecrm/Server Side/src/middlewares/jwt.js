const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Logger } = require("../shared/logger");

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        Logger.warn('A token is required for authentication');
        return res.status(403).send('A token is required for authentication');
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        Logger.info(`Token verified for user: ${decoded.username}`);
    } catch (err) {
        Logger.error('Invalid Token:', err.message);
        return res.status(401).send('Invalid Token');
    }
    return next();
};


module.exports = {
    generateToken,
    verifyToken,
};
