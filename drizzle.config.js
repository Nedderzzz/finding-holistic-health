module.exports = {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  driver: "better-sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "./data/dev.db",
  },
};
