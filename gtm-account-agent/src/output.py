from __future__ import annotations

import json
import re
from pathlib import Path

from src.schemas import AccountBrief


ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "outputs" / "briefs"


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = value.strip("-")
    return value or "account"


def brief_to_markdown(brief: AccountBrief) -> str:
    buyers = "\n".join(f"- {item}" for item in brief.likely_buyers)
    pains = "\n".join(f"- {item}" for item in brief.pain_hypotheses)
    triggers = "\n".join(f"- {item}" for item in brief.trigger_events)
    objections = "\n".join(f"- {item}" for item in brief.objections)
    missing = "\n".join(f"- {item}" for item in brief.missing_information)

    return f"""# Account Brief: {brief.company_name}

## Account

- Website: {brief.website}
- Target Market: {brief.target_market}
- Offering: {brief.offering}
- Confidence: {brief.confidence_level}

## ICP Fit Score

{brief.icp_fit_score} / 100

## Company Summary

{brief.company_summary}

## Fit Rationale

{brief.fit_rationale}

## Likely Buyers

{buyers}

## Business Model Notes

{brief.business_model_notes}

## Pain Hypotheses

{pains}

## Possible Trigger Events

{triggers}

## Relevance to Offering

{brief.relevance_to_offering}

## Likely Objections

{objections}

## Recommended Outreach Angle

{brief.recommended_angle}

## Cold Email

Subject: {brief.cold_email_subject}

{brief.cold_email}

## HubSpot Notes

{brief.hubspot_notes}

## Next Best Action

{brief.next_best_action}

## Missing Information

{missing}
""".strip() + "\n"


def save_brief(brief: AccountBrief) -> tuple[Path, Path]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    slug = slugify(brief.company_name)
    json_path = OUTPUT_DIR / f"{slug}.json"
    markdown_path = OUTPUT_DIR / f"{slug}.md"

    json_path.write_text(brief.model_dump_json(indent=2), encoding="utf-8")
    markdown_path.write_text(brief_to_markdown(brief), encoding="utf-8")

    return json_path, markdown_path
