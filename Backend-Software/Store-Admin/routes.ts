import { Router } from 'express';
import { storeAdminAuth } from './middleware.js';
import { DashboardController } from './controllers/dashboardController.js';
import { MenuController } from './controllers/menuController.js';
import { BillingController } from './controllers/billingController.js';
import { 
  MarketingController, CustomerController, OrderController, 
  AnalyticsController, TableController, SettingsController 
} from './controllers/remainingControllers.js';

const router = Router();

// Store-Admin Health Check (Public / Non-Auth)
router.get('/health', (req, res) => {
  res.json({ module: 'Store-Admin', status: 'OK', timestamp: new Date() });
});

// Enforce Auth and Tenant Scope on all following routes
router.use(storeAdminAuth);

// ==========================================
// MODULE 1: DASHBOARD
// ==========================================
router.get('/dashboard/summary', DashboardController.getSummary);
router.get('/dashboard/top-items', DashboardController.getTopItems);
router.get('/dashboard/recent-orders', DashboardController.getRecentOrders);
router.get('/dashboard/revenue-chart', DashboardController.getRevenueChart);
router.get('/dashboard/low-selling', DashboardController.getLowSelling);
router.post('/dashboard/quick-discount', DashboardController.createQuickDiscount);

// ==========================================
// MODULE 2: MENU MANAGEMENT
// ==========================================
// Categories
router.get('/menu/categories', MenuController.getCategories);
router.post('/menu/categories', MenuController.createCategory);
router.patch('/menu/categories/:id', MenuController.updateCategory);
router.delete('/menu/categories/:id', MenuController.deleteCategory);

// Menu Items
router.get('/menu/items', MenuController.getItems);
router.post('/menu/items', MenuController.createItem);
router.patch('/menu/items/:id', MenuController.updateItem);
router.patch('/menu/items/:id/toggle', MenuController.toggleItemAvailability);
router.delete('/menu/items/:id', MenuController.deleteItem);
router.post('/menu/items/:id/image', MenuController.uploadImage);

// Modifiers
router.get('/menu/items/:id/modifiers', MenuController.getItemModifiers);
router.post('/menu/items/:id/modifiers', MenuController.createModifierGroup);
router.patch('/menu/modifiers/:groupId', MenuController.updateModifierGroup);
router.delete('/menu/modifiers/:groupId', MenuController.deleteModifierGroup);

// ==========================================
// MODULE 3: BILLING SYSTEM
// ==========================================
router.get('/billing/orders', BillingController.getActiveOrders);
router.get('/billing/orders/:id', BillingController.getOrderDetail);
router.get('/billing/table/:tableId/bill', BillingController.getTableBill);
router.post('/billing/bill/generate', BillingController.generateBill);
router.get('/billing/bill/:id/print', BillingController.getPrintTemplate);
router.post('/billing/bill/:id/send', BillingController.sendBillNotification);
router.post('/billing/bill/:id/pay', BillingController.recordPayment);
router.get('/billing/bill/history', BillingController.getBillHistory);

// ==========================================
// MODULE 4: MARKETING
// ==========================================
router.get('/marketing/discounts', MarketingController.getDiscounts);
router.post('/marketing/discounts', MarketingController.createDiscount);
router.get('/marketing/coupons', MarketingController.getCoupons);
router.post('/marketing/coupons', MarketingController.createCoupon);
router.get('/marketing/coupons/:code/validate', MarketingController.validateCoupon);
router.get('/marketing/notifications', MarketingController.getNotifications);
router.post('/marketing/notifications', MarketingController.createNotification);
router.get('/marketing/suggestions', MarketingController.getSmartSuggestions);

// ==========================================
// MODULE 5: CUSTOMERS
// ==========================================
router.get('/customers', CustomerController.getCustomers);
router.get('/customers/:id', CustomerController.getCustomerDetail);
router.post('/customers', CustomerController.createCustomer);

// ==========================================
// MODULE 6: ORDERS
// ==========================================
router.get('/orders', OrderController.getOrders);
router.get('/orders/live', OrderController.getLiveQueue);

// ==========================================
// MODULE 7: ANALYTICS
// ==========================================
router.get('/analytics/summary', AnalyticsController.getSummaryStats);

// ==========================================
// MODULE 8: TABLE MANAGEMENT
// ==========================================
router.get('/tables', TableController.getTables);
router.post('/tables', TableController.createTable);
router.patch('/tables/:id', TableController.updateTable);
router.delete('/tables/:id', TableController.deleteTable);

// ==========================================
// MODULE 9: SETTINGS
// ==========================================
router.get('/settings/store', SettingsController.getStoreDetails);
router.patch('/settings/store', SettingsController.updateStoreDetails);
router.post('/settings/payments/razorpay', SettingsController.saveRazorpay);
router.get('/settings/blogs', SettingsController.getBlogs);
router.post('/settings/blogs', SettingsController.createBlog);

export default router;
