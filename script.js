/* ==========================================================
   WING DROP — script.js
   EDIT THE SETTINGS BELOW to make the site yours.
   ========================================================== */

// 1) Your Facebook page username (the part after facebook.com/).
//    Example: if your page is facebook.com/WingDropLima, use "WingDropLima".
const MESSENGER_PAGE = "YOUR_PAGE_USERNAME";

// 2) Prices for each size.
const CURRENCY = "$";
const PRICES = { 6: 8.99, 12: 15.99, 24: 29.99 };

// 3) Top 10 most common wing flavors. heat = 0 (mild) to 5 (very hot).
const FLAVORS = [
  { name: "Buffalo",          heat: 3, desc: "The classic. Tangy cayenne-vinegar sauce with a buttery kick." },
  { name: "Honey BBQ",        heat: 1, desc: "Smoky, sticky and sweet. A crowd pleaser every time." },
  { name: "Garlic Parmesan",  heat: 0, desc: "Buttery garlic sauce tossed with nutty parmesan." },
  { name: "Lemon Pepper",     heat: 1, desc: "Zesty citrus and cracked black pepper, dry-rub style." },
  { name: "Honey Hot",        heat: 3, desc: "Sweet honey meets a slow-building chili heat." },
  { name: "Teriyaki",         heat: 0, desc: "Sweet soy glaze with ginger and garlic." },
  { name: "Sweet Chili",      heat: 2, desc: "Sticky, sweet and a little spicy. Super addictive." },
  { name: "Cajun",            heat: 3, desc: "Bold Louisiana spice blend with paprika and herbs." },
  { name: "Mango Habanero",   heat: 4, desc: "Tropical mango sweetness with a fiery habanero bite." },
  { name: "Nashville Hot",    heat: 5, desc: "Cayenne-packed, brick-red heat. Not for the faint of heart." }
];

/* ---------- Helpers ---------- */
const messengerUrl = "https://m.me/" + encodeURIComponent(MESSENGER_PAGE);
const money = (n) => CURRENCY + n.toFixed(2);
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/* ---------- Build the flavor cards ---------- */
const grid = document.getElementById("flavorGrid");

function flames(heat) {
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += `<svg class="${i <= heat ? "on" : ""}" aria-hidden="true"><use href="#flame"/></svg>`;
  }
  return out;
}

function heatLabel(h) {
  return ["Mild", "Mild", "Medium", "Hot", "Extra hot", "Fire"][h];
}

function cardHTML(f, i) {
  const id = slug(f.name);
  const sizes = Object.keys(PRICES)
    .map((n, idx) => `
      <label>
        <input type="radio" name="size-${id}" value="${n}" ${idx === 1 ? "checked" : ""}>
        <span><b>${n}</b><small>wings</small></span>
      </label>`)
    .join("");

  return `
    <article class="card" data-flavor="${f.name}">
      <span class="card__rank" aria-label="Number ${i + 1}">${i + 1}</span>
      <div class="card__img">
        <svg viewBox="0 0 260 190" role="img" aria-label="${f.name} chicken wings">
          <use href="#wing" x="14"  y="52" width="110" height="100" transform="rotate(-8 69 102)"/>
          <use href="#wing" x="132" y="48" width="110" height="100" transform="rotate(10 187 98)"/>
          <use href="#wing" x="70"  y="70" width="120" height="110"/>
        </svg>
      </div>
      <div class="card__body">
        <div class="card__top">
          <h3 class="card__name">${f.name}</h3>
          <div class="card__heat" role="img" aria-label="Heat level: ${heatLabel(f.heat)}">${flames(f.heat)}</div>
        </div>
        <p class="card__desc">${f.desc}</p>
        <fieldset class="sizes">
          <legend>Choose your size</legend>
          ${sizes}
        </fieldset>
        <div class="card__foot">
          <div class="card__price"><small>Total</small><span data-price>${money(PRICES[12])}</span></div>
          <button class="btn btn--messenger" type="button" data-order>
            <svg aria-hidden="true"><use href="#messenger"/></svg>
            Order on<br>Messenger
          </button>
        </div>
      </div>
    </article>`;
}

grid.innerHTML = FLAVORS.map(cardHTML).join("");

/* ---------- Card interactions ---------- */
function selectedSize(card) {
  const checked = card.querySelector("input[type=radio]:checked");
  return Number(checked.value);
}

// Update price when size changes
grid.addEventListener("change", (e) => {
  if (!e.target.matches("input[type=radio]")) return;
  const card = e.target.closest(".card");
  card.querySelector("[data-price]").textContent = money(PRICES[selectedSize(card)]);
});

// Order button
grid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-order]");
  if (!btn) return;
  const card = btn.closest(".card");
  const flavor = card.dataset.flavor;
  const size = selectedSize(card);
  const message =
    `Hi! I'd like to order ${size} ${flavor} wings (${money(PRICES[size])}). ` +
    `My delivery address is: `;
  sendToMessenger(message);
});

/* ---------- Messenger ordering ----------
   Messenger links can't pre-fill a message, so we copy the order text
   to the clipboard and open the chat. The customer just pastes it in. */
const toast = document.getElementById("toast");
let toastTimer;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 5000);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers / non-secure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
}

async function sendToMessenger(message) {
  const copied = await copyText(message);
  showToast(
    copied
      ? "Order copied! Paste it into Messenger and add your address."
      : "Opening Messenger. Tell us your flavor, size and address."
  );
  window.open(messengerUrl, "_blank", "noopener");
}

// Make every generic "Order on Messenger" link point to your page
document.querySelectorAll("[data-messenger]").forEach((a) => {
  a.href = messengerUrl;
});

/* ---------- Mobile nav ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

navLinks.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Footer year ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
