export default defineContentScript({
  matches: [
    "*://*.paypal.com/*",
    "*://*.sandbox.paypal.com/*",
    "*://*.stripe.com/*",
    "*://localhost/*",
    "*://127.0.0.1/*",
    "*://*.appspot.com/*",
  ],
  allFrames: true,
  matchAboutBlank: true,
  matchOriginAsFallback: true,
  main() {
    let lastFocusedInput: FillableTextElement | null = null;

    // Track the field that is focused or opened through the context menu.
    document.addEventListener("focusin", (event) => {
      if (isFillableTextElement(event.target)) {
        lastFocusedInput = event.target;
      }
    });

    document.addEventListener("contextmenu", (event) => {
      if (isFillableTextElement(event.target)) {
        lastFocusedInput = event.target;
      }
    });

    browser.runtime.onMessage.addListener((message: unknown) => {
      if (!isRecord(message)) return undefined;

      if (message.action === "fillCard" && isCardData(message.card)) {
        return fillCardForm(message.card);
      }

      if (message.action === "fillField" && typeof message.value === "string") {
        const success = fillInput(lastFocusedInput, message.value);
        return { success, filledFields: success ? 1 : 0 };
      }

      return undefined;
    });
  },
});

type FillableTextElement = HTMLInputElement | HTMLTextAreaElement;
type SearchRoot = Document | ShadowRoot;

interface CardData {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  country?: string;
}

interface FillResult {
  success: boolean;
  filledFields: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCardData(value: unknown): value is CardData {
  if (!isRecord(value)) return false;

  return (
    typeof value.number === "string" &&
    typeof value.expiry === "string" &&
    typeof value.cvv === "string" &&
    typeof value.name === "string" &&
    (value.country === undefined || typeof value.country === "string")
  );
}

function isFillableTextElement(
  target: EventTarget | null,
): target is FillableTextElement {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
}

function setNativeValue(el: FillableTextElement, value: string) {
  const prototype =
    el instanceof HTMLTextAreaElement
      ? globalThis.HTMLTextAreaElement.prototype
      : globalThis.HTMLInputElement.prototype;
  const nativeValueSetter = Object.getOwnPropertyDescriptor(
    prototype,
    "value",
  )?.set;

  if (nativeValueSetter) {
    nativeValueSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
}

function fillInput(el: FillableTextElement | null, value: string): boolean {
  if (!el || el.disabled || el.readOnly) return false;
  setNativeValue(el, value);
  return true;
}

function normalizeOptionValue(value: string): string {
  return value.trim().toUpperCase().replaceAll(/[^A-Z0-9]/g, "");
}

function fillSelect(el: HTMLSelectElement | null, value: string): boolean {
  if (!el || el.disabled) return false;

  const normalizedValue = normalizeOptionValue(value);
  const shortYear = /^20\d{2}$/.test(normalizedValue)
    ? normalizedValue.slice(-2)
    : normalizedValue;
  const numericValue = String(Number.parseInt(normalizedValue, 10));

  const option = Array.from(el.options).find((item) => {
    const optionValue = normalizeOptionValue(item.value);
    const optionText = normalizeOptionValue(item.text);

    return (
      optionValue === normalizedValue ||
      optionText === normalizedValue ||
      optionValue === shortYear ||
      optionText === shortYear ||
      (numericValue !== "NaN" &&
        (optionValue === numericValue || optionText === numericValue))
    );
  });

  if (!option) return false;

  el.value = option.value;
  el.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  return true;
}

async function fillInputAsync(
  el: FillableTextElement | HTMLSelectElement | null,
  value: string,
): Promise<boolean> {
  if (!el) return false;

  const success =
    el instanceof HTMLSelectElement
      ? fillSelect(el, value)
      : fillInput(el, value);

  if (success) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return success;
}

function getSearchRoots(): SearchRoot[] {
  const roots: SearchRoot[] = [document];

  for (const root of roots) {
    for (const element of root.querySelectorAll("*")) {
      if (element.shadowRoot && !roots.includes(element.shadowRoot)) {
        roots.push(element.shadowRoot);
      }
    }
  }

  return roots;
}

function findElement<T extends Element>(
  selectors: string[],
  roots: SearchRoot[],
): T | null {
  for (const selector of selectors) {
    for (const root of roots) {
      const element = root.querySelector<T>(selector);
      if (element) return element;
    }
  }

  return null;
}

function findInput(
  selectors: string[],
  roots: SearchRoot[],
): HTMLInputElement | null {
  return findElement<HTMLInputElement>(selectors, roots);
}

function findSelect(
  selectors: string[],
  roots: SearchRoot[],
): HTMLSelectElement | null {
  return findElement<HTMLSelectElement>(selectors, roots);
}

async function fillCardForm(card: CardData): Promise<FillResult> {
  const roots = getSearchRoots();
  let filledFields = 0;

  // Card number
  const cardNumberEl = findInput(
    [
      'input[name*="card" i][name*="number" i]',
      'input[id*="card" i][id*="number" i]',
      'input[placeholder*="card number" i]',
      'input[placeholder*="số thẻ" i]',
      'input[aria-label*="card number" i]',
      'input[autocomplete="cc-number"]',
      'input[data-testid*="card-number" i]',
      'input[data-elements-stable-field-name="cardNumber"]',
      'input[name="cardnumber"]',
      'input[name="card_number"]',
      'input[name="ccnumber"]',
      'input[name="cc-number"]',
    ],
    roots,
  );
  if (await fillInputAsync(cardNumberEl, card.number)) filledFields++;

  // Expiry
  const expiryEl = findInput(
    [
      'input[name*="expir" i]',
      'input[id*="expir" i]',
      'input[placeholder*="mm/yy" i]',
      'input[placeholder*="mm / yy" i]',
      'input[placeholder*="expiry" i]',
      'input[aria-label*="expiration" i]',
      'input[autocomplete="cc-exp"]',
      'input[data-elements-stable-field-name="cardExpiry"]',
      'input[name="exp-date"]',
      'input[name="expdate"]',
      'input[name="cc-exp"]',
    ],
    roots,
  );

  if (expiryEl) {
    const [month, year] = card.expiry.split("/");
    const normalizedExpiry =
      month && year ? `${month}/${year.slice(-2)}` : card.expiry;
    if (await fillInputAsync(expiryEl, normalizedExpiry)) filledFields++;
  } else {
    const [month = "", year = ""] = card.expiry.split("/");
    const monthEl =
      findInput(
        [
          'input[name*="exp" i][name*="month" i]',
          'input[id*="exp" i][id*="month" i]',
          'input[autocomplete="cc-exp-month"]',
        ],
        roots,
      ) ??
      findSelect(
        [
          'select[name*="exp" i][name*="month" i]',
          'select[id*="exp" i][id*="month" i]',
          'select[autocomplete="cc-exp-month"]',
        ],
        roots,
      );
    const yearEl =
      findInput(
        [
          'input[name*="exp" i][name*="year" i]',
          'input[id*="exp" i][id*="year" i]',
          'input[autocomplete="cc-exp-year"]',
        ],
        roots,
      ) ??
      findSelect(
        [
          'select[name*="exp" i][name*="year" i]',
          'select[id*="exp" i][id*="year" i]',
          'select[autocomplete="cc-exp-year"]',
        ],
        roots,
      );

    if (await fillInputAsync(monthEl, month)) filledFields++;
    if (
      await fillInputAsync(yearEl, year.length === 2 ? `20${year}` : year)
    ) {
      filledFields++;
    }
  }

  // CVV
  const cvvEl = findInput(
    [
      'input[name*="cvv" i]',
      'input[name*="cvc" i]',
      'input[name*="csc" i]',
      'input[id*="cvv" i]',
      'input[id*="cvc" i]',
      'input[placeholder*="cvv" i]',
      'input[placeholder*="cvc" i]',
      'input[aria-label*="security code" i]',
      'input[autocomplete="cc-csc"]',
      'input[data-elements-stable-field-name="cardCvc"]',
      'input[name="securityCode"]',
      'input[name="security_code"]',
    ],
    roots,
  );
  if (await fillInputAsync(cvvEl, card.cvv)) filledFields++;

  // Cardholder name
  const nameEl = findInput(
    [
      'input[name*="card" i][name*="name" i]',
      'input[id*="card" i][id*="name" i]',
      'input[name*="holder" i]',
      'input[placeholder*="name on card" i]',
      'input[placeholder*="cardholder" i]',
      'input[aria-label*="name on card" i]',
      'input[autocomplete="cc-name"]',
      'input[name="ccname"]',
      'input[name="cc-name"]',
    ],
    roots,
  );
  if (await fillInputAsync(nameEl, card.name)) filledFields++;

  // Country
  if (card.country) {
    const countryEl = findInput(
      [
        'input[name*="country" i]',
        'input[id*="country" i]',
        'input[autocomplete="country"]',
        'input[autocomplete="country-name"]',
        'input[autocomplete="billing country"]',
      ],
      roots,
    );
    if (await fillInputAsync(countryEl, card.country)) filledFields++;

    const countrySelect = findSelect(
      [
        'select[name*="country" i]',
        'select[id*="country" i]',
        'select[autocomplete="country"]',
        'select[autocomplete="country-name"]',
      ],
      roots,
    );
    if (fillSelect(countrySelect, card.country)) filledFields++;
  }

  return { success: filledFields > 0, filledFields };
}
