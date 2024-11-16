import { googleConfig } from './config.js';

export function initClient() {
    google.accounts.id.initialize({
        client_id: googleConfig.clientId,
        callback: handleCredentialResponse
    });
}

function handleCredentialResponse(response) {
    const id_token = response.credential;
    console.log("ID Token: " + id_token);

    // Load Google API client library
    gapi.load('client', initializeGapiClient);
}

function initializeGapiClient() {
    gapi.client.init({
        apiKey: googleConfig.apiKey,
        discoveryDocs: ["https://classroom.googleapis.com/$discovery/rest?version=v1"],
        clientId: googleConfig.clientId,
        scope: googleConfig.classroom.scopes.join(' ')
    }).then(() => {
        listAnnouncements();
    }).catch(error => {
        console.error('Error initializing GAPI client:', error);
    });
}

export function listAnnouncements() {
    gapi.client.classroom.courses.announcements.list({
        courseId: googleConfig.classroom.courseId
    }).then(response => {
        const announcements = response.result.announcements;
        console.log(announcements);
    }).catch(error => {
        console.error('Error fetching announcements:', error);
    });
}
