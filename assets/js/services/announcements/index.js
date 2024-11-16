// assets/js/services/announcements/index.js
import { ClassroomConnector } from './classroom';
import { WhatsAppConnector } from './whatsapp';
import { AnnouncementSource } from './types';

export class AnnouncementService {
    constructor() {
        this.connectors = new Map();
        this.listeners = new Set();
    }

    async initialize(config) {
        if (config.classroom) {
            const classroomConnector = new ClassroomConnector(config.classroom);
            await classroomConnector.connect();
            this.connectors.set(AnnouncementSource.CLASSROOM, classroomConnector);
        }

        if (config.whatsapp) {
            const whatsappConnector = new WhatsAppConnector(config.whatsapp);
            await whatsappConnector.connect();
            this.connectors.set(AnnouncementSource.WHATSAPP, whatsappConnector);
        }

        // Start polling for updates
        this.startPolling();
    }

    async fetchAllAnnouncements() {
        const announcements = [];

        for (const connector of this.connectors.values()) {
            try {
                const sourceAnnouncements = await connector.fetchAnnouncements();
                announcements.push(...sourceAnnouncements);
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            }
        }

        return announcements.sort((a, b) => b.timestamp - a.timestamp);
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Removed 'private' keyword, just a regular method now
    startPolling() {
        setInterval(async () => {
            const announcements = await this.fetchAllAnnouncements();
            this.listeners.forEach(callback => callback(announcements));
        }, 5 * 60 * 1000); // Poll every 5 minutes
    }
}