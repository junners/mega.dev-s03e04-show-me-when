---
id: SCHED-4515
title: List holds still; "N new" bar brings new incidents in
status: done
plan: R1 (changed), R2, R4
---

Product, after the step-one recording (00:14: the pointer rested on INC-7737's Ack, INC-7119 slid in at the
top, the click acked INC-7119): "The list holds still while it is on screen; a "N new" bar brings new
incidents in on click. Ack stays on the row."

- A refresh never inserts, removes or reorders rows; it updates rows already shown in place.
- New incidents wait behind a `data-testid="new-bar"` button ("N new incidents · show") above the list,
  in space the page always keeps, so the bar appearing moves nothing. Clicking it brings them in at the top.
- Ack keeps acking its own row's id; the acked mark stays on that incident after the bar is clicked.

Acceptance: rest the pointer on a row's Ack while new incidents arrive; the row stays put and the click acks
that row. The bar shows the count; clicking it puts the new incidents at the top.
