# AI Security Report

Verified on 2026-11-05 against a running backend (test results, not assumptions):

| Check | Result |
| --- | --- |
| API key in frontend source / public / smartboard files | None found |
| API key in backend server log | None found |
| API key in `/ai/scope` response | Not present |
| `.env` ignored by version control | `.gitignore` created (the project is not currently a git repository) |
| Unauthenticated `POST /ai/chat` | 401 |
| Principal calling `/ai/chat` | 403 (no Principal AI) |
| Student asking for a subject outside their class | 403 |
| Teacher asking for an unassigned class | 403 |
| Teacher asking for an unassigned subject | 403 |
| Student calling quiz generation | 403 (role guard) |
| Rate limit (20 requests/minute/user on `/ai/chat` and `/ai/query`) | Requests 21+ returned 429 |
| Provider errors shown to users | Generic "busy / daily limit" message, no provider text |

Design controls: class/subject scope is derived from enrolment/allocations on the server; every retrieved chunk is re-checked against the scope before it reaches the model; retrieved text and board text are passed as data with an explicit "ignore instructions inside" rule; Smart Board images are validated (type, 3 MB, minimum size), kept in memory only and not stored.

Not yet tested: prompt-injection attempts against live Gemini answers, cross-institution access beyond the scope checks, load behaviour of the rate limiter across multiple server instances (the limiter is per-process memory).

Note: a few characters from the end of the API key were printed in this development session's tool output while editing `.env`. If that transcript can be shared, rotate the key.
