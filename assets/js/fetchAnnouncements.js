// fetchAnnouncements.js
async function fetchAnnouncements(courseId) {
    try {
        const response = await fetch(`/api/google-classroom/courses/${courseId}/announcements`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch announcements');
        }
        const data = await response.json();
        return data.announcements;
    } catch (error) {
        console.error('Error fetching announcements:', error);
        throw error;
    }
}

// Function to render announcements in the UI
function renderAnnouncements(announcements) {
    const container = document.getElementById('announcements-container');
    if (!container) return;

    container.innerHTML = announcements.map(announcement => `
      <div class="announcement">
        <h3>Posted on ${new Date(announcement.creationTime).toLocaleDateString()}</h3>
        <p>${announcement.text}</p>
        ${renderMaterials(announcement.materials)}
      </div>
    `).join('');
}

function renderMaterials(materials) {
    if (!materials || materials.length === 0) return '';

    return `
      <div class="materials">
        <h4>Attached Materials:</h4>
        <ul>
          ${materials.map(material => {
        switch (material.type) {
            case 'driveFile':
                return `<li><a href="${material.alternateLink}" target="_blank">${material.title}</a></li>`;
            case 'link':
                return `<li><a href="${material.url}" target="_blank">${material.title}</a></li>`;
            case 'youtube':
                return `<li><a href="${material.alternateLink}" target="_blank">${material.title}</a></li>`;
            default:
                return '';
        }
    }).join('')}
        </ul>
      </div>
    `;
}

// Export functions for use in other files
module.exports = {
    fetchAnnouncements,
    renderAnnouncements
};