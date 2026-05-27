import { Request, Response, NextFunction } from 'express';
import { 
  discounts, coupons, couponUses, storefrontNotifications, 
  customers, customerVisits, orders, orderItems, tables, tableSessions, 
  bills, storeSettings, branding, storefrontConfig, paymentIntegrations, blogs, users
} from '../../../drizzle/schema.js';
import { eq, and, isNull, desc, asc, sql } from 'drizzle-orm';
import crypto from 'crypto';

// Basic AES-256 Key Encryption Helper
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cafecanvas_secret_secure_key_32c'; // Must be 32 chars
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// ==========================================
// MODULE 4: MARKETING CONTROLLER
// ==========================================
export class MarketingController {
  static async getDiscounts(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(discounts)
          .where(and(eq(discounts.tenantId, req.user!.tenant_id), isNull(discounts.deletedAt)));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, type, value, minOrderAmount, appliesTo, targetIds, validFrom, validUntil, usageLimit, perCustomerLimit } = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [discount] = await tx.insert(discounts).values({
          tenantId: req.user!.tenant_id,
          branchId: req.user!.branch_id!,
          name, type, value,
          minOrderAmount: minOrderAmount || 0,
          appliesTo: appliesTo || 'all',
          targetIds: targetIds || [],
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
          usageLimit, perCustomerLimit: perCustomerLimit || 1
        }).returning();
        return discount;
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(coupons).where(eq(coupons.tenantId, req.user!.tenant_id));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { discountId, code, maxUses, perUserLimit, validUntil } = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [coupon] = await tx.insert(coupons).values({
          tenantId: req.user!.tenant_id,
          discountId, code, maxUses,
          perUserLimit: perUserLimit || 1,
          validUntil: validUntil ? new Date(validUntil) : null
        }).returning();
        return coupon;
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const data = await req.txQuery!(async (tx) => {
        const list = await tx.select().from(coupons).where(eq(coupons.code, code as string)).limit(1);
        if (list.length === 0) return { valid: false, reason: 'Coupon code not found' };
        
        const coupon = list[0];
        if (!coupon.isActive) return { valid: false, reason: 'Coupon is inactive' };
        if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return { valid: false, reason: 'Coupon has expired' };
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, reason: 'Coupon usage limit reached' };

        const discountList = await tx.select().from(discounts).where(eq(discounts.id, coupon.discountId)).limit(1);
        return { valid: true, coupon, discount: discountList[0] };
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(storefrontNotifications)
          .where(eq(storefrontNotifications.tenantId, req.user!.tenant_id));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, title, body, ctaText, ctaUrl, startAt, endAt, target } = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [notif] = await tx.insert(storefrontNotifications).values({
          tenantId: req.user!.tenant_id,
          branchId: req.user!.branch_id!,
          type, title, body, ctaText, ctaUrl,
          startAt: new Date(startAt),
          endAt: new Date(endAt),
          target: target || 'all'
        }).returning();
        return notif;
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getSmartSuggestions(req: Request, res: Response, next: NextFunction) {
    try {
      // Mock marketing recommendations for low selling items from last 7 days
      res.json({
        success: true,
        data: [
          { itemId: "1", name: "Green Tea Mint", salesQty: 3, suggestedDiscount: 15, reason: "Low selling beverage this week" },
          { itemId: "2", name: "Cheese Croissant", salesQty: 1, suggestedDiscount: 20, reason: "Bakery stock rotating slowly" }
        ]
      });
    } catch (err) { next(err); }
  }
}

// ==========================================
// MODULE 5: CUSTOMERS CONTROLLER
// ==========================================
export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        const list = await tx.select().from(customers)
          .where(and(eq(customers.tenantId, req.user!.tenant_id), isNull(customers.deletedAt)))
          .orderBy(desc(customers.createdAt));

        // Phone numbers masking logic (GDPR compliance)
        return list.map((c: any) => ({
          ...c,
          phone: c.phone.substring(0, c.phone.length - 4) + 'XXXX'
        }));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getCustomerDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await req.txQuery!(async (tx) => {
        const profile = await tx.select().from(customers).where(eq(customers.id, id as string)).limit(1);
        if (profile.length === 0) return null;

        const visits = await tx.select().from(customerVisits).where(eq(customerVisits.customerId, id as string));
        return { profile: profile[0], visits };
      });
      if (!data) return res.status(404).json({ success: false, error: 'Customer not found' });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, notes } = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [cust] = await tx.insert(customers).values({
          tenantId: req.user!.tenant_id,
          branchId: req.user!.branch_id!,
          name, phone, notes
        }).returning();
        return cust;
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }
}

// ==========================================
// MODULE 6: ORDERS CONTROLLER
// ==========================================
export class OrderController {
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined
            )
          )
          .orderBy(desc(orders.createdAt));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async getLiveQueue(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined,
              sql`status IN ('pending', 'confirmed', 'preparing', 'ready')`
            )
          )
          .orderBy(asc(orders.createdAt));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

// ==========================================
// MODULE 7: ANALYTICS CONTROLLER
// ==========================================
export class AnalyticsController {
  static async getSummaryStats(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        const revenue = await tx.select({
          total: sql<number>`sum(total)`,
          count: sql<number>`count(id)`
        }).from(bills).where(and(eq(bills.tenantId, req.user!.tenant_id), eq(bills.status, 'paid')));

        const items = await tx.select({
          totalItemsSold: sql<number>`sum(quantity)`
        }).from(orderItems);

        return {
          totalRevenue: Number(revenue[0]?.total || 0),
          totalInvoices: Number(revenue[0]?.count || 0),
          itemsSold: Number(items[0]?.totalItemsSold || 0),
          averageDiningMinutes: 42
        };
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

// ==========================================
// MODULE 8: TABLE MANAGEMENT CONTROLLER
// ==========================================
export class TableController {
  static async getTables(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(tables)
          .where(and(eq(tables.tenantId, req.user!.tenant_id), isNull(tables.deletedAt)))
          .orderBy(asc(tables.name));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, capacity, section, position } = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [tbl] = await tx.insert(tables).values({
          tenantId: req.user!.tenant_id,
          branchId: req.user!.branch_id!,
          name, capacity, section,
          position: position || { x: 0, y: 0 }
        }).returning();
        return tbl;
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async updateTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fields = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [tbl] = await tx.update(tables).set({ ...fields, updatedAt: new Date() })
          .where(eq(tables.id, id as string)).returning();
        return tbl;
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async deleteTable(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await req.txQuery!(async (tx) => {
        // Soft delete only if no active sessions
        const active = await tx.select().from(tableSessions)
          .where(and(eq(tableSessions.tableId, id as string), isNull(tableSessions.checkOutAt))).limit(1);

        if (active.length > 0) throw new Error('Cannot delete a table with an active dining session');

        const [tbl] = await tx.update(tables).set({ deletedAt: new Date() }).where(eq(tables.id, id as string)).returning();
        return tbl;
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }
}

// ==========================================
// MODULE 9: SETTINGS CONTROLLER
// ==========================================
export class SettingsController {
  static async getStoreDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(storeSettings).where(eq(storeSettings.tenantId, req.user!.tenant_id)).limit(1);
      });
      res.json({ success: true, data: data[0] || null });
    } catch (err) { next(err); }
  }

  static async updateStoreDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const fields = req.body;
      const data = await req.txQuery!(async (tx) => {
        const existing = await tx.select().from(storeSettings).where(eq(storeSettings.tenantId, req.user!.tenant_id)).limit(1);
        if (existing.length === 0) {
          const [created] = await tx.insert(storeSettings).values({
            tenantId: req.user!.tenant_id,
            branchId: req.user!.branch_id!,
            ...fields
          }).returning();
          return created;
        } else {
          const [updated] = await tx.update(storeSettings).set({ ...fields }).where(eq(storeSettings.tenantId, req.user!.tenant_id)).returning();
          return updated;
        }
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async saveRazorpay(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyId, keySecret } = req.body;
      if (!keyId || !keySecret) return res.status(400).json({ success: false, error: 'keyId and keySecret are required' });
      
      const encryptedSecret = encrypt(keySecret);
      const data = await req.txQuery!(async (tx) => {
        // Upsert gateway connections
        const existing = await tx.select().from(paymentIntegrations)
          .where(and(eq(paymentIntegrations.tenantId, req.user!.tenant_id), eq(paymentIntegrations.provider, 'razorpay'))).limit(1);

        const configPayload = { keyId, keySecret: encryptedSecret };
        if (existing.length === 0) {
          return await tx.insert(paymentIntegrations).values({
            tenantId: req.user!.tenant_id,
            provider: 'razorpay',
            encryptedConfig: configPayload,
            isActive: true
          }).returning();
        } else {
          return await tx.update(paymentIntegrations).set({ encryptedConfig: configPayload })
            .where(eq(paymentIntegrations.id, existing[0].id)).returning();
        }
      });
      res.json({ success: true, message: 'Razorpay keys saved and encrypted successfully.' });
    } catch (err) { next(err); }
  }

  static async getBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select().from(blogs).where(and(eq(blogs.tenantId, req.user!.tenant_id), isNull(blogs.deletedAt)));
      });
      res.json({ success: true, data });
    } catch (err) { next(err); }
  }

  static async createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, slug, content, heroImageUrl } = req.body;
      const data = await req.txQuery!(async (tx) => {
        const [post] = await tx.insert(blogs).values({
          tenantId: req.user!.tenant_id,
          title, slug, content, heroImageUrl
        }).returning();
        return post;
      });
      res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
  }
}
