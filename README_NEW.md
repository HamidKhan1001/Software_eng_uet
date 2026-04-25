# UET Software Engineering Department Portal

A comprehensive web platform for the Software Engineering Department at UET featuring a public homepage and student portal with announcements, past papers, timetable, and more.

## Features

### Public Homepage
- ✅ Department information
- ✅ About Us section
- ✅ Mission & Vision
- ✅ Software Excellence Society introduction
- ✅ Social media links
- ✅ Responsive footer
- ✅ Mobile-friendly design

### Student Portal
- ✅ User authentication (Login/Register/Password reset)
- ✅ Dashboard with personalized content
- ✅ Announcements management (admin)
- ✅ Past papers & course notes library
- ✅ Class timetable with push notifications
- ✅ Community discussion board
- ✅ Attendance QR code scanning
- ✅ Mobile responsive UI

### Admin Features
- ✅ Manage announcements
- ✅ Upload past papers and notes
- ✅ Edit class timetables
- ✅ User management
- ✅ Attendance tracking & export
- ✅ Email notifications

---

## Tech Stack

- **Frontend**: React 19 + React Router
- **Backend**: Node.js + Express 5
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT tokens
- **Email**: Nodemailer + Gmail SMTP
- **Deployment**: Vercel (frontend) + Railway/Render (backend)

---

## Project Structure

```
Software_eng_uet/
├── software/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components (Header, Sidebar, Layout)
│   │   ├── pages/            # Page components (Home, Dashboard, Announcements, etc.)
│   │   ├── hooks/            # Custom hooks (useAuth)
│   │   ├── styles/           # CSS files
│   │   ├── api.js            # API client
│   │   └── App.js            # Main component
│   ├── public/               # Static assets
│   └── package.json
├── server/                    # Node.js Backend
│   ├── server.mjs            # Express app & API routes
│   ├── .env.example          # Environment variables template
│   └── package.json
├── DEPLOYMENT.md             # Deployment guide
└── README.md                 # This file
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+ (from [nodejs.org](https://nodejs.org))
- npm or yarn
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))
- Gmail account (for email notifications)

### 2. Setup Backend

```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm start  # Runs on http://localhost:4000
```

### 3. Setup Frontend

```bash
cd software
cp .env.example .env.local
# Edit .env.local with API URL
npm install
npm start  # Runs on http://localhost:3000
```

### 4. Database Setup

The database tables are automatically created when the server starts for the first time.

**Default timetable** for Batch 2024 is seeded automatically.

### 5. First Login

1. Navigate to http://localhost:3000
2. Click "Sign Up" to create an admin account
3. First user becomes admin automatically
4. Students can register afterward

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://...      # Neon connection string
JWT_SECRET=your-secret-key         # Random 32+ char string
PORT=4000
CLIENT_URL=http://localhost:3000   # Frontend URL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password        # Gmail app password
```

### Frontend (.env.local)

```env
REACT_APP_API_URL=http://localhost:4000
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Announcements
- `GET /api/announcements` - List all
- `POST /api/announcements` - Create (admin)
- `DELETE /api/announcements/:id` - Delete (admin)

### Past Papers
- `GET /api/past-papers` - List all
- `POST /api/past-papers` - Create (admin)
- `DELETE /api/past-papers/:id` - Delete (admin)

### Course Notes
- `GET /api/notes` - List all
- `POST /api/notes` - Create (admin)
- `DELETE /api/notes/:id` - Delete (admin)

### Timetable
- `GET /api/timetables/:batchId` - Get timetable
- `PUT /api/timetables/:batchId` - Update (admin)
- `GET /api/schedule/today` - Today's classes
- `GET /api/schedule/on-date` - Classes on specific date

### Attendance & QR
- `POST /api/sessions/:batchId/generate` - Generate QR code
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/export` - Export attendance

### Users & Batches
- `GET /api/users` - List users (admin)
- `PUT /api/users/:id` - Update user (admin)
- `GET /api/batches` - List batches
- `POST /api/batches` - Create batch (admin)

### Community
- `GET /api/community` - List posts
- `POST /api/community` - Create post
- `DELETE /api/community/:id` - Delete post (admin)

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions including:
- Railway.app setup
- Render.com setup
- Vercel deployment
- Environment configuration
- Troubleshooting

**TL;DR:**
1. Push to GitHub
2. Deploy backend to Railway/Render
3. Deploy frontend to Vercel
4. Add environment variables
5. Done! 🚀

---

## Features Overview

### Home Page
- Public facing department information
- Non-bookmarked testimonials
- Software Excellence Society introduction
- Mobile responsive design
- Social media links in footer

### Authentication
- Secure registration & login
- Email-based password reset
- Role-based access (admin/student)
- JWT token authentication

### Dashboard
- Student profile & batch info
- Today's schedule
- Quick links to resources

### Announcements
- Admins post official announcements
- Students view latest updates
- Timestamp & author info
- Mobile-friendly cards

### Past Papers & Notes
- Browse by course & semester
- Download resources
- Organized by type
- Admin can upload new content

### Timetable
- Weekly schedule view
- Shows location & time
- Semester selection
- Auto-populated from admin panel
- Responsive grid layout

### Community
- Anonymous posts (24-hour expiry)
- Pinned announcements
- Admin management tools
- Discussion forum

### Attendance
- QR code generation for classes
- Student check-in via camera
- Attendance export to Excel
- Automated email reminders (15 min before class)

---

## Development Guide

### Running Locally with Hot Reload

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm start
# Watches for changes, no restart needed
```

**Terminal 2 - Frontend:**
```bash
cd software
npm install
npm start
# Auto-opens browser, hot module reloading
```

### Building for Production

**Frontend:**
```bash
cd software
npm run build
# Creates optimized build in `build/` folder
```

**Backend:**
- No build step needed, runs directly with Node.js

---

## Database Schema

### Users
- `id`, `name`, `email`, `password`, `role`, `reg_no`, `batch_id`

### Announcements
- `id`, `title`, `content`, `author_id`, `created_at`, `updated_at`

### Past Papers
- `id`, `title`, `course`, `semester`, `file_path`, `uploaded_by`, `created_at`

### Course Notes
- `id`, `title`, `course`, `content`, `file_path`, `uploaded_by`, `created_at`

### Timetables
- `id`, `batch_id`, `course`, `day`, `start_time`, `end_time`, `location`, `created_at`

### Schedule Slots
- `id`, `batch_id`, `weekday`, `subject`, `start_t`, `end_t`, `location`

### Attendance
- `id`, `ts`, `date_ymd`, `batch_id`, `session_id`, `student_id`, `reg_no`, `name`, `subject`, `start_t`, `end_t`, `location`

---

## Customization

### Change Department Name
1. Edit [Home.js](software/src/pages/Home.js) - `Software Excellence Society` → your name
2. Update [Header.js](software/src/components/Header.js) - `UET Software Engineering` → your department

### Add Social Media Links
Edit the footer in [Home.js](software/src/pages/Home.js) - Replace placeholder links with real URLs

### Customize Colors
Edit [styles.css](software/src/styles.css) and individual CSS files:
- Primary color: `#667eea`
- Change to your brand color throughout

### Modify Timetable
Edit via Admin Panel or seed the database directly in [server.mjs](server/server.mjs)

---

## Support & Troubleshooting

### Common Issues

**"Cannot connect to database"**
- Verify DATABASE_URL in .env
- Check Neon database is active
- Ensure network access is allowed

**"CORS error on login"**
- Update CLIENT_URL in server.env
- Verify frontend URL in CORS config

**"Email not sending"**
- Check Gmail app password (16 chars)
- Enable 2FA on Gmail account
- Verify SMTP credentials

**"Module not found"**
- Run `npm install` in both server/ and software/
- Clear node_modules and package-lock.json, reinstall

---

## Contributing

To contribute improvements:

1. Create a feature branch
2. Make changes
3. Test locally
4. Submit a pull request

---

## License

© 2024 UET Software Engineering. All rights reserved.

---

## Contact & Support

For issues or questions:
- 📧 Email: se@uet.edu.pk
- 📱 Instagram: @seuet
- 💼 LinkedIn: UET Software Engineering

---

**Last Updated:** April 2024  
**Version:** 1.0.0
