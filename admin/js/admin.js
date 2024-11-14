import firebaseConfig, { calendarConfig } from '../../assets/js/config.js';
import { CalendarService } from './calendar-service.js';

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

class AdminPortal {
    constructor() {
        console.log('Starting AdminPortal initialization');
        this.passwordGenerator = new PasswordGenerator();
        this.isSubmitting = false;
        this.calendarService = new CalendarService(calendarConfig);

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            console.log('Firebase initialized successfully');

            this.initializeAuth();
            this.setupEventListeners();
            this.initializeCalendar();
        } catch (error) {
            console.error('Initialization error:', error);
            alert('Error initializing application: ' + error.message);
        }
    }

    async initializeCalendar() {
        try {
            await this.calendarService.ensureInitialized();
            console.log('Calendar service initialized successfully');
        } catch (error) {
            console.warn('Calendar initialization failed:', error);
        }
    }

    async initializeAuth() {
        await this.auth.signOut();

        this.auth.onAuthStateChanged(async (user) => {
            console.log('Auth state changed, user:', user);
            if (user) {
                if (user.email.endsWith('@maristsj.co.za')) {
                    const isAuthorized = await this.checkUserAuthorization(user.email);
                    if (isAuthorized) {
                        document.getElementById('loginSection').style.display = 'none';
                        document.getElementById('adminPanel').style.display = 'block';
                        this.showAdminPanel(user);
                    } else {
                        alert('You are not authorized to access the admin panel. Please contact the administrator.');
                        await this.auth.signOut();
                    }
                } else {
                    alert('Please use your SJMC email address to login.');
                    await this.auth.signOut();
                }
            } else {
                document.getElementById('loginSection').style.display = 'flex';
                document.getElementById('adminPanel').style.display = 'none';
                this.hideAdminPanel();
            }
        });
    }

    setupEventListeners() {
        const loginButton = document.getElementById('googleLogin');
        if (loginButton) {
            loginButton.addEventListener('click', () => this.handleLogin());
        }

        const logoutButton = document.getElementById('logoutBtn');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }

        const manageUsersBtn = document.getElementById('manageUsersBtn');
        if (manageUsersBtn) {
            manageUsersBtn.addEventListener('click', () => this.manageUsers());
        }

        const assessmentForm = document.getElementById('assessmentForm');
        if (assessmentForm) {
            const newAssessmentForm = assessmentForm.cloneNode(true);
            assessmentForm.parentNode.replaceChild(newAssessmentForm, assessmentForm);

            newAssessmentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!this.isSubmitting) {
                    const formData = this.getExamFormData();
                    await this.saveExam(formData);
                }
            });
        }

        const calendarCheckbox = document.getElementById('addCalendarReminder');
        if (calendarCheckbox) {
            calendarCheckbox.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    try {
                        await this.calendarService.ensureInitialized();
                    } catch (error) {
                        console.error('Failed to initialize calendar service:', error);
                        e.target.checked = false;
                        alert('Unable to enable calendar reminders. Please try again later.');
                    }
                }
            });
        }

        this.setupTimeSelect();
    }

    async handleLogin() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account', // Force account selection every time
                hd: 'maristsj.co.za'
            });

            // Clear any existing auth state first
            await this.auth.signOut();

            const result = await this.auth.signInWithPopup(provider);
            console.log('Sign in successful:', result.user.email);

            // Force a UI update
            if (result.user) {
                const isAuthorized = await this.checkUserAuthorization(result.user.email);
                if (isAuthorized) {
                    this.showAdminPanel(result.user);
                } else {
                    alert('You are not authorized to access the admin panel. Please contact the administrator.');
                    await this.auth.signOut();
                }
            }
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
            const baseUrl = window.location.pathname.split('/admin')[0];
            window.location.href = baseUrl + '/index.html';
        } catch (error) {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        }
    }

    async saveExam(examData) {
        if (this.isSubmitting) {
            console.log('Already submitting, preventing duplicate submission');
            return;
        }

        const submitButton = document.querySelector('button[type="submit"]');
        try {
            this.isSubmitting = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';

            const docRef = await this.db.collection('exams').add({
                ...examData,
                createdBy: this.auth.currentUser.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Exam saved to Firestore:', docRef.id);

            const addReminder = document.getElementById('addCalendarReminder').checked;
            if (addReminder) {
                try {
                    await this.calendarService.createReminder(examData);
                    console.log('Calendar reminder created');
                } catch (calendarError) {
                    console.error('Calendar error (continuing anyway):', calendarError);
                    alert('Assessment saved, but calendar reminder failed to create. Please add it manually if needed.');
                }
            }

            document.getElementById('assessmentForm').reset();
            alert('Assessment saved successfully!');
            await this.loadExams();

            return docRef;
        } catch (error) {
            console.error('Save exam error:', error);
            alert('Error: ' + error.message);
        } finally {
            this.isSubmitting = false;
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    }

    async checkUserAuthorization(email) {
        try {
            const userDoc = await this.db.collection('users').doc(email).get();
            return userDoc.exists;
        } catch (error) {
            console.error('Error checking user authorization:', error);
            return false;
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

    async manageUsers() {
        if (this.auth.currentUser.email !== 'acoetzee@maristsj.co.za') {
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

    async loadTeachers() {
        const usersList = document.getElementById('usersList');
        if (!usersList) return;

        try {
            const snapshot = await this.db.collection('users').get();
            usersList.innerHTML = '<h4>Authorized Teachers</h4>';

            snapshot.forEach(doc => {
                const userData = doc.data();
                const item = document.createElement('div');
                item.className = 'user-item';
                item.innerHTML = `
                    <span>${userData.email}</span>
                    <button onclick="adminPortal.removeTeacher('${userData.email}')" class="remove-button">
                        Remove
                    </button>
                `;
                usersList.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading teachers:', error);
            usersList.innerHTML = 'Error loading teachers';
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
        const date = document.getElementById('scheduledDate').value;
        const time = document.getElementById('scheduledTime').value;
        const scheduledDateTime = `${date}T${time}`;
        const formData = {
            grade: document.getElementById('grade')?.value,
            subject: document.getElementById('subject')?.value,
            type: document.getElementById('assessmentType')?.value,
            url: this.formatDriveUrl(document.getElementById('driveUrl')?.value || ''),
            scheduledDate: scheduledDateTime,
            password: document.getElementById('password')?.value,
            date: new Date().toISOString()
        };

        console.log('Collected form data:', formData);

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

    setupTimeSelect() {
        const timeSelect = document.getElementById('scheduledTime');
        if (timeSelect) {
            timeSelect.addEventListener('mousedown', function () {
                if (this.options.length > 6) {
                    this.size = 6;
                }
            });

            timeSelect.addEventListener('change', function () {
                this.size = 0;
            });

            timeSelect.addEventListener('blur', function () {
                this.size = 0;
            });
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
            const selectedDate = new Date(reportDate);
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

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

            const assessmentsByGrade = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!assessmentsByGrade[data.grade]) {
                    assessmentsByGrade[data.grade] = [];
                }
                assessmentsByGrade[data.grade].push(data);
            });

            let reportHTML = `
                <h3>Passwords for ${new Date(reportDate).toLocaleDateString()}</h3>
                <div class="password-list">
            `;

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

            const dialog = document.createElement('div');
            dialog.className = 'edit-dialog-overlay';

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
                    this.loadExams();
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

export default AdminPortal;