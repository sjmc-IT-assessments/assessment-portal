document.addEventListener('DOMContentLoaded', function () {
    const proxyFrame = document.getElementById('proxyFrame');
    const displayFrame = document.getElementById('displayFrame');
    const backBtn = document.getElementById('backBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const accessibilityToggle = document.getElementById('accessibilityToggle');
    const accessibilityPanel = document.querySelector('.accessibility-panel');

    accessibilityToggle.addEventListener('click', function () {
        accessibilityPanel.classList.toggle('active');
    });

    // Get assessment data from session storage
    const examData = JSON.parse(sessionStorage.getItem('examData') || '{}');
    sessionStorage.removeItem('examData'); // Clear after use

    if (examData && examData.url) {
        document.title = examData.title || 'Assessment Viewer';

        document.getElementById('gradeSubject').textContent = `Grade ${examData.grade} - ${examData.subject}`;
        document.getElementById('assessmentType').textContent = examData.type || 'Assessment';

        if (examData.title) {
            const titleParts = examData.title.split(' - ');
            document.getElementById('gradeSubject').textContent = titleParts[0] || 'Subject';
            document.getElementById('assessmentType').textContent = titleParts[1] || 'Assessment';
        }

        const today = new Date();
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('assessmentDate').textContent =
            examData.scheduledDate || today.toLocaleDateString('en-ZA', dateOptions);

        // Load the assessment URL into the proxy frame first
        proxyFrame.src = examData.url;

        proxyFrame.onload = function () {
            try {
                const isGoogleForm = examData.url.includes('forms.gle') ||
                    examData.url.includes('docs.google.com/forms');

                if (isGoogleForm) {
                    displayFrame.src = examData.url;
                } else {
                    const content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>body,html{margin:0;padding:0;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:none}</style>
  <title>${examData.title || 'Assessment'}</title>
</head>
<body><iframe src="${examData.url}" frameborder="0" allowfullscreen></iframe></body>
</html>`;
                    displayFrame.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(content);
                }
            } catch (err) {
                console.error('Error setting display frame:', err);
                displayFrame.src = examData.url;
            }
        };
    } else {
        displayFrame.srcdoc = '<html><body style="text-align:center;padding-top:100px;font-family:sans-serif;"><h2>Assessment not found</h2><p>Please return to the portal.</p></body></html>';
    }

    backBtn.addEventListener('click', function () {
        window.location.href = './';
    });

    fullscreenBtn.addEventListener('click', function () {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.fullscreenElement) {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });
});
