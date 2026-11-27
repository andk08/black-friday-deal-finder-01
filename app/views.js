// HTML for each page, built from the deal data. Every value is escaped before
// it goes into the page. The list page is the whole board; a deal page is one
// deal with its full check record and any second store price.

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const usd = (n) =>
  `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);
export const saved = (d) => d.was - d.price;

const when = (iso) =>
  new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }) + " UTC";

const verdictWords = {
  "new-low": "New low",
  strong: "Strong price",
  routine: "Routine sale",
};

function card(d) {
  return `<li class="card">
  <h2><a href="#/deal/${encodeURIComponent(d.id)}">${escape(d.title)}</a></h2>
  <p class="meta">${escape(d.store)} &middot; ${escape(d.category)}</p>
  <p class="price-line"><span class="price">${usd(d.price)}</span> <span class="was">${usd(d.was)}</span> <span class="off">${percentOff(d)}% off</span></p>
  <p class="verdict ${escape(d.verdict.label)}"><b>${escape(verdictWords[d.verdict.label] || d.verdict.label)}</b> — ${escape(d.verdict.note)}</p>
  <p class="checked-note">Checked ${when(d.checked)} &middot; ${escape(d.source)}</p>
  <a class="go" href="${escape(d.url)}" rel="noopener">See it at ${escape(d.store)}</a>
</li>`;
}

export function cards(shown) {
  if (shown.length === 0) {
    return `<p class="empty">No deal matches. Clear the search or pick another filter.</p>`;
  }
  return `<ul class="cards">${shown.map(card).join("")}</ul>`;
}

export function statsLine(all) {
  const total = all.length;
  const avg = Math.round(all.reduce((s, d) => s + percentOff(d), 0) / total);
  const best = all.reduce((a, d) => (saved(d) > saved(a) ? d : a), all[0]);
  const lows = all.filter((d) => d.verdict.label === "new-low").length;
  return `<section class="stats" aria-label="Board summary">
  <div class="stat"><b>${total}</b><span>deals checked today</span></div>
  <div class="stat"><b>${avg}%</b><span>average discount</span></div>
  <div class="stat"><b>${usd(saved(best))}</b><span>biggest saving: ${escape(best.title)}</span></div>
  <div class="stat"><b>${lows}</b><span>new lows</span></div>
</section>`;
}

export function controls(categories, stores, state) {
  const catButtons = ["All", ...categories]
    .map(
      (c) =>
        `<li><button type="button" data-category="${escape(c)}" aria-pressed="${state.category === c}">${escape(c)}</button></li>`,
    )
    .join("");
  const storeOptions = ["All stores", ...stores]
    .map(
      (s) =>
        `<option value="${escape(s)}"${state.store === s ? " selected" : ""}>${escape(s)}</option>`,
    )
    .join("");
  const discountOptions = [0, 20, 30, 40, 50]
    .map(
      (n) =>
        `<option value="${n}"${state.minOff === n ? " selected" : ""}>${n === 0 ? "Any discount" : n + "% off or more"}</option>`,
    )
    .join("");
  const sortOptions = [
    ["discount", "Biggest % off first"],
    ["saving", "Biggest saving first"],
    ["price", "Lowest price first"],
    ["low", "New lows first"],
  ]
    .map(
      ([v, label]) =>
        `<option value="${v}"${state.sort === v ? " selected" : ""}>${label}</option>`,
    )
    .join("");
  return `<div class="controls">
  <input type="search" id="q" placeholder="Search deals, stores, categories&hellip;" value="${escape(state.query)}" aria-label="Search deals">
  <select id="store" aria-label="Filter by store">${storeOptions}</select>
  <select id="minoff" aria-label="Minimum discount">${discountOptions}</select>
  <select id="sort" aria-label="Sort deals">${sortOptions}</select>
</div>
<ul class="chips">${catButtons}</ul>`;
}

export function listPage(all, shown, state, categories, stores) {
  return `<h1>Black Friday deals, checked today</h1>
<p class="sub">19 real deals from 6 stores. Every price was read on 27 November 2026,
with the store and the source named on each deal.</p>
${statsLine(all)}
${controls(categories, stores, state)}
<p class="count">Showing ${shown.length} of ${all.length} deals</p>
${cards(shown)}
<section class="how">
<h2>How a deal earns its verdict</h2>
<p><b>New low</b> — the lowest price trackers have seen for this product.
<b>Strong price</b> — a deep cut on a current model, close to its best price.
<b>Routine sale</b> — a real discount, but an ordinary one, or a cut measured
against a list price the store raised first.</p>
<p>Prices were read at the store or in a deals source that names the store, and
each deal says when and where. A deal whose price no store or source showed
does not belong here.</p>
</section>`;
}

export function dealPage(d) {
  const also = d.alsoAt
    ? `<p class="also">Also at ${escape(d.alsoAt.store)} for ${usd(d.alsoAt.price)} — same product, checked the same day.</p>`
    : "";
  return `<div class="detail">
<p><a class="back" href="#/">&larr; All deals</a></p>
<h1>${escape(d.title)}</h1>
<dl>
  <dt>Store</dt><dd>${escape(d.store)}</dd>
  <dt>Category</dt><dd>${escape(d.category)}</dd>
  <dt>Price</dt><dd><span class="big-price">${usd(d.price)}</span> usually ${usd(d.was)} — ${percentOff(d)}% off, you save ${usd(saved(d))}</dd>
  <dt>Verdict</dt><dd><b>${escape(verdictWords[d.verdict.label] || d.verdict.label)}</b> — ${escape(d.verdict.note)}</dd>
  <dt>Checked</dt><dd>${when(d.checked)}</dd>
  <dt>Read in</dt><dd>${escape(d.source)}</dd>
</dl>
${also}
<p><a class="go" href="${escape(d.url)}" rel="noopener">See it at ${escape(d.store)}</a></p>
</div>`;
}

export function missingPage() {
  return `<h1>Not found</h1>
<p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
