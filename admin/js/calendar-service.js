// calendar-service.js
export class CalendarService {
    constructor(config) {
        this.config = config;
        this.initialized = false;
        this.initPromise = null;
    }

    async ensureInitialized() {
        if (this.initialized) return;
        
        if (!this.initPromise) {
            this.initPromise = this.initialize();
        }
        
        await this.initPromise;
    }

    async initialize() {
        try {
            await new Promise((resolve, reject) => {
                if (typeof gapi === 'undefined') {
                    reject(new Error('Google API not loaded'));
                    return;
                }
                gapi.load('client:auth2', resolve);
            });

            await gapi.client.init({
                apiKey: this.config.apiKey,
                clientId: this.config.clientId,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
                scope: this.config.scopes.join(' ')
            });

            this.initialized = true;
        } catch (error) {
            console.error('Calendar initialization failed:', error);
            this.initialized = false;
            throw error;
        }
    }

    async createReminder(examData) {
        await this.ensureInitialized();

        try {
            const auth = gapi.auth2.getAuthInstance();
            if (!auth.isSignedIn.get()) {
                await auth.signIn();
            }

            const examDate = new Date(examData.scheduledDate);
            const reminderTime = new Date(examDate.getTime() - 20 * 60000);

            const event = {
                summary: `Kiosk Setup - Grade ${examData.grade} ${examData.subject}`,
                description: `Prepare devices for ${examData.subject} assessment.\nPassword: ${examData.password}`,
                start: {
                    dateTime: reminderTime.toISOString(),
                    timeZone: 'Africa/Johannesburg'
                },
                end: {
                    dateTime: examDate.toISOString(),
                    timeZone: 'Africa/Johannesburg'
                },
                attendees: [
                    { email: 'acoetzee@maristsj.co.za' }
                ],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 30 },
                        { method: 'popup', minutes: 20 }
                    ]
                },
                visibility: 'private'
            };

            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                sendUpdates: 'all'
            });

            return response.result;
        } catch (error) {
            console.error('Failed to create calendar reminder:', error);
            throw error;
        }
    }
}