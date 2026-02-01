-- ============================================
-- UHI Staff Portal - Row Level Security Policies
-- ============================================
-- 
-- These policies secure your Supabase database so that users can only
-- access their own data when using the Anon Key from the frontend.
--
-- IMPORTANT: Run these in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
--
-- ============================================
-- ============================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
-- ============================================
-- 2. USERS TABLE POLICIES
-- ============================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users FOR
SELECT USING (auth.uid() = id);
-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile" ON users FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Service role has full access (for backend)
CREATE POLICY "Service role has full access to users" ON users FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 3. LOANS TABLE POLICIES
-- ============================================
-- Users can view their own loans
CREATE POLICY "Users can view own loans" ON loans FOR
SELECT USING (auth.uid() = user_id);
-- Users can create loan applications
CREATE POLICY "Users can create own loans" ON loans FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own pending loans
CREATE POLICY "Users can update own pending loans" ON loans FOR
UPDATE USING (
        auth.uid() = user_id
        AND status = 'pending'
    ) WITH CHECK (
        auth.uid() = user_id
        AND status = 'pending'
    );
-- Service role has full access
CREATE POLICY "Service role has full access to loans" ON loans FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 4. LOAN PAYMENTS TABLE POLICIES
-- ============================================
-- Users can view their own loan payments
CREATE POLICY "Users can view own loan payments" ON loan_payments FOR
SELECT USING (
        auth.uid() IN (
            SELECT user_id
            FROM loans
            WHERE id = loan_payments.loan_id
        )
    );
-- Service role has full access
CREATE POLICY "Service role has full access to loan payments" ON loan_payments FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 5. APPLICATIONS TABLE POLICIES
-- ============================================
-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications FOR
SELECT USING (auth.uid() = user_id);
-- Users can create applications
CREATE POLICY "Users can create own applications" ON applications FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications" ON applications FOR
UPDATE USING (
        auth.uid() = user_id
        AND status = 'pending'
    ) WITH CHECK (auth.uid() = user_id);
-- Users can delete their own pending applications
CREATE POLICY "Users can delete own pending applications" ON applications FOR DELETE USING (
    auth.uid() = user_id
    AND status = 'pending'
);
-- Service role has full access
CREATE POLICY "Service role has full access to applications" ON applications FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 6. STAFF PROFILES TABLE POLICIES
-- ============================================
-- Users can view their own staff profile
CREATE POLICY "Users can view own staff profile" ON staff_profiles FOR
SELECT USING (auth.uid() = user_id);
-- Users can update their own staff profile (limited)
CREATE POLICY "Users can update own staff profile" ON staff_profiles FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Service role has full access
CREATE POLICY "Service role has full access to staff profiles" ON staff_profiles FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 7. STAFF DOCUMENTS TABLE POLICIES
-- ============================================
-- Users can view their own documents
CREATE POLICY "Users can view own documents" ON staff_documents FOR
SELECT USING (auth.uid() = user_id);
-- Users can upload their own documents
CREATE POLICY "Users can upload own documents" ON staff_documents FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Service role has full access
CREATE POLICY "Service role has full access to staff documents" ON staff_documents FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 8. PAYROLL RECORDS TABLE POLICIES
-- ============================================
-- Users can view their own payroll records
CREATE POLICY "Users can view own payroll" ON payroll_records FOR
SELECT USING (auth.uid() = user_id);
-- Service role has full access
CREATE POLICY "Service role has full access to payroll" ON payroll_records FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 9. GRANTS TABLE POLICIES
-- ============================================
-- Users can view their own grants
CREATE POLICY "Users can view own grants" ON grants FOR
SELECT USING (auth.uid() = user_id);
-- Service role has full access
CREATE POLICY "Service role has full access to grants" ON grants FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 10. BANK ACCOUNTS TABLE POLICIES
-- ============================================
-- Users can view their own bank accounts
CREATE POLICY "Users can view own bank accounts" ON bank_accounts FOR
SELECT USING (auth.uid() = user_id);
-- Users can create their own bank accounts
CREATE POLICY "Users can create own bank accounts" ON bank_accounts FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can update their own bank accounts
CREATE POLICY "Users can update own bank accounts" ON bank_accounts FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Service role has full access
CREATE POLICY "Service role has full access to bank accounts" ON bank_accounts FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 11. USER ROLES TABLE POLICIES
-- ============================================
-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles FOR
SELECT USING (
        auth.uid() IN (
            SELECT id
            FROM users
            WHERE id = user_roles.user_id
        )
    );
-- Service role has full access
CREATE POLICY "Service role has full access to user roles" ON user_roles FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- 12. APPLICATION AUDIT TABLE POLICIES
-- ============================================
-- Users can view audit logs for their own applications
CREATE POLICY "Users can view own application audits" ON application_audit FOR
SELECT USING (
        auth.uid() IN (
            SELECT user_id
            FROM applications
            WHERE id = application_audit.application_id
        )
    );
-- Service role has full access
CREATE POLICY "Service role has full access to application audit" ON application_audit FOR ALL USING (auth.role() = 'service_role');
-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify policies are working:
-- Check which tables have RLS enabled
SELECT schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- View all policies
SELECT schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename,
    policyname;
-- ============================================
-- NOTES
-- ============================================
--
-- 1. These policies assume you're using Supabase Auth
--    If using custom JWT auth, you'll need to modify the policies
--
-- 2. Service role key bypasses RLS - use it only in backend
--
-- 3. Anon key respects RLS - safe to use in frontend
--
-- 4. Test policies thoroughly before deploying to production
--
-- 5. To disable RLS on a table (NOT RECOMMENDED):
--    ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
--
-- 6. To drop a policy:
--    DROP POLICY "policy_name" ON table_name;
--
-- ============================================