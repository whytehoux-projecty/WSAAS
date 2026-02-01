# Admin Credentials Guide

## 🔐 Default Admin Credentials

The database has been seeded with a default superadmin account for development purposes.

### Default Login Credentials

```
Staff ID: ADMIN-001
Email:    admin@organization.org
Password: Admin@123456
```

**⚠️ IMPORTANT SECURITY NOTES:**

- These are **development credentials only**
- Change the password immediately after first login
- Never use these credentials in production
- Create new admin accounts with strong passwords for production use

---

## 🚀 How to Access the Admin Interface

### 1. Start the Backend Server

```bash
cd staff_backend
npm run dev
```

The backend API will run on: `http://localhost:3000`

### 2. Start the Admin Interface

```bash
cd staff_admin_interface
npm run dev
```

The admin interface will run on: `http://localhost:3001` (or the next available port)

### 3. Login

1. Open your browser and navigate to the admin interface URL
2. Enter the credentials:
   - **Staff ID or Email**: `ADMIN-001` or `admin@organization.org`
   - **Password**: `Admin@123456`
3. Click "Login"

---

## 👥 Creating Additional Admin Users

You have three options to create additional admin users:

### Option 1: Using the Create Admin Script (Recommended)

We've created a convenient script to create new admin users:

```bash
cd staff_backend
npm run create-admin
```

Or directly with ts-node:

```bash
cd staff_backend
npx ts-node scripts/create-admin-user.ts
```

You'll be prompted to enter:

- Staff ID (e.g., ADMIN-002)
- Email
- Password (minimum 8 characters)
- First Name
- Last Name

The script will:

- ✅ Validate all inputs
- ✅ Check for duplicate users
- ✅ Hash the password securely
- ✅ Create the user
- ✅ Assign admin role automatically
- ✅ Display the credentials for you to save

### Option 2: Using the Database Seed Script

You can modify the seed script to add more admin users:

1. Edit `staff_backend/prisma/seed.ts`
2. Add additional admin users in the seed function
3. Run the seed command:

```bash
cd staff_backend
npm run seed
```

### Option 3: Direct Database Insert (Advanced)

If you need to create an admin user directly in the database:

```sql
-- 1. Create the user (replace values as needed)
INSERT INTO users (id, staff_id, email, password_hash, first_name, last_name, status, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'ADMIN-002',
    'admin2@organization.org',
    '$2b$10$hashedPasswordHere',  -- Use bcrypt to hash your password
    'John',
    'Doe',
    'active',
    NOW(),
    NOW()
);

-- 2. Get the user ID and admin role ID
-- Then assign the admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.staff_id = 'ADMIN-002' AND r.name = 'admin';
```

---

## 🔒 Password Hashing

If you need to hash a password manually (for direct database insert):

```bash
cd staff_backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123', 10).then(hash => console.log(hash));"
```

---

## 🎯 Admin Role Permissions

The `admin` role has the following permissions (defined in the database):

```json
{
  "all": true
}
```

This grants full access to all features:

- ✅ Manage all staff members
- ✅ Approve/reject applications (leave, transfer, training, loans, grants)
- ✅ Manage payroll
- ✅ View and edit all data
- ✅ Access admin settings
- ✅ Manage CMS content
- ✅ View analytics and reports

---

## 🔄 Resetting Admin Password

### Method 1: Using the Database

```sql
-- Update password for ADMIN-001
UPDATE users 
SET password_hash = '$2b$10$newHashedPasswordHere',
    updated_at = NOW()
WHERE staff_id = 'ADMIN-001';
```

### Method 2: Using Prisma Studio

```bash
cd staff_backend
npx prisma studio
```

1. Navigate to the `users` table
2. Find the admin user
3. Update the `password_hash` field with a new bcrypt hash
4. Save changes

### Method 3: Password Reset Flow (If Implemented)

If the password reset feature is implemented in the admin interface:

1. Click "Forgot Password" on the login page
2. Enter your admin email
3. Follow the reset link sent to your email

---

## 📊 Verifying Admin Access

After logging in, you should have access to:

### Admin Dashboard

- Overview statistics
- Recent activities
- Quick actions

### Staff Management

- View all staff members
- Add/edit/deactivate staff
- Manage staff profiles

### Applications

- Leave applications
- Transfer requests
- Training applications
- Loan requests
- Grant applications

### Payroll

- Process monthly payroll
- View payroll history
- Generate payslips

### Settings

- CMS settings (branding, colors, logos)
- System configuration
- User roles and permissions

---

## 🛡️ Security Best Practices

1. **Strong Passwords**: Use passwords with:
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, and symbols
   - No dictionary words or personal information

2. **Change Default Credentials**:
   - Never use `Admin@123456` in production
   - Change immediately after first login

3. **Limit Admin Accounts**:
   - Create admin accounts only for authorized personnel
   - Use principle of least privilege

4. **Enable Two-Factor Authentication** (if available):
   - Add extra security layer
   - Protect against password theft

5. **Regular Audits**:
   - Review admin user list regularly
   - Deactivate unused accounts
   - Monitor admin activities

6. **Secure Storage**:
   - Store credentials in a password manager
   - Never share credentials via email or chat
   - Use encrypted communication channels

---

## 🐛 Troubleshooting

### Cannot Login with Default Credentials

**Problem**: Login fails with `ADMIN-001` / `Admin@123456`

**Solutions**:

1. Verify the database has been seeded:

   ```bash
   cd staff_backend
   npm run seed
   ```

2. Check if the user exists:

   ```bash
   npx prisma studio
   ```

   Navigate to `users` table and look for `ADMIN-001`

3. Verify the backend is running:

   ```bash
   curl http://localhost:3000/health
   ```

### "Admin Role Not Found" Error

**Problem**: Script fails with "Admin role not found"

**Solution**: Run the database seed to create default roles:

```bash
cd staff_backend
npm run seed
```

### Password Hash Mismatch

**Problem**: Password doesn't work after manual database insert

**Solution**: Ensure you're using bcrypt with salt rounds of 10:

```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('YourPassword', 10);
```

---

## 📞 Support

If you encounter issues:

1. Check the backend logs for errors
2. Verify database connection in `.env`
3. Ensure all migrations have been applied
4. Review the Supabase dashboard for database status

For additional help, refer to:

- `SETUP_SUCCESS.md` - Setup verification guide
- `SUPABASE_TROUBLESHOOTING.md` - Database troubleshooting
- `staff_backend/README.md` - Backend documentation

---

## 📝 Quick Reference

| Item | Value |
|------|-------|
| **Default Staff ID** | ADMIN-001 |
| **Default Email** | <admin@organization.org> |
| **Default Password** | Admin@123456 |
| **Admin Interface URL** | <http://localhost:3001> |
| **Backend API URL** | <http://localhost:3000> |
| **Create Admin Script** | `npm run create-admin` |
| **Database Seed** | `npm run seed` |
| **Prisma Studio** | `npx prisma studio` |

---

**Last Updated**: February 2026  
**Version**: 1.0
