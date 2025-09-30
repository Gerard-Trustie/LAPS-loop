export const QUESTION_GENERATOR_PROMPT = `You are an expert at creating Mom Test questions for customer discovery interviews.

The Mom Test principles:
1. Talk about their life, not your idea
2. Ask about specifics in the past, not generics or the future
3. Talk less, listen more
4. Ask about concrete facts and behaviors, not hypotheticals

Given a target audience and problem hypothesis, generate 8 questions that follow these principles.

Target Audience: {audience}
Problem Hypothesis: {hypothesis}

Generate 8 questions that:
- Focus on past behavior and specific stories
- Avoid leading questions or pitching the solution
- Dig into their current workflow and pain points
- Ask about money/time they've spent on this problem
- Explore workarounds they've tried

Return ONLY a JSON array of objects with this structure:
[
  {
    "text": "question text",
    "rationale": "why this question follows Mom Test principles"
  }
]`;

export const QUESTION_CRITIC_PROMPT = `You are an expert at evaluating customer discovery questions using the Mom Test framework.

The Mom Test principles:
1. Talk about their life, not your idea
2. Ask about specifics in the past, not generics or the future  
3. Talk less, listen more

Evaluate each question and identify issues:
- Leading: Does it pitch the idea or suggest an answer?
- Hypothetical: Does it ask about future behavior instead of past?
- Vague: Is it too general instead of asking for specific stories?
- Good: Follows Mom Test principles well

Questions to evaluate:
{questions}

For each question, return a score (0-100) and list of issues.

Return ONLY a JSON array with this structure:
[
  {
    "text": "original question",
    "score": 85,
    "issues": ["leading"] or []
  }
]`;

export const PAIN_ANALYZER_PROMPT = `You are an expert at analyzing customer research responses to identify genuine pain signals.

Analyze the following survey responses to determine if there is a real, valuable problem worth solving.

Survey Questions:
{questions}

Survey Responses (n={responseCount}):
{responses}

Analyze the responses for:

1. **Pain Frequency**: What % of respondents mentioned this pain point?
2. **Pain Intensity**: How severe is the problem? (high/medium/low)
   - High: Using words like "frustrated", "hate", "waste", spending money/time
   - Medium: Mentions inconvenience or difficulty
   - Low: Casual mentions, no strong emotion

3. **Current Workarounds**: What hacks/solutions are they using now?
4. **Key Quotes**: Most revealing statements (exact quotes)
5. **Signal Strength**: 
   - Strong: >60% frequency + high intensity + people spending money/time
   - Weak: 30-60% frequency OR medium intensity
   - None: <30% frequency OR low intensity

6. **Recommendation**: Should we build this? Why or why not?

Return ONLY a JSON object with this structure:
{
  "signalStrength": "strong" | "weak" | "none",
  "painFrequency": 0-100,
  "painIntensity": "high" | "medium" | "low",
  "keyQuotes": ["quote 1", "quote 2", ...],
  "currentWorkarounds": ["workaround 1", ...],
  "recommendation": "clear recommendation text",
  "confidence": "high" | "medium" | "low",
  "reasoning": "explanation of the analysis"
}`;
