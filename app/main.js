// The deal finder: hash routes, search and filters that work on the deal data.
// No network request is made: every deal lives in data.js.
//
//   #/                        the board, all deals
//   #/?category=Audio&sort=saving   the board with filters applied
//   #/deal/<id>               one deal
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { deals } from "./data.js";
import { listPage, dealPage, missingPage, percentOff, saved } from "./views.js";

const app = document.getElementById("app");

const categories = [...new Set(deals.map((d) => d.category))].sort();
const stores = [...new Set(deals.map((d) => d.store))].sort();

const state = {
  query: "",
  category: "All",
  store: "All stores",
  minOff: 0,
  sort: "discount",
};

function readHashState() {
  const raw = location.hash.slice(2);
  if (!raw.startsWith("?")) return;
  const params = new URLSearchParams(raw.slice(1));
  if (params.has("q")) state.query = params.get("q") || "";
  if (params.has("category") && (params.get("category") === "All" || categories.includes(params.get("category")))) {
    state.category = params.get("category");
  }
  if (params.has("store") && (params.get("store") === "All stores" || stores.includes(params.get("store")))) {
    state.store = params.get("store");
  }
  if (params.has("minoff")) {
    const n = Number(params.get("minoff"));
    if ([0, 20, 30, 40, 50].includes(n)) state.minOff = n;
  }
  if (params.has("sort") && ["discount", "saving", "price", "low"].includes(params.get("sort"))) {
    state.sort = params.get("sort");
  }
}

function applyFilters() {
  const q = state.query.trim().toLowerCase();
  let shown = deals.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All stores" && d.store !== state.store) return false;
    if (percentOff(d) < state.minOff) return false;
    if (q !== "" && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    discount: (a, b) => percentOff(b) - percentOff(a),
    saving: (a, b) => saved(b) - saved(a),
    price: (a, b) => a.price - b.price,
    low: (a, b) => (a.verdict.label === "new-low" ? 0 : 1) - (b.verdict.label === "new-low" ? 0 : 1) || percentOff(b) - percentOff(a),
  };
  shown = [...shown].sort(by[state.sort]);
  return shown;
}

function render() {
  window.__shotReady = false;
  const dealMatch = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = `${found ? found.title : "Not found"} | Real Deal Friday`;
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else {
    readHashState();
    document.title = "Real Deal Friday — Black Friday prices, checked today";
    app.innerHTML = listPage(deals, applyFilters(), state, categories, stores);
    const search = app.querySelector("#q");
    const store = app.querySelector("#store");
    const minoff = app.querySelector("#minoff");
    const sort = app.querySelector("#sort");
    const rerender = () => {
      const shown = applyFilters();
      const count = app.querySelector(".count");
      if (count) count.textContent = `Showing ${shown.length} of ${deals.length} deals`;
      const list = app.querySelector(".cards, .empty");
      if (list) {
        const fresh = document.createElement("div");
        fresh.innerHTML = listPage(deals, shown, state, categories, stores);
        const replacement = fresh.querySelector(".cards, .empty");
        list.replaceWith(replacement);
        const replacementCount = fresh.querySelector(".count");
        if (replacementCount && count) count.textContent = replacementCount.textContent;
      }
    };
    search.addEventListener("input", () => {
      state.query = search.value;
      rerender();
    });
    store.addEventListener("change", () => {
      state.store = store.value;
      rerender();
    });
    minoff.addEventListener("change", () => {
      state.minOff = Number(minoff.value);
      rerender();
    });
    sort.addEventListener("change", () => {
      state.sort = sort.value;
      rerender();
    });
    app.querySelectorAll(".chips button").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.category;
        app.querySelectorAll(".chips button").forEach((b) =>
          b.setAttribute("aria-pressed", String(b === button)),
        );
        rerender();
      });
    });
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
