require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 10000;

// Production Security Hardening via Middleware
app.use(helmet());
app.use(express.json());

// Strict Cross-Origin Configuration
const allowedOrigins = [
  'https://yourusername.github.io', // Replace with your exact GitHub Pages domain later
  'http://127.0.0.1:5500',          // VS Code Live Server default
  'http://localhost:5500',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Cross-Origin Resource Protection matrix.'));
    }
  }
}));

// Prevent DDoS/Spam Attacks via Automated Rate Limiting
const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute analysis window
  max: 5, // Limit each IP to 5 submissions per window
  message: { error: 'Too many recovery requests initialized from this IP. System entry locked down.' }
});

// Secure API Processing Endpoint
app.post('/api/v1/secure-contact', contactSubmissionLimiter, (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Data payload is structurally incomplete.' });
  }

  // Sanitization Layer against Indirect Prompt Injection
  const sanitizedName = String(name).replace(/[<>]/g, "");
  const sanitizedEmail = String(email).trim().toLowerCase();
  const sanitizedMessage = String(message)
    .replace(/[<>]/g, "")
    .substring(0, 1000); // Defensive size constraint

  /* PRODUCTION NOTE: This is where your data pipeline lives.
    You can hook this up to send to an email service, a Discord webhook,
    or drop it right into a database. For now, it safely logs it.
  */
  console.log('--- Secure System Log Appended ---');
  console.log(`From: ${sanitizedName} (${sanitizedEmail})`);
  console.log(`Content: ${sanitizedMessage}`);

  return res.status(200).json({ status: 'success', message: 'Payload securely processed into backend logs.' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal pipeline malfunction initialized.' });
});

app.listen(PORT, () => {
  console.log(`[SYSTEM STABLE] Secure interface processing on port ${PORT}`);
});
