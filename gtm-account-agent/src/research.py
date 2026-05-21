from __future__ import annotations

from src.schemas import AccountInput


def get_research_text(account: AccountInput) -> str:
    """Return research context for the account.

    V1 intentionally uses a placeholder so the agent workflow is easy to inspect
    before adding live web research, search APIs, browser automation, or scraping.
    """
    return f"""
Known input:
- Company name: {account.company_name}
- Website: {account.website}
- Target market: {account.target_market}
- Offering: {account.offering}

Research status:
- Live website research is not implemented in V1.
- Treat the website and company name as user-supplied context.
- Do not claim facts that are not directly implied by the user input.
- Use hypotheses carefully and flag missing information where needed.
""".strip()
