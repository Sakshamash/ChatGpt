const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');


/* Routes */
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require("./routes/chat.routes");


const app = express();



/* using middlewares */
// Enable pre-flight requests for all routes
app.options('*', cors());

// Main CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = ['https://chatgpt-qg5w.onrender.com', 'http://localhost:5173'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'credentials', 'Origin', 'Accept'],
    optionsSuccessStatus: 200
}));

// Add security headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://chatgpt-qg5w.onrender.com');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, credentials');
    next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));



/* Test route for CORS */
app.get('/api/test', (req, res) => {
    res.json({ message: 'CORS is working' });
});

/* Using Routes */
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);


app.get("*name", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;