const express = require('express'); // You forgot to require 'express'
const mysql = require('mysql2'); // You forgot to require 'mysql2'
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid'); // ✅ This line was missing


//const cors = require('cors');

//app.use(cors({
// origin: function (origin, callback) {
//    callback(null, origin || '*'); // reflect requested origin or allow all
//  },
//  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
//  credentials: true
//}));

// ✅ Handle preflight OPTIONS globally
// app.options('*', cors());


// ✅ Middleware: Handle CORS manually
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Handle preflight OPTIONS requests for all routes
//app.options('*', (req, res) => {
//  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
//  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
//  res.setHeader('Access-Control-Allow-Credentials', 'true');
//  res.sendStatus(204); // No Content
//});



// Use a single port declaration to avoid conflicts
const port = 3000; // Port for Node.js server (change if necessary)

// Middleware
app.use(bodyParser.json()); // To parse JSON payloads

// MySQL connection
const db = mysql.createConnection({
    host: '101.53.149.101', // Your MySQL server IP
    user: 'voicebot',       // MySQL username
    password: 'subha123',   // MySQL password
    database: 'voicebot',   // Database name
    port: 3306              // MySQL port (default: 3306)
});

// Test MySQL connection
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});



// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});


// ✅ Example POST endpoint (can be renamed to /save-data)

// Endpoint to save data

//GET,HEADroot@alscloud:~/bcurl -i -X OPTIONS https://101.53.149.101:3003/get-data \t-data \
//  -H "Origin: https://instadatahelp.com" \
//  -H "Access-Control-Request-Method: POST"
//HTTP/1.1 200 OK
//Server: nginx/1.24.0 (Ubuntu)
//Date: Wed, 23 Jul 2025 15:37:42 GMT
//Content-Type: text/html; charset=utf-8
//Content-Length: 8
//Connection: keep-alive
//X-Powered-By: Express
//Allow: GET,HEAD
//ETag: W/"8-ZRAf8oNBS3Bjb/SU2GYZCmbtmXg"

//GET,HEADroot@alscloud:~/backend#//app.post('/save-data', (req, res) => {
//    const { ipAddress, date, time, clientID, clientSetupNum, queryText, replyText, llmDetails } = req.body;
//
//    const query = `
//        INSERT INTO query_data (
//            ip_address, date, time, client_id, client_setup_num, query_text, reply_text, llm_details
//      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//    `;
//
//    const values = [ipAddress, date, time, clientID, clientSetupNum, queryText, replyText, llmDetails];
//
//    db.query(query, values, (err, results) => {
//        if (err) {
//            console.error('Error saving data:', err);
//            res.status(500).send('Error saving data');
//       } else {
//            res.send('Data saved successfully');
//        }
//    });
//});

app.post('/save-data', (req, res) => {
    console.log('Received payload:', req.body); // Log the received payload

    const {
        ip_address,
        date,
        time,
        client_id,
        client_setup_num,
        query_text,
        reply_text,
        llm_details,
        name,
        phone,
         email
    } = req.body;

    console.log('Extracted values:', {
        ip_address,
        date,
        time,
        client_id,
        client_setup_num,
        query_text,
        reply_text,
        llm_details,
        name,
        phone,
        email,
    }); // Log the extracted values

    const query = `
        INSERT INTO query_data (
            ip_address, date, time, client_id, client_setup_num, query_text, reply_text, llm_details, name, phone, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [ip_address, date, time, client_id, client_setup_num, query_text, reply_text, llm_details, name, phone, email];

    console.log('SQL Query:', query); // Log the SQL query
    console.log('SQL Values:', values); // Log the query values

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Database error:', err); // Log the database error
            return res.status(500).send('Error saving data');
        }
        console.log('Insert success:', results); // Log successful insert
        res.send('Data saved successfully');
    });
});



// Endpoint to retrieve data from MySQL
app.get('/get-data', (req, res) => {
    const query = `SELECT * FROM query_data`; // Replace 'query_data' with your actual table name

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Error retrieving data');
        } else {
            res.json(results); // Send the data to the frontend
        }
    });
});

app.post('/get-data', (req, res) => {
    res.json({
        success: true,
        message: 'POST /get-data received',
        body: req.body
    });
});



//http.createServer(app).listen(port, () => {
//    console.log(`Server running at http://localhost:${port}`);
//});

// New MySQL Connection for Nexon Sales Trainer
const db2 = mysql.createConnection({
    host: '101.53.149.101',
    user: 'voicebot',
    password: 'subha123',
    database: 'nexon_sales',
    port: 3306
});

db2.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL (nexon_sales):', err);
        return;
    }
    console.log('Connected to MySQL database (nexon_sales)');
});



// New Endpoint for Nexon Sales Data
app.post('/save-nexon-data', (req, res) => {
    console.log('Received Nexon Sales payload:', req.body);

    const {
        username,
        date,
        time,
        productid,
        productname,
        category,
        productknowledgescore,
        salesacumenscore,
        question,
        userreply,
        feedback,
        attempt
    } = req.body;

    const query = `
        INSERT INTO sales_data (
            username, date, time, productid, productname, category,
            productknowledgescore, salesacumenscore, question, userreply, feedback, attempt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        username,
        date,
        time,
        productid,
        productname,
        category,
        productknowledgescore,
        salesacumenscore,
        question,
        userreply,
        feedback,
        attempt
    ];

    db2.query(query, values, (err, results) => {
        if (err) {
            console.error('Error saving Nexon Sales data:', err);
            res.status(500).send({ message: 'Error saving data', error: err });
        } else {
            console.log('Nexon Sales data saved successfully:', results);
            res.send({ message: 'Data saved successfully', insertedId: results.insertId });
        }
    });
});

// Endpoint to retrieve data from MySQL
app.get('/get-nexon-data', (req, res) => {
    const query = `SELECT * FROM sales_data`;

    db2.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving data:', err);
            res.status(500).send('Error retrieving data');
        } else {
            res.json(results); // Send the data to the frontend
        }
    });
});



//app.listen(3001, () => { console.log('API server listening on http://localhost:3001'); });

// /// /////////////////////////////////////////////////////////////////
// Mwdical Prescription Map Application

// --- Database Connection 3: medical_prescription_app ---
const db3 = mysql.createConnection({
  host: '101.53.149.101',
  user: 'voicebot',
  password: 'subha123',
  database: 'medical_prescription_app'
});

db3.connect((err) => {
  if (err) {
    console.error('Error connecting to medical_prescription_app DB:', err);
    return;
  }
  console.log('Successfully connected to medical_prescription_app DB');
});


// --- NEW AND REVISED API ENDPOINTS FOR MEDICAL PRESCRIPTION APP ---

/**
 * Doctor Login
 * Authenticates a doctor based on mobile number and a plain text password.
 */
app.post('/api/doctor-login', (req, res) => {
    const { mobile_number, password } = req.body;
    if (!mobile_number || !password) {
        return res.status(400).json({ success: false, message: 'Mobile number and password are required.' });
    }
    const query = 'SELECT doctor_id, name, registration_number, specialty, email FROM doctor_master WHERE mobile_number = ? AND password_hash = ?';
    db3.query(query, [mobile_number, password], (err, results) => {
        if (err) {
            console.error('Login DB error:', err);
            return res.status(500).json({ success: false, message: 'Database error during login.' });
        }
        if (results.length > 0) {
            res.json({ success: true, doctor: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    });
});

/**
 * Fetch Dashboard Data
 * Gathers statistics (patients today, this month, total prescriptions, recent list) for a given doctor.
 */
app.get('/api/dashboard-data/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    const today = new Date().toISOString().slice(0, 10);
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

    const queries = {
        patientsToday: 'SELECT COUNT(DISTINCT patient_id) as count FROM prescription WHERE doctor_id = ? AND date = ?',
        patientsThisMonth: 'SELECT COUNT(DISTINCT patient_id) as count FROM prescription WHERE doctor_id = ? AND date >= ?',
        totalPrescriptions: 'SELECT COUNT(*) as count FROM prescription WHERE doctor_id = ?',
        recentPrescriptions: 'SELECT prescription_id, patient_name, date FROM prescription WHERE doctor_id = ? ORDER BY date DESC, time DESC LIMIT 10'
    };

    Promise.all([
        new Promise((resolve, reject) => db3.query(queries.patientsToday, [doctorId, today], (err, results) => err ? reject(err) : resolve(results[0].count))),
        new Promise((resolve, reject) => db3.query(queries.patientsThisMonth, [doctorId, firstDayOfMonth], (err, results) => err ? reject(err) : resolve(results[0].count))),
        new Promise((resolve, reject) => db3.query(queries.totalPrescriptions, [doctorId], (err, results) => err ? reject(err) : resolve(results[0].count))),
        new Promise((resolve, reject) => db3.query(queries.recentPrescriptions, [doctorId], (err, results) => err ? reject(err) : resolve(results)))
    ]).then(([patientsToday, patientsThisMonth, totalPrescriptions, recentPrescriptions]) => {
        res.json({ success: true, patientsToday, patientsThisMonth, totalPrescriptions, recentPrescriptions });
    }).catch(err => {
        console.error('Dashboard DB error:', err);
        res.status(500).json({ success: false, message: 'Database error.' });
    });
});

/**
 * Search Patient
 * Finds a patient by their WhatsApp phone number.
 */
app.get('/api/search-patient/:mobile', (req, res) => {
    const { mobile } = req.params;
    const query = 'SELECT patient_id, name, age, gender, email, pincode FROM patient WHERE whatsapp_phone = ? LIMIT 1';
    db3.query(query, [mobile], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (results.length > 0) {
            res.json({ success: true, found: true, patient: results[0] });
        } else {
            res.json({ success: true, found: false });
        }
    });
});

/**
 * Save Prescription
 * A robust endpoint to save patient, prescription, and medicine data in a single flow.
 */
app.post('/api/save-prescription', (req, res) => {
    const { doctor, patient, prescription } = req.body;
    // ✅ NEW and IMPROVED upsertPatient function
const upsertPatient = (callback) => {
    // --- Data Validation and Sanitization ---
    if (!patient.name) {
        // The 'name' column is NOT NULL, so we must have a value.
        return callback(new Error("Patient name cannot be empty."));
    }
    
    // Convert age to an integer, or null if it's not a valid number.
    let age_int = parseInt(patient.age, 10);
    if (isNaN(age_int)) {
        age_int = null;
    }

    const patientData = {
        name: patient.name,
        age: age_int, // Use the sanitized integer or null
        gender: patient.gender,
        whatsapp_phone: patient.whatsapp_phone,
        email: patient.email,
        pincode: patient.pincode
    };

    // --- Database Logic (unchanged) ---
    db3.query('SELECT patient_id FROM patient WHERE whatsapp_phone = ?', [patient.whatsapp_phone], (err, results) => {
        if (err) return callback(err);
        if (results.length > 0) {
            const patientId = results[0].patient_id;
            db3.query('UPDATE patient SET ? WHERE patient_id = ?', [patientData, patientId], (updateErr) => callback(updateErr, patientId));
        } else {
            db3.query('INSERT INTO patient SET ?', patientData, (insertErr, insertResult) => callback(insertErr, insertResult.insertId));
        }
    });
};
    upsertPatient((err, patientId) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to save patient data.', error: err.message });
        const prescriptionId = uuidv4();
        const now = new Date();
        const prescriptionData = {
            prescription_id: prescriptionId,
            date: now.toISOString().slice(0, 10),
            time: now.toTimeString().split(' ')[0],
            doctor_id: doctor.doctor_id,
            patient_id: patientId,
            patient_name: patient.name,
            age: patient.age,
            gender: patient.gender,
            whatsapp_phone: patient.whatsapp_phone,
            prescription_text: prescription.fullText,
            followup_date: prescription.followUp || null,
            medical_tests: prescription.investigations
        };
        db3.query('INSERT INTO prescription SET ?', prescriptionData, (prescErr) => {
            if (prescErr) return res.status(500).json({ success: false, message: 'Failed to save prescription.', error: prescErr.message });
            if (!prescription.medications || prescription.medications.length === 0) {
                return res.json({ success: true, message: 'Prescription saved successfully.', prescription_id: prescriptionId });
            }
            const medicinesData = prescription.medications.map(med => [
                prescriptionId, med.name, med.strength, med.form, med.quantity, med.sig, prescriptionData.date, prescriptionData.time
            ]);
            db3.query('INSERT INTO medicine (prescription_id, medicine_name, strength, form, quantity, instruction, date, time) VALUES ?', [medicinesData], (medErr) => {
                if (medErr) return res.status(200).json({ success: true, message: 'Prescription saved, but failed to save medicines.', prescription_id: prescriptionId });
                res.json({ success: true, message: 'Prescription and medicines saved successfully.', prescription_id: prescriptionId });
            });
        });
    });
});



app.post('/api/update-doctor-credentials', (req, res) => {
    const { mobile_number, new_password } = req.body;

    if (!mobile_number || !new_password) {
        return res.status(400).json({ success: false, message: 'Mobile number and new password are required.' });
    }

    const query = 'UPDATE doctor_master SET password_hash = ? WHERE mobile_number = ?';
    
    db3.query(query, [new_password, mobile_number], (err, results) => {
        if (err) {
            console.error('Update credential error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No doctor found with that mobile number.' });
        }
        
        res.json({ success: true, message: 'Doctor credentials updated successfully.' });
    });
});


app.post('/api/doctor-signup', (req, res) => {
    const { name, mobile_number, email, specialty, registration_number, city, password_hash } = req.body;

    // Basic validation
    if (!name || !mobile_number || !email || !password_hash) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Check if doctor already exists
    db3.query('SELECT mobile_number FROM doctor_master WHERE mobile_number = ?', [mobile_number], (err, results) => {
        if (err) {
            console.error('Signup DB error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'A doctor with this mobile number already exists.' });
        }

        // Create new doctor
        const newDoctor = {
            doctor_id: `D-${mobile_number}`, // Using mobile number for a unique ID
            name,
            mobile_number,
            email,
            specialty,
            registration_number,
            city,
            password_hash // Storing plain text password as per table structure
        };

        db3.query('INSERT INTO doctor_master SET ?', newDoctor, (insertErr, insertResult) => {
            if (insertErr) {
                console.error('Doctor insert error:', insertErr);
                return res.status(500).json({ success: false, message: 'Failed to create new doctor.' });
            }
            res.status(201).json({ success: true, message: 'Doctor registered successfully.' });
        });
    });
});

// Add this new endpoint to your server.js file
app.get('/api/prescription/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT prescription_text FROM prescription WHERE prescription_id = ?';

    db3.query(query, [id], (err, results) => {
        if (err) {
            console.error('Fetch prescription error:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        if (results.length > 0) {
            res.json({ success: true, prescription: results[0] });
        } else {
            res.status(404).json({ success: false, message: 'Prescription not found.' });
        }
    });
});

// 🚀 NEW ENDPOINT FOR DASHBOARD INSIGHTS
app.get('/api/dashboard-insights/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    const queries = {
        topMedicines: `
            SELECT m.medicine_name, COUNT(m.medicine_name) as prescription_count
            FROM medicine m
            JOIN prescription p ON m.prescription_id = p.prescription_id
            WHERE p.doctor_id = ? AND m.medicine_name IS NOT NULL AND m.medicine_name != ''
            GROUP BY m.medicine_name
            ORDER BY prescription_count DESC
            LIMIT 20;
        `,
        genderDistribution: `
            SELECT gender, COUNT(patient_id) as count 
            FROM prescription 
            WHERE doctor_id = ? AND gender IS NOT NULL AND gender != ''
            GROUP BY gender;
        `,
        ageDistribution: `
            SELECT 
                SUM(CASE WHEN age BETWEEN 0 AND 17 THEN 1 ELSE 0 END) as '0-17',
                SUM(CASE WHEN age BETWEEN 18 AND 35 THEN 1 ELSE 0 END) as '18-35',
                SUM(CASE WHEN age BETWEEN 36 AND 55 THEN 1 ELSE 0 END) as '36-55',
                SUM(CASE WHEN age >= 56 THEN 1 ELSE 0 END) as '56+'
            FROM prescription 
            WHERE doctor_id = ? AND age IS NOT NULL;
        `
    };

    try {
        const [medicines] = await db3.promise().query(queries.topMedicines, [doctorId]);
        const [genders] = await db3.promise().query(queries.genderDistribution, [doctorId]);
        const [ages] = await db3.promise().query(queries.ageDistribution, [doctorId]);

        res.json({
            success: true,
            insights: {
                topMedicines: medicines,
                genderDistribution: genders,
                ageDistribution: ages[0]
            }
        });
    } catch (err) {
        console.error('Dashboard insights error:', err);
        res.status(500).json({ success: false, message: 'Database error while fetching insights.' });
    }
});

// 🚀 NEW ENDPOINT FOR PATIENT PRESCRIPTION HISTORY
app.get('/api/doctor/:doctorId/patient-search', async (req, res) => {
    const { doctorId } = req.params;
    const { phone } = req.query;

    if (!phone) {
        return res.status(400).json({ success: false, message: 'Patient phone number is required.' });
    }

    const query = `
        SELECT prescription_id, patient_name, date 
        FROM prescription 
        WHERE doctor_id = ? AND whatsapp_phone = ? 
        ORDER BY date DESC;
    `;

    try {
        const [prescriptions] = await db3.promise().query(query, [doctorId, phone]);
        res.json({ success: true, prescriptions });
    } catch (err) {
        console.error('Patient search error:', err);
        res.status(500).json({ success: false, message: 'Database error during patient search.' });
    }
});




// --- PHARMA DASHBOARD ROUTES ---
app.get('/api/pharma/general-insights', async (req, res) => {
    const { startDate, endDate } = req.query;
    const queries = {
        topDoctors: `
            SELECT d.name, d.specialty, d.city, COUNT(p.prescription_id) as prescription_count
            FROM prescription p
            JOIN doctor_master d ON p.doctor_id = d.doctor_id
            WHERE p.date BETWEEN ? AND ?
            GROUP BY d.doctor_id
            ORDER BY prescription_count DESC
            LIMIT 10;
        `,
        topMedicines: `
            SELECT m.medicine_name, COUNT(m.medicine_name) as prescription_count
            FROM medicine m
            JOIN prescription p ON m.prescription_id = p.prescription_id
            WHERE p.date BETWEEN ? AND ?
            GROUP BY m.medicine_name
            ORDER BY prescription_count DESC
            LIMIT 10;
        `
    };
    try {
        const [doctors] = await db3.promise().query(queries.topDoctors, [startDate, endDate]);
        const [medicines] = await db3.promise().query(queries.topMedicines, [startDate, endDate]);
        res.json({ success: true, topDoctors: doctors, topMedicines: medicines });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

app.get('/api/pharma/medicine-search', async (req, res) => {
    const { term } = req.query;
    const query = `
        SELECT DISTINCT medicine_name 
        FROM medicine 
        WHERE medicine_name LIKE ? 
        LIMIT 10;
    `;
    try {
        const [medicines] = await db3.promise().query(query, [`%${term}%`]);
        res.json(medicines.map(m => m.medicine_name));
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});

app.get('/api/pharma/medicine-doctors', async (req, res) => {
    const { medicineName, startDate, endDate } = req.query;
    const query = `
        SELECT d.name, d.specialty, d.city, COUNT(p.prescription_id) as prescription_count
        FROM prescription p
        JOIN doctor_master d ON p.doctor_id = d.doctor_id
        JOIN medicine m ON p.prescription_id = m.prescription_id
        WHERE m.medicine_name = ? AND p.date BETWEEN ? AND ?
        GROUP BY d.doctor_id
        ORDER BY prescription_count DESC
        LIMIT 20;
    `;
    try {
        const [doctors] = await db3.promise().query(query, [medicineName, startDate, endDate]);
        res.json({ success: true, doctors });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error.' });
    }
});







// --- ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

