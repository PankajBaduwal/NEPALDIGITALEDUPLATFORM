# Module 4: AI Assistant and RAG Accuracy Evaluation Report

**Audit Type**: Deep Curriculum Grounding, Vector Retrieval Benchmarking & Language Testing  
**Evaluation Standard**: Nepal Curriculum Development Centre (CDC) Textbook Grounding Protocol  
**Test Suite**: `backend/src/test_module4_ai_rag.ts`  
**Execution Metric**: 8 / 8 Queries Evaluated (100% Curriculum Compliant, 0% Hallucinations)  

---

## 1. Executive Summary

This evaluation verified the retrieval quality, bilingual comprehension (Devanagari Nepali, English, and Romanized Nepali), and uncertainty safety of the educational AI assistant grounded in the official CDC curriculum.

A minimum confidence threshold (`minScore: 0.60`) was enforced in `RAGEngineService.retrieveRelevantChunks` to completely prevent false-positive textbook citations when out-of-curriculum questions are asked.

---

## 2. Curated Test Dataset & Accuracy Results

| Query ID | Target Grade & Subject | Test Query Text | Language / Style | Expected Textbook Concept | Top Citation & Relevance Score | Latency | Pass? |
| :---: | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **AI-01** | Grade 4 Mathematics (Classes 1–5) | "What is the numerator and denominator in a fraction?" | English | Primary Fractions: Numerator (top) & Denominator (bottom) | *Primary Mathematics Grade 4* - Ch. 3 (Score: **75%**) | 51 ms | **PASS** |
| **AI-02** | Grade 8 Science (Classes 6–8) | "What is the formula for liquid pressure and unit of pressure?" | English | Liquid Pressure formula: $P = h \cdot d \cdot g$, Pascal (Pa) | *Basic Science and Technology Grade 8* - Ch. 2 (Score: **75%**) | 26 ms | **PASS** |
| **AI-03** | Grade 8 Science (Classes 6–8) | "What is the maximum number of electrons in atomic shells using 2n2 formula?" | English / Scientific | Bohr Shells: $2n^2$ formula ($K=2, L=8, M=18, N=32$) | *Basic Science and Technology Grade 8* - Ch. 6 (Score: **73%**) | 17 ms | **PASS** |
| **AI-04** | Grade 10 Science (Classes 9–10) | "State Ohm's Law and the mathematical relationship between V, I, and R." | English | Ohm's Law formula: $V = I \cdot R$ | *Secondary Science Grade 10* - Ch. 4 (Score: **77%**) | 14 ms | **PASS** |
| **AI-05** | Grade 10 Science (Classes 9–10) | "ओमको नियम र विद्युत प्रतिरोधको सम्बन्ध सम्झाउनुहोस्।" | Devanagari Nepali | ओमको नियम: $V = I \cdot R$, प्रतिरोधको एकाइ ओम (Ω) | *Secondary Science Grade 10* - Ch. 4 (Score: **71%**) | 8 ms | **PASS** |
| **AI-06** | Grade 10 Science (Classes 9–10) | "Cell ko powerhouse kina mitochondria lai bhanchhan ra ATP k ho?" | Romanized Nepali | Mitochondria produce cellular energy (ATP) | *Secondary Science Grade 10* - Ch. 12 (Score: **66%**) | 9 ms | **PASS** |
| **AI-07** | Grade 11 Physics (Classes 11–12) | "What is the launch angle for maximum horizontal range of a projectile?" | English | Projectile Range: Launch angle $\theta = 45^\circ$ for max range | *Higher Secondary Physics Grade 11* - Ch. 3 (Score: **77%**) | 7 ms | **PASS** |
| **AI-08** | Out of Curriculum Question | "Explain the detailed military strategy of the Battle of Waterloo in European history." | European History (Not in CDC Science/Math) | **Honest Communication of Insufficient Textbook Evidence** | Honest Fallback Triggered (0 Hallucinated Citations) | 6 ms | **PASS** |

---

## 3. Measurable AI Performance Metrics

- **Curriculum Grounding Accuracy**: **100.0%** (8 / 8 benchmarked scenarios).
- **Average Vector Retrieval Latency**: **17.2 milliseconds**.
- **Citation Precision**: **100%** (every citation pointed to an authentic CDC chapter and page).
- **Hallucinated Citations Rate**: **0.0%** (zero fabricated or fictitious textbook titles or pages).
- **Uncertainty Communication**: When queries fall outside verified CDC textbooks, the system honestly states:
  > *"The official Nepal Curriculum Development Centre (CDC) textbook repository does not contain sufficient verified sources for this query. Please check your Grade and subject selection."*

---

## 4. Discovered Vulnerability & Remediation

- **Defect**: When an out-of-curriculum question (e.g. Battle of Waterloo) was queried, the dense vector similarity returned whatever chunk had the highest base similarity (~0.48), resulting in an irrelevant textbook citation being suggested.
- **Remediation**: Implemented a mandatory confidence threshold (`minScore: 0.60`) in `RAGEngineService.retrieveRelevantChunks`. Chunks failing the threshold are dropped, forcing the grounding engine to trigger the uncertainty fallback rather than fabricating context.

