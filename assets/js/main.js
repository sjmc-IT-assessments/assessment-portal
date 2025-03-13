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
        this.loadAssessments('8'); // Load Grade 8 by default
        console.log('Assessment Portal initialized');
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

        // Set up the modal close button event listener
        const closeModalBtn = document.querySelector('.close-btn');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        // Set up the password form submit handler
        const passwordForm = document.querySelector('.password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.verifyPassword();
            });
        }

        // Allow pressing Enter in the password field to submit
        const passwordInput = document.getElementById('assessmentPassword');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.verifyPassword();
                }
            });
        }

        // PDF Modal controls
        const closePdfBtn = document.getElementById('closePdfBtn');
        if (closePdfBtn) {
            closePdfBtn.addEventListener('click', () => this.closePdfViewer());
        }

        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Close modals on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closePdfViewer();
            }
        });
    }

    switchGrade(grade) {
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.grade === grade);
        });

        document.querySelectorAll('.grade-content').forEach(content => {
            content.classList.add('active');
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
                .orderBy('scheduledDate', 'asc');

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
            statusClass = 'status-today'; // Using today's style for available
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
        } else {
            statusClass = 'status-past';
            statusText = 'Recent';
            buttonText = 'View Assessment';
        }

        const formattedDate = this.formatDate(date, true);

        // Store assessment ID as a data attribute for easier access
        card.dataset.assessmentId = id;

        card.innerHTML = `
    <div class="assessment-header">
        <h3>${assessment.subject}</h3>
        <span class="status-badge ${statusClass}">${statusText}</span>
    </div>
    <p class="assessment-type">
        ${assessment.type === 'googleform' ? '<span class="form-icon">📝</span> ' : ''}${assessment.type}
    </p>
    <p class="assessment-time">${formattedDate}</p>
    <button class="start-btn ${!isAvailable ? 'disabled' : ''}"
            ${!isAvailable ? 'disabled' : ''}>
        ${buttonText}
    </button>
`;

        // Add click event listener directly to the button
        const button = card.querySelector('.start-btn');
        if (button && isAvailable) {
            button.addEventListener('click', () => {
                this.openAssessment(id);
            });
        }

        return card;
    }

    openAssessment(assessmentId) {
        console.log('Opening assessment:', assessmentId);
        this.currentAssessment = assessmentId;

        const modalOverlay = document.getElementById('modalOverlay');
        console.log('Modal overlay element:', modalOverlay);

        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.classList.add('active');

            const passwordInput = document.getElementById('assessmentPassword');
            console.log('Password input element:', passwordInput);

            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            } else {
                console.error('Password input not found in modal');
            }
        } else {
            console.error('Modal overlay not found');
        }
    }

    closeModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            modalOverlay.classList.remove('active');
        }
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
                this.closeModal();

                // Check if this is a Google Form
                const isGoogleForm = assessment.type === 'googleform' ||
                    assessment.url.includes('forms.gle') ||
                    assessment.url.includes('docs.google.com/forms');

                if (isGoogleForm) {
                    // For Google Forms, redirect directly to the form URL
                    window.location.href = assessment.url;
                } else {
                    // For PDFs and other assessments, use the viewer as before
                    const examData = {
                        url: assessment.url,
                        title: `${assessment.subject} - ${assessment.type}`,
                        grade: assessment.grade,
                        subject: assessment.subject,
                        type: assessment.type,
                        scheduledDate: assessment.scheduledDisplayDate || this.formatDate(assessment.scheduledDate)
                    };

                    // Save to session storage
                    sessionStorage.setItem('examData', JSON.stringify(examData));

                    // Navigate to the viewer
                    window.location.href = 'viewer.html';
                }
            } else {
                alert('Incorrect password');
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            alert('Error verifying password. Please try again.');
        }
    }

    async openPdfViewer(assessment) {
        // Instead of using an iframe, we'll open the PDF in a controlled way
        console.log('Opening PDF viewer for:', assessment.subject);

        // Get the URL from the assessment
        const pdfUrl = assessment.url;

        // Create a new window with specific settings for kiosk mode
        const pdfWindow = window.open('about:blank', '_blank',
            'toolbar=0,location=0,menubar=0,width=1000,height=800,left=100,top=100');

        if (!pdfWindow) {
            alert('Please allow popups to view the assessment');
            return;
        }

        // Write content to the new window with styling and controls
        pdfWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${assessment.subject} - ${assessment.type}</title>
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        height: 100%;
                        overflow: hidden;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    }
                    .header {
                        background-color: #0a2b72;
                        color: white;
                        padding: 10px 20px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 18px;
                    }
                    .controls {
                        display: flex;
                        gap: 10px;
                    }
                    .btn {
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .btn:hover {
                        background: rgba(255,255,255,0.3);
                    }
                    .content {
                        height: calc(100% - 50px);
                    }
                    iframe {
                        width: 100%;
                        height: 100%;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${assessment.subject} - ${assessment.type}</h1>
                    <div class="controls">
                        <button class="btn" id="fullscreenBtn">Fullscreen</button>
                        <button class="btn" id="closeBtn">Close</button>
                    </div>
                </div>
                <div class="content">
                    <iframe src="${pdfUrl}" frameborder="0" allowfullscreen></iframe>
                </div>
                
                <script>
                    // Fullscreen button
                    document.getElementById('fullscreenBtn').addEventListener('click', () => {
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        }
                    });
                    
                    // Close button
                    document.getElementById('closeBtn').addEventListener('click', () => {
                        window.close();
                    });
                    
                    // Also handle Escape key for exiting fullscreen
                    document.addEventListener('keydown', (e) => {
                        if (e.key === 'Escape' && !document.fullscreenElement) {
                            window.close();
                        }
                    });
                </script>
            </body>
            </html>
        `);

        // Finalize the document
        pdfWindow.document.close();
    }
}

// Initialize the portal when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Assessment Portal');
    window.portal = new AssessmentPortal();
});

// Maintain backward compatibility for any existing references
window.portal = window.portal || new AssessmentPortal();