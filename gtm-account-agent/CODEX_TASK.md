# Codex Task: Build GTM Account Research Agent V1

## Context

This repository now contains a Python subproject at `gtm-account-agent/`.

The goal is to build a local GTM Account Research Agent that takes a company name, website, target market, and offering, then generates a structured account brief in JSON and Markdown.

## Current V1 state

Implemented:

- CLI runner: `run_account_agent.py`
- Claude API runner: `src/agent.py`
- Prompt builder: `src/prompts.py`
- Pydantic schemas: `src/schemas.py`
- Mock research placeholder: `src/research.py`
- Scoring rubric loader: `src/scoring.py`
- Markdown/JSON output writers: `src/output.py`
- Config files under `config/`
- Setup docs in `README.md`

## What to do in auto mode

Please review the whole `gtm-account-agent/` project and improve it for local reliability, developer experience, and clean V1 execution.

Prioritize these tasks:

1. Verify the CLI runs correctly from inside `gtm-account-agent/`.
2. Add any missing `__init__.py` files if needed.
3. Improve error handling around API failures, invalid model JSON, and missing environment variables.
4. Add a `sample_input.json` or `examples/` folder with a Westminster Communities example.
5. Add a non-API mock mode so the agent can run without an Anthropic key for local testing.
6. Add basic tests for slugify, markdown generation, schema validation, and JSON parsing.
7. Add a `.gitignore` for `.env`, `.venv`, `outputs/`, and Python cache files.
8. Update README with mock mode and test instructions.
9. Do not add live web scraping yet.
10. Do not connect to HubSpot, Gmail, Asana, or any write-action systems yet.

## Acceptance criteria

- `pip install -r requirements.txt` works.
- `python run_account_agent.py` works with a real Anthropic API key.
- A mock/test mode works without an API key.
- Outputs are saved to `outputs/briefs/`.
- Tests can be run locally.
- No real secrets are committed.
- The code remains beginner-friendly and readable.

## Future roadmap, not for this task

- Live website research ingestion
- Batch CSV mode
- HubSpot-ready CSV export
- FastAPI endpoint
- Supabase persistence
- Human approval workflow
