// server/server.js
import dotenv from 'dotenv';
import dayjs from 'dayjs';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import QRCode from 'qrcode';
import ExcelJS from 'exceljs';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import rateLimit from 'express-rate-limit';

import path from 'path';

// --- app ---
const app = express();
app.use(express.json());
dotenv.config();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ['http://localhost:3000','http://127.0.0.1:3000'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const sql = neon(process.env.DATABASE_URL);

// --- utils ---
const dataDir = path.join(process.cwd(), 'data', 'attendance');
fs.mkdirSync(dataDir, { recursive: true });
const dowIdx = (d) => dayjs(d).day();
const isWeekend = (d) => [0,6].includes(dowIdx(d));
const signUser = (u) =>
  jwt.sign({ id:u.id, role:u.role, name:u.name, regNo:u.reg_no, batchId:u.batch_id }, JWT_SECRET, { expiresIn:'7d' });
const signSession = (payload) => {
  const exp = dayjs(payload.dateYMD + ' 23:59:59').unix();
  return jwt.sign(payload, JWT_SECRET, { expiresIn: Math.max(60, exp - dayjs().unix()) });
};
const auth = (req,res,next)=>{ try{ req.user=jwt.verify((req.headers.authorization||'').replace('Bearer ','').trim(),JWT_SECRET); next(); }catch{ res.status(401).json({error:'Unauthorized'});} };
const admin = (req,res,next)=>{ if(req.user?.role!=='admin') return res.status(403).json({error:'Admin only'}); next(); };

// --- DB bootstrap (each statement separately for Neon) ---
await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('admin','student')), reg_no TEXT, batch_id TEXT)`;
await sql`CREATE TABLE IF NOT EXISTS batches (id TEXT PRIMARY KEY, number TEXT UNIQUE NOT NULL, name TEXT NOT NULL)`;
await sql`CREATE TABLE IF NOT EXISTS schedule_slots (id TEXT PRIMARY KEY, batch_id TEXT NOT NULL, weekday INT NOT NULL, subject TEXT NOT NULL, start_t TEXT NOT NULL, end_t TEXT NOT NULL, location TEXT NOT NULL)`;
await sql`CREATE TABLE IF NOT EXISTS attendance (id BIGSERIAL PRIMARY KEY, ts TIMESTAMPTZ DEFAULT now(), date_ymd TEXT NOT NULL, batch_id TEXT NOT NULL, session_id TEXT NOT NULL, student_id TEXT NOT NULL, reg_no TEXT, name TEXT, subject TEXT, start_t TEXT, end_t TEXT, location TEXT)`;
await sql`CREATE TABLE IF NOT EXISTS community_posts (
  id         TEXT PRIMARY KEY,
  author_id  TEXT NOT NULL,
  body       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('anon','announcement')),
  pinned     BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
)`;
await sql`CREATE INDEX IF NOT EXISTS community_created_idx ON community_posts (created_at DESC)`;
const communityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/community', communityLimiter);

app.get('/api/community', auth, async (req, res) => {
  // Purge expired anon posts (separate statement because Neon forbids multi-cmd)
  await sql`DELETE FROM community_posts WHERE type='anon' AND expires_at IS NOT NULL AND expires_at < now()`;

  const rows = await sql`
    SELECT c.*, u.name AS author_name, u.email AS author_email
    FROM community_posts c
    JOIN users u ON u.id = c.author_id
    WHERE (c.type='announcement' OR c.expires_at IS NULL OR c.expires_at > now())
    ORDER BY c.pinned DESC, c.created_at DESC
    LIMIT 200
  `;

  const adminView = req.user?.role === 'admin';
  const posts = rows.map(r => ({
    id: r.id,
    body: r.body,
    type: r.type,
    pinned: r.pinned,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    author: adminView ? { id: r.author_id, name: r.author_name, email: r.author_email }
                      : { name: 'Anonymous' }
  }));
  res.json({ posts });
});
app.post('/api/community', auth, async (req, res) => {
  let { body, type } = req.body || {};
  body = String(body || '').trim();
  if (!body) return res.status(400).json({ error: 'Empty post' });
  if (body.length > 2000) return res.status(400).json({ error: 'Too long (max 2000 chars)' });

  const userIsAdmin = req.user?.role === 'admin';
  // Only admins can create announcements; everyone else forced to anon
  const finalType = userIsAdmin && type === 'announcement' ? 'announcement' : 'anon';
  const expiresAt = finalType === 'anon' ? dayjs().add(24, 'hour').toISOString() : null;

  const id = uuid();
  await sql`
    INSERT INTO community_posts (id, author_id, body, type, pinned, expires_at)
    VALUES (${id}, ${req.user.id}, ${body}, ${finalType}, ${finalType === 'announcement'}, ${expiresAt})
  `;

  res.json({
    post: {
      id,
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
  await sql`DELETE FROM community_posts WHERE id=${req.params.id}`;
  res.json({ ok: true });
});



// --- Auth rate limit ---
app.use('/api/auth/', rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true, legacyHeaders: false }));

// --- helpers: ensure batch + seed 2024 timetable once ---
async function ensureBatch(yearStr) {
  if (!yearStr) return null;
  const year = parseInt(yearStr, 10);
  if (!Number.isInteger(year) || year < 2024 || year > 2100) return null;

  const existing = await sql`SELECT * FROM batches WHERE number=${String(year)}`;
  if (existing.length) return existing[0];

  const id = uuid();
  await sql`INSERT INTO batches (id,number,name) VALUES (${id},${String(year)},${'Batch '+year})`;
  return { id, number:String(year), name:'Batch '+year };
}

async function seed2024IfEmpty(batch) {
  if (!batch || batch.number !== '2024') return;
  const rows = await sql`SELECT 1 FROM schedule_slots WHERE batch_id=${batch.id} LIMIT 1`;
  if (rows.length) return;

  // UET SE 3rd semester (from your image) — Mon..Thu, Fri off, prayer break at 13:00-13:30
  const S = [];
  const push = (wd, subject, start, end, location) => S.push({ id: uuid(), batch_id: batch.id, weekday: wd, subject, start_t: start, end_t: end, location });

  // Monday
  push(1,'OS (Lab)', '08:30','10:30','Lab 2');
  push(1,'ISE (Lab)','10:30','12:00','Lab 2');
  push(1,'CVT (CR1)','12:00','13:00','CR 1');
  push(1,'CVT (CR1) — Continue','13:30','15:00','CR 1');

  // Tuesday
  push(2,'DSA (Lab)','08:30','10:30','Lab 2');
  push(2,'ISE (Lab)','10:30','12:00','Lab 2');
  push(2,'OS-L (Lab)','12:00','13:30','Lab 2');
  push(2,'OS-L (Lab) — Continue','13:30','15:00','Lab 2');

  // Wednesday
  push(3,'DSA (Lab)','08:30','10:30','Lab 2');
  push(3,'OS (Lab)','10:30','12:00','Lab 2');
  push(3,'PS (CR1)','12:00','13:30','CR 1');
  push(3,'PS (CR1) — Continue','13:30','15:00','CR 1');

  // Thursday
  push(4,'Quranic Translation','08:00','11:00','Block A');
  push(4,'DSA-L (Lab)','12:00','13:30','Lab 2');
  push(4,'DSA-L (Lab) — Continue','13:30','15:00','Lab 2');

  for (const r of S) {
    await sql`INSERT INTO schedule_slots (id,batch_id,weekday,subject,start_t,end_t,location)
              VALUES (${r.id},${r.batch_id},${r.weekday},${r.subject},${r.start_t},${r.end_t},${r.location})`;
  }
  console.log('Seeded 2024 timetable for batch', batch.id);
}

// --- AUTH ---
app.post('/api/auth/register', async (req,res)=>{
  try{
    let { name, email, password, regNo, batchNumber } = req.body || {};
    name=(name||'').trim(); regNo=(regNo||'').trim();
    const normEmail=(email||'').trim().toLowerCase();

    if(!name||!normEmail||!password||!regNo||!batchNumber) return res.status(400).json({error:'Missing fields'});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) return res.status(400).json({error:'Invalid email'});
    if(String(password).length<8) return res.status(400).json({error:'Password too short (min 8)'});

    // first user is admin, others student
    const [{count}] = await sql`SELECT COUNT(*)::int FROM users`;
    const finalRole = count===0 ? 'admin' : 'student';

    const exists = await sql`SELECT 1 FROM users WHERE email=${normEmail} LIMIT 1`;
    if (exists.length) return res.status(400).json({ error:'Email already exists' });

    // ensure batch exists by year; create if needed (validates ≥2024)
    const batch = await ensureBatch(String(batchNumber));
    if (!batch) return res.status(400).json({ error:'Invalid batch year (>= 2024)' });

    // seed timetable for 2024 (first time only)
    await seed2024IfEmpty(batch);

    const id = uuid();
    const hash = bcrypt.hashSync(password,10);
    await sql`INSERT INTO users (id,name,email,password,role,reg_no,batch_id)
              VALUES (${id},${name},${normEmail},${hash},${finalRole},${regNo},${batch.id})`;

    const token = signUser({ id, role:finalRole, name, reg_no:regNo, batch_id:batch.id });
    res.json({ token, user:{ id, name, email:normEmail, role:finalRole, batchId:batch.id, regNo } });
  }catch(err){
    if (err?.code==='23505') return res.status(400).json({error:'Email already exists'});
    console.error('REGISTER ERROR', err);
    res.status(500).json({error:'Server error'});
  }
});

app.post('/api/auth/login', async (req,res)=>{
  try{
    const { email, password } = req.body || {};
    const normEmail=(email||'').trim().toLowerCase();
    if(!normEmail||!password) return res.status(400).json({error:'Missing email or password'});

    const rows = await sql`SELECT * FROM users WHERE email=${normEmail} LIMIT 1`;
    const u = rows[0];
    const hash = u?.password;
    const looksLikeBcrypt = typeof hash==='string' && /^\$2[aby]\$/.test(hash) && hash.length>=50;
    const ok = looksLikeBcrypt ? bcrypt.compareSync(password, hash) : false;
    if (!ok) return res.status(401).json({ error:'Invalid credentials' });

    const token = signUser(u);
    res.json({ token, user:{ id:u.id, name:u.name, email:u.email, role:u.role, batchId:u.batch_id, regNo:u.reg_no } });
  }catch(err){
    console.error('LOGIN ERROR',err);
    res.status(500).json({error:'Server error'});
  }
});

app.get('/api/auth/me', auth, (req,res)=>res.json({ user:req.user }));

// --- BATCHES & USERS ---
// --- BATCHES & USERS ---
app.get('/api/batches', auth, async (_req, res) => {
  // fetch existing
  let batches = await sql`SELECT * FROM batches ORDER BY number`;
  if (batches.length === 0) {
    // create defaults
    const years = [2024, 2025, 2026];
    for (const y of years) {
      const b = await ensureBatch(String(y));      // creates if missing & validates year ≥ 2024
      await seed2024IfEmpty(b);                    // only seeds timetable for 2024 and only once
    }
    batches = await sql`SELECT * FROM batches ORDER BY number`;
    console.log('Seeded default batches:', batches.map(b => b.number).join(', '));
  }
  res.json({ batches });
});


app.post('/api/batches', auth, admin, async (req,res)=>{
  const { number, name } = req.body || {};
  const batch = await ensureBatch(String(number));
  if (!batch) return res.status(400).json({error:'Batch number must be a year ≥ 2024'});
  if (name && name!==batch.name) await sql`UPDATE batches SET name=${name} WHERE id=${batch.id}`;
  // seed if 2024 and empty
  await seed2024IfEmpty(batch);
  const [b] = await sql`SELECT * FROM batches WHERE id=${batch.id}`;
  res.json({ batch: b });
});

app.get('/api/users', auth, admin, async (_req,res)=>{
  const users = await sql`SELECT id,name,email,role,reg_no,batch_id FROM users ORDER BY name`;
  res.json({ users });
});

app.put('/api/users/:id', auth, admin, async (req,res)=>{
  const { id } = req.params;
  const { regNo, batchId, name } = req.body || {};
  await sql`UPDATE users SET reg_no=${regNo}, batch_id=${batchId}, name=${name} WHERE id=${id}`;
  const [u] = await sql`SELECT id,name,email,role,reg_no,batch_id FROM users WHERE id=${id}`;
  res.json({ user:u });
});

// --- SCHEDULE ---
app.put('/api/batches/:id/schedule', auth, admin, async (req,res)=>{
  const { id } = req.params;
  const sc = req.body?.schedule || {};
  await sql`DELETE FROM schedule_slots WHERE batch_id=${id}`;
  const days = ['mon','tue','wed','thu','fri'];
  for (let i=0;i<days.length;i++){
    for (const s of (sc[days[i]]||[])){
      await sql`INSERT INTO schedule_slots (id,batch_id,weekday,subject,start_t,end_t,location)
                VALUES (${s.id||uuid()},${id},${i+1},${s.subject||''},${s.start||''},${s.end||''},${s.location||''})`;
    }
  }
  res.json({ ok:true });
});

app.get('/api/schedule/today', auth, async (req, res) => {
  const { batchId } = req.query;
  const userBatchId = req.user.batch_id;
  const id = batchId || userBatchId;
  if (!id) return res.status(400).json({ error: 'Batch required' });

  const today = dayjs().day(); // 0 = Sun
  if (today === 0 || today === 6)
    return res.json({ weekday: today, classes: [] });

  const rows = await sql`
    SELECT * FROM schedule_slots
    WHERE batch_id=${id} AND weekday=${today}
    ORDER BY start_t
  `;
  res.json({ weekday: today, classes: rows });
});


// --- QR & Attendance ---
app.post('/api/sessions/:batchId/generate', auth, admin, async (req,res)=>{
  const { batchId } = req.params;
  const { dateYMD, slotId } = req.body || {};
  if (!dateYMD||!slotId) return res.status(400).json({error:'dateYMD and slotId required'});
  const [slot] = await sql`SELECT * FROM schedule_slots WHERE id=${slotId} AND batch_id=${batchId} LIMIT 1`;
  if (!slot) return res.status(404).json({error:'Slot not found'});
  const sessionId = uuid();
  const token = signSession({ sessionId, batchId, dateYMD, slot });
  const url = `${CLIENT_URL}/scan?token=${encodeURIComponent(token)}`;
  const qrDataUrl = await QRCode.toDataURL(url, { margin:1, width:360 });
  res.json({ url, qrDataUrl, session:{ sessionId, dateYMD, batchId, slot } });
});

app.post('/api/attendance/mark', auth, async (req,res)=>{
  const { token } = req.body || {};
  if (!token) return res.status(400).json({error:'Missing token'});
  let payload; try{ payload = jwt.verify(token, JWT_SECRET); }catch{ return res.status(400).json({error:'Invalid/expired session'}); }
  if (req.user.batchId !== payload.batchId) return res.status(403).json({error:'Wrong batch'});
  const dateObj = dayjs(payload.dateYMD).toDate(); if (isWeekend(dateObj)) return res.status(400).json({error:'Weekend is off'});
  const [u] = await sql`SELECT * FROM users WHERE id=${req.user.id}`;
  await sql`INSERT INTO attendance (date_ymd,batch_id,session_id,student_id,reg_no,name,subject,start_t,end_t,location)
            VALUES (${payload.dateYMD},${payload.batchId},${payload.sessionId},${u.id},${u.reg_no},${u.name},${payload.slot.subject},${payload.slot.start_t||payload.slot.start},${payload.slot.end_t||payload.slot.end},${payload.slot.location})`;
  const dir = path.join(dataDir, payload.dateYMD);
  fs.mkdirSync(dir,{recursive:true});
  const csvPath = path.join(dir, `${payload.batchId}.csv`);
  if (!fs.existsSync(csvPath)) fs.writeFileSync(csvPath,'timestamp,batchId,sessionId,studentRegNo,studentName,subject,start,end,location\n');
  const line = [new Date().toISOString(), payload.batchId, payload.sessionId, (u.reg_no||'').replace(/,/g,' '), (u.name||'').replace(/,/g,' '), (payload.slot.subject||'').replace(/,/g,' '), payload.slot.start_t||payload.slot.start, payload.slot.end_t||payload.slot.end, (payload.slot.location||'').replace(/,/g,' ')].join(',');
  fs.appendFileSync(csvPath, line+'\n');
  res.json({ ok:true, savedTo: csvPath });
});

app.get('/api/attendance/export', auth, admin, async (req,res)=>{
  const { dateYMD, batchId } = req.query || {};
  if (!dateYMD||!batchId) return res.status(400).json({error:'dateYMD & batchId required'});
  const csvPath = path.join(dataDir, dateYMD, `${batchId}.csv`);
  if (!fs.existsSync(csvPath)) return res.status(404).json({error:'No attendance file'});
  const wb = new ExcelJS.Workbook(); const ws = wb.addWorksheet(`Attendance ${dateYMD}`);
  ws.columns = [
    { header:'Timestamp', key:'timestamp', width:24 },
    { header:'Batch', key:'batch', width:10 },
    { header:'Session ID', key:'sessionId', width:36 },
    { header:'Reg No', key:'regNo', width:14 },
    { header:'Name', key:'name', width:22 },
    { header:'Subject', key:'subject', width:20 },
    { header:'Start', key:'start', width:10 },
    { header:'End', key:'end', width:10 },
    { header:'Location', key:'location', width:18 }
  ];
  const rows = fs.readFileSync(csvPath,'utf8').trim().split(/\r?\n/).slice(1);
  rows.forEach(r=>{ const [timestamp,batch,sessionId,regNo,name,subject,start,end,location]=r.split(','); ws.addRow({timestamp,batch,sessionId,regNo,name,subject,start,end,location}); });
  res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition',`attachment; filename="attendance_${dateYMD}_${batchId}.xlsx"`);
  await wb.xlsx.write(res); res.end();
});

app.get('/api/health', (_req,res)=>res.json({ ok:true, now:new Date().toISOString() }));
// Get full weekly schedule for a batch (Mon..Fri grouped), sorted by start time
app.get('/api/batches/:id/schedule', auth, admin, async (req, res) => {
  const { id } = req.params;
  const rows = await sql`
    SELECT * FROM schedule_slots
    WHERE batch_id=${id}
    ORDER BY weekday, start_t
  `;
  const days = { mon:[], tue:[], wed:[], thu:[], fri:[] };
  rows.forEach(r => {
    const key = ({1:'mon',2:'tue',3:'wed',4:'thu',5:'fri'})[r.weekday];
    if (key) days[key].push(r);
  });
  res.json({ schedule: days });
});

// Get slots for a specific date (uses that date's weekday)
app.get('/api/schedule/on-date', auth, async (req, res) => {
  const { batchId, date } = req.query || {};
  if (!batchId || !date) return res.status(400).json({ error: 'batchId & date required' });
  const d = dayjs(String(date));
  const wd = d.day();                 // 0..6 (Sun..Sat)
  if (wd === 0 || wd === 6) return res.json({ date, weekday: wd, classes: [] }); // weekend
  const rows = await sql`
    SELECT * FROM schedule_slots
    WHERE batch_id=${batchId} AND weekday=${wd}
    ORDER BY start_t
  `;
  res.json({ date, weekday: wd, classes: rows });
});
app.get('/api/on-date', auth, async (req, res) => {
  const { batchId, date } = req.query || {};
  if (!batchId || !date) return res.status(400).json({ error: 'batchId & date required' });
  const d = dayjs(String(date));
  const wd = d.day();
  if (wd === 0 || wd === 6) return res.json({ date, weekday: wd, classes: [] });
  const rows = await sql`
    SELECT * FROM schedule_slots
    WHERE batch_id=${batchId} AND weekday=${wd}
    ORDER BY start_t
  `;
  res.json({ date, weekday: wd, classes: rows });
});
// Fallback alias: POST /api/generate  { batchId, dateYMD, slotId }
app.post('/api/generate', auth, admin, async (req, res) => {
  try {
    const { batchId, dateYMD, slotId } = req.body || {};
    if (!batchId || !dateYMD || !slotId)
      return res.status(400).json({ error: 'batchId, dateYMD, slotId required' });

    const [slot] = await sql`
      SELECT * FROM schedule_slots WHERE id=${slotId} AND batch_id=${batchId} LIMIT 1
    `;
    if (!slot) return res.status(404).json({ error: 'Slot not found' });

    const sessionId = uuid();
    const token = signSession({ sessionId, batchId, dateYMD, slot });
    const url = `${CLIENT_URL}/scan?token=${encodeURIComponent(token)}`;
    const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 360 });
    res.json({ url, qrDataUrl, session: { sessionId, dateYMD, batchId, slot } });
  } catch (e) {
    console.error('ALIAS /api/generate error', e);
    res.status(500).json({ error: 'Server error' });
  }
});


app.listen(PORT, ()=>console.log(`Software server running on :${PORT}`));
