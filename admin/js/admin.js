// Firebase initialization and authentication
class AdminPortal {
    constructor() {
        console.log('Starting AdminPortal initialization');
        // Your Firebase config from console
        this.firebaseConfig = {
            apiKey: "AIzaSyDZCPR_aHLvZWhaGQJ5isd3t51snf-vbds",
            authDomain: "assessment-portal-sjmc.firebaseapp.com",
            projectId: "assessment-portal-sjmc",
            storageBucket: "assessment-portal-sjmc.firebasestorage.app",
            messagingSenderId: "881891153841",
            appId: "1:881891153841:web:10c1fb448b76a2750b4f90",
            measurementId: "G-GW01WBG6C9"
        };

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            console.log('Firebase initialized successfully');
            
            // Initialize auth state observer
            this.initializeAuth();
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            alert('Error initializing application: ' + error.message);
        }
    }

    initializeAuth() {
        this.auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            if (user) {
                // Check email domain
                if (user.email.endsWith('@maristsj.co.za')) {
                    this.showAdminPanel(user);
                } else {
                    console.log('Invalid email domain:', user.email);
                    alert('Please use your Marist school email address to login.');
                    this.auth.signOut();
                }
            } else {
                this.hideAdminPanel();
            }
        });
    }
    setupEventListeners() {
        const loginButton = document.getElementById('googleLogin');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.handleLogin());
        }

        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', this.handleLogout);

        // Exam form
        document.getElementById('examForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const examData = this.getExamFormData();
            await this.saveExam(examData);
        });
    }

    handleLogin() {
        const provider = new firebase.auth.GoogleAuthProvider();
        this.auth.signInWithPopup(provider);
    }

    handleLogout() {
        this.auth.signOut();
    }

   
    showAdminPanel(user) {
        document.getElementById('loginSection').style.display = 'none';
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
            
            // Create exam list if it doesn't exist
            let examList = document.getElementById('examList');
            if (!examList) {
                examList = document.createElement('div');
                examList.id = 'examList';
                examList.className = 'exam-list';
                adminPanel.appendChild(examList);
            }
            
            this.loadExams();
        }
    }

    hideAdminPanel() {
        document.getElementById('loginSection').style.display = 'flex';
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'none';
        }
    }
    getExamFormData() {
        return {
            grade: document.getElementById('grade').value,
            subject: document.getElementById('subject').value,
            url: this.formatDriveUrl(document.getElementById('driveUrl').value),
            password: document.getElementById('password').value,
            date: new Date().toISOString()
        };
    }

    formatDriveUrl(url) {
        const fileId = url.match(/\/d\/(.*?)(\/|$)/)?.[1];
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }

    async handleLogin() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            // Set school domain restriction
            provider.setCustomParameters({
                hd: 'maristsj.co.za'
            });
            
            // Clear any existing popups
            await this.auth.signOut();
            const result = await this.auth.signInWithPopup(provider);
            console.log('Sign in successful:', result.user.email);
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this site to login.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // Just log this one as it's not really an error
                console.log('Previous popup closed');
            } else {
                alert('Login failed: ' + error.message);
            }
        }
    }
    async saveExam(examData) {
        try {
            await this.db.collection('exams').add({
                ...examData,
                createdBy: this.auth.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('Exam saved successfully!');
            document.getElementById('examForm').reset();
            this.loadExams();
        } catch (error) {
            alert('Error saving exam: ' + error.message);
        }
    }

    async loadExams() {
        const examsList = document.getElementById('examList');
        if (!examsList) return;

        examsList.innerHTML = '<h2>Current Exams</h2>';
        
        try {
            const snapshot = await this.db.collection('exams')
                .orderBy('createdAt', 'desc')
                .get();

            if (snapshot.empty) {
                examsList.innerHTML += '<p>No exams added yet.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const exam = doc.data();
                const item = document.createElement('div');
                item.className = 'exam-item';
                item.innerHTML = `
                    <div>
                        <strong>Grade ${exam.grade} - ${exam.subject}</strong><br>
                        Password: ${exam.password}<br>
                        Added: ${new Date(exam.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                    <div>
                        <button onclick="adminPortal.copyPassword('${exam.password}')" class="copy-button">
                            Copy Password
                        </button>
                        <button onclick="adminPortal.deleteExam('${doc.id}')" class="delete-button">
                            Delete
                        </button>
                    </div>
                `;
                examsList.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading exams:', error);
            examsList.innerHTML += '<p>Error loading exams. Please try again.</p>';
        }
    }

    async deleteExam(examId) {
        if (confirm('Are you sure you want to delete this exam?')) {
            try {
                await this.db.collection('exams').doc(examId).delete();
                this.loadExams();
            } catch (error) {
                alert('Error deleting exam: ' + error.message);
            }
        }
    }
    generatePassword() {
        const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoiding confusing characters like 1/I, 0/O
        const length = 8;
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        document.getElementById('password').value = password;
    }
    copyPassword(password) {
        navigator.clipboard.writeText(password);
        alert('Password copied to clipboard!');
    }
}

// Initialize admin portal when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing AdminPortal');
    window.adminPortal = new AdminPortal();
});