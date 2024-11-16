//admin.js
import firebaseConfig, { calendarConfig } from '../../assets/js/config.js';
import { CalendarService } from './calendar-service.js';

// Format date as DD/MM/YYYY with optional time in South African timezone
function formatDate(date, includeTime = false) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    // Create formatter with South African timezone
    const options = {
        timeZone: 'Africa/Johannesburg',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    // Add time options if needed
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = false;
    }

    // Format the date using the locale formatter
    return new Intl.DateTimeFormat('en-ZA', options).format(date);
}
class PasswordGenerator {
    constructor() {
        this.firstWords = [
            'Sparkle', 'Dragon', 'Cosmic', 'Melody', 'Winter',
            'Summer', 'Autumn', 'Spring', 'Thunder', 'Lightning',
            'Crystal', 'Rainbow', 'Golden', 'Silver', 'Mystic',
            'Whisper', 'Noble', 'Royal', 'Brave', 'Swift',
            'Bright', 'Lunar', 'Solar', 'Star', 'Cloud',

            // Science Words
            'Quantum', 'Nucleus', 'Electron', 'Neutron', 'Proton',
            'Molecule', 'Asteroid', 'Telescope', 'Laboratory', 'Chemical',
            'Velocity', 'Momentum', 'Gravity', 'Magnetic', 'Atomic',

            // Technology
            'Digital', 'Cyber', 'Quantum', 'Virtual', 'Binary',
            'Pixel', 'Neural', 'Vector', 'Matrix', 'Crypto',
            'Quantum', 'Hologram', 'Wireless', 'Circuit', 'Android',

            // Mythology
            'Olympus', 'Poseidon', 'Mercury', 'Jupiter', 'Neptune',
            'Hercules', 'Atlas', 'Pegasus', 'Phoenix', 'Hydra',
            'Kraken', 'Cyclops', 'Titan', 'Oracle', 'Chimera',

            // Architecture
            'Cathedral', 'Pyramid', 'Colosseum', 'Palace', 'Castle',
            'Citadel', 'Fortress', 'Mansion', 'Temple', 'Tower',
            'Pavilion', 'Pantheon', 'Obelisk', 'Lighthouse', 'Bridge',
            // Adventure Time inspired
            'Algebraic', 'Mathematical', 'Radical', 'Wizard', 'Dungeon',
            'Princess', 'Vampire', 'Candy', 'Ice', 'Flame',
            'Lumpy', 'Cosmic', 'Adventure', 'Magic', 'Penguin',
            'Prismo', 'Cosmic', 'Bubblegum', 'Marceline', 'Banana',
            'Grass', 'Finn', 'Jake', 'Tree', 'Cosmic',
            'Science', 'Wizard', 'Champion', 'Hero', 'Sword'
        ];

        this.secondWords = [
            'Storm', 'Light', 'Shadow', 'Dream', 'Wave',
            'Mountain', 'River', 'Forest', 'Meadow', 'Symphony',
            'Cookie', 'Tornado', 'Whisper', 'Blossom', 'Dance',
            'Spirit', 'Heart', 'Soul', 'Mind', 'Breeze',
            'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Lion',

            // Exploration
            'Wanderer', 'Explorer', 'Adventure', 'Discovery', 'Journey',
            'Expedition', 'Voyager', 'Pioneer', 'Navigator', 'Traveler',
            'Pathfinder', 'Discoverer', 'Surveyor', 'Nomad', 'Scout',

            // Elements & Materials
            'Platinum', 'Titanium', 'Diamond', 'Sapphire', 'Emerald',
            'Obsidian', 'Quartz', 'Marble', 'Crystal', 'Bronze',
            'Graphene', 'Neon', 'Carbon', 'Silicon', 'Helium',

            // Time Related
            'Infinity', 'Eternity', 'Temporal', 'Chronicle', 'Dynasty',
            'Century', 'Millennium', 'Moment', 'Legacy', 'Heritage',
            'Ancestry', 'Destiny', 'Future', 'Epoch', 'Era',

            // Weather Phenomena
            'Hurricane', 'Avalanche', 'Blizzard', 'Tempest', 'Monsoon',
            'Typhoon', 'Cyclone', 'Thunder', 'Lightning', 'Tornado',
            'Whirlwind', 'Tsunami', 'Eclipse', 'Aurora', 'Rainbow',

            // Fantasy Creatures
            'Basilisk', 'Centaur', 'Griffon', 'Manticore', 'Sphinx',
            'Minotaur', 'Pegasus', 'Unicorn', 'Dragon', 'Phoenix',
            'Leviathan', 'Behemoth', 'Chimera', 'Wyrm', 'Hydra',

            // Abstract Concepts
            'Serenity', 'Harmony', 'Liberty', 'Victory', 'Destiny',
            'Mystery', 'Fortune', 'Wisdom', 'Glory', 'Honor',
            'Courage', 'Justice', 'Freedom', 'Unity', 'Peace'

        ];

        this.foodWords = [
            'Habanero', 'Milkshake', 'Cookie', 'Pepper', 'Mango',
            'Vanilla', 'Chocolate', 'Cinnamon', 'Nutmeg', 'Wasabi',
            'Cupcake', 'Donut', 'Pretzel', 'Smoothie', 'Biscuit',

            // International Foods
            'Sushi', 'Paella', 'Lasagna', 'Croissant', 'Tiramisu',
            'Baklava', 'Churros', 'Gelato', 'Ramen', 'Kimchi',
            'Falafel', 'Hummus', 'Sashimi', 'Gnocchi', 'Tempura',

            // Fancy Desserts
            'Macaron', 'Eclair', 'Ganache', 'Praline', 'Souffle',
            'Parfait', 'Profiterole', 'Meringue', 'Gelato', 'Gateau',
            'Truffle', 'Toffee', 'Caramel', 'Fondant', 'Mousse',

            // Beverages
            'Espresso', 'Cappuccino', 'Lemonade', 'Frappe', 'Matcha',
            'Boba', 'Slushie', 'Mojito', 'Nectar', 'Cordial',
            'Smoothie', 'Latte', 'Mocha', 'Juice', 'Punch',
            //AT
            'Sandwich', 'Bacon', 'Pancake', 'Spaghetti', 'Everything',
            'Burrito', 'BubbleGum', 'Candy', 'IceCream', 'Cookie',
            'Pizza', 'Taco', 'Waffle', 'Pickle', 'Burger',
            'Noodle', 'Meatball', 'Sundae', 'Lasagna', 'PieDay',
            'Donut', 'Popcorn', 'Pretzel', 'Sugar', 'Sweet',

            // Exotic Fruits
            'Dragonfruit', 'Passionfruit', 'Lychee', 'Guava', 'Papaya',
            'Kumquat', 'Pomelo', 'Durian', 'Jackfruit', 'Rambutan',
            'Mangosteen', 'Persimmon', 'Tamarind', 'Starfruit', 'Plantain',

            // Herbs & Spices
            'Lavender', 'Rosemary', 'Saffron', 'Cardamom', 'Turmeric',
            'Oregano', 'Thyme', 'Basil', 'Sage', 'Tarragon',
            'Ginger', 'Clove', 'Anise', 'Fennel', 'Juniper'
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
        this.fixExistingExams();
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            console.log('Firebase initialized successfully');

            // Move these after Firebase initialization
            this.initializeAuth();
            this.setupEventListeners();
            this.initializeCalendar();
            this.setupAutoArchiving(); // Move this here, after Firebase is initialized

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


        const applyFilterBtn = document.getElementById('applyFilter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                console.log('Applying filters...'); // Debug log
                this.loadExams(true);
            });
        }
        // Optional: Add reset filter button
        const filterControls = document.querySelector('.filter-controls');
        if (filterControls && !document.querySelector('.reset-filter-btn')) {
            const resetFilterBtn = document.createElement('button');
            resetFilterBtn.textContent = 'Reset';
            resetFilterBtn.className = 'reset-filter-btn';
            resetFilterBtn.addEventListener('click', () => {
                document.getElementById('filterGrade').value = '';
                document.getElementById('filterType').value = '';
                this.loadExams(false);
            });
            filterControls.appendChild(resetFilterBtn);
        }
        const archiveAllBtn = document.getElementById('archiveAll');
        if (archiveAllBtn) {
            archiveAllBtn.addEventListener('click', () => this.archiveAll());
        }
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
    setupAutoArchiving() {
        // Run immediately
        this.checkAndArchiveOldExams();

        // Then run every hour
        setInterval(() => this.checkAndArchiveOldExams(), 60 * 60 * 1000);
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
    async loadExams(filter = false) {
        const examsList = document.getElementById('examList');
        if (!examsList) return;

        try {
            let query = this.db.collection('exams');

            if (filter) {
                const gradeFilter = document.getElementById('filterGrade').value;
                const typeFilter = document.getElementById('filterType').value;
                const archiveFilter = document.getElementById('filterArchived').value;

                // First handle archive status
                if (archiveFilter === 'active') {
                    // For active, we want both false and non-existent archived fields
                    query = query.where('archived', 'in', [false, null]);
                } else if (archiveFilter === 'archived') {
                    query = query.where('archived', '==', true);
                }
                // 'all' doesn't need any archived filter

                // Add other filters
                if (gradeFilter) {
                    query = query.where('grade', '==', Number(gradeFilter));
                }

                if (typeFilter) {
                    query = query.where('type', '==', typeFilter);
                }
            } else {
                // Default view shows active and unarchived assessments
                query = query.where('archived', 'in', [false, null]);
            }

            // Always order by date
            query = query.orderBy('scheduledDate', 'asc');

            const snapshot = await query.get();

            if (snapshot.empty) {
                examsList.innerHTML = '<p>No assessments found.</p>';
                return;
            }

            examsList.innerHTML = '';

            snapshot.forEach(doc => {
                const exam = doc.data();
                const item = document.createElement('div');
                item.className = 'exam-item' + (exam.archived ? ' archived-item' : '');
                item.innerHTML = `
                    <div>
                        <strong>Grade ${exam.grade} - ${exam.subject}</strong>
                        ${exam.archived ? '<span class="archived-badge">Archived</span>' : ''}<br>
                        Password: ${exam.password}<br>
                        Scheduled: ${formatDate(exam.scheduledDate, true)}<br>
                        Added: ${formatDate(exam.createdAt?.toDate())}<br>
                        ${exam.archived ? `Archived: ${formatDate(exam.archivedAt?.toDate())}` : ''}
                    </div>
                    <div class="exam-actions">
                        <button onclick="adminPortal.copyPassword('${exam.password}')" class="copy-button">
                            Copy Password
                        </button>
                        <button onclick="adminPortal.editExam('${doc.id}')" class="edit-button">
                            Edit Time
                        </button>
                        ${exam.archived ?
                        `<button onclick="adminPortal.restoreExam('${doc.id}')" class="restore-button">
                                Restore
                            </button>` :
                        `<button onclick="adminPortal.archiveSingleExam('${doc.id}')" class="archive-button">
                                Archive
                            </button>`
                    }
                        <button onclick="adminPortal.deleteExam('${doc.id}')" class="delete-button">
                            Delete
                        </button>
                    </div>
                `;
                examsList.appendChild(item);
            });

        } catch (error) {
            console.error('Error loading exams:', error);
            examsList.innerHTML = `<p>Error loading exams: ${error.message}</p>`;
        }
    }

    async archiveAll() {
        if (!confirm('Are you sure you want to archive all currently visible assessments?')) {
            return;
        }

        try {
            // Get current visible assessments
            const snapshot = await this.db.collection('exams')
                .where('archived', '==', false)
                .get();

            if (snapshot.empty) {
                alert('No assessments to archive');
                return;
            }

            // Use batched write for better performance
            const batch = this.db.batch();

            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    archived: true,
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    archivedBy: this.auth.currentUser.email
                });
            });

            await batch.commit();
            alert('Successfully archived all assessments');
            this.loadExams(true); // Refresh the list
        } catch (error) {
            console.error('Error archiving all assessments:', error);
            alert('Error archiving assessments: ' + error.message);
        }
    }
    async restoreExam(examId) {
        try {
            await this.db.collection('exams').doc(examId).update({
                archived: false,
                restoredAt: firebase.firestore.FieldValue.serverTimestamp(),
                restoredBy: this.auth.currentUser.email
            });
            this.loadExams(true);
        } catch (error) {
            console.error('Error restoring exam:', error);
            alert('Error restoring exam: ' + error.message);
        }
    }

    async archiveSingleExam(examId) {
        try {
            await this.db.collection('exams').doc(examId).update({
                archived: true,
                archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
                archivedBy: this.auth.currentUser.email
            });
            this.loadExams(true);
        } catch (error) {
            console.error('Error archiving exam:', error);
            alert('Error archiving exam: ' + error.message);
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

        const localDate = new Date(scheduledDateTime);
        console.log('Time debug:', {
            inputDate: date,
            inputTime: time,
            scheduledDateTime,
            finalDate: localDate.toISOString()
        });
        const formData = {
            grade: Number(document.getElementById('grade')?.value),
            subject: document.getElementById('subject')?.value,
            type: document.getElementById('assessmentType')?.value,
            url: this.formatDriveUrl(document.getElementById('driveUrl')?.value || ''),
            scheduledDate: localDate.toISOString(), // Store as is
            password: document.getElementById('password')?.value,
            archived: false,
            date: new Date().toISOString()
        };

        console.log('Form data:', formData);

        const missingFields = Object.entries(formData)
            .filter(([key, value]) => {
                if (typeof value === 'boolean') return false;
                return !value;
            })
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
            const doc = await this.db.collection('exams').doc(examId).get();
            if (!doc.exists) {
                alert('Assessment not found');
                return;
            }


            const exam = doc.data();
            const scheduledDate = new Date(exam.scheduledDate);

            const formattedDateTime = scheduledDate.toISOString().slice(0, 16);
            console.log('Edit time debug:', {
                original: exam.scheduledDate,
                scheduledDate: scheduledDate,
                formatted: formattedDateTime
            });

            const dialog = document.createElement('div');
            dialog.className = 'edit-dialog-overlay';
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
                            value="${formattedDateTime}" 
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
                const newScheduledDate = document.getElementById('editScheduledDate').value + ':00+02:00';
                const newDate = new Date(newScheduledDate);

                try {
                    await this.db.collection('exams').doc(examId).update({
                        scheduledDate: newDate.toISOString()
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
    async archiveCurrentAssessments() {
        if (!confirm('Are you sure you want to archive all currently displayed assessments? They will be hidden from students but can be restored through filters.')) {
            return;
        }

        try {
            const batch = this.db.batch();
            const snapshot = await this.db.collection('exams')
                .where('archived', '==', false)
                .get();

            if (snapshot.empty) {
                alert('No assessments to archive');
                return;
            }

            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    archived: true,
                    archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    archivedBy: this.auth.currentUser.email
                });
            });

            await batch.commit();
            alert('Assessments archived successfully');
            this.loadExams(false);
        } catch (error) {
            console.error('Error archiving assessments:', error);
            alert('Error archiving assessments: ' + error.message);
        }

    }

    async fixMissingArchivedStatus() {
        if (!confirm('This will update all exams without an archived status to set them as active. Continue?')) {
            return;
        }

        try {
            // Get ALL exams
            const snapshot = await this.db.collection('exams').get();

            if (snapshot.empty) {
                alert('No exams found');
                return;
            }

            const batch = this.db.batch();
            let count = 0;

            snapshot.forEach(doc => {
                const examData = doc.data();
                // Check if archived field exists at all
                if (!examData.hasOwnProperty('archived')) {
                    batch.update(doc.ref, {
                        archived: false // Set them as active by default
                    });
                    count++;
                }
            });

            if (count === 0) {
                alert('No exams found needing update');
                return;
            }

            await batch.commit();
            alert(`Successfully updated ${count} exams`);
            this.loadExams(true);
        } catch (error) {
            console.error('Error fixing archived status:', error);
            alert('Error updating exams: ' + error.message);
        }
    }
    async checkAndArchiveOldExams() {
        try {
            const now = new Date();
            // Get exams that are either not archived or have no archive status
            const snapshot = await this.db.collection('exams')
                .where('archived', 'in', [false, null])
                .get();

            const batch = this.db.batch();
            let count = 0;

            snapshot.forEach(doc => {
                const exam = doc.data();
                const examDate = new Date(exam.scheduledDate);
                const hoursSinceExam = (now - examDate) / (1000 * 60 * 60);

                if (hoursSinceExam > 4) { // Archive if more than 4 hours old
                    batch.update(doc.ref, {
                        archived: true,
                        archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
                        archivedBy: 'system',
                        archiveReason: 'auto-archived after 4 hours'
                    });
                    count++;
                }
            });

            if (count > 0) {
                await batch.commit();
                console.log(`Auto-archived ${count} old exams`);
            }
        } catch (error) {
            console.error('Error in auto-archiving:', error);
        }
    }
    async fixExistingExams() {
        try {
            const snapshot = await this.db.collection('exams').get();
            const batch = this.db.batch();
            let count = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (!data.hasOwnProperty('archived')) {
                    batch.update(doc.ref, {
                        archived: false
                    });
                    count++;
                }
            });

            if (count > 0) {
                await batch.commit();
                console.log(`Updated ${count} exams with missing archived status`);
                this.loadExams(true);
            } else {
                console.log('No exams needed updating');
            }
        } catch (error) {
            console.error('Error fixing exams:', error);
        }
    }

}

// Initialize admin portal when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing AdminPortal');
    window.adminPortal = new AdminPortal();
});

export default AdminPortal;