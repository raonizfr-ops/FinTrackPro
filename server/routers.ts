import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  getUserAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  getUserCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  getUserTransactions,
  getTransactionsByDateRange,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getUserBudgets,
  getBudgetsByMonth,
  getBudgetById,
  createBudget,
  updateBudget,
  getUserNotifications,
  getUnreadNotifications,
  createNotification,
  markNotificationAsRead,
  getUserGoals,
  getGoalById,
  createGoal,
  updateGoal,
  getUserDashboardSummary,
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // ACCOUNTS
  // ============================================================================
  accounts: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserAccounts(ctx.user.id)
    ),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) =>
        getAccountById(input.id, ctx.user.id)
      ),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          type: z.enum(["checking", "savings", "investment", "credit_card", "other"]),
          balance: z.string().default("0"),
          currency: z.string().default("BRL"),
          description: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createAccount({
          userId: ctx.user.id,
          ...input,
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          balance: z.string().optional(),
          description: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateAccount(id, ctx.user.id, updates);
      }),
  }),

  // ============================================================================
  // CATEGORIES
  // ============================================================================
  categories: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserCategories(ctx.user.id)
    ),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) =>
        getCategoryById(input.id, ctx.user.id)
      ),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          type: z.enum(["income", "expense"]),
          color: z.string().default("#3b82f6"),
          icon: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createCategory({
          userId: ctx.user.id,
          ...input,
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          color: z.string().optional(),
          icon: z.string().optional(),
          description: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateCategory(id, ctx.user.id, updates);
      }),
  }),

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================
  transactions: router({
    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(50),
          offset: z.number().default(0),
        })
      )
      .query(({ ctx, input }) =>
        getUserTransactions(ctx.user.id, input.limit, input.offset)
      ),

    getByDateRange: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(({ ctx, input }) =>
        getTransactionsByDateRange(ctx.user.id, input.startDate, input.endDate)
      ),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) =>
        getTransactionById(input.id, ctx.user.id)
      ),

    create: protectedProcedure
      .input(
        z.object({
          accountId: z.number(),
          categoryId: z.number(),
          amount: z.string(),
          type: z.enum(["income", "expense"]),
          description: z.string().optional(),
          date: z.date(),
          tags: z.string().optional(),
          notes: z.string().optional(),
          isRecurring: z.boolean().default(false),
          recurringFrequency: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createTransaction({
          userId: ctx.user.id,
          ...input,
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          amount: z.string().optional(),
          description: z.string().optional(),
          date: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateTransaction(id, ctx.user.id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        deleteTransaction(input.id, ctx.user.id)
      ),
  }),

  // ============================================================================
  // BUDGETS
  // ============================================================================
  budgets: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserBudgets(ctx.user.id)
    ),

    getByMonth: protectedProcedure
      .input(z.object({ month: z.string() }))
      .query(({ ctx, input }) =>
        getBudgetsByMonth(ctx.user.id, input.month)
      ),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) =>
        getBudgetById(input.id, ctx.user.id)
      ),

    create: protectedProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.string(),
          month: z.string(),
          alertThreshold: z.number().default(80),
        })
      )
      .mutation(({ ctx, input }) =>
        createBudget({
          userId: ctx.user.id,
          ...input,
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          limit: z.string().optional(),
          spent: z.string().optional(),
          alertThreshold: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateBudget(id, ctx.user.id, updates);
      }),
  }),

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(({ ctx, input }) =>
        getUserNotifications(ctx.user.id, input.limit)
      ),

    getUnread: protectedProcedure.query(({ ctx }) =>
      getUnreadNotifications(ctx.user.id)
    ),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) =>
        markNotificationAsRead(input.id, ctx.user.id)
      ),
  }),

  // ============================================================================
  // GOALS
  // ============================================================================
  goals: router({
    list: protectedProcedure.query(({ ctx }) =>
      getUserGoals(ctx.user.id)
    ),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) =>
        getGoalById(input.id, ctx.user.id)
      ),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          targetAmount: z.string(),
          deadline: z.date().optional(),
          category: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createGoal({
          userId: ctx.user.id,
          ...input,
        })
      ),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          currentAmount: z.string().optional(),
          isCompleted: z.boolean().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, ...updates } = input;
        return updateGoal(id, ctx.user.id, updates);
      }),
  }),

  // ============================================================================
  // DASHBOARD
  // ============================================================================
  dashboard: router({
    summary: protectedProcedure.query(({ ctx }) =>
      getUserDashboardSummary(ctx.user.id)
    ),
  }),
});

export type AppRouter = typeof appRouter;

