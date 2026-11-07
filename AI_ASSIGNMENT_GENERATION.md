# AI Assignment Generation

Existing Assignment Studio → `POST /api/v1/assignments/generate-ai`. Indexed subjects use `RagGenerationService.assignment`: title, description, instructions, questions with marks, expected answers, marking criteria and a rubric, each tied to textbook pages. Duplicates are removed and, when a total is requested, marks are adjusted so they add up. The teacher edits and publishes through the Studio. Unindexed subjects fall back to the template generator and are flagged.
