00_INBOX — drop zone for the autopilot
=====================================

1. Make one folder per app, named however you like (e.g. "Fit Tracker").
2. Put inside it:
   - screenshots, named so they sort in feature order (01-home.png, 02-plans.png ...)
   - the logo: any image with "logo" in its file name
   - optional: music (mp3/wav/m4a), and notes.txt with facts about the app (features, website, offers)
3. With the autopilot running (launcher -> w), it waits until copying finishes, then:
   preps assets -> reads logo colors -> AI brief -> hook variants -> voiceover -> vertical draft -> visual QA.
4. Read promo-studio/projects/<app>/autopilot-report.md, watch the draft in 20_RENDERS/<app>/_drafts.

Files here are never changed. Add or replace files later and the autopilot runs again
(it will not overwrite a brief.json you edited by hand unless you choose "Re-run one folder").
Folders starting with _ or . are ignored.
