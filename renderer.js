const videoElement = document.createElement('video');
videoElement.style.display = 'none';
document.body.appendChild(videoElement);

const canvasElement = document.getElementById('webcam-canvas');
const canvasCtx = canvasElement.getContext('2d');
const banner = document.getElementById('status-banner');
const scoreValue = document.getElementById('score-value');
const goodPctText = document.getElementById('good-pct');
const badPctText = document.getElementById('bad-pct');
const goodProgressBar = document.getElementById('good-progress');
const badProgressBar = document.getElementById('bad-progress');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const loadingScreen = document.getElementById('loading');

let baseline = null, totalFrames = 0, goodFrames = 0, badFrames = 0;
let lastSpeechTime = 0, scoreHistory = [], lastLandmarks = null, sessionStartTime = Date.now();
let badFrameStreak = 0;

const AppSettings = {
    sensitivity: localStorage.getItem('posture_sens') || 'balanced',
    startHour: parseInt(localStorage.getItem('posture_start'), 10) || 9,
    endHour: parseInt(localStorage.getItem('posture_end'), 10) || 17,
    history: JSON.parse(localStorage.getItem('posture_history')) || {},
    badges: JSON.parse(localStorage.getItem('posture_badges')) || { first: false, streak: false, perfect: false, warrior: false },
    hoursTracked: parseInt(localStorage.getItem('posture_hours'), 10) || 0
};

function saveSettings() {
    localStorage.setItem('posture_sens', AppSettings.sensitivity);
    localStorage.setItem('posture_start', AppSettings.startHour);
    localStorage.setItem('posture_end', AppSettings.endHour);
    localStorage.setItem('posture_badges', JSON.stringify(AppSettings.badges));
    localStorage.setItem('posture_hours', AppSettings.hoursTracked);
}

function saveDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const ratio = totalFrames > 0 ? (goodFrames / totalFrames) : 0;
    AppSettings.history[today] = ratio;
    localStorage.setItem('posture_history', JSON.stringify(AppSettings.history));
    const recentDays = Object.keys(AppSettings.history).sort().slice(-3);
    AppSettings.badges.streak = recentDays.length === 3 && recentDays.every(day => AppSettings.history[day] >= 0.75);
    if (AppSettings.hoursTracked >= 10) AppSettings.badges.warrior = true;
    saveSettings();
}

const stretches = [
    'Roll your shoulders back and down for 10 seconds.',
    'Gently tilt your head to the left, then right.',
    'Stand up and reach for the sky!',
    'Gently rotate your neck in a slow circle.',
    'Stretch your arms wide and pull your shoulder blades together.'
];

function triggerStretch() {
    const suggestion = stretches[Math.floor(Math.random() * stretches.length)];
    document.getElementById('stretch-suggestion').innerText = suggestion;
    document.getElementById('stretch-modal').style.display = 'flex';
}

setInterval(triggerStretch, 50 * 60 * 1000);

const ctxChart = document.getElementById('scoreChart').getContext('2d');
const scoreChart = new Chart(ctxChart, {
    type: 'line',
    data: { labels: Array(60).fill(''), datasets: [{ data: [], borderColor: '#bb86fc', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true, backgroundColor: 'rgba(187, 134, 252, 0.1)' }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { display: false }, y: { min: 0, max: 100, display: false } }, plugins: { legend: { display: false } }, animation: false }
});

function updateScoreChart(score) {
    scoreHistory.push(score);
    if (scoreHistory.length > 60) scoreHistory.shift();
    scoreChart.data.datasets[0].data = scoreHistory;
    scoreChart.update();
}

function triggerAlert(msg) {
    const now = Date.now();
    if (now - lastSpeechTime > 10000) {
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
        if (window.electronAPI) window.electronAPI.sendNotification('PostureGuard AI', msg);
        lastSpeechTime = now;
    }
}

function calculateMidpoint(p1, p2) { return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }; }

function analyzePosture(landmarks) {
    if (!landmarks) return null;
    const nose = landmarks[0], lEar = landmarks[7], rEar = landmarks[8], lShoulder = landmarks[11], rShoulder = landmarks[12], lHip = landmarks[23], rHip = landmarks[24];
    const shoulderMid = calculateMidpoint(lShoulder, rShoulder);
    const hipMid = calculateMidpoint(lHip, rHip);
    const eyeDist = Math.abs(landmarks[1].x - landmarks[2].x);
    const isTooClose = eyeDist > 0.12;

    const features = {
        neckTilt: Math.abs((lEar.x + rEar.x) / 2 - shoulderMid.x),
        forwardHead: Math.abs(nose.x - shoulderMid.x),
        shoulderSymmetry: Math.abs(lShoulder.y - rShoulder.y),
        spineLean: Math.abs(shoulderMid.x - hipMid.x)
    };
    if (!baseline) return { status: 'CALIBRATING', score: 100, issues: ['Please Calibrate'], features };

    const diffs = { neck: Math.abs(features.neckTilt - baseline.neckTilt), head: Math.abs(features.forwardHead - baseline.forwardHead), sym: Math.abs(features.shoulderSymmetry - baseline.shoulderSymmetry), lean: Math.abs(features.spineLean - baseline.spineLean) };
    let multiplier = 1.0;
    if (AppSettings.sensitivity === 'zen') multiplier = 2.0;
    if (AppSettings.sensitivity === 'strict') multiplier = 0.5;
    const THRESHOLDS = { neck: 0.08 * multiplier, head: 0.08 * multiplier, sym: 0.06 * multiplier, lean: 0.10 * multiplier };

    let issues = [];
    if (isTooClose) issues.push('Too close to screen!');
    if (diffs.neck > THRESHOLDS.neck) issues.push('Neck tilt detected');
    if (diffs.head > THRESHOLDS.head) issues.push('Head too far forward');
    if (diffs.sym > THRESHOLDS.sym) issues.push('Shoulders uneven');
    if (diffs.lean > THRESHOLDS.lean) issues.push('Slouching detected');

    let status = 'GOOD'; let score = 100;
    if (issues.length > 0) { score = 100 - (issues.length * 20); status = issues.length === 1 ? 'WARNING' : 'BAD'; }
    return { status, score, issues, features };
}

function onResults(results) {
    const currentHour = new Date().getHours();
    if (currentHour < AppSettings.startHour || currentHour >= AppSettings.endHour) {
        statusDot.className = 'dot';
        statusText.innerText = 'QUIET MODE';
        return;
    }

    statusDot.className = 'dot active';
    statusText.innerText = 'RUNNING';

    if (!results.poseLandmarks) return;
    lastLandmarks = results.poseLandmarks;
    const analysis = analyzePosture(results.poseLandmarks);
    if (!analysis) return;

    totalFrames++;
    if (analysis.status === 'GOOD') { goodFrames++; badFrameStreak = 0; }
    else if (analysis.status === 'BAD') { badFrames++; badFrameStreak++; }

    banner.innerText = analysis.issues.length > 0 ? analysis.issues[0] : 'Posture is Great!';
    banner.style.backgroundColor = analysis.status === 'GOOD' ? 'var(--good-color)' : (analysis.status === 'WARNING' ? 'var(--warning-color)' : 'var(--bad-color)');
    banner.style.color = analysis.status === 'WARNING' ? '#000' : '#fff';
    scoreValue.innerText = analysis.score;
    scoreValue.style.color = analysis.status === 'GOOD' ? 'var(--good-color)' : (analysis.status === 'WARNING' ? 'var(--warning-color)' : 'var(--bad-color)');
    updateScoreChart(analysis.score);

    const gPct = Math.round((goodFrames / totalFrames) * 100);
    const bPct = Math.round((badFrames / totalFrames) * 100);
    goodPctText.innerText = gPct + '%'; badPctText.innerText = bPct + '%';
    goodProgressBar.style.width = gPct + '%'; badProgressBar.style.width = bPct + '%';

    if (analysis.status === 'BAD' && badFrameStreak >= 10) { triggerAlert('Sit straight! ' + analysis.issues[0]); }

    document.getElementById('s-neck').innerText = `Neck Tilt: ${analysis.features.neckTilt.toFixed(3)}`;
    document.getElementById('s-head').innerText = `Forward Head: ${analysis.features.forwardHead.toFixed(3)}`;
    document.getElementById('s-shoulder').innerText = `Symmetry: ${analysis.features.shoulderSymmetry.toFixed(3)}`;
    document.getElementById('s-spine').innerText = `Spine Lean: ${analysis.features.spineLean.toFixed(3)}`;

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    drawSkeleton(canvasCtx, results.poseLandmarks, analysis.status);
    canvasCtx.restore();
}

function drawSkeleton(ctx, landmarks, status) {
    const color = status === 'GOOD' ? '#4caf50' : (status === 'WARNING' ? '#ffeb3b' : '#f44336');
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3;
    const points = [0, 7, 8, 11, 12, 13, 14, 15, 16, 23, 24];
    const connections = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24]];
    points.forEach(idx => { const p = landmarks[idx]; if (!p) return; ctx.beginPath(); ctx.arc(p.x * canvasElement.width, p.y * canvasElement.height, 4, 0, Math.PI * 2); ctx.fill(); });
    connections.forEach(([start, end]) => {
        const p1 = landmarks[start], p2 = landmarks[end]; if (!p1 || !p2) return;
        ctx.beginPath(); ctx.moveTo(p1.x * canvasElement.width, p1.y * canvasElement.height); ctx.lineTo(p2.x * canvasElement.width, p2.y * canvasElement.height); ctx.stroke();
    });
}

function updateBadges() {
    document.getElementById('badge-first').className = AppSettings.badges.first ? 'badge unlocked' : 'badge';
    document.getElementById('badge-streak').className = AppSettings.badges.streak ? 'badge unlocked' : 'badge';
    document.getElementById('badge-perfect').className = AppSettings.badges.perfect ? 'badge unlocked' : 'badge';
    document.getElementById('badge-warrior').className = AppSettings.badges.warrior ? 'badge unlocked' : 'badge';
}

updateBadges();

const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

// 3. THE SYSTEM-DRIVEN AI LOOP
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        videoElement.srcObject = stream;
        videoElement.play();

        videoElement.onloadedmetadata = () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            loadingScreen.style.display = 'none';

            // INSTEAD OF setInterval, we listen to the Main Process "Heartbeat"
            if (window.electronAPI) {
                window.electronAPI.onAITick(async () => {
                    await pose.send({ image: videoElement });
                });
            } else {
                // Fallback for browser mode
                setInterval(async () => { await pose.send({ image: videoElement }); }, 100);
            }
        };
    } catch (err) {
        loadingScreen.innerHTML = `<div style="color: #f44336; text-align: center; padding: 20px;"><h2>CAMERA ERROR</h2><p>${err.message}</p><button onclick="location.reload()">Retry</button></div>`;
    }
}

startCamera();

document.getElementById('calibrate-btn').onclick = () => {
    if (!lastLandmarks) return alert('No pose detected.');
    const nose = lastLandmarks[0], lEar = lastLandmarks[7], rEar = lastLandmarks[8], lShoulder = lastLandmarks[11], rShoulder = lastLandmarks[12], lHip = lastLandmarks[23], rHip = lastLandmarks[24];
    const shoulderMid = calculateMidpoint(lShoulder, rShoulder);
    baseline = {
        neckTilt: Math.abs((lEar.x + rEar.x) / 2 - shoulderMid.x),
        forwardHead: Math.abs(nose.x - shoulderMid.x),
        shoulderSymmetry: Math.abs(lShoulder.y - rShoulder.y),
        spineLean: Math.abs(shoulderMid.x - calculateMidpoint(lHip, rHip).x)
    };
    banner.innerText = 'Calibrated!';
    banner.style.backgroundColor = 'var(--accent-color)';
    AppSettings.badges.first = true;
    updateBadges();
    saveSettings();
};

document.getElementById('open-settings').onclick = () => {
    document.getElementById('setting-sensitivity').value = AppSettings.sensitivity;
    document.getElementById('setting-start').value = AppSettings.startHour;
    document.getElementById('setting-end').value = AppSettings.endHour;
    document.getElementById('settings-modal').style.display = 'flex';
};

document.getElementById('save-settings').onclick = () => {
    AppSettings.sensitivity = document.getElementById('setting-sensitivity').value;
    AppSettings.startHour = parseInt(document.getElementById('setting-start').value, 10);
    AppSettings.endHour = parseInt(document.getElementById('setting-end').value, 10);
    saveSettings();
    document.getElementById('settings-modal').style.display = 'none';
};

document.getElementById('close-stretch').onclick = () => { document.getElementById('stretch-modal').style.display = 'none'; };

document.getElementById('close-report').onclick = () => { document.getElementById('report-modal').style.display = 'none'; };

setInterval(() => {
    const elapsed = Date.now() - sessionStartTime;
    if (elapsed >= 3600000) {
        const gPct = Math.round((goodFrames / totalFrames) * 100) || 0;
        const bPct = Math.round((badFrames / totalFrames) * 100) || 0;
        if (gPct === 100) AppSettings.badges.perfect = true;
        AppSettings.hoursTracked += 1;
        if (AppSettings.hoursTracked >= 10) AppSettings.badges.warrior = true;
        updateBadges();
        saveSettings();
        saveDailyStats();
        document.getElementById('report-details').innerHTML = `<p><b>Time:</b> 1 Hour</p><p><b>Good:</b> ${gPct}%</p><p><b>Bad:</b> ${bPct}%</p><p><b>Verdict:</b> ${gPct > 80 ? 'Amazing!' : 'Stretch now!'}</p>`;
        document.getElementById('report-modal').style.display = 'flex';
        sessionStartTime = Date.now();
    }
}, 60000);
