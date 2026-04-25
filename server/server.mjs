// Heroku deployment 2026-04-25
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import cron from 'node-cron';
import { MongoClient, ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup
dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'attendance-data');

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/software_eng';

let db = null;
let collections = {};

// Initialize MongoDB
async function initMongoDB() {
  try {
    if (!MONGODB_URI || MONGODB_URI.includes('localhost')) {
      console.log('⚠️  Using localhost MongoDB - install MongoDB locally or use connection string');
    }
    
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    db = client.db('software_eng');
    
    // Create collections if they don't exist
    const collectionNames = ['users', 'batches', 'schedule_slots', 'attendance', 
                            'community_posts', 'reset_tokens', 'announcements', 
                            'past_papers', 'course_notes', 'timetables', 'reminders_sent'];
    
    for (const name of collectionNames) {
      const exists = await db.listCollections({ name }).toArray();
      if (exists.length === 0) {
        await db.createCollection(name);
        console.log(`✅ Created collection: ${name}`);
      }
      collections[name] = db.collection(name);
    }
    
    // Create indexes
    await collections.users.createIndex({ email: 1 }, { unique: true });
    await collections.batches.createIndex({ number: 1 }, { unique: true });
    await collections.community_posts.createIndex({ created_at: -1 });
    await collections.attendance.createIndex({ date_ymd: 1, batch_id: 1 });
    
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    return false;
  }
}

// Express App
const app = express();
app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Email setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendMail = (to, subject, text, html) => {
  if (!process.env.SMTP_USER) {
    console.log('[MAIL SKIPPED - no SMTP config]', { to, subject });
    return;
  }
  transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text, html }, (err) => {
    if (err) console.error('Mail error:', err.message);
  });
};

// Helpers
const signSession = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
const verifyJwt = (token) => jwt.verify(token, JWT_SECRET);
const isWeekend = (date) => [0, 6].includes(new Date(date).getDay());

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

// Cron: Daily class reminders (10 min before each class)
cron.schedule('*/10 * * * *', async () => {
  if (!db) return;
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');
  const wd = now.day();
  
  if (wd === 0 || wd === 6) return; // weekend
  
  const slots = await collections.schedule_slots.find({ weekday: wd }).toArray();
  for (const slot of slots) {
    const [h, m] = slot.start_t.split(':');
    const slotTime = now.clone().hour(parseInt(h)).minute(parseInt(m));
    const minUntilStart = slotTime.diff(now, 'minute');
    
    if (minUntilStart > 5 && minUntilStart < 15) {
      const existing = await collections.reminders_sent.findOne({ 
        batch_id: slot.batch_id, 
        slot_id: slot._id.toString(),
        date_ymd: today 
      });
      if (existing) continue;
      
      const students = await collections.users.find({ 
        role: 'student', 
        batch_id: slot.batch_id 
      }).toArray();
      
      for (const s of students) {
        sendMail(
          s.email,
          `🔔 Class starting soon: ${slot.subject}`,
          `${slot.subject} starts at ${slot.start_t} in ${slot.location}`,
          `<p><b>${slot.subject}</b> starts at <b>${slot.start_t}</b> in <b>${slot.location}</b></p>`
        );
      }
      
      await collections.reminders_sent.insertOne({
        batch_id: slot.batch_id,
        slot_id: slot._id.toString(),
        date_ymd: today,
        sent_at: new Date()
      });
    }
  }
});

const commonErrorMessage = 'Database not configured. Please set MONGODB_URI in .env file.';

// ===== API Routes =====

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  try {
    let { name, email, password, regNo, batchNumber } = req.body || {};
    name = (name || '').trim();
    regNo = (regNo || '').trim();
    const normEmail = (email || '').trim().toLowerCase();
    
    if (!name || !normEmail || !password || !regNo || !batchNumber) 
      return res.status(400).json({ error: 'Missing fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) 
      return res.status(400).json({ error: 'Invalid email' });
    if (String(password).length < 8) 
      return res.status(400).json({ error: 'Password too short (min 8)' });
    
    const userCount = await collections.users.countDocuments();
    const finalRole = userCount === 0 ? 'admin' : 'student';
    
    const exists = await collections.users.findOne({ email: normEmail });
    if (exists) return res.status(400).json({ error: 'Email already exists' });
    
    // Ensure batch exists
    let batch = await collections.batches.findOne({ number: String(batchNumber) });
    if (!batch) {
      batch = {
        _id: new ObjectId(),
        number: String(batchNumber),
        name: `Batch ${batchNumber}`
      };
      await collections.batches.insertOne(batch);
    }
    
    const hash = await bcryptjs.hash(password, 10);
    const userId = new ObjectId();
    
    await collections.users.insertOne({
      _id: userId,
      name,
      email: normEmail,
      password: hash,
      role: finalRole,
      reg_no: regNo,
      batch_id: batch._id.toString()
    });
    
    const token = jwt.sign({ id: userId.toString(), name, email: normEmail, role: finalRole, batch_id: batch._id.toString() }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ user: { id: userId.toString(), name, email: normEmail, role: finalRole }, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  try {
    const { email, password } = req.body || {};
    const normEmail = (email || '').trim().toLowerCase();
    
    const user = await collections.users.findOne({ email: normEmail });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const match = await bcryptjs.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Wrong password' });
    
    const token = jwt.sign(
      { id: user._id.toString(), name: user.name, email: user.email, role: user.role, batch_id: user.batch_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, batch_id: user.batch_id },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }));

// Batches
app.get('/api/batches', auth, async (_req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  let batches = await collections.batches.find({}).toArray();
  
  if (batches.length === 0) {
    const years = [2024, 2025, 2026];
    for (const y of years) {
      const existing = await collections.batches.findOne({ number: String(y) });
      if (!existing) {
        await collections.batches.insertOne({
          _id: new ObjectId(),
          number: String(y),
          name: `Batch ${y}`
        });
      }
    }
    batches = await collections.batches.find({}).toArray();
  }
  
  res.json({ batches: batches.map(b => ({ id: b._id.toString(), ...b })) });
});

app.post('/api/batches', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { number, name } = req.body || {};
  const year = parseInt(number, 10);
  if (!Number.isInteger(year) || year < 2024 || year > 2100) 
    return res.status(400).json({ error: 'Batch number must be a year ≥ 2024' });
  
  let batch = await collections.batches.findOne({ number: String(number) });
  if (!batch) {
    const result = await collections.batches.insertOne({
      _id: new ObjectId(),
      number: String(number),
      name: name || `Batch ${number}`
    });
    batch = { _id: result.insertedId, number: String(number), name: name || `Batch ${number}` };
  } else if (name && name !== batch.name) {
    await collections.batches.updateOne({ _id: batch._id }, { $set: { name } });
    batch.name = name;
  }
  
  // Seed 2024 timetable if empty
  if (number === 2024) {
    const hasSlots = await collections.schedule_slots.findOne({ batch_id: batch._id.toString() });
    if (!hasSlots) {
      const timetable = [
        { weekday: 1, subject: 'OS (Lab)', start_t: '08:30', end_t: '10:30', location: 'Lab 2' },
        { weekday: 1, subject: 'ISE (Lab)', start_t: '10:30', end_t: '12:00', location: 'Lab 2' },
        { weekday: 2, subject: 'DSA (Lab)', start_t: '08:30', end_t: '10:30', location: 'Lab 2' },
        { weekday: 2, subject: 'OS-L (Lab)', start_t: '12:00', end_t: '15:00', location: 'Lab 2' },
        { weekday: 3, subject: 'DSA (Lab)', start_t: '08:30', end_t: '10:30', location: 'Lab 2' },
        { weekday: 4, subject: 'Quranic Translation', start_t: '08:00', end_t: '11:00', location: 'Block A' },
        { weekday: 4, subject: 'DSA-L (Lab)', start_t: '12:00', end_t: '13:30', location: 'Lab 2' }
      ];
      
      for (const slot of timetable) {
        await collections.schedule_slots.insertOne({
          _id: new ObjectId(),
          batch_id: batch._id.toString(),
          weekday: slot.weekday,
          subject: slot.subject,
          start_t: slot.start_t,
          end_t: slot.end_t,
          location: slot.location
        });
      }
    }
  }
  
  res.json({ batch: { id: batch._id.toString(), ...batch } });
});

// Schedule
app.get('/api/schedule/today', auth, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { batchId } = req.query;
  const userBatchId = req.user.batch_id;
  const id = batchId || userBatchId;
  
  const now = dayjs().toDate();
  const weekday = now.getDay(); // 0-6
  
  if (weekday === 0 || weekday === 6)
    return res.json({ weekday, classes: [] });
  
  const classes = await collections.schedule_slots
    .find({ batch_id: id, weekday })
    .sort({ start_t: 1 })
    .toArray();
  
  res.json({ weekday, classes: classes.map(c => ({ id: c._id.toString(), ...c })) });
});

app.put('/api/batches/:id/schedule', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { id } = req.params;
  const sc = req.body?.schedule || {};
  
  await collections.schedule_slots.deleteMany({ batch_id: id });
  
  const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
  for (let i = 0; i < days.length; i++) {
    for (const s of (sc[days[i]] || [])) {
      await collections.schedule_slots.insertOne({
        _id: new ObjectId(),
        batch_id: id,
        weekday: i + 1,
        subject: s.subject || '',
        start_t: s.start || '',
        end_t: s.end || '',
        location: s.location || ''
      });
    }
  }
  
  res.json({ ok: true });
});

app.get('/api/batches/:id/schedule', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { id } = req.params;
  const rows = await collections.schedule_slots
    .find({ batch_id: id })
    .sort({ weekday: 1, start_t: 1 })
    .toArray();
  
  const days = { mon: [], tue: [], wed: [], thu: [], fri: [] };
  rows.forEach(r => {
    const key = ['', 'mon', 'tue', 'wed', 'thu', 'fri'][r.weekday];
    if (key) days[key].push(r);
  });
  
  res.json({ schedule: days });
});

// QR & Attendance
app.post('/api/sessions/:batchId/generate', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { batchId } = req.params;
  const { dateYMD, slotId } = req.body || {};
  if (!dateYMD || !slotId) return res.status(400).json({ error: 'dateYMD and slotId required' });
  
  const slot = await collections.schedule_slots.findOne({ _id: new ObjectId(slotId), batch_id: batchId });
  if (!slot) return res.status(404).json({ error: 'Slot not found' });
  
  const sessionId = uuid();
  const token = signSession({ sessionId, batchId, dateYMD, slot });
  const url = `${CLIENT_URL}/scan?token=${encodeURIComponent(token)}`;
  const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 360 });
  
  res.json({ url, qrDataUrl, session: { sessionId, dateYMD, batchId, slot } });
});

app.post('/api/attendance/mark', auth, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });
  
  let payload;
  try {
    payload = verifyJwt(token);
  } catch {
    return res.status(400).json({ error: 'Invalid/expired session' });
  }
  
  if (req.user.batch_id !== payload.batchId) return res.status(403).json({ error: 'Wrong batch' });
  
  const dateObj = dayjs(payload.dateYMD).toDate();
  if (isWeekend(dateObj)) return res.status(400).json({ error: 'Weekend is off' });
  
  const user = await collections.users.findOne({ _id: new ObjectId(req.user.id) });
  
  await collections.attendance.insertOne({
    _id: new ObjectId(),
    date_ymd: payload.dateYMD,
    batch_id: payload.batchId,
    session_id: payload.sessionId,
    student_id: user._id.toString(),
    reg_no: user.reg_no,
    name: user.name,
    subject: payload.slot.subject,
    start_t: payload.slot.start_t || payload.slot.start,
    end_t: payload.slot.end_t || payload.slot.end,
    location: payload.slot.location,
    ts: new Date()
  });
  
  // Also save to CSV for backup
  const dir = path.join(dataDir, payload.dateYMD);
  fs.mkdirSync(dir, { recursive: true });
  const csvPath = path.join(dir, `${payload.batchId}.csv`);
  if (!fs.existsSync(csvPath)) 
    fs.writeFileSync(csvPath, 'timestamp,batchId,sessionId,studentRegNo,studentName,subject,start,end,location\n');
  const line = [new Date().toISOString(), payload.batchId, payload.sessionId, (user.reg_no || '').replace(/,/g, ' '), (user.name || '').replace(/,/g, ' '), (payload.slot.subject || '').replace(/,/g, ' '), payload.slot.start_t || payload.slot.start, payload.slot.end_t || payload.slot.end, (payload.slot.location || '').replace(/,/g, ' ')].join(',');
  fs.appendFileSync(csvPath, line + '\n');
  
  res.json({ ok: true, savedTo: csvPath });
});

app.get('/api/attendance/export', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { dateYMD, batchId } = req.query || {};
  if (!dateYMD || !batchId) return res.status(400).json({ error: 'dateYMD & batchId required' });
  
  const records = await collections.attendance
    .find({ date_ymd: dateYMD, batch_id: batchId })
    .toArray();
  
  if (records.length === 0) return res.status(404).json({ error: 'No attendance records' });
  
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(`Attendance ${dateYMD}`);
  ws.columns = [
    { header: 'Timestamp', key: 'ts', width: 24 },
    { header: 'Batch', key: 'batch_id', width: 10 },
    { header: 'Reg No', key: 'reg_no', width: 14 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Subject', key: 'subject', width: 20 },
    { header: 'Start', key: 'start_t', width: 10 },
    { header: 'End', key: 'end_t', width: 10 },
    { header: 'Location', key: 'location', width: 18 }
  ];
  
  records.forEach(r => {
    ws.addRow({
      ts: r.ts,
      batch_id: r.batch_id,
      reg_no: r.reg_no,
      name: r.name,
      subject: r.subject,
      start_t: r.start_t,
      end_t: r.end_t,
      location: r.location
    });
  });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="attendance_${dateYMD}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
});

// Users
app.get('/api/users', auth, admin, async (_req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const users = await collections.users
    .find({}, { projection: { password: 0 } })
    .sort({ name: 1 })
    .toArray();
  
  res.json({ users: users.map(u => ({ id: u._id.toString(), ...u })) });
});

app.put('/api/users/:id', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { id } = req.params;
  const { regNo, batchId, name } = req.body || {};
  
  await collections.users.updateOne(
    { _id: new ObjectId(id) },
    { $set: { reg_no: regNo, batch_id: batchId, name } }
  );
  
  const user = await collections.users.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
  res.json({ user: { id: user._id.toString(), ...user } });
});

// Community
const communityLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use('/api/community', communityLimiter);

app.get('/api/community', auth, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  try {
    // Purge expired posts
    await collections.community_posts.deleteMany({ type: 'anon', expires_at: { $lt: new Date() } });
    
    const rows = await collections.community_posts
      .find({ $or: [{ type: 'announcement' }, { expires_at: { $gt: new Date() } }] })
      .sort({ pinned: -1, created_at: -1 })
      .limit(200)
      .toArray();
    
    const adminView = req.user?.role === 'admin';
    const posts = rows.map(r => ({
      id: r._id.toString(),
      body: r.body,
      type: r.type,
      pinned: r.pinned,
      createdAt: r.created_at,
      expiresAt: r.expires_at,
      author: adminView ? { id: r.author_id, name: r.author_name } : { name: 'Anonymous' }
    }));
    
    res.json({ posts });
  } catch (err) {
    console.error('Community fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/community', auth, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  let { body, type } = req.body || {};
  body = String(body || '').trim();
  
  if (!body) return res.status(400).json({ error: 'Empty post' });
  if (body.length > 2000) return res.status(400).json({ error: 'Too long (max 2000 chars)' });
  
  const userIsAdmin = req.user?.role === 'admin';
  const finalType = userIsAdmin && type === 'announcement' ? 'announcement' : 'anon';
  const expiresAt = finalType === 'anon' ? dayjs().add(24, 'hour').toDate() : null;
  
  const id = new ObjectId();
  await collections.community_posts.insertOne({
    _id: id,
    author_id: req.user.id,
    body,
    type: finalType,
    pinned: finalType === 'announcement',
    expires_at: expiresAt,
    created_at: new Date()
  });
  
  res.json({
    post: {
      id: id.toString(),
      body,
      type: finalType,
      pinned: finalType === 'announcement',
      createdAt: new Date().toISOString(),
      expiresAt,
      author: userIsAdmin ? { id: req.user.id, name: req.user.name } : { name: 'Anonymous' }
    }
  });
});

app.delete('/api/community/:id', auth, admin, async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  await collections.community_posts.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ ok: true });
});

// Password reset
app.post('/api/auth/request-reset', async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { email } = req.body || {};
  const normEmail = (email || '').trim().toLowerCase();
  
  const user = await collections.users.findOne({ email: normEmail });
  if (!user) return res.status(200).json({ ok: true }); // don't reveal existence
  
  const token = uuid();
  const exp = dayjs().add(1, 'hour').toDate();
  
  await collections.reset_tokens.insertOne({
    _id: new ObjectId(),
    user_id: user._id.toString(),
    token,
    expires_at: exp
  });
  
  const link = `${CLIENT_URL}/reset-password?token=${token}`;
  await sendMail(
    user.email,
    "🔑 Reset your password",
    `Click the link to reset your password: ${link}`,
    `<p>Click below to reset your password:</p><p><a href="${link}">${link}</a></p>`
  );
  
  res.json({ ok: true });
});

app.post('/api/auth/reset-password', async (req, res) => {
  if (!db) return res.status(503).json({ error: commonErrorMessage });
  
  const { token, password } = req.body || {};
  
  const record = await collections.reset_tokens.findOne({ token, expires_at: { $gt: new Date() } });
  if (!record) return res.status(400).json({ error: 'Invalid/expired token' });
  
  const hash = await bcryptjs.hash(password, 10);
  await collections.users.updateOne({ _id: new ObjectId(record.user_id) }, { $set: { password: hash } });
  await collections.reset_tokens.deleteOne({ token });
  
  res.json({ ok: true, msg: 'Password updated' });
});

// Start server
app.listen(PORT, async () => {
  const connected = await initMongoDB();
  if (connected) {
    console.log(`✅ Software server running on :${PORT}`);
  } else {
    console.log(`⚠️  Server running on :${PORT} but MongoDB not connected`);
  }
});
