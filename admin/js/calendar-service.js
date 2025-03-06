export class CalendarService {
    constructor(config) {
        this.config = config;
        this.initialized = false;
        this.initPromise = null;
        this.tokenClient = null;
    }

    async ensureInitialized() {
        if (this.initialized) return;

        if (!this.initPromise) {
            this.initPromise = this.initialize();
        }

        try {
            await this.initPromise;
        } catch (error) {
            this.initPromise = null;
            throw error;
        }
    }

    async initialize() {
        try {
            // Load the Google Identity Services script if not already loaded
            if (!window.google) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://accounts.google.com/gsi/client';
                    script.async = true;
                    script.defer = true;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            // Initialize the token client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.config.clientId,
                scope: this.config.scopes.join(' '),
                callback: '', // Will be set later
            });

            // Load the Google API client library
            await new Promise((resolve, reject) => {
                if (typeof gapi === 'undefined') {
                    const script = document.createElement('script');
                    script.src = 'https://apis.google.com/js/api.js';
                    script.async = true;
                    script.defer = true;
                    script.onload = () => {
                        gapi.load('client', resolve);
                    };
                    script.onerror = reject;
                    document.head.appendChild(script);
                } else {
                    gapi.load('client', resolve);
                }
            });

            // Initialize the GAPI client
            await gapi.client.init({
                apiKey: this.config.apiKey,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            });

            this.initialized = true;
            console.log('Calendar service initialized successfully');
        } catch (error) {
            console.error('Calendar initialization failed:', error);
            this.initialized = false;
            throw error;
        }
    }

    async getAccessToken() {
        return new Promise((resolve, reject) => {
            if (!this.tokenClient) {
                reject(new Error('Token client not initialized'));
                return;
            }

            this.tokenClient.callback = async (response) => {
                if (response.error !== undefined) {
                    reject(response);
                }
                resolve(response.access_token);
            };

            this.tokenClient.requestAccessToken({ prompt: '' });
        });
    }

    async createReminder(examData) {
        await this.ensureInitialized();

        try {
            // Get fresh access token
            await this.getAccessToken();

            // Get exam timestamp information
            const timestamp = examData.scheduledTimestamp;

            // Create reminder time (20 minutes before)
            let reminderHours = timestamp.hours;
            let reminderMinutes = timestamp.minutes - 20;

            // Handle minute underflow
            if (reminderMinutes < 0) {
                reminderHours = reminderHours - 1;
                reminderMinutes = 60 + reminderMinutes;
            }

            // Handle hour underflow
            if (reminderHours < 0) {
                reminderHours = 24 + reminderHours;
                // This would require adjusting the day as well, but we'll keep it simple
            }

            // Create formatted time strings in 24-hour format with leading zeros
            const examTimeFormatted = `${timestamp.hours.toString().padStart(2, '0')}:${timestamp.minutes.toString().padStart(2, '0')}`;
            const reminderTimeFormatted = `${reminderHours.toString().padStart(2, '0')}:${reminderMinutes.toString().padStart(2, '0')}`;

            // Create date strings in YYYY-MM-DD format
            const dateStr = `${timestamp.year}-${timestamp.month.toString().padStart(2, '0')}-${timestamp.day.toString().padStart(2, '0')}`;

            // Create RFC3339 formatted date-time strings with explicit timezone
            const examDateTime = `${dateStr}T${examTimeFormatted}:00+02:00`; // +02:00 for South Africa
            const reminderDateTime = `${dateStr}T${reminderTimeFormatted}:00+02:00`;

            const event = {
                summary: `Kiosk Setup - Grade ${examData.grade} ${examData.subject}`,
                description: `Prepare devices for ${examData.subject} assessment.\nPassword: ${examData.password}`,
                start: {
                    dateTime: reminderDateTime,
                    timeZone: 'Africa/Johannesburg'
                },
                end: {
                    dateTime: examDateTime,
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

            console.log('Creating calendar event with:', {
                examDateTime,
                reminderDateTime,
                event
            });

            const response = await gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: event,
                sendUpdates: 'all'
            });

            console.log('Calendar event created successfully:', response.result);
            return response.result;
        } catch (error) {
            console.error('Failed to create calendar reminder:', error);
            throw error;
        }
    }
}