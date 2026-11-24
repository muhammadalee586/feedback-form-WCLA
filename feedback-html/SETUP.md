# Get feedback arriving in a Google Sheet (about 5 minutes)

1. Create a new Google Sheet (name it "Walled City Feedback").
2. Extensions > Apps Script. Delete the default code and paste all of `apps-script.gs`. Save.
3. Deploy > New deployment > type "Web app".
   - Execute as: Me
   - Who has access: Anyone
   Click Deploy and approve the permissions. Copy the Web app URL.
4. Open `script.js` and paste that URL into `var ENDPOINT = '';` at the top.
5. Open `index.html` (double-click, or host it) and submit a test. A new row appears in the sheet within a few seconds.

Notes: photos are not uploaded in this version (only the count is saved).
If you later change the Apps Script code, use Deploy > Manage deployments > edit > New version.
