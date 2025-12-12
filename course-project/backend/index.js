#!/usr/bin/env node
require('dotenv').config();
'use strict';

const port = process.env.PORT || 3000;
const express = require("express");
const cors = require("cors");
const routes = require('./src/routes');
const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Enable JSON parsing
app.use(express.json());

// enable CORS
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', cors());
app.use("/api", routes); // mount API routes

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
