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

