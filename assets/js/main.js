document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    const tabs = document.querySelectorAll('.tab-button');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show selected content
            const gradeId = tab.getAttribute('data-grade');
            document.getElementById(gradeId).classList.add('active');
        });
    });
});

// Handle exam password validation
function validatePassword() {
    const password = document.getElementById('examPassword').value;
    // This will be integrated with Firebase later
    console.log('Password entered:', password);
}