#!/usr/bin/env node
require('dotenv').config();
'use strict';

const port = process.env.PORT || 3000;
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// enable json parsing
app.use(express.json());

// Global CORS handler for all routes and preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // handle preflight options request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use('/api', routes); // mount API routes

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
