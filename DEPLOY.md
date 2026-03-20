# Deploying Your Marketplace with Supabase + Render

## What You'll Get
- A live URL like `https://marketplace-xxxx.onrender.com`
- PostgreSQL database on Supabase (free, 500MB, runs 24/7)
- Backend on Render (free, auto-deploys from GitHub)
- Share the link with anyone — they can register, buy, sell!

---

## Step 1: Create Accounts (all free)

1. **GitHub** → https://github.com/signup
2. **Supabase** → https://supabase.com (sign up with GitHub)
3. **Render** → https://render.com (sign up with GitHub)
4. **Git** installed → https://git-scm.com/download/win

---

## Step 2: Set Up Supabase Database

1. Go to https://supabase.com → click **"New Project"**
2. Choose your organization (or create one)
3. Fill in:
   - **Project name:** `marketplace`
   - **Database password:** (make a strong one and SAVE IT — you'll need it!)
   - **Region:** pick the closest to you (Singapore if you're in SG)
4. Click **"Create new project"** — wait 1-2 minutes

### Get your connection string:
1. In your Supabase project, click **"Project Settings"** (gear icon, bottom left)
2. Click **"Database"** in the left menu
3. Scroll to **"Connection string"** section
4. Click **"URI"** tab
5. Copy the connection string — it looks like:
   ```
   postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with the password you set in step 3

### Run the database setup:
1. In Supabase, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Paste the contents of `sql/schema.sql` → click **"Run"**
4. New query → paste `sql/seed.sql` → click **"Run"**
5. New query → paste `sql/migration_finance.sql` → click **"Run"**
6. New query → paste `sql/migration_cancel.sql` → click **"Run"**

### Set the admin password:
On your local machine, run (in Command Prompt from your project folder):
```
node -e "const b=require('bcryptjs');b.hash('admin123456',10).then(h=>console.log(h))"
```

Copy the hash, then in Supabase SQL Editor run:
```sql
UPDATE users SET password_hash = 'PASTE_HASH_HERE' WHERE role IN ('admin', 'seller');
```

### Insert categories and products:
Since Supabase handles Unicode properly, you can use emojis!
Run each block in the SQL Editor (they're in the seed.sql file).

---

## Step 3: Push Code to GitHub

Open Command Prompt:

```bash
cd C:\SIT\marketplace-deploy
git init
git add .
git commit -m "Marketplace with Supabase"
git remote add origin https://github.com/YOUR_USERNAME/marketplace.git
git branch -M main
git push -u origin main
```

Replace YOUR_USERNAME with your actual GitHub username.

If the repo already exists, use a different name like `marketplace-live`.

---

## Step 4: Deploy on Render

1. Go to https://render.com → **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`marketplace` or `marketplace-live`)
3. Configure:
   - **Name:** `marketplace` (or anything you want)
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Click **"Advanced"** → **"Add Environment Variable"**:

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | (paste your Supabase connection string from Step 2) |
   | `JWT_SECRET` | `any-long-random-string-you-make-up-here-abc123xyz` |

5. Click **"Create Web Service"**

Render will build and deploy. First deploy takes 3-5 minutes.

---

## Step 5: Test Your Live Site!

Once deployed, Render gives you a URL like:
```
https://marketplace-xxxx.onrender.com
```

Open it in your browser. You should see the login page!

- Login as admin: `admin@gmail.com` / `admin123456`
- Register a new buyer account
- Add a card, top up wallet, buy something
- Share the URL with friends!

---

## Updating Your Site

Make changes locally, then:
```bash
cd C:\SIT\marketplace-deploy
git add .
git commit -m "Description of changes"
git push
```

Render auto-redeploys in 2-3 minutes.

---

## Important Notes

### Free Tier Limits
- **Supabase free:** 500MB database, 2 projects, unlimited API calls
- **Render free:** Spins down after 15 min of inactivity, cold start takes ~30 seconds
  (First visit after being idle is slow, then it's fast)

### Security
- Never commit your `.env` file or database password to GitHub
- The `.gitignore` file prevents this
- All secrets are set as environment variables on Render

### Supabase Dashboard
- You can view/edit your data directly in Supabase: **Table Editor** tab
- Run queries in the **SQL Editor** tab
- Monitor usage in the **Reports** tab

---

## Troubleshooting

**"Application error" on Render:**
→ Check Render logs (click your service → "Logs" tab)
→ Usually a missing DATABASE_URL or wrong connection string

**"Database connection failed":**
→ Make sure DATABASE_URL is set in Render's environment variables
→ Make sure you replaced [YOUR-PASSWORD] in the connection string
→ Try the connection string with `?sslmode=require` at the end

**Blank page:**
→ Build might have failed. Check Render logs for vite errors.
→ Make sure NODE_ENV is set to "production"

**Slow first load:**
→ Normal on Render free tier. The server "wakes up" after being idle.
→ Subsequent requests are fast.
