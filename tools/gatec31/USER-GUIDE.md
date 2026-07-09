# GATEC31 Flight Deck — User Guide

**For the pilot of @gatec31.** One page, everything the tool does, and the two rituals that make it work. (For how it's built, see `IMPLEMENTATION.md`.)

---

## Getting started

**Option A — hosted (recommended once merged):** open `https://blackpoppyethos.github.io/blackpoppycanon/tools/gatec31/` in any browser. On a phone: browser menu → *Add to Home Screen*.

**Option B — standalone file:** save `index.html` anywhere and double-click it. Everything works identically.

**Know this one thing about your data:** it lives in the browser you use, not in the file and not in a cloud. Same browser, same computer = your data is there. Different browser or device = a fresh, empty deck. That's why backups exist (see below) — and why you should pick *one* browser and stick with it.

First visit? Press **Load Demo Data** (Revenue tab, bottom) to see the tool alive, poke around, then **Reset Everything** and start real.

---

## The daily ritual — 30 seconds

1. Open YouTube Studio → Analytics.
2. Open the Flight Deck. On the **Flight Deck** tab, "Today's Flight Plan" is waiting.
3. Enter four numbers: **Subscribers** (your total), **Views** (last 28 days), **Watch hours** (28 days), **Est. revenue** (28 days, optional).
4. **File Today's Report.**

That's the whole habit. Everything else — the charts, the growth rate, the "you'll hit 2,500 subs on November 9" projection, the streak counter — is computed from those daily reports. The streak counter is there to guilt you, lovingly.

## The tabs

**✈ Flight Deck** — the instrument panel. Current subscribers with 7-day delta, stat tiles with trend sparklines, your next milestone with an estimated arrival date based on your last 14 days of growth, the subscriber chart (hover for exact values; 30D/90D/ALL ranges; "View as table" underneath for a plain-numbers view), and your next three unchecked runway tasks.

**📋 Daily Log** — the flight recorder. Every entry you've filed, with day-over-day sub changes, editable and deletable, plus a notes field ("published fog video today") so spikes have explanations later. **Export CSV** if you want the raw data in a spreadsheet.

**🛩 Hangar** — your video pipeline. Every video is a flight plan moving through *idea → scripted → recorded → edited → published*. Each card carries its hook, its target keyword, and a live SEO score on its title. After a video has been up ~48 hours, come back and log its **Views, CTR, and AVD** from Studio — the tool judges them against the bars that matter (CTR ≥ 5%, AVD ≥ 50%) and tells you whether to celebrate or retest the thumbnail.

**📡 SEO Tower** — where titles get built. Type a title, watch it scored live against seven checks (length, keyword, front-loading, numbers, power words, curiosity, shouting). Then:
- **Improve This Title** — the tool rebuilds it: keyword moved to the front, `(MSFS 2024)` added, curiosity structure, de-shouting. Click any scored variant to load it. It won't invent facts — runway numbers and altitudes are yours to add, and they're usually the last points between 85 and 100.
- **Keyword Bank** — the searches flight-sim viewers actually type. Click to insert.
- **Description Builder / Tags** — generates a Studio-ready description skeleton (chapters, gear block with affiliate slots, stream schedule) and a tag list. Fill in the `[links]`.
- From the Hangar, **Tune title in SEO Tower** opens a video's title here in edit mode — revise it, then **Update Video Title** saves it back onto that video.

**🖼 Thumbnail Lab** — design at 1280×720, judge at 168px. Pick a background preset (or upload a VR screenshot), darken it until text pops, set a 3–4 word headline plus an accent line, and watch the **Search result (168px)** preview — that tiny image is where the click actually happens. Guides show the rule-of-thirds and the corner YouTube covers with the duration badge; they're never in the exported file. **Download PNG** gives you the exact 1280×720 file Studio wants.

**🧭 Strategy** — the standing playbook: the channel audit, the Nas.com four-layer flywheel, the three content pillars (40% Destination / 35% Tech & Setup / 25% Real World × Sim), and the minute-by-minute long-form video blueprint. Read it when planning; the other tabs execute it.

**🛫 Runway** — the 90-day plan as checklists. Check things off; progress saves itself and the Flight Deck nags you with what's next. Below it, the **Weekly Review Ritual** — six boxes that reset every Sunday.

**💰 Revenue** — the six-stream monetization stack. Toggle a stream **Active** when you launch it, type what it earned this month, and watch the total climb toward the $500/month target. The Mission Data card at the bottom is also where backups live.

## The weekly ritual — 15 minutes, Sundays

Open the **Runway** tab, Weekly Review card, and work the six boxes: check CTR/AVD on the week's uploads, flag any under-5%-CTR video for a thumbnail retest, reply to every comment, post the community poll, cut two Shorts, confirm the logging streak. The list resets itself every Sunday.

## Backups — do this weekly

**Revenue tab → Export Backup (JSON).** One file, everything in it (log, videos, checklists, revenue). Keep it wherever you keep things that matter. **Import Backup** restores it — including onto a new computer or into a different browser. The CSV export is for spreadsheets; the JSON backup is the real safety net.

## Quick answers

- **I got a new version of the HTML file — will I lose my data?** No. Replace the old file with the new one (same folder) or just use the hosted URL; data lives in the browser, not the file.
- **Numbers look wrong?** Daily Log tab → Edit on that row. One entry per date; saving the same date updates it.
- **What actually grows a channel?** In order: AVD ≥ 50% (make the middle of videos better), CTR ≥ 5% (make thumbnails/titles better at 168px), consistency (the streaks — uploads and logging). Subscriber count follows those three; that's why it isn't the number the tool asks you to chase.

*Cleared for takeoff. ◆ KDEN*
