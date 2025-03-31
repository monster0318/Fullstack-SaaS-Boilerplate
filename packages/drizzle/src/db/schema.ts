import { pgTable, text, integer, uuid, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import * as t from "drizzle-orm/pg-core"

export const rolesEnum = pgEnum("roles", ["user", "admin"])

export const userTable = pgTable(
  "user",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text("name").notNull(),
    age: integer(),
    image: text("image"),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    role: rolesEnum().default("user"),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)]
)

export const sessionTable = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique session ID
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id), // FK to users table
  token: text("token").notNull(), // Session token
  impersonatedBy: uuid("impersonated_by").references(() => userTable.id), // FK to users table
  expiresAt: timestamp("expires_at").notNull(), // Expiry timestamp
  ipAddress: text("ip_address"), // Optional IP address
  userAgent: text("user_agent"), // Optional user agent
  createdAt: timestamp("created_at").defaultNow().notNull(), // Creation time
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Last update time
})

export const sessionToUserRelations = relations(sessionTable, ({ one }) => ({
  user: one(userTable, {
    fields: [sessionTable.userId],
    references: [userTable.id],
  }),
}))

export const accountTable = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique ID for account
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id), // FK to user

  accountId: text("account_id").notNull(), // From SSO or same as userId
  providerId: text("provider_id").notNull(), // ID of the auth provider

  accessToken: text("access_token"), // Access token from provider
  refreshToken: text("refresh_token"), // Refresh token from provider
  accessTokenExpiresAt: timestamp("access_token_expires_at"), // Access token expiry
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"), // Refresh token expiry

  scope: text("scope"), // Scope of the token
  idToken: text("id_token"), // ID token from provider

  password: text("password"), // Optional password (e.g. for email/pass login)

  createdAt: timestamp("created_at").defaultNow().notNull(), // Created time
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Updated time
})

export const verificationTable = pgTable("verification", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique ID for verification
  identifier: text("identifier").notNull(), // Identifier for the request
  value: text("value").notNull(), // Value to be verified
  expiresAt: timestamp("expires_at").notNull(), // Expiry time
  createdAt: timestamp("created_at").defaultNow().notNull(), // Created timestamp
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Updated timestamp
})
