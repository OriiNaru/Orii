# Orii

Homework, schedule, food, and lifts in one calm place. Orii installs to your phone's home screen, opens like an app, and works offline. Everything you enter is saved on your phone.

## Put Orii online (free, about 10 minutes)

These steps are easiest on a computer.

1. Make a free GitHub account at https://github.com/signup. Your username becomes part of Orii's web address, so pick one you're fine with people seeing.
2. Click the **+** in the top right, then **New repository**. Name it `orii`, leave it **Public**, and click **Create repository**.
3. On the new page, click **uploading an existing file**. Drag in all the files from this folder (the files themselves, not the folder). Click **Commit changes**.
4. Go to **Settings**, then **Pages** in the left menu. Under **Build and deployment**, set **Source** to **Deploy from a branch**, pick **main** and **/ (root)**, and click **Save**.
5. Wait a minute or two and refresh. The page shows your address, which looks like `https://YOUR-USERNAME.github.io/orii/`.

## Install it on your phone

- **iPhone:** open your Orii address in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** open it in Chrome, tap the **⋮** menu, then **Install app** or **Add to Home screen**.

## Bring over your entries from the Claude version

1. In the Claude version of Orii, tap the gear, then **Export a backup**, and save the file.
2. In the new Orii, tap the gear, then **Import**, and pick that file.

## Good to know

- Entries live on the phone you use. Export a backup now and then from the gear menu.
- **School → Send to my calendar** adds homework due dates and exams to your phone's calendar with reminders. Send it again after adding new ones.
- The app icon shows a badge for homework due today or tomorrow, on phones that support it.
- Food is logged by entering calories and protein yourself. Saved meals make repeats one tap.

## Updating Orii later

Upload the changed files to the same repository. Then open `sw.js`, change `orii-v1` to `orii-v2` (and so on), and commit. Phones pick up the update the next time Orii opens.
