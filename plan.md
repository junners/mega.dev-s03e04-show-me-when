# sched-prod incident board — plan

The on-call board for sched-prod. One page, one list: tonight's incidents, newest first, so on-call sees
what just broke and takes it.

## Flows

| flow | who | what happens |
|------|-----|--------------|
| `open-board` | on-call | opens the board; sees tonight's incidents |
| `ack-incident` | on-call | picks an incident on the board and acks it — "I've got this one" |
| `watch-board` | on-call | keeps the board open; it stays current without a reload |

## Requirements

- **R1** The list holds still while it is on screen: rows never move on their own. New incidents are
  announced live in a **"N new" bar** above the list (`new-bar`); clicking it brings them in at the top,
  newest first. The bar sits in space the page always keeps for it, so showing it moves nothing.
  *(Changed 2026-11-14 by product, after a recording showed a click at 00:14 ack the row that slid under
  the pointer instead of the one aimed at. Was: "New incidents appear live at the top of the list, newest first.")*
- **R2** Each incident row has an **Ack** button. Ack sends the ack (`api.ack(id)`) and marks the row acked.
  Ack stays on the row: the acked mark belongs to that incident and keeps it after the bar brings new ones in.
- **R3** Show a loader until incidents load.
- **R4** The board refreshes itself every 2 seconds while open: rows on screen update in place, and the
  `new-bar` count updates (R1).
- **R5** Times show in the viewer's local time; day before month for EU locales (dd/mm).
- **R6** The page names its build: `<meta name="build" content="<git sha>">` in the head and the same sha in the footer.

## Hooks (pinned — tests and the replay rely on them)

| `data-testid` | element |
|---------------|---------|
| `board` | the board's main area |
| `loader` | the loader (gone once incidents load) |
| `empty` | what shows when there are no incidents |
| `incident-list` | the list |
| `incident-row` | one incident row, with `data-id="<incident id>"` |
| `ack` | the Ack button in a row |
| `acked` | the acked mark in a row |
| `build-sha` | the sha in the footer |
| `new-bar` | the "N new" bar: hidden when nothing is waiting; click brings the new incidents in |

## Done

Every issue in `issues/` delivered, deployed to a public https address, and shown working.
