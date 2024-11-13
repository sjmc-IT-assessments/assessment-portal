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
        const container = document.querySelector('.assessments-grid');
        container.innerHTML = '<div class="loading">Loading assessments...</div>';

        try {
            // Get today's date at midnight
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const snapshot = await this.db.collection('exams')
                .where('grade', '==', grade)
                .where('scheduledDate', '>=', today.toISOString())
                .orderBy('scheduledDate')
                .get();

            if (snapshot.empty) {
                container.innerHTML = '<div class="no-assessments">No scheduled assessments for this grade.</div>';
                return;
            }

            container.innerHTML = '';
            snapshot.forEach(doc => {
                const assessment = doc.data();
                const card = this.createAssessmentCard(doc.id, assessment);
                container.appendChild(card);
            });

        } catch (error) {
            console.error('Error loading assessments:', error);
            container.innerHTML = '<div class="error">Error loading assessments. Please try again.</div>';
        }
    }

    createAssessmentCard(id, assessment) {
        const card = document.createElement('div');
        card.className = 'assessment-card';
        
        const date = new Date(assessment.scheduledDate);
        
        card.innerHTML = `
            <h3>${assessment.subject}</h3>
            <p class="assessment-type">${assessment.type}</p>
            <p class="assessment-date">${date.toLocaleDateString()}</p>
            <button onclick="portal.openAssessment('${id}')" class="start-btn">
                Start Assessment
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
        console.log('Loading assessments for grade:', grade); // Debug log
        const container = document.querySelector('.assessments-grid');
        if (!container) {
            console.error('Container not found!');
            return;
        }
        
        container.innerHTML = '<div class="loading">Loading assessments...</div>';
    
        try {
            // Log the query we're about to make
            console.log('Querying Firestore for grade:', grade);
            
            const snapshot = await this.db.collection('exams')
                .where('grade', '==', grade.toString()) // Convert grade to string
                .orderBy('scheduledDate')
                .get();
    
            console.log('Query complete. Found documents:', snapshot.size); // Debug log
    
            if (snapshot.empty) {
                console.log('No assessments found for grade', grade); // Debug log
                container.innerHTML = '<div class="no-assessments">No scheduled assessments for this grade.</div>';
                return;
            }
    
            container.innerHTML = '';
            
            // Log each document we found
            snapshot.forEach(doc => {
                console.log('Assessment found:', doc.data()); // Debug log
                const assessment = doc.data();
                const card = this.createAssessmentCard(doc.id, assessment);
                container.appendChild(card);
            });
    
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
        const isPast = date < today;
        const isFuture = date > today;
        
        let statusClass = '';
        let statusText = '';
        
        if (isToday) {
            statusClass = 'status-today';
            statusText = 'Today';
        } else if (isPast) {
            statusClass = 'status-past';
            statusText = 'Past';
        } else {
            statusClass = 'status-upcoming';
            statusText = 'Upcoming';
        }
        
        card.innerHTML = `
            <div class="assessment-header">
                <h3>${assessment.subject}</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <p class="assessment-type">${assessment.type}</p>
            <p class="assessment-time">${date.toLocaleTimeString('en-ZA', { 
                hour: '2-digit', 
                minute: '2-digit'
            })}</p>
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