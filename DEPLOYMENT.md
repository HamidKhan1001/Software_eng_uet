# Deployment Guide

## Quick Start

This application has two main parts:
- **Frontend**: React app (Vercel)
- **Backend**: Node.js/Express server (Railway or Render)

## Prerequisites

1. A Neon PostgreSQL database (free tier available)
2. Vercel account
3. Railway or Render account
4. Gmail account (for email notifications)

---

## 1. Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)
4. Save it for later - this is `DATABASE_URL`

---

## 2. Backend Deployment (Railway or Render)

### Option A: Railway.app (Recommended)

1. Push your code to GitHub if not already done
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add these environment variables:
   ```
   DATABASE_URL=your_neon_connection_string
   JWT_SECRET=your_random_secret_key_min_32_chars
   PORT=4000
   CLIENT_URL=https://your-frontend-domain.vercel.app
   
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your_app_password
   ```

6. Deploy! Railway will serve it at `https://your-project.up.railway.app`

### Option B: Render.com

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set the start command: `node server/server.mjs`
5. Add environment variables (same as Railway above)
6. Deploy!

---

## 3. Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. In settings, add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url
   ```
   (e.g., `https://your-project.up.railway.app`)

5. Deploy! Vercel will handle building and deploying automatically

---

## 4. Gmail Setup for Emails

To enable email notifications:

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Generate an "App Password" for Mail
3. Copy the 16-character password
4. Use this as `SMTP_PASS` in your environment variables

---

## 5. Environment Variables Reference

### Backend (.env or Railway/Render dashboard)

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Server
PORT=4000
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters

# Frontend URL
CLIENT_URL=https://your-frontend-domain.vercel.app

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
```

### Frontend (.env.local)

```env
REACT_APP_API_URL=https://your-backend-url
```

---

## 6. First-Time Setup

After deploying:

1. Your app is live at your Vercel URL
2. Click "Sign up" to create the first admin account
3. First user is automatically an admin
4. Students can create accounts afterward
5. Admin can manage timetables, announcements, etc.

---

## 7. Post-Deployment Checklist

- [ ] Database is connected and tables are created
- [ ] Admin account is created
- [ ] Email notifications are working
- [ ] Homepage loads correctly
- [ ] Login/Signup works
- [ ] Can post announcements (admin)
- [ ] Timetable displays correctly
- [ ] Mobile responsive on phones

---

## 8. Troubleshooting

### Database connection error
- Check `DATABASE_URL` format
- Ensure Neon database is active
- Update firewall rules if needed

### Email not sending
- Check SMTP credentials
- Verify app password is 16 characters
- Check email address is correct

### CORS errors
- Update `CORS_ORIGINS` in server.mjs
- Add your frontend URL to the cors origins list

### Build failures
- Clear build caches in Vercel/Railway
- Check Node version compatibility
- Ensure all dependencies are installed

---

## 9. Monitoring & Maintenance

- Check logs in Railway/Render dashboard
- Monitor database usage on Neon
- Set up alerts for high error rates

---

## Need Help?

Check the main README.md for development setup instructions.
