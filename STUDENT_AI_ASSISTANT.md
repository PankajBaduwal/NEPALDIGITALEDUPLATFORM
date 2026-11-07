# Student AI Learning Assistant

Student Dashboard → Practice & AI → AI Learning Assistant (`components/ai/AIAssistantPanel.tsx`, `role="STUDENT"`).
- Class, section, medium and subjects come from the student's enrolment and section allocations on the server. A request cannot widen them: another class is ignored, another subject returns 403.
- Chat with history, new/clear conversation, subject filter, answer language (auto/English/Nepali), suggested questions, loading and error states, thumbs feedback.
- Answers show a badge: from your textbook / partly / general explanation / not found. Sources list the book, chapter and page; "Open page" opens the existing PDF reader at that page.
- Maths renders with KaTeX. Follow-ups use the last six messages for context but cannot change the scope.
- Uses the existing feature flag `AI_STUDENT_ACCESS` and the daily query quota.
