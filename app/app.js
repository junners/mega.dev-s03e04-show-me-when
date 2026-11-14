import { fetchIncidents, ack } from './api.js';

const REFRESH_MS = 2000; // R4

const list = document.querySelector('[data-testid="incident-list"]');
const loader = document.querySelector('[data-testid="loader"]');
const empty = document.querySelector('[data-testid="empty"]');
const status = document.querySelector('[data-status]');

const rows = new Map(); // incident id -> <li>, so a refresh keeps rows (and their ack state) in place

// R5: the viewer's own zone and order (en-GB / de / fr … put the day first, en-US the month).
const timeFormat = new Intl.DateTimeFormat(navigator.languages, {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
});
export function localTime(iso) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : timeFormat.format(d);
}

function el(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

function markAcked(li, reply) {
  const mark = el('span', { 'data-testid': 'acked', class: 'acked' }, `acked ${localTime(reply.ackedAt)}`);
  li.querySelector('.act').replaceChildren(mark);
  li.classList.add('is-acked');
}

// R2: Ack sends api.ack(id) for the row's own id and marks that row acked.
async function onAck(event) {
  const button = event.currentTarget;
  const li = button.closest('[data-testid="incident-row"]');
  button.disabled = true;
  button.textContent = 'Acking…';
  try {
    markAcked(li, await ack(li.dataset.id));
  } catch (err) {
    console.error(err);
    button.disabled = false;
    button.textContent = 'Ack';
    button.title = `Ack failed: ${err.message}`;
  }
}

function buildRow(i) {
  const li = el('li', { 'data-testid': 'incident-row', 'data-id': i.id, class: `row ${i.severity}` });
  const time = el('time', { datetime: i.openedAt, title: i.openedAt }, localTime(i.openedAt));
  const button = el('button', { type: 'button', 'data-testid': 'ack', class: 'ack' }, 'Ack');
  button.addEventListener('click', onAck);
  li.append(
    el('span', { class: 'id' }, i.id),
    el('span', { class: 'sev' }, i.severity),
    el('span', { class: 'what' }, `${i.service} · ${i.region} · ${i.summary}`),
    time,
    el('span', { class: 'act' }),
  );
  li.querySelector('.act').append(button);
  return li;
}

// The API can restate an incident (its openedAt moved between answers): keep the row, refresh its fields.
function updateRow(li, i) {
  const time = li.querySelector('time');
  if (time.getAttribute('datetime') !== i.openedAt) {
    time.setAttribute('datetime', i.openedAt);
    time.title = i.openedAt;
    time.textContent = localTime(i.openedAt);
  }
  const what = `${i.service} · ${i.region} · ${i.summary}`;
  const whatEl = li.querySelector('.what');
  if (whatEl.textContent !== what) whatEl.textContent = what;
  if (li.querySelector('.sev').textContent !== i.severity) {
    li.querySelector('.sev').textContent = i.severity;
    li.classList.remove('sev1', 'sev2', 'sev3', 'sev4');
    li.classList.add(i.severity);
  }
}

// R1: newest first, new ones at the top; existing rows are reused, not rebuilt.
function render(incidents) {
  const seen = new Set();
  let prev = null;
  for (const i of incidents) {
    seen.add(i.id);
    let li = rows.get(i.id);
    if (!li) {
      li = buildRow(i);
      rows.set(i.id, li);
    } else {
      updateRow(li, i);
    }
    const want = prev ? prev.nextSibling : list.firstChild;
    if (li !== want) list.insertBefore(li, want);
    prev = li;
  }
  for (const [id, li] of rows) {
    if (!seen.has(id)) {
      li.remove();
      rows.delete(id);
    }
  }
  empty.hidden = incidents.length > 0;
}

let loaded = false;
async function refresh() {
  try {
    const page = await fetchIncidents();
    render(page.incidents);
    if (!loaded) {
      loaded = true;
      loader.remove(); // R3: gone once incidents load
    }
    status.textContent = `· updated ${localTime(page.updatedAt)}`;
    status.classList.remove('stale');
  } catch (err) {
    console.error(err);
    if (!loaded) loader.textContent = 'Could not load incidents. Retrying…';
    status.textContent = '· refresh failed, retrying';
    status.classList.add('stale');
  } finally {
    setTimeout(refresh, REFRESH_MS); // R4: one request at a time, every 2 s
  }
}

refresh();
