# Hyrox Performance Leaderboard

A lightweight browser app for tracking a gym Hyrox event. Athletes can submit their finish time, heart-rate data from Strava, a Strava screenshot, and notes from their attempt. The app ranks performances and generates a short coaching-style story about pacing, heart-rate efficiency, and possible upside.

## Features

- Finish-time leaderboard ranked fastest to slowest
- Event summary showing athlete count, best time, and average time
- Heart-rate efficiency score using average HR, max HR, and red-zone percentage
- Projected best-time estimate based on how aggressively or inefficiently the effort was paced
- Storytelling analysis for the latest submitted athlete
- Strava screenshot preview stored locally in the browser
- Sample data button for quick demos
- No backend required

## How it works

Open `index.html` in a browser, enter an athlete result, and click **Add to leaderboard**. Data is saved in browser `localStorage`, so it stays on that device and browser until cleared.

The screenshot upload is used as a visual reference in the story panel. The current version does not automatically read numbers from the image, so the Strava heart-rate values should be typed into the form.

## Publishing with GitHub Pages

1. Go to the repository settings.
2. Open **Pages**.
3. Set the source to deploy from the `main` branch.
4. Choose the repository root as the folder.
5. Save and wait for GitHub to publish the site.

## Future ideas

- Add user accounts or a shared database so everyone sees the same leaderboard
- Add OCR for Strava screenshots to read heart-rate values automatically
- Split leaderboard by gender, age group, relay pairs, or scaled divisions
- Add station-by-station splits for richer Hyrox analysis
- Export results to CSV
