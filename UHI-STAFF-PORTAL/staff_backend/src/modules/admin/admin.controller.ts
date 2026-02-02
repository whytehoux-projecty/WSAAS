import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";

export class AdminController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      // In a real app, strict validation should be here (Zod)
      const newUser = await adminService.createUser(req.body);
      res.status(201).json({ success: true, data: newUser, message: 'User created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updatedUser = await adminService.updateUser(id, req.body);
      res.json({ success: true, data: updatedUser, message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getSystemStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const raw =
        typeof req.query.status === "string" ? req.query.status : undefined;
      const allowed = new Set(["pending", "approved", "rejected", "cancelled"]);
      const status =
        raw && allowed.has(raw)
          ? (raw as "pending" | "approved" | "rejected" | "cancelled")
          : undefined;
      const applications = await adminService.getApplications({ status });
      res.json({ success: true, data: applications });
    } catch (error) {
      next(error);
    }
  }

  async decideApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const adminId = req.user!.id;
      const { id } = req.params;
      const { decision, comment } = req.body as {
        decision: "approved" | "rejected";
        comment?: string;
      };
      const updated = await adminService.decideApplication(
        adminId,
        id,
        decision,
        comment
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await adminService.getRecentActivity();
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  }

  async getFullUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await adminService.getFullUser(id);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async createUserDeployment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // In real app, pass req.user.id as creator
      const deployment = await adminService.createDeployment(id, req.body);
      res.json({ success: true, data: deployment });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
