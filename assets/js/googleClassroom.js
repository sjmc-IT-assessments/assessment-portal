// googleClassroom.js
export class GoogleClassroomService {
    constructor(config) {
        this.config = config;
        this.initialized = false;
        this.initPromise = null;
        this.tokenClient = null;
        this.accessToken = null;
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
            console.log('Initializing Google Classroom service...');

            // Initialize the token client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.config.clientId,
                scope: 'https://www.googleapis.com/auth/classroom.announcements.readonly https://www.googleapis.com/auth/classroom.courses.readonly',
                callback: (tokenResponse) => {
                    if (tokenResponse.error !== undefined) {
                        throw tokenResponse;
                    }
                    this.accessToken = tokenResponse.access_token;
                    gapi.client.setToken({access_token: this.accessToken});
                },
            });

            // Load and init GAPI client
            await new Promise((resolve, reject) => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            discoveryDocs: ['https://classroom.googleapis.com/$discovery/rest'],
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            this.initialized = true;
            console.log('Google Classroom service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Google Classroom service:', error);
            throw error;
        }
    }

    async getAccessToken() {
        return new Promise((resolve, reject) => {
            if (this.accessToken) {
                resolve(this.accessToken);
                return;
            }

            this.tokenClient.callback = (response) => {
                if (response.error !== undefined) {
                    reject(response);
                }
                this.accessToken = response.access_token;
                gapi.client.setToken({access_token: this.accessToken});
                resolve(this.accessToken);
            };

            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    async listCourses() {
        try {
            await this.ensureInitialized();
            await this.getAccessToken();

            console.log('Fetching available courses...');
            const response = await gapi.client.classroom.courses.list({
                pageSize: 10
            });

            console.log('Available courses:', response.result.courses);
            return response.result.courses || [];
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    }

    async getAnnouncements() {
        try {
            await this.ensureInitialized();
            await this.getAccessToken();

            // First, verify the course exists
            console.log('Verifying course access...');
            try {
                const courseResponse = await gapi.client.classroom.courses.get({
                    id: this.config.classroom.courseId
                });
                console.log('Course details:', courseResponse.result);
            } catch (error) {
                console.error('Error accessing course:', error);
                // List available courses to help debug
                const courses = await this.listCourses();
                console.log('Available courses:', courses);
                throw new Error('Cannot access specified course. Please verify the course ID.');
            }

            console.log('Fetching announcements for course:', this.config.classroom.courseId);
            const response = await gapi.client.classroom.courses.announcements.list({
                courseId: this.config.classroom.courseId,
                pageSize: 10,
                orderBy: 'updateTime desc'
            });

            console.log('Announcements response:', response);
            return response.result.announcements || [];
        } catch (error) {
            console.error('Error fetching announcements:', error);
            throw error;
        }
    }
}