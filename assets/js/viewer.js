import { firebaseConfig } from './config.js';

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    const proxyFrame = document.getElementById('proxyFrame');
    const displayFrame = document.getElementById('displayFrame');
    const backBtn = document.getElementById('backBtn');

    // Get assessment data from session storage
    const examData = JSON.parse(sessionStorage.getItem('examData') || '{}');
    sessionStorage.removeItem('examData');

    if (examData && examData.url) {
        document.title = examData.title || 'Assessment Viewer';

        if (examData.title) {
            const titleParts = examData.title.split(' - ');
            document.getElementById('gradeSubject').textContent = titleParts[0] || 'Subject';
            document.getElementById('assessmentType').textContent = titleParts[1] || 'Assessment';
        } else {
            document.getElementById('gradeSubject').textContent = `Grade ${examData.grade} - ${examData.subject}`;
            document.getElementById('assessmentType').textContent = examData.type || 'Assessment';
        }

        const today = new Date();
        const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        document.getElementById('assessmentDate').textContent =
            examData.scheduledDate || today.toLocaleDateString('en-ZA', dateOptions);

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
    initBroadcast(db);

    backBtn.addEventListener('click', function () {
        window.location.href = './';
    });
});

// ─── Broadcast ────────────────────────────────────────────────────────────────

function initBroadcast(db) {
    const banner = document.getElementById('broadcastBanner');
    const messageEl = document.getElementById('broadcastMessage');
    if (!banner || !messageEl) return;

    db.collection('broadcasts').doc('current').onSnapshot(doc => {
        if (doc.exists && doc.data().active && doc.data().message) {
            messageEl.textContent = doc.data().message;
            banner.style.display = 'flex';
        } else {
            banner.style.display = 'none';
        }
    }, () => {
        // Broadcasts collection may not exist yet — fail silently
    });
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function initTimer(examData) {
    const timerEl = document.getElementById('examTimer');
    if (!timerEl) return;

    const readingMins = examData.readingTime || 0;
    const writingMins = examData.writingTime || 0;
    const hasTimer = (readingMins > 0 || writingMins > 0) && examData.scheduledISO;

    if (!hasTimer) {
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

    let currentPhase = null;
    let warned10 = false;
    let warned5 = false;
    let intervalId;

    function tick() {
        const now = new Date();
        let newPhase;

        if (now < startTime) {
            newPhase = 'upcoming';
        } else if (readingMins > 0 && now < readingEnd) {
            newPhase = 'reading';
        } else if (writingMins > 0 && now < writingEnd) {
            newPhase = 'writing';
        } else {
            newPhase = 'done';
        }

        // Phase transition events
        if (currentPhase !== null && currentPhase !== newPhase) {
            if (newPhase === 'reading') {
                playChime('transition');
            } else if (newPhase === 'writing') {
                showPhaseOverlay('Reading time is over', 'You may now begin writing', '✏️');
                playChime('transition');
            } else if (newPhase === 'done') {
                playChime('timeup');
            }
        }
        currentPhase = newPhase;

        // Writing phase warnings
        if (newPhase === 'writing') {
            const minsLeft = (writingEnd - now) / 60000;
            if (minsLeft <= 10 && !warned10) {
                warned10 = true;
                playChime('warning1');
            }
            if (minsLeft <= 5 && !warned5) {
                warned5 = true;
                playChime('warning2');
            }
        }

        // Update display
        if (newPhase === 'upcoming') {
            timerEl.className = 'exam-timer timer-upcoming';
            timerEl.innerHTML = `<span class="timer-label">Starts in</span><span class="timer-time">${formatCountdown(startTime - now)}</span>`;
        } else if (newPhase === 'reading') {
            timerEl.className = 'exam-timer timer-reading';
            timerEl.innerHTML = `<span class="timer-label">Reading time</span><span class="timer-time">${formatCountdown(readingEnd - now)}</span>`;
        } else if (newPhase === 'writing') {
            const diff = writingEnd - now;
            const minsLeft = diff / 60000;
            const urgency = minsLeft <= 5 ? 'timer-danger' : minsLeft <= 10 ? 'timer-warning' : '';
            timerEl.className = `exam-timer timer-writing ${urgency}`;
            timerEl.innerHTML = `<span class="timer-label">Writing time</span><span class="timer-time">${formatCountdown(diff)}</span>`;
        } else {
            timerEl.className = 'exam-timer timer-done';
            timerEl.innerHTML = `<span class="timer-label">Time\u2019s up</span>`;
            clearInterval(intervalId);
        }
    }

    tick();
    intervalId = setInterval(tick, 1000);
}

// ─── Phase Overlay ────────────────────────────────────────────────────────────

function showPhaseOverlay(title, subtitle, icon) {
    const overlay = document.getElementById('phaseOverlay');
    if (!overlay) return;

    document.getElementById('overlayIcon').textContent = icon;
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlaySubtitle').textContent = subtitle;
    overlay.style.display = 'flex';

    let count = 5;
    document.getElementById('overlayCountdown').textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(interval);
            overlay.style.display = 'none';
        } else {
            document.getElementById('overlayCountdown').textContent = count;
        }
    }, 1000);
}

// ─── Sound ────────────────────────────────────────────────────────────────────

function playChime(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Sequences: { f = frequency Hz, d = duration seconds }
        const sequences = {
            transition: [{ f: 392, d: 0.28 }, { f: 494, d: 0.28 }, { f: 587, d: 0.55 }], // G4 B4 D5 — ascending
            warning1:   [{ f: 440, d: 0.65 }],                                             // A4 — single soft bell
            warning2:   [{ f: 440, d: 0.38 }, { f: 440, d: 0.38 }],                        // A4 A4 — double bell
            timeup:     [{ f: 587, d: 0.28 }, { f: 494, d: 0.28 }, { f: 392, d: 0.55 }],  // D5 B4 G4 — descending
        };

        const seq = sequences[type] || [];
        let t = ctx.currentTime + 0.05;

        seq.forEach(({ f, d }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = f;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + d);
            osc.start(t);
            osc.stop(t + d + 0.05);
            t += d * 0.82;
        });

        setTimeout(() => ctx.close(), (t + 1) * 1000);
    } catch (e) {
        // Audio not available — fail silently
    }
}
