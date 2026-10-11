# PoseGenius AI - Image Sourcing & Legal Compliance

This document outlines the legal compliance, licensing terms, and media sourcing strategy of PoseGenius AI.

---

## 1. Zero Copyrighted Assets Bundled

To respect intellectual property rights and ensure the app can be distributed freely worldwide:
- **Local Seed Dataset**: Comprises 100+ meticulously drafted, original pose positioning instructions covering head, shoulders, arms, hands, torso, legs, feet, camera angle, and lighting.
- **Geometric Vector Visualizations**: Instead of bundling unverified images, the app renders procedural geometric diagrams via `PoseStickFigure` (using `react-native-svg`). This provides intuitive posture silhouettes with zero copyright exposure.

---

## 2. Online Discovery Sources

When users search for live references in the **Discover Online** tab, results are obtained strictly through legitimate, documented open-access APIs:

### A. Openverse (Formerly Creative Commons Search)
- **API**: `https://api.openverse.org/v1/images/`
- **Supported Licenses**:
  - `CC0` (Public Domain Dedication)
  - `CC BY` (Attribution)
  - `CC BY-SA` (Attribution-ShareAlike)
  - `PDM` (Public Domain Mark)
- **Compliance Rules**:
  - The app preserves and renders the creator's name, license type, and direct link to the original foreign landing page.
  - Images are loaded remotely via permitted CDN thumbnails without unlicensed redistribution.

### B. Wikimedia Commons
- **API**: `https://commons.wikimedia.org/w/api.php`
- **User-Agent Policy**: Follows Wikimedia's required User-Agent identification standard.
- **Attribution Display**: Automatically extracts `extmetadata` (`Artist`, `LicenseShortName`, `LicenseUrl`) and surfaces an attribution banner beneath every item.

---

## 3. Strict Anti-Scraping Policy

- **No Scraping**: The app does **NOT** scrape Instagram, Pinterest, Google Images, or proprietary fashion blogs.
- **Direct Search Fallback**: When an API search returns limited results, the app provides a button that opens the user's default web browser with the query on public search engines (e.g., DuckDuckGo Images). This ensures the user can find inspiration without the app violating third-party terms of service.

---

## 4. User Content & Data Removal

- Users can remove any saved or discovered pose from their favorites at any time with a single tap.
- A **Clear All Saved Data** option in Settings completely wipes all stored references and cache from the device.
