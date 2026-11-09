# Nepal Digital Education Ecosystem — Known Issues & Operational Considerations

**Document Version**: 2.0.0  
**Target Audience**: DevOps Engineers, System Administrators, and Deployment Teams  

---

## 1. Environment & Network Considerations

### MongoDB Local Loopback Connection
- **Observation**: Connecting to local MongoDB (`127.0.0.1:27017`) from restricted containerized runner environments or isolated sandboxes may fail if loopback TCP sockets are restricted by policy.
- **Operational Recommendation**: In production, supply a standard MongoDB Atlas connection URI or standalone replica set URI via the `MONGODB_URI` environment variable.

### Vite Config Native Ignore Warning
- **Observation**: During `vite build`, Vite v8.3.5 reports:
  `(!) Your Vite config uses features that are unsupported by configLoader: 'native' ... Set VITE_CONFIG_NATIVE_IGNORE_WARNING=true to suppress this warning.`
- **Impact**: Zero runtime or build impact. Build exits cleanly with code 0.
- **Resolution**: Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` in frontend `.env` to silence this informational notice.

---

## 2. AI Assistant & LLM Inference Modes

### Grounded Fallback vs External Live LLM Keys
- **Design Philosophy**: The platform's educational AI assistant is grounded in the official Nepal CDC textbooks. It uses dense vector chunk retrieval to find relevant textbook citations before generating answers.
- **Offline / Sandbox Operation**: When external LLM API keys (e.g. `GEMINI_API_KEY` or `OPENAI_API_KEY`) are omitted from `.env`, the system operates in **Deterministic Grounded Mode** (`LLMGroundingService.ts`). It generates structured educational responses and lesson plans formatted with verified CDC citations directly from the local vector chunks.
- **Production External Inference**: To enable live open-ended conversational generation via Gemini 1.5 / 2.0 Flash, add `GEMINI_API_KEY=your_key_here` to `backend/.env`.

---

## 3. Storage & CDC PDF Textbook Assets

- **Local Storage Path**: Textbooks are stored under `Nepal data/` and served via byte-range streaming from `uploads/textbooks/`.
- **Production Recommendation**: When deploying to multi-server cloud instances (AWS ECS, Google Cloud Run), mount a persistent cloud object volume (AWS S3, Google Cloud Storage, or MinIO) to store the 141 CDC textbooks, ensuring all container instances share access to the textbook binaries.

---

## 4. Nepal Academic Calendar & BS Conversion

- Academic year notation defaults to **Bikram Sambat (BS)**, such as `2081/2082`.
- Internal timestamps are stored in standard UTC Date objects, allowing international compatibility while rendering native BS labels in user interfaces.

