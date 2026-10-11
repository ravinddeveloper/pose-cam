# PoseGenius AI - Android Setup & Build Guide

This document describes how to set up, develop, and build the PoseGenius AI Android mobile application.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v24.x`
- **Package Manager**: `npm` (with legacy peer dependency resolution configured in `.npmrc`)
- **Android Development Environment** (for native builds):
  - **Android Studio Ladybug** or newer
  - **JDK**: Java 17 (recommended: Eclipse Temurin 17 or Android Studio bundled JDK)
  - **Android SDK**: API Level 34 or 35
  - **Android SDK Build-Tools**: `35.0.0`
  - **Android Virtual Device (AVD)** or a physical Android device with Developer Mode & USB Debugging enabled

---

## 2. Quick Start (Development Mode)

### Step 1: Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Start Metro Bundler
```bash
npx expo start
```
- Press `a` in the terminal to launch on a running Android emulator.
- Scan the QR code using the **Expo Go** app on a physical Android device on the same local Wi-Fi.

---

## 3. Native Android Build (Continuous Native Generation)

PoseGenius AI uses Expo's Continuous Native Generation (CNG) with native Expo Modules. To compile native modules (including `expo-camera` and native MediaPipe modules):

### Step 1: Generate Native Android Project
```bash
npx expo prebuild --platform android
```
This generates the `android/` directory containing the native Gradle configuration, AndroidManifest.xml with camera permissions, and module bridges.

### Step 2: Build and Run on Android Device / Emulator
```bash
npx expo run:android
```
*Note: Ensure an Android device or emulator is running (`adb devices` lists the device).*

---

## 4. Cloud Builds via EAS (No Local Android Studio Required)

If you don't have Android Studio or Java installed locally, you can use Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to Expo account (free tier)
eas login

# Configure project
eas build:configure

# Build a standalone Android APK for testing
eas build --platform android --profile preview
```

The resulting `.apk` file can be directly downloaded and installed on any Android phone.

---

## 5. Testing & Verification Checklist

1. **Camera Permissions**:
   - On first launch of "Live Coach", the Android permission dialog for `android.permission.CAMERA` should display.
   - If denied, the app should display the friendly permission guidance card with an "Enable Camera" action.
2. **Offline Airplane Mode Test**:
   - Enable Airplane Mode on the device.
   - Launch app: All 100+ seed poses, category filters, detail screens, geometric stick-figure previews, and the rule-based AI Coach must work 100% offline.
3. **Capture & Timer**:
   - Test 3s, 5s, and 10s timer. Shutter button triggers countdown animation and captures photo into cache without crashing.
