from __future__ import annotations

import json
import os
from typing import Any

from anthropic import Anthropic

from src.prompts import SYSTEM_PROMPT, build_user_prompt
from src.research import get_research_text
from src.schemas import AccountBrief, AccountInput
from src.scoring import load_scoring_rubric


DEFAULT_MODEL = "claude-3-5-sonnet-latest"


def _extract_json(text: str) -> dict[str, Any]:
    """Parse JSON returned by the model.

    The prompt asks for JSON only, but this helper is tolerant if a model includes
    small leading/trailing text.
    """
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise
        return json.loads(text[start : end + 1])


def run_account_agent(account: AccountInput) -> AccountBrief:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key."
        )

    model = os.getenv("ANTHROPIC_MODEL", DEFAULT_MODEL)
    client = Anthropic(api_key=api_key)

    research_text = get_research_text(account)
    scoring_rubric = load_scoring_rubric()
    user_prompt = build_user_prompt(account, research_text, scoring_rubric)

    response = client.messages.create(
        model=model,
        max_tokens=3000,
        temperature=0.2,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    text_parts = []
    for block in response.content:
        if getattr(block, "type", None) == "text":
            text_parts.append(block.text)

    raw_text = "\n".join(text_parts)
    parsed = _extract_json(raw_text)
    return AccountBrief.model_validate(parsed)
