// Replace the PROMPTS array in data.js with a curated, high-quality set of
// detailed "power prompts" (role + context + task + constraints + output).
// Serialized with JSON.stringify so escaping/newlines are always valid.
import fs from 'node:fs';
const DATA = '/data/ToolHub/public/assets/js/data.js';

const P = [
// ---------------- Coding & Dev ----------------
{ title: 'Senior Code Reviewer', cat: 'Coding', text:
`You are a staff-level software engineer doing a rigorous code review.
Review the code below and report findings grouped by severity: Critical (bugs, security, data loss), Major (performance, edge cases, error handling), Minor (readability, naming, style).
For each finding give: file/line reference, why it matters, and a concrete fixed code snippet.
End with a short overall assessment and the top 3 things to fix first.

Language/framework: [stack]
Code:
[paste code]` },

{ title: 'Root-Cause Debugger', cat: 'Coding', text:
`Act as an expert debugger. I will give you an error and the relevant code.
1) Restate the likely root cause in one sentence.
2) Explain the chain of events that leads to the error.
3) Give the corrected code with the change clearly marked.
4) Suggest one test that would have caught this.
Ask for more context only if strictly necessary.

Error:
[error message]
Code:
[paste code]` },

{ title: 'Refactor to Clean Code', cat: 'Coding', text:
`Refactor the following code for readability, testability and performance WITHOUT changing its behavior.
Constraints: keep the public API stable, prefer pure functions, remove duplication, add meaningful names, and note any assumptions.
Return: (1) the refactored code, (2) a bullet list of what changed and why.

[paste code]` },

{ title: 'System Design Interview Partner', cat: 'Coding', text:
`Act as a senior interviewer for a system design interview. The problem is: design [system, e.g. a URL shortener].
Drive the session: ask me to clarify requirements, then guide me through capacity estimates, high-level design, data model, API, scaling, and trade-offs.
Ask one focused question at a time, critique my answers briefly, and only reveal a reference design at the end.` },

{ title: 'Comprehensive Unit Tests', cat: 'Coding', text:
`Write thorough unit tests for the function below using [framework].
Cover: happy path, boundary values, empty/null inputs, invalid inputs, and failure/error paths.
Use clear test names in the pattern "method_condition_expectedResult", arrange-act-assert structure, and no network or time dependencies (mock them).

[paste code]` },

{ title: 'Explain This Codebase', cat: 'Coding', text:
`You are onboarding me to unfamiliar code. Read the snippet below and produce:
1) A one-paragraph plain-English summary of what it does.
2) A numbered walkthrough of the control flow.
3) Key data structures and why they are used.
4) Any risky or confusing parts to be careful with.
Write for a competent developer new to this project.

[paste code]` },

{ title: 'SQL Optimizer', cat: 'Coding', text:
`Act as a SQL performance expert. Given the schema and query below:
1) Explain what the query does.
2) Identify why it may be slow (scans, missing indexes, N+1, bad joins).
3) Provide an optimized query.
4) Suggest indexes or schema changes, with the trade-offs.

Schema:
[paste schema]
Query:
[paste query]` },

{ title: 'Regex Builder + Tests', cat: 'Coding', text:
`Write a single regular expression (flavor: [PCRE/JS/Python]) that matches: [describe the pattern precisely].
Then: explain each component in a table, and give 5 strings that should match and 5 that should NOT, confirming each.
Avoid catastrophic backtracking; note any assumptions.` },

{ title: 'Commit Message & PR Writer', cat: 'Coding', text:
`Based on the diff/description below, write:
1) A Conventional Commits message (type(scope): summary, then a body explaining what and why).
2) A PR description with sections: Summary, Changes, How to test, Risks/rollback.
Keep it concise and factual.

[paste diff or description]` },

// ---------------- Writing ----------------
{ title: 'Precision Line Editor', cat: 'Writing', text:
`Act as a sharp copy editor. Improve the text below for clarity, concision and flow while preserving meaning and the author's voice.
Deliver: (1) the edited version, (2) a short list of the most important changes, (3) 2-3 optional suggestions to strengthen it further.
Tone to keep: [tone]. Reading level: [audience].

[paste text]` },

{ title: 'Rewrite in Brand Voice', cat: 'Writing', text:
`Rewrite the text below to match this brand voice: [describe voice, e.g. confident, warm, no jargon].
Keep the same facts and calls to action. Match sentence rhythm and vocabulary to the voice, and flag any claim that may need proof.
Return the rewrite plus a 1-line note on how the voice was applied.

[paste text]` },

{ title: 'Long-Form Article Draft', cat: 'Writing', text:
`You are a professional ghostwriter. Write a [word count]-word article titled "[working title]" for [audience].
Goal: [what the reader should think/do afterward]. Tone: [tone].
Structure it with a compelling hook, clear H2 sections, concrete examples, and a strong closing. Avoid filler and clichés. Use specific detail over generic statements.` },

{ title: 'One-Sentence + TL;DR + Full Summary', cat: 'Writing', text:
`Summarize the content below at three levels:
1) A single-sentence takeaway.
2) A 3-bullet TL;DR.
3) A tight paragraph (under 120 words) covering the key points.
Stay faithful to the source and do not add outside information.

[paste text]` },

{ title: 'Professional Email (Structured)', cat: 'Writing', text:
`Write a professional email.
To: [recipient/role]  Goal: [what I want to happen]  Context: [background]  Tone: [tone].
Rules: clear subject line, under 150 words, one main ask, skimmable, polite but direct, end with a specific next step.
Provide 2 versions: a concise one and a warmer one.` },

{ title: 'Tone & Register Transformer', cat: 'Writing', text:
`Rewrite the passage below into [target tone, e.g. formal / friendly / persuasive / diplomatic].
Keep the meaning and key facts. Show the result only. If the original is ambiguous, keep the safest interpretation and note it in one line at the end.

[paste text]` },

// ---------------- Career ----------------
{ title: 'Resume Bullet Optimizer', cat: 'Career', text:
`Act as an executive resume writer. Rewrite my bullet points to be results-driven using the pattern: strong action verb + what I did + measurable impact.
Quantify where possible (%, $, time, scale); if a metric is missing, insert a clearly marked [estimate] placeholder. Cut fluff and keep each bullet to one line.

[paste bullet points]` },

{ title: 'Behavioral Interview Coach (STAR)', cat: 'Career', text:
`Act as an interview coach. Ask me one common behavioral question for a [role] at a time.
After my answer, score it 1-5 on Situation, Task, Action, Result, rewrite my answer in tight STAR format, and give one tip. Then continue to the next question.` },

{ title: 'Technical Interviewer', cat: 'Career', text:
`Act as a technical interviewer for a [role] position. Ask one question at a time, starting easy and increasing difficulty.
Wait for my answer, give brief targeted feedback, then continue. Cover fundamentals, problem-solving, and one scenario question. Keep a running note of strengths and gaps to summarize at the end.` },

{ title: 'Salary Negotiation Roleplay', cat: 'Career', text:
`Act as a hiring manager in a salary negotiation. Scenario: [role, offer details, my target].
Role-play realistically and push back. After I respond, stay in character. When I type "debrief", step out and critique my anchoring, framing, and concessions, then suggest better scripts.` },

{ title: 'Tailored Cover Letter', cat: 'Career', text:
`Write a concise cover letter (under 300 words) for the job below, using my background.
Mirror the top 3 requirements from the posting, show impact with specifics, avoid generic phrases, and sound like a real person.

Job posting:
[paste posting]
My background:
[paste resume/notes]` },

{ title: 'Self-Assessment / Performance Review', cat: 'Career', text:
`Help me write a performance self-review for the period [timeframe].
From my notes below, group accomplishments by theme, quantify impact, connect to company goals, and honestly note 1-2 growth areas with a plan.
Keep it confident but grounded.

[paste accomplishments]` },

// ---------------- Learning ----------------
{ title: 'Feynman Technique Tutor', cat: 'Learning', text:
`Teach me [topic] using the Feynman technique.
1) Explain it simply as if to a beginner, using a concrete analogy.
2) Point out the 3 concepts people most often misunderstand.
3) Quiz me with 3 questions, wait for my answers, then correct gaps.
Ramp up depth only once I answer correctly.` },

{ title: 'Socratic Tutor', cat: 'Learning', text:
`Be my Socratic tutor for [subject/goal]. Do not give direct answers first.
Ask guiding questions that lead me to the insight, one at a time. If I'm stuck after two hints, then explain. Adjust difficulty to my responses and end with a one-line summary of what I learned.` },

{ title: 'Personalized Study Plan', cat: 'Learning', text:
`Create a study plan to learn [skill] in [timeframe], studying about [hours] per week, starting at [current level].
Break it into weekly milestones with specific resources/exercises, checkpoints to test progress, and a spaced-repetition schedule for review. Present as a table.` },

{ title: 'Explain Like I Choose the Level', cat: 'Learning', text:
`Explain [concept] at three levels: (1) to a curious 5-year-old with an everyday analogy, (2) to a high-school student, (3) to a professional in an adjacent field.
Keep each version accurate, avoid jargon in levels 1-2, and end with one common misconception.` },

{ title: 'Language Tutor with Corrections', cat: 'Learning', text:
`Act as a [language] tutor at [level]. Have a natural conversation about [topic].
After each of my messages: gently correct grammar and word choice, show a more natural phrasing, then continue the conversation with a follow-up question. Keep replies short.` },

{ title: 'Flashcard Generator', cat: 'Learning', text:
`Turn the material below into high-quality spaced-repetition flashcards.
Rules: one fact per card, question on the front and a concise answer on the back, avoid yes/no cards, include a few cloze-deletion cards. Output as a two-column table (Front | Back).

[paste notes]` },

// ---------------- Marketing ----------------
{ title: 'Go-To-Market Plan', cat: 'Marketing', text:
`Act as a growth marketing strategist. Build a go-to-market plan for [product] targeting [audience].
Include: positioning statement, value proposition, ideal customer profile, 3 acquisition channels with why, a 30-day launch timeline, and the 3 KPIs to track. Be specific, not generic.` },

{ title: 'Ad Copy with Frameworks', cat: 'Marketing', text:
`Write ad copy for [product] whose key benefit is "[benefit]" for [audience].
Produce 3 variations using AIDA, 3 using PAS (Problem-Agitate-Solve), and 3 punchy headlines under 8 words.
Each ad: a headline, 1-2 lines of body, and a clear CTA. Keep the voice [tone].` },

{ title: 'SEO Content Brief', cat: 'Marketing', text:
`Create an SEO content brief for the target keyword "[keyword]" (search intent: [informational/commercial]).
Include: suggested H1, a logical H2/H3 outline, target word count, related keywords/entities to include, 5 FAQ questions, a meta title (<60 chars) and meta description (<155 chars), and 3 internal-link ideas.` },

{ title: 'High-Converting Landing Page', cat: 'Marketing', text:
`Write landing page copy for [product] aimed at [audience].
Sections: hero headline + subhead, 3 benefit blocks (benefit-led, not feature-led), social-proof line, objection-handling FAQ (4), and a primary CTA with 2 button-text options. Keep it scannable and benefit-driven.` },

{ title: 'Cold Outreach (Personalized)', cat: 'Marketing', text:
`Write a personalized cold outreach message to [name], [role] at [company].
Reference this context: [trigger/observation]. Keep it under 90 words, lead with them (not me), offer one clear value, and end with a low-friction ask. Also give a 1-line follow-up for 3 days later.` },

{ title: 'Email Nurture Sequence', cat: 'Marketing', text:
`Design a 5-email nurture sequence for [audience] who just [action, e.g. signed up].
For each email give: goal, subject line (+1 alt), send-day, key message, and CTA. Progress from welcome to education to social proof to offer, without being pushy.` },

// ---------------- Business / Strategy ----------------
{ title: 'Lean Canvas Builder', cat: 'Business', text:
`Act as a startup advisor. Fill out a Lean Canvas for this idea: [describe idea].
Cover all 9 blocks (Problem, Customer Segments, Unique Value Proposition, Solution, Channels, Revenue Streams, Cost Structure, Key Metrics, Unfair Advantage). Be concrete and flag the riskiest assumption to test first.` },

{ title: 'SWOT + Recommendations', cat: 'Business', text:
`Perform a SWOT analysis for [company/product/decision] given the context below.
After the four quadrants, add a "So what" section: the 3 highest-leverage actions, each tied to a specific strength or opportunity, with a first step.

Context:
[paste context]` },

{ title: 'Competitive Analysis', cat: 'Business', text:
`Create a competitive analysis for [product] vs [list competitors].
Output a comparison table (positioning, target user, pricing model, key strengths, key weaknesses), then summarize where we can differentiate and the 2 biggest competitive threats. Mark anything you are unsure about.` },

{ title: 'Pricing Strategy Advisor', cat: 'Business', text:
`Act as a pricing strategist for [product], target customer [segment], cost basis [if known].
Recommend a pricing model (options: subscription, usage, tiered, freemium) with rationale, propose 3 tiers with feature fences and price points, and list the assumptions and experiments to validate them.` },

{ title: 'Investor One-Pager', cat: 'Business', text:
`Draft a crisp investor one-pager for [startup].
Sections: problem, solution, why now, market size, business model, traction, team, and the ask. Keep each section to 2-3 sentences, use concrete numbers where I provide them and [placeholders] where I don't.

Details:
[paste details]` },

// ---------------- Productivity ----------------
{ title: 'Meeting Notes to Action Items', cat: 'Productivity', text:
`From the meeting transcript/notes below, produce:
1) A 3-bullet summary.
2) Decisions made.
3) Action items as a table (Owner | Task | Due date if mentioned).
4) Open questions / follow-ups.
Do not invent owners or dates; use [unassigned] when unclear.

[paste transcript]` },

{ title: 'Prioritize with RICE', cat: 'Productivity', text:
`Help me prioritize the tasks/features below using RICE (Reach, Impact, Confidence, Effort).
Ask me for any missing estimates, then produce a scored table sorted high-to-low, and recommend what to do now, next, and later.

[paste list]` },

{ title: 'Weekly Plan from a Brain Dump', cat: 'Productivity', text:
`Turn my messy brain dump into an organized weekly plan.
Group items into themes, flag the 3 most important outcomes (the "big rocks"), schedule them across the week, separate quick wins from deep work, and list anything to delegate or drop.

[paste brain dump]` },

{ title: 'Decision Matrix', cat: 'Productivity', text:
`Help me decide between these options: [list options].
Propose 4-6 weighted criteria (ask if I want to set weights), score each option 1-5 in a matrix, compute totals, and give a recommendation with the main trade-off and what would change the decision.` },

{ title: 'Plain-Language Explainer', cat: 'Productivity', text:
`Explain the document below in plain language for a non-expert.
Give: a 3-bullet gist, anything I should be cautious about or that seems unusual, and 3 questions I should ask before agreeing/acting. Do not give legal or financial advice; flag when I should consult a professional.

[paste text]` },

// ---------------- Data & Analysis ----------------
{ title: 'Data Analysis Plan', cat: 'Data', text:
`Act as a data analyst. My goal is [question/decision] and I have data on [describe columns].
Propose an analysis plan: hypotheses to test, the metrics/segments to look at, suitable charts, and possible pitfalls (bias, confounders, small samples). Then outline the steps in order.` },

{ title: 'Spreadsheet Formula Builder', cat: 'Data', text:
`Write a [Excel/Google Sheets] formula for this task: [describe what you want].
Data layout: [describe columns/ranges]. Give the exact formula, explain each part, note edge cases (blanks, errors, text vs numbers), and offer an alternative approach if one exists.` },

{ title: 'A/B Test Designer', cat: 'Data', text:
`Help me design an A/B test for [change] with primary metric [metric].
Define the hypothesis, control vs variant, the guardrail metrics, a rough sample-size/duration consideration, and the decision rule. Warn me about common mistakes (peeking, multiple comparisons).` },

{ title: 'Explain a Dataset (EDA)', cat: 'Data', text:
`I will describe or paste a dataset. Act as an analyst doing exploratory analysis.
Suggest: data quality checks, useful summary stats, interesting relationships to explore, and 3 questions the data could answer. Keep it practical and prioritized.

[describe/paste data]` },

// ---------------- Product & Design ----------------
{ title: 'PRD Writer', cat: 'Product', text:
`Act as a product manager. Write a concise PRD for [feature].
Sections: problem statement, target user, goals & non-goals, user stories, functional requirements, success metrics, and open questions. Keep it tight and testable; use [placeholders] where I haven't given details.` },

{ title: 'User Persona & JTBD', cat: 'Product', text:
`Create a user persona and jobs-to-be-done for [product/audience].
Persona: name, context, goals, frustrations, and a day-in-the-life. Then list 3 JTBD in the form "When [situation], I want to [motivation], so I can [outcome]", each with the current workaround.` },

{ title: 'UX Microcopy', cat: 'Product', text:
`Act as a UX writer. Write microcopy for [screen/flow].
Provide options for: button labels, empty states, error messages (helpful, no blame), and a confirmation. Keep it clear, concise, and consistent in voice ([voice]). Give 2 variants each.` },

{ title: 'Design/Copy Critique', cat: 'Product', text:
`Critique the [design/landing page/flow] I describe below as a senior product designer.
Evaluate clarity, hierarchy, friction, and trust. Give specific, prioritized suggestions (not vague praise), and note what is already working. End with the single highest-impact change.

[paste description]` },

// ---------------- Prompt Engineering ----------------
{ title: 'Improve My Prompt', cat: 'Prompt Engineering', text:
`You are a prompt engineering expert. Improve the prompt below.
1) Point out weaknesses (ambiguity, missing role/context/format, no constraints).
2) Rewrite it as a strong prompt with clear role, task, constraints, and output format.
3) List the variables I should fill in.

My prompt:
[paste prompt]` },

{ title: 'Meta-Prompt Generator', cat: 'Prompt Engineering', text:
`I want a reusable prompt that makes an AI act as [expert] to accomplish [task].
Generate a polished template with: a role definition, the context it should ask for, step-by-step instructions, constraints/guardrails, and a specified output format. Use [placeholders] for anything the user must provide.` },

{ title: 'Reasoning Scaffold', cat: 'Prompt Engineering', text:
`For the problem below, don't answer immediately. First think step by step: restate the problem, list what's known and unknown, outline an approach, then work through it, and finally give the answer clearly separated under a "Final answer" heading. Verify the answer against the constraints.

Problem:
[paste problem]` },

{ title: 'Few-Shot Example Builder', cat: 'Prompt Engineering', text:
`Help me build few-shot examples for the task: [describe task, input -> desired output].
Produce 4 diverse, high-quality input/output pairs that demonstrate the exact format and edge cases, then write a short instruction line to place before them. Keep formatting consistent across examples.` },

// ---------------- Research ----------------
{ title: 'Deep Research Report', cat: 'Research', text:
`Act as a research analyst. Produce a structured report on [topic] for [audience].
Include: an executive summary, key findings as bullets, a balanced view of different perspectives, notable uncertainties, and open questions. Clearly separate established facts from opinion, and note where a claim would need a citation.` },

{ title: 'Literature Synthesis', cat: 'Research', text:
`Synthesize the sources/notes below into a coherent overview.
Identify the main themes, points of agreement and disagreement, and gaps. Present as: themes with supporting points, a comparison of viewpoints, and 3 questions worth investigating further. Do not fabricate sources.

[paste notes/sources]` },

{ title: 'Critical Thinking / Steelman', cat: 'Research', text:
`Take the claim below and stress-test it.
1) Steelman it (strongest version + best evidence).
2) Give the strongest counterarguments.
3) List key assumptions and what evidence would change your mind.
4) End with a calibrated conclusion.

Claim:
[paste claim]` },

// ---------------- Lifestyle ----------------
{ title: 'Meal Plan Builder', cat: 'Lifestyle', text:
`Create a [N]-day meal plan for [goal, e.g. high-protein] with a daily target of about [calories] kcal.
Constraints: [diet/allergies], budget [level], cooking time [minutes]/meal. Give breakfast/lunch/dinner/snack per day, a consolidated grocery list, and simple prep tips. Note it's general guidance, not medical advice.` },

{ title: 'Travel Itinerary Planner', cat: 'Lifestyle', text:
`Plan a [N]-day trip to [destination] for [travelers] with a budget of [amount] and interests in [interests].
Give a day-by-day itinerary (morning/afternoon/evening) balancing must-sees and downtime, food suggestions, transit tips, and one rainy-day backup per day. Keep walking realistic.` },

{ title: 'Workout Program', cat: 'Lifestyle', text:
`Design a [days]/week workout program for [goal] at [beginner/intermediate/advanced] level, with access to [equipment] and about [minutes] per session.
Give the weekly split, exercises with sets/reps, progression over 4 weeks, and warm-up/cool-down notes. Flag when to rest and that it's general guidance, not medical advice.` },
];

const body = P.map((p) => `  { title: ${JSON.stringify(p.title)}, cat: ${JSON.stringify(p.cat)}, text: ${JSON.stringify(p.text)} },`).join('\n');
const block = `export const PROMPTS = [\n${body}\n]`;

let src = fs.readFileSync(DATA, 'utf8');
if (!/export const PROMPTS = \[[\s\S]*?\n\]/.test(src)) throw new Error('PROMPTS block not found');
src = src.replace(/export const PROMPTS = \[[\s\S]*?\n\]/, block);
fs.writeFileSync(DATA, src);

const byCat = {};
for (const p of P) byCat[p.cat] = (byCat[p.cat] || 0) + 1;
console.log('prompts:', P.length);
console.log('byCat:', JSON.stringify(byCat));
console.log('hasBrace:', P.some((p) => p.text.includes(String.fromCharCode(123,123))));