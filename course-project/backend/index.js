#!/usr/bin/env node
require('dotenv').config();
'use strict';

const port = process.env.PORT || 3000;

const express = require("express");
const cors = require("cors");
const routes = require('./src/routes');
const app = express();

// Enable CORS
app.use(cors());

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