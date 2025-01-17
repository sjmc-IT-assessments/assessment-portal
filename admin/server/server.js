const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration for GitHub Pages
app.use(cors({
    origin: ['https://sjmc-it-assessments.github.io', 'http://localhost:5500'],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

async function getClassroomClient() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: './service-account-key.json',
            scopes: [
                'https://www.googleapis.com/auth/classroom.announcements.readonly',
                'https://www.googleapis.com/auth/classroom.courses.readonly'
            ]
        });

        const client = await auth.getClient();
        return google.classroom({ version: 'v1', auth: client });
    } catch (error) {
        console.error('Error initializing Classroom client:', error);
        throw error;
    }
}

// Announcements endpoint
app.get('/api/classroom/announcements', async (req, res) => {
    try {
        const classroom = await getClassroomClient();
        const courseId = process.env.COURSE_ID;

        console.log(`Fetching announcements for course: ${courseId}`);
        
        const response = await classroom.courses.announcements.list({
            courseId: courseId,
            pageSize: 20,
            orderBy: 'updateTime desc'
        });

        res.json({
            success: true,
            announcements: response.data.announcements || []
        });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch announcements',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'SJMC Assessment Portal API'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});