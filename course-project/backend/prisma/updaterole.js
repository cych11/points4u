/*
 * Script to update a user's role directly in the database
 * Usage: 
 *   node prisma/updaterole.js <utorid> <role>
 *   Roles: regular, cashier, manager, superuser
 * 
 * Example:
 *   node prisma/updaterole.js testuser manager
 */
'use strict';
const prisma = require('../src/prisma');

const utorid = process.argv[2];
const role = process.argv[3];

const validRoles = ['regular', 'cashier', 'manager', 'superuser'];

if (!utorid || !role) {
  console.error("Usage: node prisma/updaterole.js <utorid> <role>");
  console.error("Roles: regular, cashier, manager, superuser");
  process.exit(1);
}

if (!validRoles.includes(role)) {
  console.error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
  process.exit(1);
}

async function updateRole() {
  try {
    const user = await prisma.user.findUnique({ where: { utorid } });
    
    if (!user) {
      console.error(`User with UTORid "${utorid}" not found.`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { utorid },
      data: { role }
    });

    console.log(`✅ Successfully updated user role:`);
    console.log(`   UTORid: ${updated.utorid}`);
    console.log(`   Name: ${updated.name}`);
    console.log(`   Old Role: ${user.role}`);
    console.log(`   New Role: ${updated.role}`);
  } catch (err) {
    console.error('Error updating user role:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateRole();

