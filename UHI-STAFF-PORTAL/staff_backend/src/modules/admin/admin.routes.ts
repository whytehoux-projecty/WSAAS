import { Router } from 'express';
import { adminController } from './admin.controller';
import { loanController } from '../finance/loan.controller';
import { grantController } from '../finance/grant.controller';
import { leaveBalanceController } from '../staff/leaveBalance.controller';
import { authMiddleware, adminOnly } from '../../shared/middleware/auth.middleware';
import { validateBody, validateParams } from '../../shared/middleware/validation.middleware';
import { z } from 'zod';
import { deploymentSchema } from '../staff/staff.validation';


const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

// ============ USER MANAGEMENT ============
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser); // Added route
router.get('/users/:id/full', adminController.getFullUserDetails);
router.post('/users/:id/deployments', validateBody(deploymentSchema), adminController.createUserDeployment);
router.get('/stats', adminController.getStats);
router.get('/activity', adminController.getRecentActivity);

// ============ APPLICATION MANAGEMENT ============
router.get('/applications', adminController.getApplications);

const applicationIdParamsSchema = z.object({
    id: z.string().uuid()
});

const decisionBodySchema = z.object({
    decision: z.enum(['approved', 'rejected']),
    comment: z.string().trim().min(1).optional()
});

router.patch(
    '/applications/:id/decision',
    validateParams(applicationIdParamsSchema),
    validateBody(decisionBodySchema),
    adminController.decideApplication
);

// ============ LOAN MANAGEMENT ============
const loanIdParamsSchema = z.object({
    id: z.string().uuid()
});

const updateLoanBodySchema = z.object({
    amount: z.number().positive().optional(),
    balance: z.number().min(0).optional(),
    monthly_payment: z.number().positive().optional(),
    interest_rate: z.number().min(0).max(100).optional(),
    start_date: z.string().datetime().optional(),
    due_date: z.string().datetime().optional(),
    status: z.enum(['pending', 'approved', 'active', 'completed', 'rejected', 'defaulted']).optional(),
    admin_notes: z.string().optional(),
});

const bulkApproveBodySchema = z.object({
    loanIds: z.array(z.string().uuid())
});

const rejectLoanBodySchema = z.object({
    reason: z.string().optional()
});

// Get all loans
router.get('/loans', loanController.getAllLoans);

// Get loan statistics
router.get('/loans/stats', loanController.getLoanStats);

// Send payment reminders
router.post('/loans/send-reminders', loanController.sendReminders);

// Bulk approve loans
router.post(
    '/loans/bulk-approve',
    validateBody(bulkApproveBodySchema),
    loanController.bulkApprove
);

// Get single loan details
router.get(
    '/loans/:id',
    validateParams(loanIdParamsSchema),
    loanController.getLoanDetails
);

// Update loan
router.patch(
    '/loans/:id',
    validateParams(loanIdParamsSchema),
    validateBody(updateLoanBodySchema),
    loanController.updateLoan
);

// Approve loan
router.post(
    '/loans/:id/approve',
    validateParams(loanIdParamsSchema),
    loanController.approveLoan
);

// Reject loan
router.post(
    '/loans/:id/reject',
    validateParams(loanIdParamsSchema),
    validateBody(rejectLoanBodySchema),
    loanController.rejectLoan
);

// Activate loan
router.post(
    '/loans/:id/activate',
    validateParams(loanIdParamsSchema),
    loanController.activateLoan
);

// ============ LEAVE BALANCE MANAGEMENT ============
const userIdParamsSchema = z.object({
    userId: z.string().uuid()
});

// Get all leave balances
router.get('/leave-balances', leaveBalanceController.getAllLeaveBalances);

// Get specific user's leave balance
router.get(
    '/leave-balances/:userId',
    validateParams(userIdParamsSchema),
    leaveBalanceController.getUserLeaveBalance
);

// Initialize leave balance for user
router.post(
    '/leave-balances/:userId/initialize',
    validateParams(userIdParamsSchema),
    leaveBalanceController.initializeLeaveBalance
);

// Update leave balance
router.patch(
    '/leave-balances/:userId',
    validateParams(userIdParamsSchema),
    leaveBalanceController.updateLeaveBalance
);

// ============ GRANT MANAGEMENT ============
const grantIdParamsSchema = z.object({
    id: z.string().uuid()
});

const rejectGrantBodySchema = z.object({
    reason: z.string().optional()
});

const bulkApproveGrantsBodySchema = z.object({
    grantIds: z.array(z.string().uuid())
});

// Get all grants
router.get('/grants', grantController.getAllGrants);

// Get grant statistics
router.get('/grants/stats', grantController.getGrantStats);

// Bulk approve grants
router.post(
    '/grants/bulk-approve',
    validateBody(bulkApproveGrantsBodySchema),
    grantController.bulkApprove
);

// Get single grant details
router.get(
    '/grants/:id',
    validateParams(grantIdParamsSchema),
    grantController.getGrantDetails
);

// Approve grant
router.post(
    '/grants/:id/approve',
    validateParams(grantIdParamsSchema),
    grantController.approveGrant
);

// Reject grant
router.post(
    '/grants/:id/reject',
    validateParams(grantIdParamsSchema),
    validateBody(rejectGrantBodySchema),
    grantController.rejectGrant
);

// Disburse grant
router.post(
    '/grants/:id/disburse',
    validateParams(grantIdParamsSchema),
    grantController.disburseGrant
);

export default router;



