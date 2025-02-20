import { firebaseConfig } from './config.js';

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
        this.loadAssessments('8');
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
            // Get current time
            const now = new Date();
            console.log('Current time:', now.toISOString());

            console.log('Querying Firestore for grade:', grade);
            const query = this.db.collection('exams')
                .where('grade', '==', Number(grade))
                .where('archived', 'in', [false, null])
                .orderBy('scheduledDate', 'asc');;

            console.log('Executing query...');
            const snapshot = await query.get();
            console.log('Query complete. Found documents:', snapshot.size);

            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('Found exam:', {
                    id: doc.id,
                    grade: data.grade,
                    subject: data.subject,
                    scheduledDate: data.scheduledDate,
                    archived: data.archived
                });
            });


            if (snapshot.empty) {
                container.innerHTML = '<div class="no-assessments">No scheduled assessments for this grade.</div>';
                return;
            }

            container.innerHTML = '';
            const assessments = [];

            // Process and filter assessments
            snapshot.forEach(doc => {
                const assessment = doc.data();
                const assessmentDate = new Date(assessment.scheduledDate);

                // Calculate time difference in hours
                const timeDiff = (assessmentDate - now) / (1000 * 60 * 60);

                // Show assessment if it's scheduled within the next 24 hours
                // or was scheduled within the last 4 hours
                if (timeDiff >= -4 && timeDiff <= 24) {
                    assessments.push({
                        id: doc.id,
                        ...assessment,
                        date: assessmentDate
                    });
                    console.log('Including assessment:', assessment.subject, 'Time diff:', timeDiff);
                } else {
                    console.log('Excluding assessment:', assessment.subject, 'Time diff:', timeDiff);
                }
            });
            assessments.sort((a, b) => a.date - b.date);
            console.log('Final filtered assessments:', assessments.length);

            if (assessments.length === 0) {
                container.innerHTML = '<div class="no-assessments">No current assessments available for this grade.</div>';
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
        const now = new Date();
        const timeDiff = (date - now) / (1000 * 60);

        // Assessment is available 15 minutes before scheduled time
        const isAvailable = timeDiff <= 15 && timeDiff >= -240;
        const isToday = date.toDateString() === now.toDateString();
        const isFuture = date > now;

        let statusClass = '';
        let statusText = '';
        let buttonText = '';

        if (isAvailable) {
            statusClass = 'status-available';
            statusText = 'Available Now';
            buttonText = 'Start Assessment';
        } else if (isToday) {
            statusClass = 'status-today';
            statusText = 'Today';
            buttonText = 'Not Yet Available';
        } else if (isFuture) {
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
            buttonText = 'Not Yet Available';
        }

        const formattedDate = this.formatDate(date, true);

        card.innerHTML = `
            <div class="assessment-header">
                <h3>${assessment.subject}</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <p class="assessment-type">${assessment.type}</p>
            <p class="assessment-time">${formattedDate}</p>
           <button data-assessment-id="${id}" 
                class="start-btn ${!isAvailable ? 'disabled' : ''}"
                ${!isAvailable ? 'disabled' : ''}>
                ${buttonText}
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

// Initialize the portal
console.portal = new AssessmentPortal();