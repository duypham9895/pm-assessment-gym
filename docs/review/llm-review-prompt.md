# LLM Review Prompt For PM Assessment Gym

Use this prompt with another LLM to review the system blueprint.

## Prompt

I am preparing for a Product Manager interview assessment on exam day, 2026-05-22. I want to build a local web app called PM Assessment Gym to practice timed PM assessments, especially Alooba-style Senior PM mock tests.

Please review the attached blueprint:

`docs/superpowers/specs/2026-05-18-pm-assessment-gym-system-blueprint.md`

I want you to critique it like a senior product manager, senior engineer, and interview coach. Please be direct and practical.

Review these areas:

1. Deadline realism:
   - What can realistically be built before exam day?
   - What should be cut from the pre-MVP?
   - What is the fastest path to interview usefulness?

2. PM assessment coverage:
   - Are the topics enough for a Senior PM assessment?
   - Are any important PM interview skills missing?
   - Are the proposed drills and case modes useful?

3. Product design:
   - Is the user flow clear?
   - Is the feedback loop strong enough?
   - Does the system help the user improve or only measure performance?

4. Technical design:
   - Is the architecture simple enough?
   - Is the proposed data model enough?
   - Is localStorage acceptable for the MVP?
   - What should be changed before implementation?

5. Build plan:
   - Are the phases in the right order?
   - Which phase should be built first?
   - Which phase creates the most learning value?
   - Which phase is unnecessary before exam day?

6. Testing and risk:
   - What are the highest-risk bugs?
   - What should be tested first?
   - What mistakes would make the app unreliable for interview prep?

Please return:

- A short executive summary.
- Top 5 recommended changes.
- Features to keep before exam day.
- Features to postpone until after exam day.
- Missing PM practice areas.
- Technical risks.
- A revised pre-exam day build sequence.
- Any questions you need answered before implementation.

Please do not rewrite the whole document. Focus on critique and improvements.
