# PostureGuard AI

PostureGuard AI is a desktop application that uses computer vision to monitor sitting posture in real time. It uses MediaPipe Pose to track body landmarks and evaluate posture-related measurements such as neck tilt, forward head position, shoulder alignment, and spine lean.

The application is built with Electron, allowing it to run as a desktop application while the user works in other applications. It provides visual feedback, system notifications, and voice alerts when poor posture is detected.

## Features

### Real-Time Posture Monitoring

The application tracks several posture measurements using pose landmarks:

* Neck tilt
* Forward head lean
* Shoulder symmetry
* Spine lean

Posture is evaluated continuously rather than based on a single frame.

### Personalized Calibration

The application provides a calibration process that establishes a baseline for the user's normal sitting position.

The baseline accounts for differences in:

* Camera position
* Sitting height
* Body proportions
* Distance from the camera

This allows posture thresholds to be based on the user's calibrated position rather than fixed values alone.

### Eye-Strain Distance Monitoring

The system estimates the user's distance from the screen using the available pose information.

If the user moves significantly closer to the screen, the application can trigger an alert.

### Posture Stability Filtering

Small movements can cause temporary changes in pose measurements. A stability buffer is used to avoid generating alerts for short-lived deviations.

This reduces unnecessary notifications caused by normal movements.

## Alert System

### Desktop Notifications

PostureGuard can send native operating-system notifications when poor posture is detected.

These notifications can appear while the user is working in applications such as:

* Chrome
* VS Code
* Microsoft Word
* Other desktop applications

### Voice Feedback

The application uses the Web Speech API to provide audio feedback.

For example, when poor posture is detected, it can provide a short instruction such as:

> Sit straight.

### Monitoring Status

A live status indicator shows whether posture monitoring is currently active.

This provides a simple way to verify that the application is running and processing camera input.

## Reports and History

### Hourly Reports

The application records posture observations and provides hourly summaries showing the proportion of time spent in good and poor posture states.

### Persistent History

Posture information is stored locally so that daily and weekly trends can be reviewed over time.

The application does not require a cloud backend for storing this history.

### Achievements

A lightweight achievement system is included to encourage consistent usage.

Examples include:

* Perfect Hour
* Spine Warrior

Achievements are based on posture-related activity and usage patterns.

### Stretch Reminders

The application can provide a stretch reminder after approximately 50 minutes of continuous work.

Each reminder can include a different suggested stretching exercise.

## Monitoring Controls

### Sensitivity Modes

Users can select between three monitoring modes:

| Mode     | Description                               |
| -------- | ----------------------------------------- |
| Zen      | More relaxed thresholds with fewer alerts |
| Balanced | Default monitoring thresholds             |
| Strict   | More sensitive posture detection          |

### Focus Mode

Focus Mode allows users to define active monitoring hours.

For example:

```text
09:00 - 17:00
```

During these hours, posture monitoring and alerts remain active. Outside the configured period, the application remains quiet.

## How It Works

The basic processing pipeline is:

```text
Camera Input
     ↓
MediaPipe Pose Detection
     ↓
Body Landmark Extraction
     ↓
Posture Metric Calculation
     ↓
Calibration Baseline Comparison
     ↓
Stability Filtering
     ↓
Posture Classification
     ↓
Notification / Voice Feedback
     ↓
History and Reports
```

The application processes camera input locally and uses the detected pose landmarks to calculate posture metrics.

## Getting Started

### Prerequisites

* Node.js
* Latest LTS version recommended
* A webcam or built-in camera

### Installation

Clone the repository:

```bash
git clone https://github.com/your-username/posture-app.git
cd posture-app
```

Install the dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

## Usage

### 1. Launch the Application

Open PostureGuard AI and allow camera access when prompted.

### 2. Calibrate Your Posture

Sit in your preferred upright position and face the camera.

Select:

```text
Calibrate Baseline
```

The application records this position as the reference for subsequent posture monitoring.

### 3. Start Working

Once calibration is complete, continue working normally.

The application can remain open while other applications are placed over it.

### 4. Respond to Alerts

If the system detects that you have remained in a poor posture for longer than the configured threshold, it can provide a voice notification and desktop alert.

## Camera Usage

The application requires access to the camera while posture monitoring is enabled.

On some operating systems, minimizing the application may affect camera access depending on the system's privacy and background-processing behavior.

If camera processing stops after minimizing the application, keep the application window open and place your other work windows over it instead.

## Technology Stack

| Component       | Technology                     |
| --------------- | ------------------------------ |
| Desktop Runtime | Electron.js                    |
| Pose Detection  | MediaPipe Pose                 |
| Frontend        | HTML5, CSS3, JavaScript        |
| Visualization   | HTML5 Canvas, Chart.js         |
| Audio Feedback  | Web Speech API                 |
| Local Storage   | Browser/Electron local storage |

## Project Structure

A typical project structure is:

```text
posture-app/
├── main.js
├── renderer.js
├── index.html
├── styles.css
├── package.json
│
├── assets/
│
├── components/
│
├── services/
│
└── LICENSE
```

The exact structure may vary depending on the implementation.

## Privacy

PostureGuard AI is designed as a local desktop application.

Camera input is used for real-time posture analysis, while posture history and application settings are stored locally. No cloud service or external backend is required for the core monitoring functionality.

Users should still review the application's camera permissions and local storage behavior before deploying it in a production environment.

## Future Improvements

Potential improvements include:

* Better distance estimation using camera calibration
* Improved posture classification using temporal models
* Support for multiple camera configurations
* More detailed posture analytics
* Exportable posture reports
* Custom alert thresholds
* Improved background camera handling
* Cross-platform packaging for Windows, macOS, and Linux
* Optional privacy controls for automatic data deletion

## License

This project is distributed under the MIT License. See the `LICENSE` file for the complete license text.
