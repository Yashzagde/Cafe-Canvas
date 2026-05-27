import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name'),
  phone: varchar('phone', { length: 256 }),
});

export const preRegistrations = pgTable('pre_registrations', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  restaurantName: text('restaurant_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
