# Quick Start Guide

Get the UET SE Portal running in 10 minutes!

## Step 1: Clone & Install

```bash
# Clone the repository (if you haven't already)
git clone <your-repo-url>
cd Software_eng_uet

# Install backend dependencies
cd server
npm install

# Install frontend dependencies (in another terminal)
cd software
npm install
```

## Step 2: Setup Local Database

### Option A: Use Neon (Cloud - Recommended)

1. Go to https://neon.tech and create a free account
2. Create a new project
3. Copy your connection string (looks like `postgresql://user:pass@host/dbname`)

### Option B: Use Local PostgreSQL

```bash
# If you have PostgreSQL installed locally
createdb uet_se_portal
# Connection string: postgresql://postgres:password@localhost:5432/uet_se_portal
```

## Step 3: Create .env File

Create `server/.env`:

```env
DATABASE_URL=postgresql://your_username:your_password@your_host/your_db
JWT_SECRET=your-secret-key-change-this
PORT=4000
CLIENT_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

### Getting Gmail App Password (Optional for local dev)

If you want email to work:
1. Go to https://myaccount.google.com
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" → "Other (custom name)"
5. Copy the 16-character password

For local testing, you can ignore emails.

## Step 4: Start the Backend

```bash
cd server
npm start
```

Expected output:
```
Software server running on :4000
```

## Step 5: Start the Frontend

Open a NEW terminal/window:

```bash
cd software
npm start
```

This will auto-open your browser to http://localhost:3000

## Step 6: Create Your First Account

1. You should see the UET SE Portal homepage
2. Click "Student Portal" button
3. Click "Create an account here" link
4. Fill in the form:
   - Name: Your name
   - Email: anything@example.com
   - Password: At least 8 characters
   - Reg No: Any number like 01-CS-123
   - Batch: 2024 (or 2025, 2026)
5. Click "Sign Up"

The first account is automatically made an **admin** account.

## Step 7: Test the Features

### As Admin:
- Go to Admin panel (top right menu)
- Post an announcement
- View timetable
- Manage users

### As Student:
- Log in with your account
- View dashboard
- Check announcements
- Browse past papers
- See timetable

### Public Features:
- Click the logo to go back to homepage
- View department info
- Check social links
- Read about the SE Society

---

## Troubleshooting

### Port 4000 Already in Use

```bash
# Kill existing process on port 4000
lsof -ti:4000 | xargs kill -9

# Or use a different port
PORT=5000 npm start
```

### Database Connection Error

1. Check DATABASE_URL is correct
2. Ensure PostgreSQL is running
3. Try connecting with psql: `psql postgresql://user:pass@host/db`

### Module Not Found

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 Already in Use

```bash
# React will auto-increment to 3001, 3002, etc.
# Or kill the process:
lsof -ti:3000 | xargs kill -9
```

---

## Tips

- **Hot reload**: Changes to React files auto-reload the page
- **Backend changes**: Requires restart (`Ctrl+C`, then `npm start`)
- **Database changes**: Tables auto-create on first server start
- **Admin features**: Only visible if you're logged in as admin (first account)

---

## Next Steps

- Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy online
- Edit homepage in `software/src/pages/Home.js`
- Customize colors in `software/src/styles.css`
- Add your social media links
- Upload real past papers via admin panel

---

## Still Stuck?

1. Check terminal error messages carefully
2. Ensure both ports 3000 (frontend) and 4000 (backend) are accessible
3. Look at DEPLOYMENT.md for more details
4. Check network tab in browser dev tools (F12)

Happy coding! 🎓
