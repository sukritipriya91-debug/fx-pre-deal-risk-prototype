# FX Pre-Deal Risk Prototype

A lightweight prototype that helps front-office users get immediate pre-deal risk guidance for FX trades. It demonstrates how a compact form or a conversational AI assistant can surface quick risk indicators to speed decision-making.

## As-Is → To-Be

- As-Is: Pre-deal risk checks are often manual, siloed across spreadsheets and legacy tools, and slow to produce actionable guidance.
- To-Be: A single, lightweight interface that returns an instant, explainable pre-deal risk summary from either a structured form or a natural-language conversation — enabling faster, more consistent trade decisions.

## How to try it

Two interaction paths are available. Run locally or open the live demo (link below).

Quick local setup

1. Clone the repo
   - git clone https://github.com/sukritipriya91-debug/fx-pre-deal-risk-prototype.git
2. Install dependencies
   - npm install
3. Start the dev server
   - npm run dev
4. Open the app in your browser at the Vite URL (typically http://localhost:5173)

Form-based path (structured, repeatable)

- Open the app root (/) to access the form-based UI.
- Fill in the trade details (currency pair, notional, buy/sell direction, trade date, counterparty) and submit.
- The prototype returns a concise pre-deal risk summary and suggested next checks (limits, exposures, P&L sensitivity).

Conversational AI path (rapid exploration)

- Open the Chat entrypoint (if present at `/chat`) or use the chat widget on the main page.
- Ask in natural language, for example:
  - "Assess pre-deal risk for 10M USD/EUR, buy USD, trade date today, counterparty: ABC Bank."
- The assistant will ask clarifying questions if required and return a summarized risk view with suggested next steps.
- Notes: the conversational path is a rapid-prototype experience. Depending on your configuration the assistant may be powered by a mocked service or an external model.

## Tech stack

- Frontend: React + Vite
- Deployments: built to be deployed on Vercel (this repo is Vercel-ready)
- Prototype support: rapid copy/UX and iteration assisted by ChatGPT during development

Being transparent: this project was developed as a rapid prototype with help from an LLM (ChatGPT) to accelerate UX, copy, and product-flow experiments. That was intentional — the aim is to explore user flows quickly and learn what to build next.

## Live demo

- Live demo: https://fx-pre-deal-risk-prototype-efo5.vercel.app/

(Replace the placeholder above with your Vercel or other deployment URL.)

## Contributing & feedback

- File issues for UX ideas, missing risk checks, or data/connectivity enhancements.
- PRs welcome — please keep changes small and focused for rapid iteration.

## License

- Specify a license (e.g., MIT) or add your organization license file.
