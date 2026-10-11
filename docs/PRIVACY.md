# PoseGenius AI - Privacy & Security Policy

Your privacy is paramount. PoseGenius AI is engineered with a **local-first, privacy-by-design** architecture.

---

## 1. Zero Cloud Uploads of Camera Frames

- **Real-Time Guidance**: When you open the **Live Camera Coach**, camera frames are processed directly on your smartphone's hardware.
- **No Background Transmission**: Video frames and camera streams are **NEVER** sent to our servers, third-party clouds, or AI APIs.
- **Local Vision**: Body landmark calculations (head, arms, torso, legs) are computed on-device.

---

## 2. No Mandatory User Accounts

- PoseGenius AI requires **no account registration**, no sign-up, no email address, and no phone number.
- You can use 100% of the core app anonymously out of the box.

---

## 3. Storage of Captured Photos

- Photos you take using the in-app shutter button are saved locally to your device's temporary cache.
- The app will never silently sync, upload, or share your captured photos with any online service.

---

## 4. Personal Preferences & Favorites

- All saved favorites, recent viewing history, and custom pose notes are stored strictly inside your phone's local storage (`AsyncStorage`).
- If you uninstall the app or press **Delete All Saved Data & Favorites** in the Settings screen, this information is wiped permanently from your device.

---

## 5. Third-Party AI Services (Optional Only)

- The default AI engine is 100% offline and rule-based.
- If you choose to configure a custom online AI provider in Settings:
  - Only text prompts (e.g. "solo travel photo near waterfall") are transmitted to your configured endpoint.
  - Camera photos are **NEVER** sent to online AI endpoints without explicit user action and confirmation.
  - Your custom API keys are saved locally on your phone and never transmitted to PoseGenius AI developers.

---

## 6. Permissions Requested

| Permission | Purpose |
| :--- | :--- |
| `CAMERA` | Required exclusively to display the live camera preview and capture photos upon pressing the shutter button. |

You can revoke camera permissions at any time through your Android System Settings (`Settings > Apps > PoseGenius AI > Permissions`).
