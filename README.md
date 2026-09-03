# SIH 26104 Frontend

Responsive frontend foundation for **SIH 26104 — AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks**.

The current prototype implements the minimum end-to-end user flow:

`10–30 second audio → analysis request → risk score → explanation/warning → SHA-256 evidence fingerprint`

The interface is intentionally built to survive beyond the one-day prototype. It uses the team's frozen response contract, so mock data can be replaced by the Spring Boot `/analyze` endpoint without redesigning the result dashboard.

## Stack

- React
- TypeScript
- Vite
- Plain CSS
- Browser `fetch`, Web Crypto, and native audio metadata APIs

No state library, component library, animation package, HTTP wrapper, or schema dependency is required for the current scope.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run build
```

## Backend integration

The app runs in clearly labelled **Demo mode** when no API URL is configured.

Copy `.env.example` to `.env.local` and set:

```text
VITE_ANALYSIS_API_URL=http://localhost:8080
```

The frontend sends:

```http
POST /analyze
Content-Type: multipart/form-data
```

with the audio file in the `audio` field.

Expected response:

```json
{
  "riskScore": 94,
  "riskLevel": "HIGH",
  "deepfakeProbability": 0.91,
  "speakerSimilarity": 0.38,
  "fraudIndicators": ["urgent_money_request", "impersonation"],
  "recommendation": "VERIFY_CALLER"
}
```

The response is validated at runtime before rendering. `speakerSimilarity` may be `null` when that signal is unavailable.

## Prototype safety and honesty

- Demo values are visibly labelled and are not presented as real model output.
- The frontend does not persist raw audio.
- The SHA-256 fingerprint is computed from the final analysis JSON, not from raw audio.
- Live telecom interception, streaming inference, production authentication, and full case management are intentionally outside the current frontend scope.
