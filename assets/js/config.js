// Exam configurations
const examConfig = {
    'afrikaans-g8': {
        password: '2024g8afr',
        url: 'https://drive.google.com/file/d/YOURFILEID/preview',
        subject: 'Afrikaans',
        grade: '8',
        year: '2024',
        term: '1'
    },
    'isixhosa-g8': {
        password: '2024g8xho',
        url: 'https://drive.google.com/file/d/YOURFILEID/preview',
        subject: 'isiXhosa',
        grade: '8',
        year: '2024',
        term: '1'
    }
    // Add more exams here
};

// Main functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => openTab(tab.getAttribute('data-grade')));
    });
});

function openTab(gradeName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab content and activate button
    document.getElementById(gradeName).classList.add('active');
    document.querySelector(`[data-grade="${gradeName}"]`).classList.add('active');
}

let currentExam = '';

function openExam(examId) {
    currentExam = examId;
    document.getElementById('modalOverlay').style.display = 'block';
    document.getElementById('passwordModal').style.display = 'block';
    document.getElementById('examPassword').value = '';
}

function validatePassword() {
    const password = document.getElementById('examPassword').value;
    if (examConfig[currentExam] && password === examConfig[currentExam].password) {
        window.location.href = examConfig[currentExam].url;
    } else {
        alert('Incorrect password. Please try again.');
    }
}