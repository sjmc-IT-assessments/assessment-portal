const { google } = require('googleapis');
const { readFileSync } = require('fs');

async function listCourses() {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'service-account-key.json',
        scopes: [
            'https://www.googleapis.com/auth/classroom.courses'
        ],
    });

    const authClient = await auth.getClient();
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    const response = await classroom.courses.list();
    const courses = response.data.courses;
    if (courses && courses.length > 0) {
        courses.forEach(course => {
            console.log(`Course ID: ${course.id}, Name: ${course.name}`);
        });
    } else {
        console.log('No courses found.');
    }
}

listCourses().catch(console.error);
