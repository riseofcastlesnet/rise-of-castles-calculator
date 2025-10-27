// Constants: CoP per troop for each action.
const COP_BY_ACTION = {
  "Train SSS": 475,
  "Train Lofty": 400,
  "Train T10": 325,
  "Train T9": 300, // Waiting for Friday to check
  "Promote T9 to T10": 25,
  "Promote T9E to T10E": 25,
  "Enhance T10 to T10E": 175,
  "Enhance T9 to T9E": 150,
};

// Utilities
function parseIntOrZero(v) {
  if (typeof v === "string") v = v.replace(/\D/g, "");
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
}

function formatNumber(n, decimals = 3) {
  const rounded = Math.round((n + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
  return rounded.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatInteger(n) {
  return Math.round(n).toLocaleString(undefined);
}

function formatEuropeanInteger(n) {
  return Math.round(n).toLocaleString("de-DE");
}

function hoursToDhms(totalHours) {
  if (!Number.isFinite(totalHours)) return "N/A";
  const totalSeconds = Math.max(0, Math.floor(totalHours * 3600));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days) parts.push(days + "d");
  if (hours || days) parts.push(hours + "h");
  if (minutes || hours || days) parts.push(minutes + "m");
  parts.push(seconds + "s");
  return parts.join(" ");
}

// Enforce digits-only typing
document.querySelectorAll(".only-digits").forEach((el) => {
  el.addEventListener("input", (e) => {
    const start = el.selectionStart;
    const end = el.selectionEnd;
    el.value = el.value.replace(/\D/g, "");
    // Restore caret
    el.setSelectionRange(start, end);
  });
});

// Main calculation
function calculate() {
  const action = document.getElementById("action").value;
  const E = parseIntOrZero(document.getElementById("colE").value);
  const C = parseIntOrZero(document.getElementById("colC").value);
  const D = parseIntOrZero(document.getElementById("colD").value);
  const amount = parseIntOrZero(document.getElementById("amount").value);
  const validationMsg = document.getElementById("validationMsg");
  const results = document.getElementById("results");
  validationMsg.textContent = "";
  results.innerHTML = "";

  if (E <= 0) {
    validationMsg.textContent = "Column E must be a positive number (cannot divide by 0).";
    return;
  }
  if (amount <= 0) {
    validationMsg.textContent = "Enter a positive amount to train.";
    return;
  }

  // Background calculations
  const gemPerTroop = C / E;        // C/E
  const speedHoursPerTroop = D / E; // D/E

  // Total for requested amount
  const totalGems = gemPerTroop * amount;
  const totalHours = speedHoursPerTroop * amount;

  // CoP calculations
  const baseCop = COP_BY_ACTION[action];
  const hasCop = baseCop !== null && baseCop !== undefined;
  const totalCopBase = hasCop ? baseCop * amount : null;
  const totalCopX3 = hasCop ? totalCopBase * 3 : null;
  const totalCopX4 = hasCop ? totalCopBase * 4 : null;

  // Compose results
  const list = document.createElement("div");
  list.className = "space-y-3";

  const li1 = document.createElement("div");
  li1.className = "result-card";
  li1.innerHTML = `<div class="text-sm sm:text-base">
    <div class="font-semibold">Gems needed</div>
	<div class="mt-1">
	  <span class="text-2xl font-extrabold">${formatEuropeanInteger(totalGems)}</span>
	  <span class="text-slate-400"> gems</span>
	</div>
    <div class="mt-1 text-slate-300/90 text-sm">Speedups required: 
		<span class="font-semibold">${Math.ceil(totalHours)} hours</span>
		<span class="text-slate-400"> (~ ${hoursToDhms(totalHours)})</span>
	</div>
    <div class="mt-2 text-xs text-slate-400">gem/troop = C/E = ${formatNumber(gemPerTroop, 6)} · hours/troop = D/E = ${formatNumber(speedHoursPerTroop, 6)}</div>
  </div>`;
  list.appendChild(li1);

  const li2 = document.createElement("div");
  li2.className = "result-card";
  if (hasCop) {
    li2.innerHTML = `<div class="text-sm sm:text-base">
      <div class="font-semibold">Clash of Province (CoP)</div>
      <div class="mt-1">Per troop baseline for <span class="font-semibold">${action}</span> = <span class="font-semibold">${baseCop}</span></div>
      <div class="mt-1">×3 event: <span class="font-semibold">${formatInteger(totalCopX3)}</span></div>
      <div class="mt-1">×4 <span class="text-slate-400">(100% buff)</span>: <span class="font-semibold">${formatInteger(totalCopX4)}</span></div>
    </div>`;
  } else {
    li2.innerHTML = `<div class="text-sm sm:text-base">
      <div class="font-semibold">Clash of Province (CoP)</div>
      <div class="mt-1 text-amber-300">No baseline CoP per troop is set for “${action}”.</div>
    </div>`;
  }
  list.appendChild(li2);

  results.appendChild(list);
}

document.getElementById("calcBtn").addEventListener("click", calculate);


// --- Custom dropdown (modern Tailwind) ---
(function(){
  const root = document.getElementById("actionDropdown");
  const menu = document.getElementById("actionMenu");
  const btn = document.getElementById("actionBtn");
  const label = document.getElementById("actionLabel");
  const hidden = document.getElementById("action");
  const items = Array.from(menu.querySelectorAll(".dropdown-item"));
  let open = false;
  let activeIndex = 0;

  function openMenu() {
    menu.classList.remove("hidden");
    open = true;
    menu.focus();
    setActiveByValue(hidden.value);
  }
  function closeMenu() {
    menu.classList.add("hidden");
    open = false;
  }
  function setActive(index) {
    activeIndex = (index + items.length) % items.length;
    items.forEach((el, i) => {
      el.setAttribute("aria-selected", i === activeIndex ? "true" : "false");
      if (i === activeIndex) el.scrollIntoView({ block: "nearest" });
    });
  }
  function setActiveByValue(val) {
    const idx = items.findIndex(el => el.dataset.value === val);
    setActive(idx >= 0 ? idx : 0);
  }
  function choose(index) {
    setActive(index);
    const val = items[activeIndex].dataset.value;
    hidden.value = val;
    label.textContent = val;
    closeMenu();
  }

  btn.addEventListener("click", () => (open ? closeMenu() : openMenu()));

  items.forEach((el, i) => {
    el.addEventListener("click", () => choose(i));
    el.addEventListener("mousemove", () => setActive(i));
  });

  // Keyboard support
  menu.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === "Enter") { e.preventDefault(); choose(activeIndex); }
    else if (e.key === "Escape") { e.preventDefault(); closeMenu(); btn.focus(); }
  });
  btn.addEventListener("keydown", (e) => {
    if ((e.key === "Enter") || (e.key === " ")) { e.preventDefault(); openMenu(); }
    if (e.key === "ArrowDown") { e.preventDefault(); openMenu(); }
  });

  // Close if clicked outside
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) closeMenu();
  });
})();
