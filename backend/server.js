const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const parentRoutes = require('./routes/parentRoutes');
const coachRoutes = require('./routes/coachRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/coach', coachRoutes);

app.get('/', (req, res) => {
    res.send('Football Academy Performance Tracking System API is running');
});

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});