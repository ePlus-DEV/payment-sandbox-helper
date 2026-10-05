export type PaymentProvider = "paypal" | "stripe";

export type ScenarioCategory =
  | "success"
  | "decline"
  | "3ds"
  | "radar"
  | "dispute"
  | "error";

export interface TestScenarioCard {
  id: string;
  provider: PaymentProvider;
  label: string;
  number: string;
  brand: string;
  cvvLen: 3 | 4;
  desc: string;
  category: ScenarioCategory;
  nameOverride?: string;
}

export interface PaypalErrorTrigger {
  id: string;
  name: string;
  trigger: string;
  code: string;
  desc: string;
}

export const PAYPAL_SUCCESS_CARDS: TestScenarioCard[] = [
  {
    id: "paypal-success-visa",
    provider: "paypal",
    label: "Visa",
    number: "4012888888881881",
    brand: "visa",
    cvvLen: 3,
    desc: "Successful sandbox payment",
    category: "success",
  },
  {
    id: "paypal-success-mastercard",
    provider: "paypal",
    label: "Mastercard",
    number: "2223000048400011",
    brand: "mastercard",
    cvvLen: 3,
    desc: "Successful sandbox payment",
    category: "success",
  },
  {
    id: "paypal-success-amex",
    provider: "paypal",
    label: "American Express",
    number: "371449635398431",
    brand: "amex",
    cvvLen: 4,
    desc: "Successful sandbox payment",
    category: "success",
  },
];

export const PAYPAL_ERROR_TRIGGERS: PaypalErrorTrigger[] = [
  {
    id: "paypal-error-refused",
    name: "Card refused",
    trigger: "CCREJECT-REFUSED",
    code: "0500",
    desc: "DO_NOT_HONOR",
  },
  {
    id: "paypal-error-fraud",
    name: "Fraudulent card",
    trigger: "CCREJECT-SF",
    code: "9500",
    desc: "SUSPECTED_FRAUD. Try using another card. Do not retry the same card.",
  },
  {
    id: "paypal-error-expired",
    name: "Card expired",
    trigger: "CCREJECT-EC",
    code: "5400",
    desc: "EXPIRED_CARD",
  },
  {
    id: "paypal-error-luhn",
    name: "Luhn check fails",
    trigger: "CCREJECT-IRC",
    code: "5180",
    desc: "INVALID_OR_RESTRICTED_CARD. Try using another card. Do not retry the same card.",
  },
  {
    id: "paypal-error-funds",
    name: "Insufficient funds",
    trigger: "CCREJECT-IF",
    code: "5120",
    desc: "INSUFFICIENT_FUNDS",
  },
  {
    id: "paypal-error-lost",
    name: "Card lost/stolen",
    trigger: "CCREJECT-LS",
    code: "9520",
    desc: "LOST_OR_STOLEN. Try using another card. Do not retry the same card.",
  },
  {
    id: "paypal-error-account",
    name: "Card not valid",
    trigger: "CCREJECT-IA",
    code: "1330",
    desc: "INVALID_ACCOUNT",
  },
  {
    id: "paypal-error-declined",
    name: "Card declined",
    trigger: "CCREJECT-BANK_ERROR",
    code: "5100",
    desc: "GENERIC_DECLINE",
  },
  {
    id: "paypal-error-cvv",
    name: "CVC check fails",
    trigger: "CCREJECT-CVV_F",
    code: "00N7",
    desc: "CVV2_FAILURE_POSSIBLE_RETRY_WITH_CVV",
  },
];

export const PAYPAL_3DS_CARDS: TestScenarioCard[] = [
  {
    id: "paypal-3ds-frictionless-success",
    provider: "paypal",
    label: "3DS - Frictionless success",
    number: "4868719196829038",
    brand: "visa",
    cvvLen: 3,
    desc: "Authentication Y · liability shift possible",
    category: "3ds",
  },
  {
    id: "paypal-3ds-frictionless-failed",
    provider: "paypal",
    label: "3DS - Frictionless failed",
    number: "4868719158130060",
    brand: "visa",
    cvvLen: 3,
    desc: "Authentication N · no liability shift",
    category: "3ds",
  },
  {
    id: "paypal-3ds-frictionless-attempt",
    provider: "paypal",
    label: "3DS - Stand-in attempt",
    number: "4868719581920723",
    brand: "visa",
    cvvLen: 3,
    desc: "Authentication A · stand-in attempt",
    category: "3ds",
  },
  {
    id: "paypal-3ds-stepup-success",
    provider: "paypal",
    label: "3DS - Step-up success",
    number: "4868719166101368",
    brand: "visa",
    cvvLen: 3,
    desc: "Step-up authentication succeeds",
    category: "3ds",
  },
  {
    id: "paypal-3ds-stepup-failed",
    provider: "paypal",
    label: "3DS - Step-up failed",
    number: "4868719181895556",
    brand: "visa",
    cvvLen: 3,
    desc: "Step-up authentication fails",
    category: "3ds",
  },
];

export const STRIPE_TEST_CARDS: TestScenarioCard[] = [
  { id: "stripe-success-visa", provider: "stripe", label: "Visa", number: "4242424242424242", brand: "visa", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-visa-debit", provider: "stripe", label: "Visa (debit)", number: "4000056655665556", brand: "visa", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-mastercard", provider: "stripe", label: "Mastercard", number: "5555555555554444", brand: "mastercard", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-mastercard-2", provider: "stripe", label: "Mastercard (2-series)", number: "2223003122003222", brand: "mastercard", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-mastercard-debit", provider: "stripe", label: "Mastercard (debit)", number: "5200828282828210", brand: "mastercard", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-mastercard-prepaid", provider: "stripe", label: "Mastercard (prepaid)", number: "5105105105105100", brand: "mastercard", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-amex-1", provider: "stripe", label: "American Express", number: "378282246310005", brand: "amex", cvvLen: 4, desc: "Succeeds", category: "success" },
  { id: "stripe-success-amex-2", provider: "stripe", label: "American Express", number: "371449635398431", brand: "amex", cvvLen: 4, desc: "Succeeds", category: "success" },
  { id: "stripe-success-discover-1", provider: "stripe", label: "Discover", number: "6011111111111117", brand: "discover", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-discover-2", provider: "stripe", label: "Discover", number: "6011000990139424", brand: "discover", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-diners", provider: "stripe", label: "Diners Club", number: "3056930009020004", brand: "diners", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-diners-14", provider: "stripe", label: "Diners Club (14-digit)", number: "36227206271667", brand: "diners", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-jcb", provider: "stripe", label: "JCB", number: "3566002020360505", brand: "jcb", cvvLen: 3, desc: "Succeeds", category: "success" },
  { id: "stripe-success-unionpay", provider: "stripe", label: "UnionPay", number: "6200000000000005", brand: "cup", cvvLen: 3, desc: "Succeeds", category: "success" },

  { id: "stripe-decline-generic", provider: "stripe", label: "Generic decline", number: "4000000000000002", brand: "visa", cvvLen: 3, desc: "card_declined", category: "decline" },
  { id: "stripe-decline-funds", provider: "stripe", label: "Insufficient funds", number: "4000000000009995", brand: "visa", cvvLen: 3, desc: "insufficient_funds", category: "decline" },
  { id: "stripe-decline-lost", provider: "stripe", label: "Lost card", number: "4000000000009987", brand: "visa", cvvLen: 3, desc: "lost_card", category: "decline" },
  { id: "stripe-decline-stolen", provider: "stripe", label: "Stolen card", number: "4000000000009979", brand: "visa", cvvLen: 3, desc: "stolen_card", category: "decline" },
  { id: "stripe-decline-expired", provider: "stripe", label: "Expired card", number: "4000000000000069", brand: "visa", cvvLen: 3, desc: "expired_card", category: "decline" },
  { id: "stripe-decline-cvc", provider: "stripe", label: "Incorrect CVC", number: "4000000000000127", brand: "visa", cvvLen: 3, desc: "incorrect_cvc", category: "decline" },
  { id: "stripe-decline-processing", provider: "stripe", label: "Processing error", number: "4000000000000119", brand: "visa", cvvLen: 3, desc: "processing_error", category: "decline" },
  { id: "stripe-decline-fraud", provider: "stripe", label: "Fraudulent", number: "4100000000000019", brand: "visa", cvvLen: 3, desc: "fraudulent (Radar)", category: "decline" },

  { id: "stripe-3ds-always", provider: "stripe", label: "3DS - Always auth", number: "4000002760003184", brand: "visa", cvvLen: 3, desc: "Requires 3DS auth", category: "3ds" },
  { id: "stripe-3ds-decline", provider: "stripe", label: "3DS - Auth or decline", number: "4000008400001629", brand: "visa", cvvLen: 3, desc: "3DS then declined", category: "3ds" },
  { id: "stripe-3ds-frictionless", provider: "stripe", label: "3DS - Frictionless", number: "4000000000003220", brand: "visa", cvvLen: 3, desc: "Frictionless flow", category: "3ds" },

  { id: "stripe-radar-blocked", provider: "stripe", label: "Radar - Always blocked", number: "4100000000000019", brand: "visa", cvvLen: 3, desc: "Highest risk · Radar always blocks", category: "radar" },
  { id: "stripe-radar-highest", provider: "stripe", label: "Radar - Highest risk", number: "4000000000004954", brand: "visa", cvvLen: 3, desc: "Highest risk level", category: "radar" },
  { id: "stripe-radar-elevated", provider: "stripe", label: "Radar - Elevated risk", number: "4000000000009235", brand: "visa", cvvLen: 3, desc: "May be queued for review", category: "radar" },
  { id: "stripe-radar-adaptive-3ds", provider: "stripe", label: "Radar - Adaptive 3DS", number: "4000008405600003", brand: "visa", cvvLen: 3, desc: "Triggers Adaptive 3DS when enabled", category: "radar" },

  { id: "stripe-dispute-fraud", provider: "stripe", label: "Dispute - Fraudulent", number: "4000000000000259", brand: "visa", cvvLen: 3, desc: "Succeeds then disputed as fraudulent", category: "dispute" },
  { id: "stripe-dispute-not-received", provider: "stripe", label: "Dispute - Product not received", number: "4000000000002685", brand: "visa", cvvLen: 3, desc: "Succeeds then disputed as not received", category: "dispute" },
  { id: "stripe-dispute-inquiry", provider: "stripe", label: "Dispute - Inquiry", number: "4000000000001976", brand: "visa", cvvLen: 3, desc: "Succeeds then creates an inquiry", category: "dispute" },
  { id: "stripe-dispute-early-fraud", provider: "stripe", label: "Dispute - Early fraud warning", number: "4000000000005423", brand: "visa", cvvLen: 3, desc: "Succeeds then receives early fraud warning", category: "dispute" },
];

export const PAYPAL_CONTEXT_SCENARIOS: TestScenarioCard[] = [
  ...PAYPAL_SUCCESS_CARDS,
  ...PAYPAL_ERROR_TRIGGERS.map((item) => ({
    id: item.id,
    provider: "paypal" as const,
    label: item.name,
    number: "4012888888881881",
    brand: "visa",
    cvvLen: 3 as const,
    desc: item.desc,
    category: "error" as const,
    nameOverride: item.trigger,
  })),
  ...PAYPAL_3DS_CARDS,
];

export const STRIPE_CONTEXT_SCENARIOS = STRIPE_TEST_CARDS;
