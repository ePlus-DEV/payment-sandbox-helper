export interface CardInfo {
  label: string;
  number: string;
  expiry: string;
  cvv: string;
  type: string;
}

// Luhn
function luhnChecksum(num: string): number {
  let sum = 0;
  let isEven = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(num[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10;
}

function generateLuhn(prefix: string, length: number): string {
  let num = prefix;
  while (num.length < length - 1) num += Math.floor(Math.random() * 10);
  const check = (10 - luhnChecksum(num + "0")) % 10;
  return num + check;
}

const CARD_SPECS: Record<string, { prefixes: string[]; length: number }> = {
  visa: { prefixes: ["4"], length: 16 },
  mastercard: {
    prefixes: ["51", "52", "53", "54", "55", "2221", "2720"],
    length: 16,
  },
  amex: { prefixes: ["34", "37"], length: 15 },
  diners: { prefixes: ["300", "301", "302", "303", "36", "38"], length: 14 },
  maestro: { prefixes: ["6304", "6759", "6761", "6762", "6763"], length: 16 },
  cup: { prefixes: ["62"], length: 16 },
  jcb: {
    prefixes: ["3528", "3529", "353", "354", "355", "356", "357", "358"],
    length: 16,
  },
};

export function generateCardNumber(type: string): string {
  const spec = CARD_SPECS[type];
  if (!spec) return "4242424242424242";
  const prefix =
    spec.prefixes[Math.floor(Math.random() * spec.prefixes.length)];
  return generateLuhn(prefix, spec.length);
}

export function randomCvv(amex = false): string {
  const len = amex ? 4 : 3;
  return String(Math.floor(Math.random() * Math.pow(10, len))).padStart(
    len,
    "0",
  );
}

export function randomExpiry(): string {
  const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  return `${String(month).padStart(2, "0")}/${year}`;
}

// PayPal static cards (dùng cho context menu)
export const PAYPAL_STATIC_CARDS: CardInfo[] = [
  {
    label: "Visa",
    number: "4012888888881881",
    expiry: randomExpiry(),
    cvv: randomCvv(),
    type: "visa",
  },
  {
    label: "Mastercard",
    number: "2223000048400011",
    expiry: randomExpiry(),
    cvv: randomCvv(),
    type: "mastercard",
  },
  {
    label: "Amex",
    number: "371449635398431",
    expiry: randomExpiry(),
    cvv: randomCvv(true),
    type: "amex",
  },
];

// Stripe static cards (dùng cho context menu)
export const STRIPE_STATIC_CARDS: CardInfo[] = [
  {
    label: "Visa",
    number: "4242424242424242",
    expiry: randomExpiry(),
    cvv: randomCvv(),
    type: "visa",
  },
  {
    label: "Mastercard",
    number: "5555555555554444",
    expiry: randomExpiry(),
    cvv: randomCvv(),
    type: "mastercard",
  },
  {
    label: "Amex",
    number: "378282246310005",
    expiry: randomExpiry(),
    cvv: randomCvv(true),
    type: "amex",
  },
  {
    label: "Visa (decline)",
    number: "4000000000000002",
    expiry: randomExpiry(),
    cvv: randomCvv(),
    type: "visa",
  },
];
