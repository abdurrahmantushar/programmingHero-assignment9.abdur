import "server-only";

import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.DATABASE_NAME;

const secret = process.env.BETTER_AUTH_SECRET;
const baseURL = process.env.BETTER_AUTH_URL;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not defined");
}

if (!databaseName) {
  throw new Error("DATABASE_NAME is not defined");
}

if (!secret || secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters");
}

if (!baseURL) {
  throw new Error("BETTER_AUTH_URL is not defined");
}

const globalForMongo = globalThis as typeof globalThis & {
  mongoClient?: MongoClient;
};

const client =
  globalForMongo.mongoClient ?? new MongoClient(mongoUri);

globalForMongo.mongoClient = client;

const db = client.db(databaseName);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  baseURL,
  secret,
  account: {
    accountLinking: {
      trustedProviders: ["github", "google",],
    }
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }
  },
  user: {
    additionalFields: {
      role: {
        type: ["customer", "vendor", "admin"],
        required: true,
        defaultValue: 'customer',
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    }

  },
  emailAndPassword: {
    enabled: true,
  },
});