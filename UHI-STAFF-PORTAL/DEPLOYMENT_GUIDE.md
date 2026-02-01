# ☁️ Free Cloud Deployment Guide for UHI Staff Portal

Since local network restrictions are blocking your connection to Supabase, deploying to the cloud is the **best solution**. Cloud servers won't have firewall issues connecting to the database.

Here is the recommended "Forever Free" stack for your project:

| Service | Component | Why? |
| :--- | :--- | :--- |
| **Vercel** | **Admin Interface** & **Staff Portal** | Native Next.js support, easiest setup, completely free. |
| **Render** | **Backend API** | Excellent free tier for Node.js services, supports subdirectories. |
| **Supabase** | **Database** | You already have this set up! |

---

## 🚀 Step 1: Prepare Your Code (GitHub)

1. Ensure your project is pushed to GitHub.
    * If you haven't pushed recently:

        ```bash
        git add .
        git commit -m "Ready for deployment"
        git push
        ```

---

## 🌐 Step 2: Deploy Frontends (Vercel)

**Do this for both `staff_admin_interface` and `staff_portal`.**

1. **Sign up/Login** at [vercel.com](https://vercel.com).
2. Click **"Add New"** > **"Project"**.
3. Import your GitHub Repository.
4. **Important:** Configure the "Root Directory".
    * Click "Edit" next to Root Directory.
    * Select `staff_admin_interface` (or `staff_portal`).
5. **Environment Variables:**
    * Expand "Environment Variables".
    * Add `NEXT_PUBLIC_API_URL`.
    * **Value:** `https://your-render-backend-url.onrender.com` (You will update this later after deploying the backend).
6. Click **"Deploy"**.

---

## ⚙️ Step 3: Deploy Backend (Render)

1. **Sign up/Login** at [render.com](https://render.com).
2. Click **"New"** > **"Web Service"**.
3. Connect your GitHub Repository.
4. **Configuration:**
    * **Name:** `uhi-staff-backend`
    * **Root Directory:** `staff_backend` (Crucial!)
    * **Runtime:** `Node`
    * **Build Command:** `npm install && npm run build`
        * *Note: Ensure `npm run build` runs `tsc`. If `tsc` is not found, use `npm install typescript -D && npm run build`.*
    * **Start Command:** `npm start`
5. **Environment Variables (Advanced):**
    * Click "Add Environment Variable".
    * Copy these from your local `.env`:
        * `DATABASE_URL`: (Use the **Pooled** connection string from Supabase: `...pooler.supabase.com:6543...`)
        * `DIRECT_URL`: (Use the **Direct** connection string: `...supabase.co:5432...`)
        * `JWT_SECRET`: (Your secret key)
        * `CORS_ORIGIN`: `*` (Or your Vercel URL once you have it)
6. Click **"Create Web Service"**.

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request might take 30-50 seconds to wake it up.

---

## 🔗 Step 4: Connect Everything

1. **Update Admin Interface on Vercel:**
    * Go to your Vercel Project Settings > Environment Variables.
    * Edit `NEXT_PUBLIC_API_URL` with your **actual Render Backend URL** (e.g., `https://uhi-staff-backend.onrender.com`).
    * **Redeploy** the project (Go to Deployments > Redeploy) for changes to take effect.

2. **Update Backend on Render:**
    * Go to Render Dashboard > Environment.
    * Update `CORS_ORIGIN` to your **Vercel Frontend URL** (e.g., `https://uhi-admin.vercel.app`) to secure it, or keep it `*` for testing.

---

## ✅ Deployment Checklist

* [ ] **Database:** Supabase is active and "Restore" button clicked if paused.
* [ ] **Backend:** Render service is "Live" and `npm run build` succeeded.
* [ ] **Frontend:** Vercel deployment has the green light.
* [ ] **Connection:** Frontend can login (checks Admin credentials in DB).

---

## 🆘 Common Troubleshooting

### Build Fails on Render (Typescript)

If Render complains `tsc: command not found`:

* Update **Build Command** to: `npm install && npm install typescript -g && npm run build`
* Or move `typescript` from `devDependencies` to `dependencies` in `staff_backend/package.json`.

### "Can't reach database" on Render

* Ensure you used the **Connection Pooler URL** (port 6543) for `DATABASE_URL`.
* Ensure `DIRECT_URL` uses port 5432.
* In Render Settings, ensure you didn't paste quotes `""` inside the value box.

### Frontend Login Fails

* Check the Network tab in browser Developer Tools.
* If you see "CORS error", check `CORS_ORIGIN` on Render.
* If you see "404 Not Found", check `NEXT_PUBLIC_API_URL` on Vercel (no trailing slash!).
