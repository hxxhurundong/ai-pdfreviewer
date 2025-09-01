How to install:
1. Download the zip file in release
2. Open Chrome extensions page
3. Go to chrome://extensions and toggle Developer mode (top right).
4. Click Load unpacked and select the extension/ folder

First run:

Open any PDF in your PDF.js viewer. You’ll see an AI Helper button in the top toolbar.

On first click you’ll be prompted for your Gemini API key




Get a Gemini API key (Free Tier):

1. Visit Google AI Studio: https://aistudio.google.com/
2. Click Get API key → Create API key in new project (or choose an existing project).
3. Copy the key and paste it into the extension when prompted.

Models are tried in order and gracefully fall back:
gemini-1.5-flash-latest → gemini-1.5-flash → gemini-1.5-pro-latest.
