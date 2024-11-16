const { google } = require('googleapis');
const { readFileSync } = require('fs');

async function fetchAnnouncements() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'service-account-key.json', // Path to your service account key file
        scopes: [
            'https://www.googleapis.com/auth/classroom.announcements.readonly',
            'https://www.googleapis.com/auth/classroom.courses.readonly'
        ],
    });

    const authClient = await auth.getClient();
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    const courseId = 'NzMxOTE2MTcwMzg5';
    const response = await classroom.courses.announcements.list({ courseId });
    console.log(response.data.announcements);
}

fetchAnnouncements().catch(console.error);
