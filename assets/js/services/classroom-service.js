// assets/js/classroom-service.js
import { googleConfig } from './config.js';

class ClassroomService {
    constructor() {
        this.auth = firebase.auth();
        this.courseId = '73191617038905'; // Your specific course ID
        console.log('ClassroomService initialized with courseId:', this.courseId);
    }

    async loadGapiClient() {
        console.log('Starting GAPI client load...');
        try {
            await new Promise((resolve, reject) => {
                gapi.load('client:auth2', { 
                    callback: () => {
                        console.log('GAPI libraries loaded');
                        resolve();
                    }, 
                    onerror: reject 
                });
            });

            await gapi.client.init({
                apiKey: googleConfig.apiKey,
                clientId: googleConfig.clientId,
                scope: 'https://www.googleapis.com/auth/classroom.announcements.readonly',
                discoveryDocs: ['https://classroom.googleapis.com/$discovery/rest']
            });

            console.log('GAPI client fully initialized');
        } catch (error) {
            console.error('Error in loadGapiClient:', error);
        }
    }

    async getAnnouncements() {
        console.log('Fetching announcements for course:', this.courseId);
        try {
            const response = await gapi.client.classroom.courses.announcements.list({
                courseId: this.courseId,
                orderBy: 'updateTime desc',
                pageSize: 10
            });
            
            console.log('Announcements response:', response);
            return response.result.announcements || [];
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }
    }
}

export default ClassroomService;