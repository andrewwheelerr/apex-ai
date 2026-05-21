from __future__ import annotations

from typing import List, Literal
from pydantic import BaseModel, Field


class AccountBrief(BaseModel):
    company_name: str
    website: str
    target_market: str
    offering: str
    company_summary: str
    icp_fit_score: int = Field(ge=0, le=100)
    fit_rationale: str
    likely_buyers: List[str]
    business_model_notes: str
    pain_hypotheses: List[str]
    trigger_events: List[str]
    relevance_to_offering: str
    objections: List[str]
    recommended_angle: str
    cold_email_subject: str
    cold_email: str
    hubspot_notes: str
    next_best_action: str
    confidence_level: Literal["low", "medium", "high"]
    missing_information: List[str]


class AccountInput(BaseModel):
    company_name: str
    website: str
    target_market: str
    offering: str
