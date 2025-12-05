const { defineConfig } = require("@prisma/config");

module.exports = defineConfig({
  database: {
    provider: "sqlite",
    url: "file:./dev.db",
  },
});
