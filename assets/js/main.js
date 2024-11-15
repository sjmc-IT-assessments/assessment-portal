import firebaseConfig from './config.js';

class AssessmentPortal {
    constructor() {
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore();

        this.currentGrade = '8';
        this.currentAssessment = null;

        this.setupEventListeners();
        this.loadAssessments('8'); // Load Grade 8 by default
    }

    formatDate(date, includeTime = false) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        if (!includeTime) {
            return `${day}/${month}/${year}`;
        }

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year}, ${hours}:${minutes}`;
    }
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                this.switchGrade(button.dataset.grade);
            });
        });
    }

    switchGrade(grade) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.grade === grade);
        });

        this.currentGrade = grade;
        this.loadAssessments(grade);
    }

    async loadAssessments(grade) {
        console.log('Loading assessments for grade:', grade);
        const container = document.querySelector('.assessments-grid');
        if (!container) {
            console.error('Container not found!');
            return;
        }
        container.innerHTML = '<div class="loading">Loading assessments...</div>';
        try {
            const now = new Date();
            console.log('Current time:', now);

            console.log('Querying Firestore for grade:', grade);
            const query = this.db.collection('exams')
                .where('grade', '==', Number(grade))
                .where('archived', 'in', [false, null])
                .orderBy('scheduledDate', 'desc');

            console.log('Executing query...');
            const snapshot = await query.get();
            console.log('Query complete. Found documents:', snapshot.size);

            if (snapshot.empty) {
                console.log('No assessments found for grade', grade);
                container.innerHTML = '<div class="no-assessments">No scheduled assessments for this grade.</div>';
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('Found assessment:', {
                    id: doc.id,
                    subject: data.subject,
                    scheduledDate: data.scheduledDate,
                    date: new Date(data.scheduledDate)
                });
            });

            container.innerHTML = '';
            const assessments = [];
            snapshot.forEach(doc => {
                const assessment = doc.data();
                const assessmentDate = new Date(assessment.scheduledDate);
                if (assessmentDate >= now) {
                    assessments.push({
                        id: doc.id,
                        ...assessment,
                        date: assessmentDate
                    });
                } else {
                    console.log('Skipping past assessment:', assessment.subject, assessmentDate);
                }
            });
            assessments.sort((a, b) => a.date - b.date);
            console.log('Filtered assessments:', assessments);
            if (assessments.length === 0) {
                container.innerHTML = '<div class="no-assessments">No current or upcoming assessments for this grade.</div>';
            } else {
                assessments.forEach(assessment => {
                    const card = this.createAssessmentCard(assessment.id, assessment);
                    container.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error loading assessments:', error);
            container.innerHTML = '<div class="error">Error loading assessments. Please try again.</div>';
        }
    }

    createAssessmentCard(id, assessment) {
        const card = document.createElement('div');
        card.className = 'assessment-card';

        const assessmentDate = new Date(assessment.scheduledDate);
        const now = new Date();
        const isToday = assessmentDate.toDateString() === now.toDateString();
        const isFuture = assessmentDate > now;
        const isAvailable = assessmentDate <= now; // Available if scheduled time has passed

        let statusClass = '';
        let statusText = '';

        if (isToday) {
            statusClass = 'status-today';
            statusText = 'Today';
        } else if (isFuture) {
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
        }

        const formattedDate = this.formatDate(assessmentDate, true);

        card.innerHTML = `
        <div class="assessment-header">
            <h3>${assessment.subject}</h3>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="assessment-type">${assessment.type}</p>
        <p class="assessment-time">${formattedDate}</p>
        <button onclick="portal.openAssessment('${id}')" 
                class="start-btn ${!isAvailable ? 'disabled' : ''}"
                ${!isAvailable ? 'disabled' : ''}>
            ${isAvailable ? 'Start Assessment' : 'Not Yet Available'}
        </button>
    `;

        return card;
    }

    openAssessment(assessmentId) {
        this.currentAssessment = assessmentId;
        document.getElementById('modalOverlay').style.display = 'flex';
        document.getElementById('assessmentPassword').value = '';
        document.getElementById('assessmentPassword').focus();
    }

    closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        this.currentAssessment = null;
    }

    async verifyPassword() {
        if (!this.currentAssessment) return;

        const password = document.getElementById('assessmentPassword').value;
        if (!password) {
            alert('Please enter a password');
            return;
        }

        try {
            const doc = await this.db.collection('exams').doc(this.currentAssessment).get();
            if (!doc.exists) {
                alert('Assessment not found');
                return;
            }

            const assessment = doc.data();
            if (password === assessment.password) {
                // Redirect to the assessment URL
                window.location.href = assessment.url;
            } else {
                alert('Incorrect password');
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            alert('Error verifying password. Please try again.');
        }
    }
    async loadAssessments(grade) {
        console.log('Loading assessments for grade:', grade);
        const container = document.querySelector('.assessments-grid');
        if (!container) {
            console.error('Container not found!');
            return;
        }


        container.innerHTML = '<div class="loading">Loading assessments...</div>';
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            console.log('Querying Firestore for grade:', grade);
            const query = this.db.collection('exams')
                .where('grade', '==', Number(grade))
                .where('archived', 'in', [false, null]) // Only show active assessments
                .orderBy('scheduledDate', 'desc');

            console.log('Executing query...');
            const snapshot = await query.get();
            console.log('Query complete. Found documents:', snapshot.size);

            if (snapshot.empty) {
                console.log('No assessments found for grade', grade);
                container.innerHTML = '<div class="no-assessments">No scheduled assessments for this grade.</div>';
                return;
            }

            container.innerHTML = '';

            const assessments = [];
            snapshot.forEach(doc => {
                const assessment = doc.data();
                const assessmentDate = new Date(assessment.scheduledDate);
                assessmentDate.setHours(0, 0, 0, 0);
                if (assessmentDate >= today) {
                    assessments.push({
                        id: doc.id,
                        ...assessment,
                        date: assessmentDate
                    });
                }
            });
            // Sort by date (closest first)
            assessments.sort((a, b) => a.date - b.date);

            // Create cards for filtered assessments
            if (assessments.length === 0) {
                container.innerHTML = '<div class="no-assessments">No current or upcoming assessments for this grade.</div>';
            } else {
                assessments.forEach(assessment => {
                    const card = this.createAssessmentCard(assessment.id, assessment);
                    container.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error loading assessments:', error);
            container.innerHTML = `<div class="error">Error loading assessments: ${error.message}</div>`;
        }
    }

    createAssessmentCard(id, assessment) {
        const card = document.createElement('div');
        card.className = 'assessment-card';

        const date = new Date(assessment.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isToday = date.toDateString() === today.toDateString();
        const isFuture = date > today;

        let statusClass = '';
        let statusText = '';

        if (isToday) {
            statusClass = 'status-today';
            statusText = 'Today';
        } else if (isFuture) {
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
        }

        const formattedDate = this.formatDate(date, true);

        card.innerHTML = `
        <div class="assessment-header">
            <h3>${assessment.subject}</h3>
            <span class="status-badge ${statusClass}">${statusText}</span>
        </div>
        <p class="assessment-type">${assessment.type}</p>
        <p class="assessment-time">${formattedDate}</p>
        <button onclick="portal.openAssessment('${id}')" 
                class="start-btn ${!isToday ? 'disabled' : ''}"
                ${!isToday ? 'disabled' : ''}>
            ${isToday ? 'Start Assessment' : 'Not Yet Available'}
        </button>
    `;

        return card;
    }
}

// Initialize the portal
window.portal = new AssessmentPortal();