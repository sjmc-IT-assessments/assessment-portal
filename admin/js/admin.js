import firebaseConfig from '../../assets/js/config.js';

// Password Generator Class
class PasswordGenerator {
    constructor() {
        this.firstWords = [
            'Sparkle', 'Dragon', 'Cosmic', 'Melody', 'Winter',
            'Summer', 'Autumn', 'Spring', 'Thunder', 'Lightning',
            'Crystal', 'Rainbow', 'Golden', 'Silver', 'Mystic',
            'Whisper', 'Noble', 'Royal', 'Brave', 'Swift',
            'Bright', 'Lunar', 'Solar', 'Star', 'Cloud'
        ];

        this.secondWords = [
            'Storm', 'Light', 'Shadow', 'Dream', 'Wave',
            'Mountain', 'River', 'Forest', 'Meadow', 'Symphony',
            'Cookie', 'Tornado', 'Whisper', 'Blossom', 'Dance',
            'Spirit', 'Heart', 'Soul', 'Mind', 'Breeze',
            'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Lion'
        ];

        this.foodWords = [
            'Habanero', 'Milkshake', 'Cookie', 'Pepper', 'Mango',
            'Vanilla', 'Chocolate', 'Cinnamon', 'Nutmeg', 'Wasabi',
            'Cupcake', 'Donut', 'Pretzel', 'Smoothie', 'Biscuit'
        ];
    }

    getRandomWord(wordList) {
        return wordList[Math.floor(Math.random() * wordList.length)];
    }

    generatePassword() {
        const styles = [
            () => `${this.getRandomWord(this.firstWords)}${this.getRandomWord(this.secondWords)}`,
            () => `${this.getRandomWord(this.firstWords)}${this.getRandomWord(this.secondWords)}${Math.floor(Math.random() * 100)}`,
            () => `${this.getRandomWord(this.foodWords)}${this.getRandomWord(this.secondWords)}`,
            () => `${this.getRandomWord(this.firstWords)}${Math.floor(Math.random() * 1000)}`
        ];

        const styleIndex = Math.floor(Math.random() * styles.length);
        return styles[styleIndex]();
    }

    generateOptions(count = 5) {
        return Array(count).fill(null).map(() => this.generatePassword());
    }
}

// Main AdminPortal Class
class AdminPortal {
    constructor() {
        console.log('Starting AdminPortal initialization');
        this.firebaseConfig = firebaseConfig;
        this.passwordGenerator = new PasswordGenerator();

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            console.log('Firebase initialized successfully');

            this.initializeAuth();
            this.setupEventListeners();
        } catch (error) {
            console.error('Firebase initialization error:', error);
            alert('Error initializing application: ' + error.message);
        }
    }
    async initializeAuth() {
        this.auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed, user:', user); // Debug log
            if (user) {
                if (user.email.endsWith('@maristsj.co.za')) {
                    // Check if user is authorized
                    console.log('Checking authorization for:', user.email); // Debug log
                    const isAuthorized = await this.checkUserAuthorization(user.email);
                    console.log('Is user authorized?', isAuthorized); // Debug log
                    if (isAuthorized) {
                        this.showAdminPanel(user);
                    } else {
                        alert('You are not authorized to access the admin panel. Please contact the administrator.');
                        this.auth.signOut();
                    }
                } else {
                    alert('Please use your SJMC email address to login.');
                    this.auth.signOut();
                }
            } else {
                this.hideAdminPanel();
            }
        });
    }
    async manageUsers() {
        if (this.auth.currentUser.email !== 'acoetzee@maristsj.co.za') { // Update with your email
            alert('Only the administrator can manage users.');
            return;
        }

        const dialog = document.createElement('div');
        dialog.className = 'user-management-dialog';
        dialog.innerHTML = `
            <div class="user-management-content">
                <h3>Manage Teachers</h3>
                <div class="add-user-form">
                    <input type="email" id="newUserEmail" placeholder="Teacher's email">
                    <button onclick="adminPortal.addTeacher()">Add Teacher</button>
                </div>
                <div class="users-list" id="usersList">
                    Loading users...
                </div>
                <button class="close-btn" onclick="this.closest('.user-management-dialog').remove()">
                    Close
                </button>
            </div>
        `;

        document.body.appendChild(dialog);
        this.loadTeachers();
    }

    async addTeacher() {
        const email = document.getElementById('newUserEmail').value;
        if (!email.endsWith('@maristsj.co.za')) {
            alert('Only @maristsj.co.za email addresses are allowed');
            return;
        }

        try {
            await this.db.collection('users').doc(email).set({
                email: email,
                addedBy: this.auth.currentUser.email,
                addedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            alert('Teacher added successfully');
            this.loadTeachers();
        } catch (error) {
            console.error('Error adding teacher:', error);
            alert('Error adding teacher: ' + error.message);
        }
    }

    async removeTeacher(email) {
        if (confirm(`Are you sure you want to remove ${email}?`)) {
            try {
                await this.db.collection('users').doc(email).delete();
                alert('Teacher removed successfully');
                this.loadTeachers();
            } catch (error) {
                console.error('Error removing teacher:', error);
                alert('Error removing teacher: ' + error.message);
            }
        }
    }
    async checkUserAuthorization(email) {
        try {
            console.log('Checking user doc for:', email); // Debug log
            const userDoc = await this.db.collection('users').doc(email).get();
            console.log('User doc exists?', userDoc.exists); // Debug log
            return userDoc.exists;
        } catch (error) {
            console.error('Error checking user authorization:', error);
            return false;
        }
    }
    async loadTeachers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        try {
            const snapshot = await this.db.collection('users').get();
            usersList.innerHTML = '<h4>Authorized Teachers</h4>';

            snapshot.forEach(doc => {
                const user = doc.data();
                const div = document.createElement('div');
                div.className = 'user-item';
                div.innerHTML = `
                    <span>${user.email}</span>
                    <button onclick="adminPortal.removeTeacher('${user.email}')" 
                            class="remove-btn">Remove</button>
                `;
                usersList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading teachers:', error);
            usersList.innerHTML = 'Error loading teachers';
        }
    }
    setupEventListeners() {
        const loginButton = document.getElementById('googleLogin');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.handleLogin());
        }

        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());

        const assessmentForm = document.getElementById('assessmentForm');
        if (assessmentForm) {
            assessmentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('Form submitted');
                const examData = this.getExamFormData();
                console.log('Assessment data:', examData);
                await this.saveExam(examData);
            });
        }
        document.getElementById('manageUsersBtn')?.addEventListener('click', () => this.manageUsers());
    }

    async handleLogin() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                hd: 'maristsj.co.za'
            });

            const result = await this.auth.signInWithPopup(provider);
            console.log('Sign in successful:', result.user.email);
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/popup-blocked') {
                alert('Please allow popups for this site to login.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                console.log('Previous popup closed');
            } else {
                alert('Login failed: ' + error.message);
            }
        }
    }

    async handleLogout() {
        try {
            await this.auth.signOut();
            // Get the base URL dynamically
            const baseUrl = window.location.pathname.split('/admin')[0];
            window.location.href = baseUrl + '/index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    }

    showAdminPanel(user) {
        document.getElementById('loginSection').style.display = 'none';
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
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

    generatePassword() {
        const passwords = this.passwordGenerator.generateOptions(5);

        const dialog = document.createElement('div');
        dialog.className = 'password-dialog';
        dialog.innerHTML = `
            <div class="password-options">
                <h3>Select a Password</h3>
                <div class="password-list">
                    ${passwords.map(pass => `
                        <button class="password-option" onclick="adminPortal.selectPassword('${pass}')">
                            ${pass}
                        </button>
                    `).join('')}
                </div>
                <button class="refresh-btn" onclick="adminPortal.generatePassword()">
                    Generate More Options
                </button>
                <button class="close-btn" onclick="this.closest('.password-dialog').remove()">
                    Close
                </button>
            </div>
        `;

        document.querySelector('.password-dialog')?.remove();
        document.body.appendChild(dialog);
    }

    selectPassword(password) {
        document.getElementById('password').value = password;
        document.querySelector('.password-dialog').remove();
    }

    getExamFormData() {
        const formData = {
            grade: document.getElementById('grade')?.value,
            subject: document.getElementById('subject')?.value,
            url: this.formatDriveUrl(document.getElementById('driveUrl')?.value),
            password: document.getElementById('password')?.value,
            type: document.getElementById('assessmentType')?.value || 'exam',
            date: new Date().toISOString()
        };
        console.log('Collected form data:', formData); // Debug log
        return formData;
    }

    formatDriveUrl(url) {
        const fileId = url.match(/\/d\/(.*?)(\/|$)/)?.[1];
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }

    async saveExam(examData) {
        console.log('Starting to save exam data:', examData); // Debug log
        try {
            // Validate data before saving
            if (!examData.grade || !examData.subject || !examData.url || !examData.password) {
                console.error('Missing required fields:', examData);
                alert('Please fill in all required fields');
                return;
            }

            const docRef = await this.db.collection('exams').add({
                ...examData,
                createdBy: this.auth.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                type: document.getElementById('assessmentType')?.value || 'exam' // Add type if not present
            });

            console.log('Exam saved successfully with ID:', docRef.id);
            alert('Assessment saved successfully!');

            // Clear form and reload list
            document.getElementById('examForm').reset();
            await this.loadExams(); // Make sure to await this
        } catch (error) {
            console.error('Detailed error saving exam:', error);
            alert('Error saving assessment: ' + error.message);
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