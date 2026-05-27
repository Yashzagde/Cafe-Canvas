import { Request, Response, NextFunction } from 'express';
import { menuCategories, menuItems, modifierGroups, modifierOptions } from '../../../drizzle/schema.js';
import { eq, and, isNull, desc, asc } from 'drizzle-orm';

export class MenuController {
  // ==========================================
  // CATEGORIES
  // ==========================================

  // GET /api/store-admin/menu/categories
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await req.txQuery!(async (tx) => {
        return await tx.select()
          .from(menuCategories)
          .where(
            and(
              eq(menuCategories.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(menuCategories.branchId, req.user!.branch_id) : undefined,
              isNull(menuCategories.deletedAt)
            )
          )
          .orderBy(asc(menuCategories.sortOrder));
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/menu/categories
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, sortOrder, isVisible } = req.body;
      if (!name) {
        res.status(400).json({ success: false, error: 'Category name is required' });
        return;
      }
      
      const branchId = req.user!.branch_id;
      if (!branchId) {
        res.status(400).json({ success: false, error: 'Branch Context is required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        const [category] = await tx.insert(menuCategories).values({
          tenantId: req.user!.tenant_id,
          branchId,
          name,
          sortOrder: sortOrder || 0,
          isVisible: isVisible !== undefined ? isVisible : true
        }).returning();
        return category;
      });

      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/store-admin/menu/categories/:id
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, sortOrder, isVisible } = req.body;

      const data = await req.txQuery!(async (tx) => {
        const [category] = await tx.update(menuCategories)
          .set({
            ...(name && { name }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(isVisible !== undefined && { isVisible }),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(menuCategories.id, id),
              eq(menuCategories.tenantId, req.user!.tenant_id)
            )
          )
          .returning();
        return category;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Category not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/store-admin/menu/categories/:id (Soft Delete)
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await req.txQuery!(async (tx) => {
        const [category] = await tx.update(menuCategories)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(menuCategories.id, id),
              eq(menuCategories.tenantId, req.user!.tenant_id)
            )
          )
          .returning();
        return category;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Category not found' });
        return;
      }

      res.json({ success: true, message: 'Category soft-deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // MENU ITEMS
  // ==========================================

  // GET /api/store-admin/menu/items
  static async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, status } = req.query;

      const data = await req.txQuery!(async (tx) => {
        return await tx.select()
          .from(menuItems)
          .where(
            and(
              eq(menuItems.tenantId, req.user!.tenant_id),
              req.user!.branch_id ? eq(menuItems.branchId, req.user!.branch_id) : undefined,
              categoryId ? eq(menuItems.categoryId, categoryId as string) : undefined,
              status ? eq(menuItems.status, status as string) : undefined,
              isNull(menuItems.deletedAt)
            )
          )
          .orderBy(asc(menuItems.name));
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/menu/items
  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, name, description, price, imageUrl, status, allowsModifiers, discountEligible } = req.body;
      if (!categoryId || !name || price === undefined) {
        res.status(400).json({ success: false, error: 'categoryId, name, and price are required' });
        return;
      }

      const branchId = req.user!.branch_id;
      if (!branchId) {
        res.status(400).json({ success: false, error: 'Branch Context is required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        const [item] = await tx.insert(menuItems).values({
          tenantId: req.user!.tenant_id,
          branchId,
          categoryId,
          name,
          description,
          price,
          imageUrl,
          status: status || 'available',
          allowsModifiers: allowsModifiers !== undefined ? allowsModifiers : false,
          discountEligible: discountEligible !== undefined ? discountEligible : true,
          createdBy: req.user!.id
        }).returning();
        return item;
      });

      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/store-admin/menu/items/:id
  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fields = req.body;

      const data = await req.txQuery!(async (tx) => {
        const [item] = await tx.update(menuItems)
          .set({
            ...fields,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(menuItems.id, id),
              eq(menuItems.tenantId, req.user!.tenant_id)
            )
          )
          .returning();
        return item;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Item not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/store-admin/menu/items/:id/toggle
  static async toggleItemAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'available' | 'unavailable' | 'hidden'

      if (!status || !['available', 'unavailable', 'hidden'].includes(status)) {
        res.status(400).json({ success: false, error: 'Valid status is required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        const [item] = await tx.update(menuItems)
          .set({ status, updatedAt: new Date() })
          .where(
            and(
              eq(menuItems.id, id),
              eq(menuItems.tenantId, req.user!.tenant_id)
            )
          )
          .returning();
        return item;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Item not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/store-admin/menu/items/:id (Soft Delete)
  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await req.txQuery!(async (tx) => {
        const [item] = await tx.update(menuItems)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(menuItems.id, id),
              eq(menuItems.tenantId, req.user!.tenant_id)
            )
          )
          .returning();
        return item;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Item not found' });
        return;
      }

      res.json({ success: true, message: 'Item soft-deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/menu/items/:id/image
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body; // In a production system, this handles standard uploads, but here we save the passed URL
      
      if (!imageUrl) {
        res.status(400).json({ success: false, error: 'imageUrl is required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        const [item] = await tx.update(menuItems)
          .set({ imageUrl, updatedAt: new Date() })
          .where(
            and(
              eq(menuItems.id, id),
              eq(menuItems.tenantId, req.user!.tenant_id)
            )
          )
          .returning();
        return item;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Item not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // ==========================================
  // MODIFIERS / EXTRAS
  // ==========================================

  // GET /api/store-admin/menu/items/:id/modifiers
  static async getItemModifiers(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const data = await req.txQuery!(async (tx) => {
        // Fetch groups
        const groups = await tx.select()
          .from(modifierGroups)
          .where(eq(modifierGroups.itemId, id));

        // Fetch options for each group
        const result = [];
        for (const group of groups) {
          const options = await tx.select()
            .from(modifierOptions)
            .where(eq(modifierOptions.groupId, group.id));
          result.push({ ...group, options });
        }
        return result;
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/store-admin/menu/items/:id/modifiers
  static async createModifierGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, required, minSelect, maxSelect, options } = req.body;

      if (!name || !options || !Array.isArray(options)) {
        res.status(400).json({ success: false, error: 'name and options array are required' });
        return;
      }

      const data = await req.txQuery!(async (tx) => {
        // Create modifier group
        const [group] = await tx.insert(modifierGroups).values({
          itemId: id,
          name,
          required: required !== undefined ? required : false,
          minSelect: minSelect || 0,
          maxSelect: maxSelect || 1
        }).returning();

        // Create modifier options
        const createdOptions = [];
        for (const opt of options) {
          const [option] = await tx.insert(modifierOptions).values({
            groupId: group.id,
            name: opt.name,
            extraPrice: opt.extraPrice || 0,
            isDefault: opt.isDefault || false
          }).returning();
          createdOptions.push(option);
        }

        return { ...group, options: createdOptions };
      });

      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /api/store-admin/menu/modifiers/:groupId
  static async updateModifierGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const { name, required, minSelect, maxSelect } = req.body;

      const data = await req.txQuery!(async (tx) => {
        const [group] = await tx.update(modifierGroups)
          .set({
            ...(name && { name }),
            ...(required !== undefined && { required }),
            ...(minSelect !== undefined && { minSelect }),
            ...(maxSelect !== undefined && { maxSelect }),
            updatedAt: new Date()
          })
          .where(eq(modifierGroups.id, groupId))
          .returning();
        return group;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Modifier group not found' });
        return;
      }

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/store-admin/menu/modifiers/:groupId
  static async deleteModifierGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const data = await req.txQuery!(async (tx) => {
        const [group] = await tx.delete(modifierGroups)
          .where(eq(modifierGroups.id, groupId))
          .returning();
        return group;
      });

      if (!data) {
        res.status(404).json({ success: false, error: 'Modifier group not found' });
        return;
      }

      res.json({ success: true, message: 'Modifier group deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
