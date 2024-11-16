export class GoogleClassroomService {
    constructor(config) {
        this.config = config;
        this.initialized = false;
        this.initPromise = null;
        this.courseId = this.normalizeCourseId(config.classroom.courseId);
    }

    normalizeCourseId(courseId) {
        try {
            return atob(courseId);
        } catch {
            return courseId;
        }
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
            
            await new Promise((resolve, reject) => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: this.config.apiKey,
                            discoveryDocs: ['https://classroom.googleapis.com/$discovery/rest']
                        });

                        // Set API key for service account authentication
                        gapi.client.setApiKey(this.config.apiKey);
                        
                        // Set token using service account credentials
                        gapi.client.setToken({
                            access_token: this.config.serviceAccount.accessToken,
                            token_type: 'Bearer'
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

    async getAnnouncements() {
        try {
            await this.ensureInitialized();

            console.log('Fetching announcements for course:', this.courseId);
            const response = await gapi.client.classroom.courses.announcements.list({
                courseId: this.courseId,
                pageSize: 20,
                orderBy: 'updateTime desc'
            });

            return response.result.announcements || [];
        } catch (error) {
            console.error('Error fetching announcements:', error);
            throw error;
        }
    }
}