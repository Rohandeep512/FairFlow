import pool from './config/db.js';

const SESSION_ID = parseInt(process.argv[2]);
if (!SESSION_ID || isNaN(SESSION_ID)) {
  console.error('Usage: node floodQueue.js <SESSION_ID>');
  process.exit(1);
}

const JOB_RANGES = {
  print:      { min: 1, max: 100 },
  equipment:  { min: 15, max: 120 },
  healthcare: { min: 5, max: 45 },
  support:    { min: 1, max: 10 },
  food:       { min: 1, max: 15 },
  general:    { min: 1, max: 50 },
};

const FIRST_NAMES = [
  'Aarav','Vivaan','Aditya','Vihaan','Arjun','Reyansh','Sai','Arnav','Dhruv','Kabir',
  'Ananya','Diya','Myra','Sara','Aadhya','Isha','Kiara','Riya','Navya','Anika',
  'Meera','Tara','Zara','Pooja','Neil','Rahul','Amit','Sneha','Priti','Kunal',
  'Lakshmi','Vikram','Sonia','Manish','Deepak'
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPhone = () => `9${rand(100000000, 999999999)}`;

const flood = async () => {
  try {
    // 1. Validate session exists and is active
    const session = await pool.query(
      `SELECT qs.id, qs.status, o.service_type 
       FROM queue_sessions qs 
       JOIN organizations o ON qs.org_id = o.id 
       WHERE qs.id = $1`,
      [SESSION_ID]
    );
    if (!session.rows.length) {
      console.error(`Session ${SESSION_ID} not found.`);
      process.exit(1);
    }
    if (session.rows[0].status !== 'active') {
      console.error(`Session ${SESSION_ID} is not active (status: ${session.rows[0].status}).`);
      process.exit(1);
    }

    const serviceType = session.rows[0].service_type;
    const range = JOB_RANGES[serviceType] || JOB_RANGES.general;
    console.log(`Flooding session ${SESSION_ID} (${serviceType}) with 30 jobs...`);
    console.log(`Job size range: ${range.min}–${range.max}\n`);

    let inserted = 0;
    for (let i = 0; i < 30; i++) {
      const name = FIRST_NAMES[i % FIRST_NAMES.length] + '_' + rand(100, 999);
      const phone = randPhone();
      const jobSize = rand(range.min, range.max);

      // Create a customer user
      const userResult = await pool.query(
        'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING id',
        [name, phone, 'customer']
      );
      const customerId = userResult.rows[0].id;

      // Insert job
      await pool.query(
        'INSERT INTO jobs (session_id, customer_id, job_size) VALUES ($1, $2, $3)',
        [SESSION_ID, customerId, jobSize]
      );

      inserted++;
      process.stdout.write(`  [${inserted}/30] ${name} — size: ${jobSize}\n`);
    }

    console.log(`\nDone! ${inserted} jobs inserted into session ${SESSION_ID}.`);
    console.log('No other data was touched.');
    process.exit(0);
  } catch (err) {
    console.error('Flood error:', err.message);
    process.exit(1);
  }
};

flood();
