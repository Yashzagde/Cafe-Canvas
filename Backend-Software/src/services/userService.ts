import { db } from '../config/db.js';
import { users, preRegistrations } from '../../../drizzle/schema.js';
import { desc } from 'drizzle-orm';

export class UserService {
  // Get all registered users
  static async getAllUsers() {
    return await db.select().from(users);
  }

  // Create a new user
  static async createUser(fullName: string, phone: string) {
    const [newUser] = await db.insert(users).values({
      fullName,
      phone
    }).returning();
    return newUser;
  }

  // Get all pre-registrations ordered by creation date
  static async getAllPreRegistrations() {
    return await db.select().from(preRegistrations).orderBy(desc(preRegistrations.createdAt));
  }

  // Create a new pre-registration entry
  static async createPreRegistration(email: string, restaurantName?: string) {
    const [newReg] = await db.insert(preRegistrations).values({
      email,
      restaurantName
    }).returning();
    return newReg;
  }
}
