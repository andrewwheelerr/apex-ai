# GTM Account Research Agent

A local Python agent that turns a company name, website, target market, and offering into a structured GTM account brief.

This V1 is intentionally simple:

- CLI-first
- Local file outputs
- Structured JSON and Markdown brief generation
- Mock research placeholder so the agent workflow is easy to understand before adding live web research
- Anthropic Claude API support via `ANTHROPIC_API_KEY`

## What it generates

For each account, the agent creates:

- Company summary
- ICP fit score
- Fit rationale
- Likely buyer titles
- Business model notes
- Pain hypotheses
- Possible trigger events
- Relevance to the offering
- Likely objections
- Recommended outreach angle
- Cold email
- HubSpot-ready notes
- Next best action
- Confidence level
- Missing information

## Setup

```bash
cd gtm-account-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Then add your Anthropic API key to `.env`:

```bash
ANTHROPIC_API_KEY=your_key_here
```

## Run

```bash
python run_account_agent.py
```

The script will ask for:

- Company name
- Website
- Target market
- Offering

Outputs are saved to:

```text
outputs/briefs/{company_slug}.json
outputs/briefs/{company_slug}.md
```

## Example input

```text
Company name: Westminster Communities
Website: https://www.westminstercommunitiesfl.org
Target market: Senior Care
Offering: Tenovi RPM + Xander Kardian contactless vitals
```

## Next build steps

1. Add real website research ingestion.
2. Add batch CSV mode.
3. Add HubSpot-ready CSV export.
4. Add source citations and confidence scoring by field.
5. Add FastAPI endpoint.
6. Add Supabase persistence for run history.
7. Add human approval workflow before CRM or email actions.

## Product direction

This can become a productized GTM research workflow:

> Upload a target account list and get back ICP scoring, buyer hypotheses, outreach angles, cold emails, and CRM-ready notes.
