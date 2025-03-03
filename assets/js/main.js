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
            <p class="assessment-type">${assessment.type}</p>
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
        if (!this.currentAssessment) {
            console.error('No assessment selected');
            return;
        }

        const passwordInput = document.getElementById('assessmentPassword');
        const password = passwordInput ? passwordInput.value : '';
        
        if (!password) {
            alert('Please enter a password');
            return;
        }

        try {
            console.log('Verifying password for assessment:', this.currentAssessment);
            const doc = await this.db.collection('exams').doc(this.currentAssessment).get();
            
            if (!doc.exists) {
                console.error('Assessment not found');
                alert('Assessment not found');
                return;
            }

            const assessment = doc.data();
            console.log('Assessment data retrieved, checking password');
            
            if (password === assessment.password) {
                console.log('Password correct, opening PDF viewer');
                this.closeModal();
                this.openPdfViewer(assessment);
            } else {
                console.log('Incorrect password');
                alert('Incorrect password');
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            alert('Error verifying password. Please try again.');
        }
    }

    openPdfViewer(assessment) {
        const pdfModalOverlay = document.getElementById('pdfModalOverlay');
        const pdfViewer = document.getElementById('pdfViewer');
        const pdfModalTitle = document.getElementById('pdfModalTitle');
        
        if (!pdfModalOverlay || !pdfViewer) {
            console.error('PDF viewer elements not found');
            return;
        }
        
        // Show loading indicator (optional)
        pdfViewer.insertAdjacentHTML('afterend', `
            <div class="pdf-loading" id="pdfLoading">
                <div class="pdf-loading-spinner"></div>
                <p>Loading assessment...</p>
            </div>
        `);
        
        // Set the title
        if (pdfModalTitle) {
            pdfModalTitle.textContent = `${assessment.subject} - ${assessment.type}`;
        }
        
        // Set iframe source (Google Drive viewer)
        // This works with both direct PDF links and Google Drive preview links
        pdfViewer.src = assessment.url;
        
        // Remove loading indicator when iframe loads
        pdfViewer.onload = () => {
            const loadingEl = document.getElementById('pdfLoading');
            if (loadingEl) loadingEl.remove();
        };
        
        // Show the modal
        pdfModalOverlay.style.display = 'flex';
        setTimeout(() => {
            pdfModalOverlay.classList.add('active');
        }, 10);
    }
    
    closePdfViewer() {
        const pdfModalOverlay = document.getElementById('pdfModalOverlay');
        const pdfViewer = document.getElementById('pdfViewer');
        
        if (pdfModalOverlay) {
            pdfModalOverlay.classList.remove('active');
            
            // Remove src to stop loading
            if (pdfViewer) {
                setTimeout(() => {
                    pdfViewer.src = '';
                }, 300); // Wait for animation to complete
            }
            
            setTimeout(() => {
                pdfModalOverlay.style.display = 'none';
                
                // Remove fullscreen if active
                const pdfModalContainer = document.querySelector('.pdf-modal-container');
                if (pdfModalContainer) {
                    pdfModalContainer.classList.remove('fullscreen');
                }
            }, 300);
        }
    }
    
    toggleFullscreen() {
        const pdfModalContainer = document.querySelector('.pdf-modal-container');
        
        if (pdfModalContainer) {
            pdfModalContainer.classList.toggle('fullscreen');
            
            // Update button icon (optional)
            const fullscreenBtn = document.getElementById('fullscreenBtn');
            if (fullscreenBtn) {
                if (pdfModalContainer.classList.contains('fullscreen')) {
                    fullscreenBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                        </svg>
                    `;
                } else {
                    fullscreenBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                        </svg>
                    `;
                }
            }
        }
    }
}

// Initialize the portal when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Assessment Portal');
    window.portal = new AssessmentPortal();
});

// Maintain backward compatibility for any existing references
window.portal = window.portal || new AssessmentPortal();