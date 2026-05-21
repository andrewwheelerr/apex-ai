from __future__ import annotations

from dotenv import load_dotenv

from src.agent import run_account_agent
from src.output import save_brief
from src.schemas import AccountInput


def ask(prompt: str) -> str:
    value = input(prompt).strip()
    while not value:
        print("This field is required.")
        value = input(prompt).strip()
    return value


def main() -> None:
    load_dotenv()

    print("GTM Account Research Agent")
    print("--------------------------")

    account = AccountInput(
        company_name=ask("Company name: "),
        website=ask("Website: "),
        target_market=ask("Target market: "),
        offering=ask("Offering: "),
    )

    print("\nGenerating account brief...\n")
    brief = run_account_agent(account)
    json_path, markdown_path = save_brief(brief)

    print(f"Done. JSON saved to: {json_path}")
    print(f"Done. Markdown saved to: {markdown_path}")
    print(f"\nICP Fit Score: {brief.icp_fit_score}/100")
    print(f"Next Best Action: {brief.next_best_action}")


if __name__ == "__main__":
    main()
