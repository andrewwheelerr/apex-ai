from __future__ import annotations

import json
from src.schemas import AccountInput


SYSTEM_PROMPT = """You are a GTM account research analyst.

Your job is to evaluate whether a target company is a strong fit for the specified offering.

You must produce practical, sales-ready output. Do not write generic company summaries. Focus on:
- ICP fit
- buyer relevance
- pain hypotheses
- likely objections
- trigger events
- recommended outreach angle
- CRM-ready notes

Rules:
- Do not invent facts.
- Separate known facts from hypotheses.
- If evidence is weak, say so.
- Keep the analysis concise but useful.
- Write for a VP of GTM, sales leader, or SDR preparing outbound.
- Return valid JSON only. Do not wrap JSON in markdown fences.
"""


JSON_OUTPUT_INSTRUCTIONS = """Return a JSON object with exactly these keys:

{
  "company_name": string,
  "website": string,
  "target_market": string,
  "offering": string,
  "company_summary": string,
  "icp_fit_score": integer 0-100,
  "fit_rationale": string,
  "likely_buyers": string[],
  "business_model_notes": string,
  "pain_hypotheses": string[],
  "trigger_events": string[],
  "relevance_to_offering": string,
  "objections": string[],
  "recommended_angle": string,
  "cold_email_subject": string,
  "cold_email": string,
  "hubspot_notes": string,
  "next_best_action": string,
  "confidence_level": "low" | "medium" | "high",
  "missing_information": string[]
}
"""


def build_user_prompt(account: AccountInput, research_text: str, scoring_rubric: dict) -> str:
    return f"""
Evaluate this account for GTM fit.

Account input:
{account.model_dump_json(indent=2)}

Research text available:
{research_text}

Scoring rubric:
{json.dumps(scoring_rubric, indent=2)}

Use the scoring rubric to assign the ICP fit score. Be conservative where evidence is missing.

{JSON_OUTPUT_INSTRUCTIONS}
""".strip()
