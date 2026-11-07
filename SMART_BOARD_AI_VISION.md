# Smart Board AI Vision

The existing Smart Board (`smartboard/tools/ai-assistant.js`) already captures a selected object or region as an image and sends it with the board text to `POST /api/v1/ai/query`. That endpoint now routes board requests to `SmartBoardVisionService`: image (PNG/JPEG/WebP, max 3 MB, rejects empty/tiny captures) + board text + question + textbook passages for the teacher's own class/subject → Gemini multimodal.
- If the image cannot be read, the response says so (`readable:false`, status UNCLEAR) and asks for a clearer capture; it does not guess.
- The panel shows what was recognised, the answer, steps, formulas, related concepts and textbook sources. Copy and Insert-on-board are existing buttons; insertion is always teacher-initiated and the board is not modified otherwise.
- New quick actions: Explain This, Solve This, Step-by-Step, Summarize, Identify Formula, Explain Diagram, Similar Questions, Nepali, English, Related Textbook Content.
- Images are processed in memory and not stored. Student information is not sent to Gemini.
