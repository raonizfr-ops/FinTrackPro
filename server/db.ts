import { eq, and, desc, gte, lte, ilike } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  accounts,
  categories,
  transactions,
  budgets,
  notifications,
  goals,
  Account,
  Category,
  Transaction,
  Budget,
  Notification,
  Goal,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ACCOUNT QUERIES
// ============================================================================

export async function getUserAccounts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(accounts).where(eq(accounts.userId, userId));
}

export async function getAccountById(accountId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAccount(account: typeof accounts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(accounts).values(account);
  return result;
}

export async function updateAccount(accountId: number, userId: number, updates: Partial<Account>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(accounts)
    .set(updates)
    .where(and(eq(accounts.id, accountId), eq(accounts.userId, userId)));
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function getCategoryById(categoryId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: typeof categories.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(categories).values(category);
}

export async function updateCategory(categoryId: number, userId: number, updates: Partial<Category>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(categories)
    .set(updates)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)));
}

// ============================================================================
// TRANSACTION QUERIES
// ============================================================================

export async function getUserTransactions(userId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
    .limit(limit)
    .offset(offset);
}

export async function getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    )
    .orderBy(desc(transactions.date));
}

export async function getTransactionById(transactionId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTransaction(transaction: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(transaction);
}

export async function updateTransaction(transactionId: number, userId: number, updates: Partial<Transaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(transactions)
    .set(updates)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

export async function deleteTransaction(transactionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .delete(transactions)
    .where(and(eq(transactions.id, transactionId), eq(transactions.userId, userId)));
}

// ============================================================================
// BUDGET QUERIES
// ============================================================================

export async function getUserBudgets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).where(eq(budgets.userId, userId));
}

export async function getBudgetsByMonth(userId: number, month: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.month, month)));
}

export async function getBudgetById(budgetId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBudget(budget: typeof budgets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(budgets).values(budget);
}

export async function updateBudget(budgetId: number, userId: number, updates: Partial<Budget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(budgets)
    .set(updates)
    .where(and(eq(budgets.id, budgetId), eq(budgets.userId, userId)));
}

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt));
}

export async function createNotification(notification: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(notifications).values(notification);
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
}

// ============================================================================
// GOAL QUERIES
// ============================================================================

export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(goals).where(eq(goals.userId, userId));
}

export async function getGoalById(goalId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createGoal(goal: typeof goals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(goals).values(goal);
}

export async function updateGoal(goalId: number, userId: number, updates: Partial<Goal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(goals)
    .set(updates)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
}

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

export async function getUserDashboardSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const userAccounts = await getUserAccounts(userId);
  const totalBalance = userAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthBudgets = await getBudgetsByMonth(userId, currentMonth);
  const totalBudgetSpent = monthBudgets.reduce((sum, budget) => sum + parseFloat(budget.spent.toString()), 0);
  const totalBudgetLimit = monthBudgets.reduce((sum, budget) => sum + parseFloat(budget.limit.toString()), 0);

  const recentTransactions = await getUserTransactions(userId, 10);

  return {
    totalBalance,
    totalBudgetSpent,
    totalBudgetLimit,
    accountCount: userAccounts.length,
    budgetCount: monthBudgets.length,
    recentTransactions,
  };
}

