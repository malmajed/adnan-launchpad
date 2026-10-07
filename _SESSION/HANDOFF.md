# Adnan's Launchpad — session handoff

Last updated: 2026-10-07 · Status: **Batch 1 built and tested (v1). Not yet deployed.**

## What it is
Career PWA for Adnan (owner's nephew), forked from majed-launchpad. Repo to be: malmajed/adnan-launchpad → https://malmajed.github.io/adnan-launchpad/
- index.html = Adnan's app (single profile, no picker). follow.html = **Advisor view** (owner).
- Compass (compass.js): 20 interest ratings, 6 day-in-the-life choices, 7 values, 13 skills, 5 open questions → fit scores for 8 paths (emb, per, hw, semi, test, net, tech, grad). fit = .45 interests + .25 scenarios + .20 values + .10 skill readiness. History kept in state.compass.hist.
- Pulse (weekly check-in), Pipeline (apps + network), Inbox (advisor notes/tasks, replies, done).
- Advisor view tabs: Brief (rule-based flags + suggested moves), Compass, Pipeline (+CV workbench), Check-ins, Learning (+STAR stories), Guide him (send note/task, focus path, device links).
- Tracks: Career Launch l01–l10 DONE (labs_launch.js, data_launch.js). Embedded Depth e01–e10, Perception p01–p10, Industry & Japan i01–i08: titles only (batches 2–4).

## Architecture
- localStorage keys prefixed `adl-` (same origin as Majed's app). SW cache prefix `adnan-lp-`, deletes only its own caches.
- Advisor channel: ADV object (core.js) stored in sheet `advisor`; GET returns {state, advisor}; advisor writes need ADVISOR_KEY (`akey`). Advisor never pushes Adnan's state (FOLLOW mode disables save).
- Function overrides live in adnan.js; old copies were removed from app.js.
- Code.gs v5 writes readable tabs: summary, pipeline, network, checkins, compass, activity. Optional `setupWeeklyDigest()` (not run).
- Build: `python3 build/make.py vN` (always bump). Test: serve root on 8765, `node build/test/mock.js`, `node build/test/e2e.js <outdir>`.

## Deploy steps (pending)
1. Create GitHub repo malmajed/adnan-launchpad, upload repo, Pages source = GitHub Actions.
2. New Google Sheet "Adnan Launchpad Progress" → Extensions → Apps Script → paste Code.gs, set SECRET and ADVISOR_KEY → Deploy → New deployment (web app, execute as me, anyone).
3. Open follow.html, enter URL + SECRET + ADVISOR_KEY. From "Guide him" copy Adnan's device link and send it to him.

## Next action
Deploy. Then batch 2 (Embedded Depth) or batch 3 (Perception) depending on his Compass result.
