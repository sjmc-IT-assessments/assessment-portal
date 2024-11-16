export const firebaseConfig = {
    apiKey: "AIzaSyDZCPR_aHLvZWhaGQJ5isd3t51snf-vbds",
    authDomain: "assessment-portal-sjmc.firebaseapp.com",
    projectId: "assessment-portal-sjmc",
    storageBucket: "assessment-portal-sjmc.firebasestorage.app",
    messagingSenderId: "881891153841",
    appId: "1:881891153841:web:10c1fb448b76a2750b4f90",
    measurementId: "G-GW01WBG6C9"
};

export const calendarConfig = {
    clientId: '36563114370-ht96lqnq8nr2020dk61fhmq5b7p5iamf.apps.googleusercontent.com',
    apiKey: 'AIzaSyBQiktcs0S_K_8Uyh7PtxH2OgAa0fYp0P0',
    scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]
};

export const googleConfig = {
    clientId: '36563114370-ht96lqnq8nr2020dk61fhmq5b7p5iamf.apps.googleusercontent.com',
    apiKey: 'AIzaSyBQiktcs0S_K_8Uyh7PtxH2OgAa0fYp0P0',
    classroom: {
        courseId: 'NzMxOTE2MTcwMzg5',  // Using the encoded ID from your URL
        scopes: [
            'https://www.googleapis.com/auth/classroom.announcements.readonly',
            'https://www.googleapis.com/auth/classroom.courses.readonly'
        ]
    }
};
