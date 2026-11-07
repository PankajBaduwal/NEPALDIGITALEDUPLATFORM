# AI Quiz Generation

The existing Quiz Studio button calls `POST /api/v1/quizzes/generate-ai`. If the subject's textbook is indexed, `RagGenerationService.quiz` retrieves the chapter's passages and asks Gemini for the requested question types (MCQ, multiple-correct, true/false, fill-blank, numerical, matching, short, descriptive).
Server-side checks drop questions with invalid or duplicate options, a correct index outside the options, non-numeric numerical answers, fewer than three matching pairs, and duplicate wording. Each question's explanation carries its textbook page reference. The response includes a validation summary and `reviewRequired: true`. The draft goes back to the Studio for editing; nothing is published here. If the subject is not indexed yet, the old template generator runs and the draft is marked `antiHallucinationVerified: false`.
Only teachers/admins reach the endpoint (students get 403). The teacher must teach the subject.
