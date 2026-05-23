import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node -r tsconfig-paths/register src/seeder/seed.ts",  // ← agrega esto
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});