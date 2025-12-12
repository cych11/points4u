#!/usr/bin/env node
require('dotenv').config();
'use strict';

const port = process.env.PORT || 3000;

const express = require("express");
const cors = require("cors");
const routes = require('./src/routes');
const app = express();

// Enable CORS
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }));

// Enable trust proxy for accurate IP detection in rate limiting
app.set('trust proxy', true);
app.use(express.json());
app.use("/api", routes);

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

server.on('error', (err) => {
    console.error(`cannot start server: ${err.message}`);
    process.exit(1);
});