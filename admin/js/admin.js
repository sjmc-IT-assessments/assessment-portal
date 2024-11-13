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
        if (this.auth.currentUser.email !== 'acoetzee@maristsj.co.za') { //Admin email
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
                const exam = doc.data();
                const item = document.createElement('div');
                item.className = 'exam-item';
                item.innerHTML = `
                    <div>
                        <strong>Grade ${exam.grade} - ${exam.subject}</strong><br>
                        Password: ${exam.password}<br>
                        Scheduled: ${new Date(exam.scheduledDate).toLocaleString()}<br>
                        Added: ${new Date(exam.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                    <div class="exam-actions">
                        <button onclick="adminPortal.copyPassword('${exam.password}')" class="copy-button">
                            Copy Password
                        </button>
                        <button onclick="adminPortal.editExam('${doc.id}')" class="edit-button">
                            Edit
                        </button>
                        <button onclick="adminPortal.deleteExam('${doc.id}')" class="delete-button">
                            Delete
                        </button>
                    </div>
                `;
                examsList.appendChild(item);
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
            type: document.getElementById('assessmentType')?.value,
            url: this.formatDriveUrl(document.getElementById('driveUrl')?.value || ''),
            scheduledDate: document.getElementById('scheduledDate')?.value,
            password: document.getElementById('password')?.value,
            date: new Date().toISOString()
        };

        // Validate the data
        console.log('Collected form data:', formData);

        // Check for missing required fields
        const missingFields = Object.entries(formData)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        return formData;
    }

    formatDriveUrl(url) {
        const fileId = url.match(/\/d\/(.*?)(\/|$)/)?.[1];
        return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }

    async saveExam(examData) {
        console.log('Starting to save exam. Exam data:', examData); // Log full data
        try {
            if (!this.auth.currentUser) {
                throw new Error('No user logged in');
            }
            const dataToSave = {
                ...examData,
                createdBy: this.auth.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            console.log('Attempting to save data:', dataToSave);

            const docRef = await this.db.collection('exams').add(dataToSave);
            console.log('Exam saved successfully with ID:', docRef.id);

            alert('Assessment saved successfully!');
            document.getElementById('assessmentForm').reset();
            this.loadExams();
        } catch (error) {
            console.error('Error saving exam:', {
                message: error.message,
                code: error.code,
                fullError: error
            });
            alert(`Error saving assessment: ${error.message}`);
        }
    }

    async loadExams() {
        const examsList = document.getElementById('examList');
        if (!examsList) return;

        examsList.innerHTML = '<h2>Current Assessments</h2>';

        try {
            const snapshot = await this.db.collection('exams')
                .orderBy('scheduledDate', 'desc')
                .get();

            if (snapshot.empty) {
                examsList.innerHTML += '<p>No assessments added yet.</p>';
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
                        Scheduled: ${new Date(exam.scheduledDate).toLocaleString()}<br>
                        Added: ${new Date(exam.createdAt?.toDate()).toLocaleDateString()}
                    </div>
                    <div class="exam-actions">
                        <button onclick="adminPortal.copyPassword('${exam.password}')" class="copy-button">
                            Copy Password
                        </button>
                        <button onclick="adminPortal.editExam('${doc.id}')" class="edit-button">
                            Edit Time
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
    async generatePasswordReport() {
        const reportDate = document.getElementById('reportDate').value;
        if (!reportDate) {
            alert('Please select a date');
            return;
        }

        try {
            // Convert selected date to start and end of day
            const selectedDate = new Date(reportDate);
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Simpler query that only needs one index
            const snapshot = await this.db.collection('exams')
                .where('scheduledDate', '>=', startOfDay.toISOString())
                .where('scheduledDate', '<=', endOfDay.toISOString())
                .orderBy('scheduledDate')
                .get();

            const reportDiv = document.getElementById('passwordReport');

            if (snapshot.empty) {
                reportDiv.innerHTML = '<p>No assessments scheduled for this date.</p>';
                return;
            }

            // Group by grade
            const assessmentsByGrade = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!assessmentsByGrade[data.grade]) {
                    assessmentsByGrade[data.grade] = [];
                }
                assessmentsByGrade[data.grade].push(data);
            });

            // Generate report HTML
            let reportHTML = `
                <h3>Passwords for ${new Date(reportDate).toLocaleDateString()}</h3>
                <div class="password-list">
            `;

            // Sort grades numerically
            const sortedGrades = Object.keys(assessmentsByGrade).sort((a, b) => Number(a) - Number(b));

            sortedGrades.forEach(grade => {
                const assessments = assessmentsByGrade[grade];
                assessments.forEach(assessment => {
                    reportHTML += `
                        <div class="password-item">
                            <span>Grade ${grade} - ${assessment.subject}:</span>
                            <strong>${assessment.password}</strong>
                        </div>
                    `;
                });
            });

            reportHTML += `</div>
                <button onclick="adminPortal.copyPasswordReport()" class="copy-report-btn">
                    Copy All Passwords
                </button>
            `;

            reportDiv.innerHTML = reportHTML;

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Error generating password report: ' + error.message);
        }
    }

    async copyPasswordReport() {
        const reportDiv = document.getElementById('passwordReport');
        if (!reportDiv) return;

        // Create a text version of the report
        const assessments = reportDiv.querySelectorAll('.password-item');
        const reportText = Array.from(assessments)
            .map(item => item.textContent.trim().replace(/\s+/g, ' '))
            .join('\n');

        try {
            await navigator.clipboard.writeText(reportText);
            alert('Password report copied to clipboard!');
        } catch (error) {
            console.error('Error copying report:', error);
            alert('Error copying report: ' + error.message);
        }
    }
    async editExam(examId) {
        try {
            console.log('Starting edit for exam:', examId);
            const doc = await this.db.collection('exams').doc(examId).get();
            if (!doc.exists) {
                alert('Assessment not found');
                return;
            }

            const exam = doc.data();
            console.log('Current exam data:', exam);

            // Create edit dialog
            const dialog = document.createElement('div');
            dialog.className = 'edit-dialog-overlay';

            // Convert scheduledDate to local datetime-local format
            const scheduledDate = new Date(exam.scheduledDate);
            const formattedDate = scheduledDate.toISOString().slice(0, 16);

            dialog.innerHTML = `
                <div class="edit-dialog">
                    <h3>Edit Assessment</h3>
                    <form id="editForm" class="edit-form">
                        <div class="form-group">
                            <label>Grade ${exam.grade} - ${exam.subject}</label>
                        </div>
                        <div class="form-group">
                            <label for="editScheduledDate">Scheduled Date & Time</label>
                            <input type="datetime-local" 
                                id="editScheduledDate" 
                                value="${formattedDate}" 
                                required>
                        </div>
                        <div class="button-group">
                            <button type="submit" class="save-btn">Save Changes</button>
                            <button type="button" class="cancel-btn" onclick="this.closest('.edit-dialog-overlay').remove()">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(dialog);

            // Handle form submission
            document.getElementById('editForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const newScheduledDate = document.getElementById('editScheduledDate').value;
                console.log('Updating to new date:', newScheduledDate);

                try {
                    await this.db.collection('exams').doc(examId).update({
                        scheduledDate: newScheduledDate
                    });

                    console.log('Update successful');
                    alert('Assessment updated successfully');
                    dialog.remove();
                    this.loadExams(); // Refresh the list
                } catch (error) {
                    console.error('Error updating assessment:', error);
                    alert('Error updating assessment: ' + error.message);
                }
            });

        } catch (error) {
            console.error('Error loading assessment for edit:', error);
            alert('Error loading assessment: ' + error.message);
        }
    }

}


// Initialize admin portal when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing AdminPortal');
    window.adminPortal = new AdminPortal();
});