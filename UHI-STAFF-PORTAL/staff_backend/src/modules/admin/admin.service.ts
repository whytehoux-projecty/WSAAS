import { prisma } from "../../config/database";
import { AppError } from "../../shared/middleware/errorHandler.middleware";
import { CreateDeploymentDTO } from "../staff/staff.types";
import { DeploymentStatus, DeploymentType, HardshipLevel, Prisma } from "@prisma/client";
import bcrypt from 'bcrypt';
import { RegisterDTO } from "../auth/auth.types";

export class AdminService {
  async createUser(data: RegisterDTO & { role?: string; department?: string; position?: string }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { staff_id: data.staffId },
          { email: data.email }
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User already exists with this Staff ID or Email', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transaction to create user, assign role, and create staff profile
    const newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          staff_id: data.staffId,
          email: data.email,
          password_hash: hashedPassword,
          first_name: data.firstName,
          last_name: data.lastName,
          status: 'active'
        }
      });

      // Assign role (default to staff if not provided)
      const roleName = data.role || 'staff';
      const role = await tx.role.findUnique({ where: { name: roleName } });

      if (role) {
        await tx.userRole.create({
          data: {
            user_id: user.id,
            role_id: role.id
          }
        });
      } else {
        // Fallback to staff if specific role not found
        const staffRole = await tx.role.findUnique({ where: { name: 'staff' } });
        if (staffRole) {
          await tx.userRole.create({
            data: {
              user_id: user.id,
              role_id: staffRole.id
            }
          });
        }
      }

      // Create Staff Profile
      await tx.staffProfile.create({
        data: {
          user_id: user.id,
          // Add any other initial fields if needed
        }
      });

      // Handle Department and Position (via EmploymentHistory)
      if (data.department || data.position) {
        let departmentId = 1; // Default ID logic needs to be robust

        if (data.department) {
          // Find or create department
          const dept = await tx.department.findUnique({ where: { name: data.department } });
          if (dept) {
            departmentId = dept.id;
          } else {
            const newDept = await tx.department.create({
              data: { name: data.department }
            });
            departmentId = newDept.id;
          }
        } else {
          // Try to get a default department or skip
          // For now, if no department provided but position is, we might fail constraint if dept_id is required
          // Let's ensure we have at least one department in DB or handle this gracefully.
          // Assuming ID 1 exists or creating a "General" department fallback
          const defaultDept = await tx.department.findFirst();
          if (defaultDept) {
            departmentId = defaultDept.id;
          } else {
            const newDefault = await tx.department.create({ data: { name: 'General' } });
            departmentId = newDefault.id;
          }
        }

        await tx.employmentHistory.create({
          data: {
            user_id: user.id,
            department_id: departmentId,
            position_title: data.position || 'Unassigned',
            start_date: new Date(),
          }
        });
      }

      return user;
    });

    return newUser;
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        staff_id: true,
        first_name: true,
        last_name: true,
        email: true,
        status: true,
        created_at: true,
        roles: {
          include: { role: true },
        },
        employment_history: {
          orderBy: { start_date: 'desc' },
          take: 1,
          include: { department: true }
        }
      },
      orderBy: { created_at: "desc" },
    });
  }

  async getSystemStats() {
    const [
      userCount,
      appCount,
      pendingAppCount,
      activeContractsCount,
      activeLoansCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "pending" } }),
      prisma.contract.count({ where: { status: "active" } }),
      prisma.loan.count({ where: { status: "active" } }),
    ]);

    return {
      users: userCount,
      applications: appCount,
      pendingApplications: pendingAppCount,
      activeContracts: activeContractsCount,
      activeLoans: activeLoansCount,
    };
  }

  async getApplications(filter: {
    status?: "pending" | "approved" | "rejected" | "cancelled";
  }) {
    const status = filter.status;
    const where = status ? { status } : undefined;

    return prisma.application.findMany({
      where,
      include: {
        user: { select: { first_name: true, last_name: true, staff_id: true } },
      },
      orderBy: { created_at: "desc" },
    });
  }

  async decideApplication(
    adminId: string,
    applicationId: string,
    decision: "approved" | "rejected",
    comment?: string
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      throw new AppError("Application not found", 404);
    }

    if (application.status !== "pending") {
      throw new AppError("Only pending applications can be decided", 400);
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: decision,
        current_handler_id: adminId,
      },
    });

    await prisma.applicationAudit.create({
      data: {
        application_id: applicationId,
        actor_id: adminId,
        action: decision,
        comment: comment || null,
      },
    });

    return updated;
  }

  async getRecentActivity() {
    return prisma.applicationAudit.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
      include: {
        application: true,
        actor: {
          select: { first_name: true, last_name: true, staff_id: true },
        },
      },
    });
  }

  async getFullUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { role: true } },
        staff_profile: true,
        bank_accounts: true,
        family_members: true,
        deployments: { orderBy: { start_date: 'desc' } },
        staff_documents: true,
        employment_history: { orderBy: { start_date: 'desc' } }
      }
    });
  }

  async createDeployment(userId: string, data: CreateDeploymentDTO) {
    return prisma.deployment.create({
      data: {
        user_id: userId,
        mission_name: data.missionName,
        country: data.country,
        start_date: new Date(data.startDate),
        end_date: data.endDate ? new Date(data.endDate) : null,
        deployment_role: data.deploymentRole,
        status: (data.status as DeploymentStatus) || DeploymentStatus.planned,
        deployment_type: (data.deploymentType as DeploymentType) || DeploymentType.standard,
        hardship_level: data.hardshipLevel as HardshipLevel,
        danger_pay_eligible: data.dangerPayEligible || false,
        created_by: '00000000-0000-0000-0000-000000000000' // Placeholder for now, or pass admin ID
      }
    });
  }

  async updateUser(userId: string, data: Partial<RegisterDTO> & { role?: string; status?: string; department?: string; position?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update Basic Info
      const userUpdateData: any = {};
      if (data.firstName) userUpdateData.first_name = data.firstName;
      if (data.lastName) userUpdateData.last_name = data.lastName;
      if (data.email) userUpdateData.email = data.email;
      if (data.staffId) userUpdateData.staff_id = data.staffId;
      if (data.status) userUpdateData.status = data.status;

      const updated = await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      });

      // 2. Update Role if provided
      if (data.role) {
        const role = await tx.role.findUnique({ where: { name: data.role } });
        if (role) {
          // Remove existing roles
          await tx.userRole.deleteMany({ where: { user_id: userId } });
          // Add new role
          await tx.userRole.create({
            data: { user_id: userId, role_id: role.id }
          });
        }
      }

      // 3. Update Employment History (Department/Position) if provided
      if (data.department || data.position) {
        // Find valid department
        let departmentId = undefined;
        if (data.department) {
          const dept = await tx.department.findUnique({ where: { name: data.department } });
          if (dept) {
            departmentId = dept.id;
          } else {
            const newDept = await tx.department.create({ data: { name: data.department } });
            departmentId = newDept.id;
          }
        }

        // Check if there is a current employment history record
        const currentHistory = await tx.employmentHistory.findFirst({
          where: { user_id: userId, end_date: null },
          orderBy: { start_date: 'desc' }
        });

        if (currentHistory) {
          // Update existing record
          await tx.employmentHistory.update({
            where: { id: currentHistory.id },
            data: {
              position_title: data.position || currentHistory.position_title,
              department_id: departmentId || currentHistory.department_id
            }
          });
        } else if (departmentId && data.position) {
          // Create new record only if we have both fields (or acceptable defaults)
          await tx.employmentHistory.create({
            data: {
              user_id: userId,
              position_title: data.position,
              department_id: departmentId,
              start_date: new Date()
            }
          });
        }
      }

      return updated;
    });

    return updatedUser;
  }
}

export const adminService = new AdminService();
