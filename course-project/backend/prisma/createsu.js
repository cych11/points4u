/*
 * Complete this script so that it is able to add a superuser to the database
 * Usage example: 
 *   node prisma/createsu.js clive123 clive.su@mail.utoronto.ca SuperUser123!
 */
'use strict';
const prisma = require('../src/prisma');
const bcrypt = require('bcrypt');

const utorid = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

const saltRounds = 10;

if (!utorid || !email || !password) {
  console.error("Usage: node prisma/createsu.js <utorid> <email> <password>");
  process.exit(1);
}

async function createSuperUser() {
  try {
    const salt = bcrypt.genSaltSync(saltRounds); //https://www.npmjs.com/package/bcrypt
    const hash = bcrypt.hashSync(password, salt);
const superUser = await prisma.user.create({ 
      data: {
      utorid: utorid,
      name: 'Superuser',
      email: email,
      role: 'superuser',
      points: 0,
      verified: true,
      password: hash,
      expiresAt: null,
      resetToken: null,
      suspicious: false
      } 
  });
  console.log('Superuser created:', superUser);
  } catch (err) {
    console.error('Error creating superuser', err);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();
