// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./src/config/database.js');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// // app.use("/api/auth", require("./routes/auth.routes"));

// const startServer = async () => {
//   try {
//     await connectDB();

//     const port = process.env.PORT || 4000;
//     app.listen(port, () => {
//       console.log('Server is running on port: ' + port);
//     });
//   } catch (error) {
//     console.log('Error:', error);
//   }
// };

// startServer();
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Database
const connectDB = require('./src/config/database');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const parentRoutes = require('./src/routes/parentRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
// const therapistRoutes = require('./src/routes/therapistRoutes');
// const labRoutes = require('./src/routes/labRoutes');

const app = express();

/* ==========================
   GLOBAL MIDDLEWARE
========================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ==========================
   API ROUTES
========================== */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/doctor', doctorRoutes);
// app.use('/api/therapist', therapistRoutes);
// app.use('/api/lab', labRoutes);

/* ==========================
   HEALTH CHECK
========================== */
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ASD Management RBAC API is running'
  });
});

/* ==========================
   404 HANDLER
========================== */
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

/* ==========================
   GLOBAL ERROR HANDLER
========================== */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

/* ==========================
   SERVER START
========================== */
const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
