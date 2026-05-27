import { Request, Response, NextFunction } from 'express';
import { orders, orderItems, menuItems, customers, discounts } from '../../../drizzle/schema.js';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export class DashboardController {
  // GET /api/store-admin/dashboard/summary
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenant_id;
      const branchId = req.user!.branch_id;
      
      const data = await req.txQuery!(async (tx) => {
        // Today's total orders & revenue (paise)
        const todayStr = new Date().toISOString().split('T')[0];
        const stats = await tx.select({
          count: sql<number>`count(id)`,
          revenue: sql<number>`coalesce(sum(total), 0)`
        })
        .from(orders)
        .where(
          and(
            eq(orders.tenantId, tenantId),
            branchId ? eq(orders.branchId, branchId) : undefined,
            sql`date(created_at) = ${todayStr}::date`,
            sql`status != 'cancelled'`
          )
        );

        // Average order value (paise)
        const count = Number(stats[0]?.count || 0);
        const revenue = Number(stats[0]?.revenue || 0);
        const avgOrderValue = count > 0 ? Math.round(revenue / count) : 0;

        // New customers count today
        const custs = await tx.select({
          count: sql<number>`count(id)`
        })
        .from(customers)
        .where(
          and(
            eq(customers.tenantId, tenantId),
            branchId ? eq(customers.branchId, branchId) : undefined,
            sql`date(created_at) = ${todayStr}::date`
          )
        );

        // Occupancy calculation mockup (e.g. 68%)
        const occupancy = 68; 

        return {
          ordersToday: count,
          revenueToday: revenue,
          avgOrderValue,
          newCustomersToday: Number(custs[0]?.count || 0),
          occupancyRate: occupancy
        };
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/dashboard/top-items
  static async getTopItems(req: Request, res: Response, next: NextFunction) {
    try {
      const period = req.query.period || 'daily';
      
      const data = await req.txQuery!(async (tx) => {
        // Fetch top-selling items joining order_items and menu_items
        return await tx.select({
          itemId: orderItems.menuItemId,
          name: orderItems.itemName,
          totalQty: sql<number>`sum(quantity)`,
          totalSales: sql<number>`sum(quantity * unit_price)`
        })
        .from(orderItems)
        .leftJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orders.tenantId, req.user!.tenant_id),
            req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined,
            period === 'daily' ? sql`date(orders.created_at) = current_date` : undefined,
            period === 'weekly' ? sql`orders.created_at >= current_date - interval '7 days'` : undefined,
            period === 'monthly' ? sql`orders.created_at >= current_date - interval '30 days'` : undefined,
            sql`orders.status != 'cancelled'`
          )
        )
        .groupBy(orderItems.menuItemId, orderItems.itemName)
        .orderBy(desc(sql`sum(quantity)`))
        .limit(10);
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/dashboard/recent-orders
  static async getRecentOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select()
          .from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined
            )
          )
          .orderBy(desc(orders.createdAt))
          .limit(20);
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/dashboard/revenue-chart
  static async getRevenueChart(req: Request, res: Response, next: NextFunction) {
    try {
      const period = req.query.period || 'daily';
      
      const data = await req.txQuery!(async (tx) => {
        if (period === 'daily') {
          // Hour by hour for today
          return await tx.select({
            label: sql<string>`to_char(created_at, 'HH24:00')`,
            revenue: sql<number>`coalesce(sum(total), 0)`
          })
          .from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined,
              sql`date(created_at) = current_date`,
              sql`status != 'cancelled'`
            )
          )
          .groupBy(sql`to_char(created_at, 'HH24:00')`)
          .orderBy(sql`to_char(created_at, 'HH24:00')`);
        } else if (period === 'weekly') {
          // Day of week
          return await tx.select({
            label: sql<string>`to_char(created_at, 'Dy')`,
            revenue: sql<number>`coalesce(sum(total), 0)`
          })
          .from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined,
              sql`created_at >= current_date - interval '7 days'`,
              sql`status != 'cancelled'`
            )
          )
          .groupBy(sql`to_char(created_at, 'Dy'), date_trunc('day', created_at)`)
          .orderBy(sql`date_trunc('day', created_at)`);
        } else {
          // Monthly days
          return await tx.select({
            label: sql<string>`to_char(created_at, 'DD Mon')`,
            revenue: sql<number>`coalesce(sum(total), 0)`
          })
          .from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined,
              sql`created_at >= current_date - interval '30 days'`,
              sql`status != 'cancelled'`
            )
          )
          .groupBy(sql`to_char(created_at, 'DD Mon'), date_trunc('day', created_at)`)
          .orderBy(sql`date_trunc('day', created_at)`);
        }
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/dashboard/low-selling
  static async getLowSelling(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        // Find bottom 5 menu items that aren't deleted
        return await tx.select({
          itemId: menuItems.id,
          name: menuItems.name,
          price: menuItems.price,
          imageUrl: menuItems.imageUrl,
          status: menuItems.status,
          totalQty: sql<number>`coalesce(sum(order_items.quantity), 0)`
        })
        .from(menuItems)
        .leftJoin(orderItems, eq(menuItems.id, orderItems.menuItemId))
        .where(
          and(
            eq(menuItems.tenantId, req.user!.tenant_id),
            req.user!.branch_id ? eq(menuItems.branchId, req.user!.branch_id) : undefined,
            sql`menu_items.deleted_at IS NULL`
          )
        )
        .groupBy(menuItems.id)
        .orderBy(asc(sql`coalesce(sum(order_items.quantity), 0)`))
        .limit(5);
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/dashboard/quick-discount
  static async createQuickDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId, discountPercent } = req.body;
      if (!itemId || !discountPercent) {
        res.status(400).json({ success: false, error: 'itemId and discountPercent are required' });
        return;
      }

      const tenantId = req.user!.tenant_id;
      const branchId = req.user!.branch_id;

      if (!branchId) {
        res.status(400).json({ success: false, error: 'Branch Context is required to create a branch discount' });
        return;
      }

      const newDiscount = await req.txQuery!(async (tx) => {
        // Fetch item details
        const items = await tx.select().from(menuItems).where(eq(menuItems.id, itemId)).limit(1);
        if (items.length === 0) {
          throw new Error('Menu item not found');
        }

        const item = items[0];

        // Create discount
        const [discount] = await tx.insert(discounts).values({
          tenantId,
          branchId,
          name: `Quick Flash Discount on ${item.name}`,
          type: 'percent',
          value: discountPercent * 100, // stored as percent * 100
          minOrderAmount: 0,
          appliesTo: 'item',
          targetIds: [itemId],
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours flash sale
          usageLimit: 100,
          usedCount: 0,
          perCustomerLimit: 1,
          isActive: true
        }).returning();

        return discount;
      });

      res.status(201).json({ success: true, data: newDiscount });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to create quick discount' });
    }
  }
}
