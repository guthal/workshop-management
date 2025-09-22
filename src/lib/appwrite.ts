import { Account, Client, Databases, Storage, Functions } from 'appwrite';

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export { client };

// Database and Collection IDs
export const DATABASE_ID = 'workshop-platform';
export const COLLECTIONS = {
  USERS: 'users',
  WORKSHOPS: 'workshops',
  APPLICATIONS: 'applications',
  PAYMENTS: 'payments',
} as const;