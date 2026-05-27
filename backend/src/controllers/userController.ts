import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';

export class UserController {
  // GET /api/users
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const allUsers = await UserService.getAllUsers();
      res.json({ success: true, data: allUsers });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/users
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, phone } = req.body;
      if (!fullName || !phone) {
        res.status(400).json({ success: false, error: 'Full name and phone number are required' });
        return;
      }
      const newUser = await UserService.createUser(fullName, phone);
      res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/pre-registrations
  static async getPreRegistrations(req: Request, res: Response, next: NextFunction) {
    try {
      const regs = await UserService.getAllPreRegistrations();
      res.json({ success: true, data: regs });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/pre-registrations
  static async createPreRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, restaurantName } = req.body;
      if (!email) {
        res.status(400).json({ success: false, error: 'Email is required' });
        return;
      }
      const newReg = await UserService.createPreRegistration(email, restaurantName);
      res.status(201).json({ success: true, data: newReg });
    } catch (err) {
      next(err);
    }
  }
}
