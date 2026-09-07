<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/c616416f-6048-435a-b713-d716e6905b6f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Working without an API key

Use **Instant Draft (no API)** after pasting notes to create a concise, editable
local outline. The main **Generate Presentation** action also returns a local
draft automatically when `GEMINI_API_KEY` is not configured. Configure that key
to enable AI generation and AuraGPT; set `GEMINI_MODEL` only when you need to
override the default `gemini-2.5-flash`.
