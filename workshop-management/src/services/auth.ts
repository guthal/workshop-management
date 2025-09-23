import { account, databases, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { User } from '@/types';

export class AuthService {
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailPasswordSession(email, password);
      const user = await this.getCurrentUser();
      return { session, user };
    } catch {
      throw new Error('Login failed');
    }
  }

  async register(email: string, password: string, name: string, role: 'master' | 'student' = 'student') {
    try {
      // First, logout any existing session
      try {
        await account.deleteSession('current');
      } catch {
        // No active session, continue
      }

      // Create Appwrite account
      const account_user = await account.create(ID.unique(), email, password, name);

      // Create session immediately after account creation
      await account.createEmailPasswordSession(email, password);

      // Now create user document with active session
      const user = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        ID.unique(),
        {
          email,
          name,
          role,
          profile: JSON.stringify({})
        }
      );

      return { account: account_user, user };
    } catch (error: unknown) {
      console.error('Registration error:', error);

      if ((error as { code?: number }).code === 409) {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }

      throw new Error(`Registration failed: ${(error as Error).message || 'Unknown error'}`);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const account_user = await account.get();

      const users = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        []
      );

      const user = users.documents.find(doc => doc.email === account_user.email);

      if (!user) return null;

      return {
        $id: user.$id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile || {},
        $createdAt: user.$createdAt
      };
    } catch {
      return null;
    }
  }

  async logout() {
    try {
      await account.deleteSession('current');
    } catch {
      throw new Error('Logout failed');
    }
  }

  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        data
      );
      return updatedUser;
    } catch {
      throw new Error('Profile update failed');
    }
  }
}