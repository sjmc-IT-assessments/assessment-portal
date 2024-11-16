// assets/js/services/index.js
export { AnnouncementService } from './announcements';

// Example usage in main.js or wherever you initialize your app
import { AnnouncementService } from './services';

const initializeServices = async () => {
  const announcementService = new AnnouncementService();
  await announcementService.initialize({
    classroom: {
      credentials: process.env.GOOGLE_CLASSROOM_CREDENTIALS,
      courseIds: ['course1', 'course2']
    },
    whatsapp: {
      sessionData: process.env.WHATSAPP_SESSION_DATA,
      approvedGroups: ['group1', 'group2']
    }
  });

  // Subscribe to updates
  announcementService.subscribe((announcements) => {
    // Update your UI here
    updateAnnouncementFeed(announcements);
  });

  return announcementService;
};