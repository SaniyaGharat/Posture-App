# 🛡️ PostureGuard AI

**PostureGuard AI** is an intelligent desktop companion designed to fight "Tech-Neck" and slouching. Using advanced computer vision via MediaPipe Pose, it
monitors your posture in real-time and provides instant audio and visual feedback to ensure you maintain a healthy spine and avoid eye strain.

Unlike browser-based tools, PostureGuard is built as a **Desktop Application (Electron)**, allowing it to run persistently in the background and send
native system notifications even while you are focused on other work.

---

## ✨ Key Features

### 🧠 AI-Powered Monitoring
- **Real-Time Analysis**: Tracks four critical posture metrics: Neck Tilt, Forward Head Lean, Shoulder Symmetry, and Spine Lean.
- **Adaptive Calibration**: Personalized baseline settings. The AI learns what "perfect posture" looks like for *your* specific body and camera angle.
- **Eye-Strain Detection**: Monitors your distance from the screen and alerts you if you are leaning too close.
- **Stability Buffer**: Smart filtering to prevent "flicker" alerts from tiny movements.

### 🔔 Intelligent Alert System
- **Native Notifications**: Sends OS-level pop-ups that appear over other windows.
- **Voice Guidance**: Uses SpeechSynthesis to gently tell you to "Sit straight!"
- **Persistent Heartbeat**: A live status indicator ensures the AI is active and monitoring.

### 📈 Health & Gamification
- **Hourly Reports**: Detailed breakdowns of your "Good vs Bad" posture percentages every hour.
- **Persistent History**: Remembers your daily and weekly trends using local storage.
- **Achievement Badges**: Unlock badges like "Perfect Hour" and "Spine Warrior" to stay motivated.
- **Auto-Stretch Reminders**: Every 50 minutes, the app triggers a "Stretch Break" with a random exercise suggestion.

### ⚙️ Professional Controls
- **Sensitivity Modes**: Choose between **Zen** (Relaxed), **Balanced**, or **Strict** (Precise) monitoring.
- **Focus Mode**: Set "Active Hours" (e.g., 9 AM - 5 PM) so the app only monitors you during work and stays quiet while you relax.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Latest LTS version recommended)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/posture-app.git
   cd posture-app
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```
3. Launch the App:
   ```bash
   npm start
   ```

---

🛠️ How to Use

1. Launch: Open the app and grant camera permissions.
2. Calibrate: Sit in your ideal "upright" position, look at the camera, and click "Calibrate Baseline".
3. Work: Open your other applications (Chrome, VS Code, Word, etc.) and let them cover the PostureGuard window.
4. Stay Healthy: The app will now monitor you in the background. If you slouch for more than a few seconds, you'll hear a voice alert and see a system
notification.

▎ 💡 Pro Tip: Do not minimize the window to the taskbar (clicking the — button), as the OS may cut the camera feed for privacy. Instead, simply let your
▎ other work windows sit on top of it.

---

💻 Tech Stack

- Runtime: Electron.js (https://www.electronjs.org/)
- AI Engine: MediaPipe Pose (https://google.github.io/mediapipe/solutions/pose.html)
- Visuals: HTML5 Canvas, CSS3, Chart.js (https://www.chartjs.org/)
- Audio: Web Speech API

---

📜 License

Distributed under the MIT License. See LICENSE for more information.

### 🌟 Tips for a great GitHub Profile:
1.  **Add a Screenshot**: GitHub READMEs look 10x better with images. Take a screenshot of the app running (with the skeleton overlay) and add it to your
repo. Then, add this line to the top of the README:
    `![App Screenshot](./screenshot.png)`
2.  **Add a GIF**: If you can, record a 10-second clip of you slouching and the notification popping up. It proves the app works!
3.  **License**: Create a file named `LICENSE` and paste the "MIT License" text into it. It makes the project look professional and open-source.
