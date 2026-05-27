import { Request, Response, NextFunction } from 'express';
import { bills, orders, orderItems, tables, tableSessions } from '../../../drizzle/schema.js';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';

export class BillingController {
  // GET /api/store-admin/billing/orders
  static async getActiveOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select()
          .from(orders)
          .where(
            and(
              eq(orders.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(orders.branchId, req.user!.branch_id) : undefined,
              sql`status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'billed')`
            )
          )
          .orderBy(desc(orders.createdAt));
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/billing/orders/:id
  static async getOrderDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const data = await req.txQuery!(async (tx) => {
        const orderList = await tx.select().from(orders).where(eq(orders.id, id)).limit(1);
        if (orderList.length === 0) return null;

        const order = orderList[0];
        const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, id));

        return { ...order, items };
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/billing/table/:tableId/bill
  static async getTableBill(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId } = req.params;

      const data = await req.txQuery!(async (tx) => {
        // Find active open orders on this table
        const activeOrders = await tx.select()
          .from(orders)
          .where(
            and(
              eq(orders.tableId, tableId),
              sql`status != 'cancelled' AND status != 'paid'`
            )
          );

        if (activeOrders.length === 0) {
          return { subtotal: 0, tax: 0, discount: 0, total: 0, orders: [] };
        }

        let subtotal = 0;
        let discount = 0;
        let total = 0;

        for (const order of activeOrders) {
          subtotal += order.subtotal;
          discount += order.discountAmount;
          total += order.total;
        }

        return {
          subtotal,
          tax: Math.round(subtotal * 0.05), // Mock 5% GST
          discount,
          total: total + Math.round(subtotal * 0.05),
          orders: activeOrders
        };
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/billing/bill/generate
  static async generateBill(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId, extraCharges } = req.body;
      if (!tableId) {
        res.status(400).json({ success: false, error: 'tableId is required' });
        return;
      }

      const tenantId = req.user!.tenant_id;
      const branchId = req.user!.branch_id;

      if (!branchId) {
        res.status(400).json({ success: false, error: 'Branch Context is required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        // Fetch active orders for this table
        const activeOrders = await tx.select()
          .from(orders)
          .where(
            and(
              eq(orders.tableId, tableId),
              sql`status != 'cancelled' AND status != 'paid'`
            )
          );

        if (activeOrders.length === 0) {
          throw new Error('No open active orders for this table');
        }

        let subtotal = 0;
        let discountAmount = 0;

        for (const order of activeOrders) {
          subtotal += order.subtotal;
          discountAmount += order.discountAmount;
        }

        // Apply custom extra charges (GST, Service Charge)
        let additionalFee = 0;
        const processedCharges = [];
        if (extraCharges && Array.isArray(extraCharges)) {
          for (const charge of extraCharges) {
            const amount = charge.type === 'percent' 
              ? Math.round(subtotal * (charge.value / 10000)) 
              : charge.value;
            additionalFee += amount;
            processedCharges.push({ label: charge.label, amount, type: charge.type, value: charge.value });
          }
        } else {
          // Default mock 5% GST
          const gstAmount = Math.round(subtotal * 0.05);
          additionalFee += gstAmount;
          processedCharges.push({ label: 'CGST + SGST (5%)', amount: gstAmount, type: 'percent', value: 500 });
        }

        const total = subtotal - discountAmount + additionalFee;

        // Create the bill entry
        const orderIds = activeOrders.map(o => o.id);
        const [bill] = await tx.insert(bills).values({
          tenantId,
          branchId,
          tableId,
          orders: orderIds,
          subtotal,
          tax: Math.round(subtotal * 0.05),
          discountAmount,
          extraCharges: processedCharges,
          total,
          status: 'open',
          createdBy: req.user!.id
        }).returning();

        // Update all associated orders to 'billed' status
        for (const orderId of orderIds) {
          await tx.update(orders).set({ status: 'billed', updatedAt: new Date() }).where(eq(orders.id, orderId));
        }

        // Set table status to occupied (ready for billing checkout)
        await tx.update(tables).set({ status: 'occupied', updatedAt: new Date() }).where(eq(tables.id, tableId));

        return bill;
      });

      res.status(201).json({ success: true, data });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to generate bill' });
    }
  }

  // POST /api/store-admin/billing/bill/:id/print (80mm Thermal Friendly Template)
  static async getPrintTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const html = await req.txQuery!(async (tx) => {
        const billList = await tx.select().from(bills).where(eq(bills.id, id)).limit(1);
        if (billList.length === 0) return null;

        const bill = billList[0];
        
        // Fetch order items to list itemized rows
        const orderIds = bill.orders as string[];
        const items = [];
        for (const oid of orderIds) {
          const oitems = await tx.select().from(orderItems).where(eq(orderItems.orderId, oid));
          items.push(...oitems);
        }

        const tblList = bill.tableId ? await tx.select().from(tables).where(eq(tables.id, bill.tableId)).limit(1) : [];
        const tableName = tblList[0]?.name || 'N/A';

        // Render HTML template
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 5px; font-size: 12px; line-height: 1.2; color: #000; }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .header { font-size: 16px; margin-bottom: 2px; }
              .divider { border-top: 1px dashed #000; margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; }
              td { padding: 2px 0; vertical-align: top; }
              .right { text-align: right; }
              .footer { margin-top: 15px; font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="center bold header">CAFE CANVAS</div>
            <div class="center">Premium Multi-Tenant Cafe Suite</div>
            <div class="center">Phone: +91 99999 88888</div>
            <div class="divider"></div>
            
            <div><strong>Bill ID:</strong> ${bill.id.substring(0, 8)}</div>
            <div><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}</div>
            <div><strong>Table:</strong> ${tableName}</div>
            <div class="divider"></div>
            
            <table>
              <thead>
                <tr class="bold">
                  <td>Item</td>
                  <td class="right">Qty</td>
                  <td class="right">Price</td>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td>${item.itemName}</td>
                    <td class="right">${item.quantity}</td>
                    <td class="right">₹${(item.unitPrice / 100).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="divider"></div>
            
            <table>
              <tr>
                <td>Subtotal</td>
                <td class="right">₹${(bill.subtotal / 100).toFixed(2)}</td>
              </tr>
              ${(bill.extraCharges as any[] || []).map(chg => `
                <tr>
                  <td>${chg.label}</td>
                  <td class="right">₹${(chg.amount / 100).toFixed(2)}</td>
                </tr>
              `).join('')}
              ${bill.discountAmount > 0 ? `
                <tr>
                  <td>Discount</td>
                  <td class="right">-₹${(bill.discountAmount / 100).toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="bold" style="font-size: 14px;">
                <td>GRAND TOTAL</td>
                <td class="right">₹${(bill.total / 100).toFixed(2)}</td>
              </tr>
            </table>
            
            <div class="divider"></div>
            <div class="center bold footer">
              Thank You! Visit Again.<br>
              Powered by Cafe Canvas SaaS
            </div>
            
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
          </html>
        `;
      });

      if (!html) {
        res.status(404).json({ success: false, error: 'Bill not found' });
        return;
      }

      res.send(html);
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/billing/bill/:id/send (WhatsApp/SMS Mock)
  static async sendBillNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { phone, method } = req.body; // 'whatsapp' | 'sms'

      if (!phone || !method) {
        res.status(400).json({ success: false, error: 'phone and method (whatsapp|sms) are required' });
        return;
      }

      const success = await req.txQuery!(async (tx) => {
        const billList = await tx.select().from(bills).where(eq(bills.id, id)).limit(1);
        if (billList.length === 0) return false;

        const bill = billList[0];
        console.log(`[MOCK NOTIFICATION] Sent bill of total ₹${(bill.total / 100).toFixed(2)} via ${method} to phone ${phone}`);
        return true;
      });

      if (!success) {
        res.status(404).json({ success: false, error: 'Bill not found' });
        return;
      }

      res.json({ success: true, message: `Bill notification dispatched successfully via ${method}` });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/billing/bill/:id/pay (Checkout payment capture)
  static async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { method, amountReceived } = req.body; // 'cash' | 'card' | 'upi' | 'other'

      if (!method) {
        res.status(400).json({ success: false, error: 'payment method is required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        const billList = await tx.select().from(bills).where(eq(bills.id, id)).limit(1);
        if (billList.length === 0) return null;

        const bill = billList[0];

        // 1. Mark bill as paid
        const [updatedBill] = await tx.update(bills)
          .set({
            status: 'paid',
            paymentMethod: method,
            paidAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(bills.id, id))
          .returning();

        // 2. Set all associated orders to 'paid'
        const orderIds = bill.orders as string[];
        for (const oid of orderIds) {
          await tx.update(orders).set({ status: 'paid', updatedAt: new Date() }).where(eq(orders.id, oid));
        }

        // 3. Mark the table as vacated / available
        if (bill.tableId) {
          await tx.update(tables).set({ status: 'available', updatedAt: new Date() }).where(eq(tables.id, bill.tableId));
          
          // Complete and record the physical Table Session
          const sessions = await tx.select().from(tableSessions)
            .where(
              and(
                eq(tableSessions.tableId, bill.tableId),
                isNull(tableSessions.checkOutAt)
              )
            ).limit(1);

          if (sessions.length > 0) {
            const session = sessions[0];
            const checkOutAt = new Date();
            const durationMinutes = Math.round((checkOutAt.getTime() - session.checkInAt.getTime()) / 60000);
            
            await tx.update(tableSessions)
              .set({
                checkOutAt,
                durationMinutes,
                totalRevenue: bill.total,
                billId: bill.id,
                updatedAt: new Date()
              })
              .where(eq(tableSessions.id, session.id));
          }
        }

        return updatedBill;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Bill not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/store-admin/billing/bill/history
  static async getBillHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select()
          .from(bills)
          .where(
            and(
              eq(bills.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(bills.branchId, req.user!.branch_id) : undefined,
              eq(bills.status, 'paid')
            )
          )
          .orderBy(desc(bills.paidAt));
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}
