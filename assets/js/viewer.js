document.addEventListener('DOMContentLoaded', function () {
    const proxyFrame = document.getElementById('proxyFrame');
    const displayFrame = document.getElementById('displayFrame');
    const backBtn = document.getElementById('backBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

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

    initTimer(examData);

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

function initTimer(examData) {
    const timerEl = document.getElementById('examTimer');
    if (!timerEl) return;

    const readingMins = examData.readingTime || 0;
    const writingMins = examData.writingTime || 0;
    const hasTimer = (readingMins > 0 || writingMins > 0) && examData.scheduledISO;

    if (!hasTimer) {
        // No timer configured — show a live clock
        function clockTick() {
            const now = new Date();
            timerEl.className = 'exam-timer timer-clock';
            timerEl.innerHTML = `<span class="timer-time">${now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>`;
        }
        clockTick();
        setInterval(clockTick, 1000);
        return;
    }

    const startTime = new Date(examData.scheduledISO);
    const readingEnd = new Date(startTime.getTime() + readingMins * 60000);
    const writingEnd = new Date(readingEnd.getTime() + writingMins * 60000);

    function formatCountdown(ms) {
        const total = Math.max(0, Math.floor(ms / 1000));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        const mm = String(m).padStart(2, '0');
        const ss = String(s).padStart(2, '0');
        return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
    }

    let intervalId;
    function tick() {
        const now = new Date();

        if (now < startTime) {
            const diff = startTime - now;
            timerEl.className = 'exam-timer timer-upcoming';
            timerEl.innerHTML = `<span class="timer-label">Starts in</span><span class="timer-time">${formatCountdown(diff)}</span>`;

        } else if (readingMins > 0 && now < readingEnd) {
            const diff = readingEnd - now;
            timerEl.className = 'exam-timer timer-reading';
            timerEl.innerHTML = `<span class="timer-label">Reading time</span><span class="timer-time">${formatCountdown(diff)}</span>`;

        } else if (writingMins > 0 && now < writingEnd) {
            const diff = writingEnd - now;
            const minsLeft = diff / 60000;
            const urgency = minsLeft <= 5 ? 'timer-danger' : minsLeft <= 10 ? 'timer-warning' : '';
            timerEl.className = `exam-timer timer-writing ${urgency}`;
            timerEl.innerHTML = `<span class="timer-label">Writing time</span><span class="timer-time">${formatCountdown(diff)}</span>`;

        } else {
            timerEl.className = 'exam-timer timer-done';
            timerEl.innerHTML = `<span class="timer-label">Time&rsquo;s up</span>`;
            clearInterval(intervalId);
        }
    }

    tick();
    intervalId = setInterval(tick, 1000);
}
