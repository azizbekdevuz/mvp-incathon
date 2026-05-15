# Security policy

## Threat model (what this project is)

**mvp-incathon** is a **static + client-side** Next.js application:

- No first-party HTTP API routes, database, or user accounts in the current tree.  
- Game state lives in **React state** in the browser session.  
- Scenario and speak content ship as **TypeScript modules** in the repo (public at build time).

Do not send real credentials, government IDs, health data, or other sensitive personal information into the app as “test content” in public issues or screenshots.

## Browser permissions

### Microphone (speak mode)

`/speak` can request **microphone access** so the browser’s **Web Speech API** can produce a text transcript. Audio is handled by the **browser/OS speech pipeline**, not by custom server code in this repository.

- Users can **deny** permission; the UI still offers **demo** and **practice self-pass** flows.  
- Maintainers cannot control vendor logging or retention policies for speech — that is governed by the user’s browser and OS.

### Clipboard, geolocation, etc.

Not used by the shipped MVP. If a future PR adds them, it must document **why** and default to least privilege.

## Speech recognition limitations

- Transcripts can be **wrong**, **empty**, or **late**; scoring is **fuzzy text match**, not certified language assessment.  
- Do not rely on this project for safety-critical or compliance-critical “authentication by voice.”

## Reporting vulnerabilities

If you believe you found a **security vulnerability in this repository’s code** (e.g., unsafe dynamic code execution, dependency confusion in build scripts, XSS in rendered user content):

1. **Do not** open a public issue with exploit details.  
2. Use **GitHub Security Advisories** for this repo (Maintainers → Security) if enabled, or contact maintainers privately if another channel exists.

Because the app is mostly static React, many “findings” will be **non-issues** (e.g., “user can read their own transcript in DevTools”). Valid reports usually involve **unsafe HTML injection**, **supply-chain** issues in dependencies, or **build** scripts.

## Responsible disclosure

Give maintainers a reasonable window to patch before public disclosure. If no response, use your judgment; this is a small OSS/hackathon project with no SLA.

## Out of scope (for this policy)

- Social engineering of individual maintainers  
- Spam or dependency update noise without a demonstrated exploit path  

## Demo / hackathon note

Live demos may run on untrusted Wi‑Fi. That is an **operational** risk (network adversaries), not something this frontend repo can solve. Use HTTPS hosting where possible.
