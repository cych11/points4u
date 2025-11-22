"use strict";
require("dotenv").config()
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    // return 401 if no token because not logged in
    return res.status(401).json({ error: 'not logged in' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = auth;