export default defineContentScript({
  matches: [
    "*://*.paypal.com/*",
    "*://*.sandbox.paypal.com/*",
    "*://*.stripe.com/*",
    "*://localhost/*",
    "*://127.0.0.1/*",
    "*://*.test/*",
    "*://*.appspot.com/*",
  ],
  main() {
    let lastFocusedInput: HTMLInputElement | null = null;

    // Track input đang được focus/right-click
    document.addEventListener("focusin", (e) => {
      if (e.target instanceof HTMLInputElement) {
        lastFocusedInput = e.target;
      }
    });
    document.addEventListener("contextmenu", (e) => {
      if (e.target instanceof HTMLInputElement) {
        lastFocusedInput = e.target;
      }
    });

    browser.runtime.onMessage.addListener((message) => {
      if (message.action === "fillCard") {
        void fillCardForm(message.card);
      }
      if (message.action === "fillField") {
        const el = lastFocusedInput;
        if (el) fillInput(el, message.value);
      }
    });
  },
});

interface CardData {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  country?: string;
}

function setNativeValue(el: HTMLInputElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    globalThis.HTMLInputElement.prototype,
    "value",
  )?.set;
  nativeInputValueSetter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function fillInput(el: HTMLInputElement | null, value: string) {
  if (!el) return;
  setNativeValue(el, value);
}

async function fillInputAsync(el: HTMLInputElement | null, value: string) {
  if (!el) return;
  setNativeValue(el, value);
  await new Promise((r) => setTimeout(r, 50));
}

function findInput(selectors: string[]): HTMLInputElement | null {
  for (const sel of selectors) {
    const el = document.querySelector<HTMLInputElement>(sel);
    if (el) return el;
  }
  return null;
}

async function fillCardForm(card: CardData) {
  // Card number
  const cardNumberEl = findInput([
    'input[name*="card" i][name*="number" i]',
    'input[id*="card" i][id*="number" i]',
    'input[placeholder*="card number" i]',
    'input[placeholder*="số thẻ" i]',
    'input[autocomplete="cc-number"]',
    'input[data-testid*="card-number" i]',
    'input[name="cardnumber"]',
    'input[name="card_number"]',
    'input[name="ccnumber"]',
    'input[name="cc-number"]',
  ]);
  await fillInputAsync(cardNumberEl, card.number);

  // Expiry
  const expiryEl = findInput([
    'input[name*="expir" i]',
    'input[id*="expir" i]',
    'input[placeholder*="mm/yy" i]',
    'input[placeholder*="mm / yy" i]',
    'input[placeholder*="expiry" i]',
    'input[autocomplete="cc-exp"]',
    'input[name="exp-date"]',
    'input[name="expdate"]',
    'input[name="cc-exp"]',
  ]);

  if (expiryEl) {
    await fillInputAsync(expiryEl, card.expiry);
  } else {
    const [month, year] = card.expiry.split("/");
    const monthEl = findInput([
      'input[name*="exp" i][name*="month" i]',
      'input[id*="exp" i][id*="month" i]',
      'input[autocomplete="cc-exp-month"]',
      'select[name*="exp" i][name*="month" i]',
    ]);
    const yearEl = findInput([
      'input[name*="exp" i][name*="year" i]',
      'input[id*="exp" i][id*="year" i]',
      'input[autocomplete="cc-exp-year"]',
    ]);
    await fillInputAsync(monthEl, month);
    await fillInputAsync(yearEl, year.length === 2 ? `20${year}` : year);
  }

  // CVV
  const cvvEl = findInput([
    'input[name*="cvv" i]',
    'input[name*="cvc" i]',
    'input[name*="csc" i]',
    'input[id*="cvv" i]',
    'input[id*="cvc" i]',
    'input[placeholder*="cvv" i]',
    'input[placeholder*="cvc" i]',
    'input[autocomplete="cc-csc"]',
    'input[name="securityCode"]',
    'input[name="security_code"]',
  ]);
  await fillInputAsync(cvvEl, card.cvv);

  // Cardholder name
  const nameEl = findInput([
    'input[name*="card" i][name*="name" i]',
    'input[id*="card" i][id*="name" i]',
    'input[name*="holder" i]',
    'input[placeholder*="name on card" i]',
    'input[placeholder*="cardholder" i]',
    'input[autocomplete="cc-name"]',
    'input[name="ccname"]',
    'input[name="cc-name"]',
  ]);
  await fillInputAsync(nameEl, card.name);

  // Country
  if (card.country) {
    const countryEl = findInput([
      'input[name*="country" i]',
      'input[id*="country" i]',
      'input[autocomplete="country"]',
      'input[autocomplete="billing country"]',
    ]);
    await fillInputAsync(countryEl, card.country);

    const countrySelect = document.querySelector<HTMLSelectElement>(
      'select[name*="country" i], select[id*="country" i], select[autocomplete="country"]',
    );
    if (countrySelect) {
      const opt = Array.from(countrySelect.options).find(
        (o) =>
          o.value.toUpperCase() === card.country ||
          o.text.toUpperCase().includes(card.country!.toUpperCase()),
      );
      if (opt) {
        countrySelect.value = opt.value;
        countrySelect.dispatchEvent(new Event("change", { bubbles: false }));
      }
    }
  }
}
