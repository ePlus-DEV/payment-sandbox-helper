export type ScenarioProvider = "stripe" | "paypal";
export type ScenarioCategory =
  | "success"
  | "decline"
  | "3ds"
  | "risk"
  | "checks"
  | "disputes";

export interface PaymentScenario {
  id: string;
  provider: ScenarioProvider;
  label: string;
  number: string;
  brand: string;
  cvvLen: 3 | 4;
  desc: string;
  category: ScenarioCategory;
  country?: string;
}

export const STRIPE_SCENARIOS: PaymentScenario[] = [
  { id: "stripe-visa", provider: "stripe", label: "Visa", number: "4242424242424242", brand: "visa", cvvLen: 3, desc: "Successful payment", category: "success" },
  { id: "stripe-visa-debit", provider: "stripe", label: "Visa debit", number: "4000056655665556", brand: "visa", cvvLen: 3, desc: "Successful debit payment", category: "success" },
  { id: "stripe-mastercard", provider: "stripe", label: "Mastercard", number: "5555555555554444", brand: "mastercard", cvvLen: 3, desc: "Successful payment", category: "success" },
  { id: "stripe-mastercard-2-series", provider: "stripe", label: "Mastercard 2-series", number: "2223003122003222", brand: "mastercard", cvvLen: 3, desc: "Successful payment", category: "success" },
  { id: "stripe-mastercard-debit", provider: "stripe", label: "Mastercard debit", number: "5200828282828210", brand: "mastercard", cvvLen: 3, desc: "Successful debit payment", category: "success" },
  { id: "stripe-amex", provider: "stripe", label: "American Express", number: "378282246310005", brand: "amex", cvvLen: 4, desc: "Successful payment", category: "success" },
  { id: "stripe-discover", provider: "stripe", label: "Discover", number: "6011111111111117", brand: "discover", cvvLen: 3, desc: "Successful payment", category: "success" },
  { id: "stripe-diners", provider: "stripe", label: "Diners Club", number: "3056930009020004", brand: "diners", cvvLen: 3, desc: "Successful payment", category: "success" },
  { id: "stripe-jcb", provider: "stripe", label: "JCB", number: "3566002020360505", brand: "jcb", cvvLen: 3, desc: "Successful payment", category: "success" },
  { id: "stripe-unionpay", provider: "stripe", label: "UnionPay", number: "6200000000000005", brand: "cup", cvvLen: 3, desc: "Successful payment", category: "success" },

  { id: "stripe-decline-generic", provider: "stripe", label: "Generic decline", number: "4000000000000002", brand: "visa", cvvLen: 3, desc: "card_declined · generic_decline", category: "decline" },
  { id: "stripe-decline-insufficient", provider: "stripe", label: "Insufficient funds", number: "4000000000009995", brand: "visa", cvvLen: 3, desc: "card_declined · insufficient_funds", category: "decline" },
  { id: "stripe-decline-lost", provider: "stripe", label: "Lost card", number: "4000000000009987", brand: "visa", cvvLen: 3, desc: "card_declined · lost_card", category: "decline" },
  { id: "stripe-decline-stolen", provider: "stripe", label: "Stolen card", number: "4000000000009979", brand: "visa", cvvLen: 3, desc: "card_declined · stolen_card", category: "decline" },
  { id: "stripe-decline-expired", provider: "stripe", label: "Expired card", number: "4000000000000069", brand: "visa", cvvLen: 3, desc: "expired_card", category: "decline" },
  { id: "stripe-decline-cvc", provider: "stripe", label: "Incorrect CVC", number: "4000000000000127", brand: "visa", cvvLen: 3, desc: "incorrect_cvc", category: "decline" },
  { id: "stripe-decline-processing", provider: "stripe", label: "Processing error", number: "4000000000000119", brand: "visa", cvvLen: 3, desc: "processing_error", category: "decline" },
  { id: "stripe-decline-number", provider: "stripe", label: "Incorrect number", number: "4242424242424241", brand: "visa", cvvLen: 3, desc: "incorrect_number · fails Luhn", category: "decline" },
  { id: "stripe-decline-velocity", provider: "stripe", label: "Velocity limit exceeded", number: "4000000000006975", brand: "visa", cvvLen: 3, desc: "card_declined · card_velocity_exceeded", category: "decline" },
  { id: "stripe-decline-attached", provider: "stripe", label: "Decline after attaching", number: "4000000000000341", brand: "visa", cvvLen: 3, desc: "Attach succeeds, charge fails", category: "decline" },

  { id: "stripe-3ds-setup", provider: "stripe", label: "Authenticate unless set up", number: "4000002500003155", brand: "visa", cvvLen: 3, desc: "Authentication required until set up for reuse", category: "3ds" },
  { id: "stripe-3ds-always", provider: "stripe", label: "Always authenticate", number: "4000002760003184", brand: "visa", cvvLen: 3, desc: "Authentication required on every transaction", category: "3ds" },
  { id: "stripe-3ds-already-setup", provider: "stripe", label: "Already set up", number: "4000003800000446", brand: "visa", cvvLen: 3, desc: "Off-session succeeds as previously set up", category: "3ds" },
  { id: "stripe-3ds-insufficient", provider: "stripe", label: "3DS then insufficient funds", number: "4000008260003178", brand: "visa", cvvLen: 3, desc: "Authenticates, then declines with insufficient_funds", category: "3ds" },
  { id: "stripe-3ds-required-ie", provider: "stripe", label: "3DS required (IE)", number: "4000000000003220", brand: "visa", cvvLen: 3, desc: "3DS required · succeeds after authentication", category: "3ds", country: "IE" },
  { id: "stripe-3ds-required-us", provider: "stripe", label: "3DS required (US)", number: "4000008400000027", brand: "visa", cvvLen: 3, desc: "3DS required · succeeds after authentication", category: "3ds", country: "US" },
  { id: "stripe-3ds-required-decline", provider: "stripe", label: "3DS required then declined", number: "4000008400001629", brand: "visa", cvvLen: 3, desc: "Authenticates, then card_declined", category: "3ds" },
  { id: "stripe-3ds-required-error", provider: "stripe", label: "3DS required · lookup error", number: "4000008400001280", brand: "visa", cvvLen: 3, desc: "3DS lookup processing error", category: "3ds" },
  { id: "stripe-3ds-supported", provider: "stripe", label: "3DS supported", number: "4000000000003055", brand: "visa", cvvLen: 3, desc: "3DS supported but not required", category: "3ds" },
  { id: "stripe-3ds-supported-error", provider: "stripe", label: "3DS supported · error", number: "4000000000003097", brand: "visa", cvvLen: 3, desc: "Optional 3DS attempt returns processing error", category: "3ds" },
  { id: "stripe-3ds-frictionless", provider: "stripe", label: "3DS frictionless", number: "4000000032200000", brand: "visa", cvvLen: 3, desc: "Required authentication succeeds frictionlessly", category: "3ds" },

  { id: "stripe-risk-blocked", provider: "stripe", label: "Radar always blocked", number: "4100000000000019", brand: "visa", cvvLen: 3, desc: "Highest risk · Radar always blocks", category: "risk" },
  { id: "stripe-risk-highest", provider: "stripe", label: "Radar highest risk", number: "4000000000004954", brand: "visa", cvvLen: 3, desc: "Highest risk · depends on Radar settings", category: "risk" },
  { id: "stripe-risk-elevated", provider: "stripe", label: "Radar elevated risk", number: "4000000000009235", brand: "visa", cvvLen: 3, desc: "Elevated risk · may be queued for review", category: "risk" },
  { id: "stripe-risk-dispute-score", provider: "stripe", label: "High fraud dispute score", number: "4000008400000407", brand: "visa", cvvLen: 3, desc: "High fraud dispute score", category: "risk" },
  { id: "stripe-risk-efw-score", provider: "stripe", label: "High early fraud warning score", number: "4000008400000159", brand: "visa", cvvLen: 3, desc: "High early fraud warning score", category: "risk" },
  { id: "stripe-risk-adaptive-3ds", provider: "stripe", label: "Radar Adaptive 3DS", number: "4000008405600003", brand: "visa", cvvLen: 3, desc: "Triggers Adaptive 3DS when enabled", category: "risk" },

  { id: "stripe-check-cvc", provider: "stripe", label: "CVC check fails", number: "4000000000000101", brand: "visa", cvvLen: 3, desc: "CVC verification fails", category: "checks" },
  { id: "stripe-check-postal", provider: "stripe", label: "Postal code check fails", number: "4000000000000036", brand: "visa", cvvLen: 3, desc: "Postal code verification fails", category: "checks" },
  { id: "stripe-check-line1", provider: "stripe", label: "Address line 1 check fails", number: "4000000000000028", brand: "visa", cvvLen: 3, desc: "Address line 1 verification fails", category: "checks" },
  { id: "stripe-check-address", provider: "stripe", label: "Address checks fail", number: "4000000000000010", brand: "visa", cvvLen: 3, desc: "Postal code and line 1 checks fail", category: "checks" },
  { id: "stripe-check-unavailable", provider: "stripe", label: "Address unavailable", number: "4000000000000044", brand: "visa", cvvLen: 3, desc: "Postal code and line 1 checks unavailable", category: "checks" },

  { id: "stripe-dispute-fraud", provider: "stripe", label: "Fraudulent dispute", number: "4000000000000259", brand: "visa", cvvLen: 3, desc: "Charge succeeds, then disputed as fraudulent", category: "disputes" },
  { id: "stripe-dispute-not-received", provider: "stripe", label: "Product not received dispute", number: "4000000000002685", brand: "visa", cvvLen: 3, desc: "Charge succeeds, then disputed as not received", category: "disputes" },
  { id: "stripe-dispute-inquiry", provider: "stripe", label: "Dispute inquiry", number: "4000000000001976", brand: "visa", cvvLen: 3, desc: "Charge succeeds, then becomes an inquiry", category: "disputes" },
  { id: "stripe-dispute-efw", provider: "stripe", label: "Early fraud warning", number: "4000000000005423", brand: "visa", cvvLen: 3, desc: "Charge succeeds, then receives an early fraud warning", category: "disputes" },
  { id: "stripe-dispute-multiple", provider: "stripe", label: "Multiple disputes", number: "4000000404000079", brand: "visa", cvvLen: 3, desc: "Charge succeeds, then is disputed multiple times", category: "disputes" },
];

export const PAYPAL_3DS_SCENARIOS: PaymentScenario[] = [
  { id: "paypal-3ds-frictionless-success", provider: "paypal", label: "Frictionless · success", number: "4868719196829038", brand: "visa", cvvLen: 3, desc: "liability shift possible · authentication Y", category: "3ds", country: "US" },
  { id: "paypal-3ds-frictionless-fail", provider: "paypal", label: "Frictionless · failed", number: "4868719158130060", brand: "visa", cvvLen: 3, desc: "no liability shift · authentication N", category: "3ds", country: "US" },
  { id: "paypal-3ds-frictionless-attempt", provider: "paypal", label: "Frictionless · stand-in attempt", number: "4868719581920723", brand: "visa", cvvLen: 3, desc: "liability shift possible · authentication A", category: "3ds", country: "US" },
  { id: "paypal-3ds-frictionless-unavailable", provider: "paypal", label: "Frictionless · unavailable", number: "4868719033482561", brand: "visa", cvvLen: 3, desc: "no liability shift · authentication U", category: "3ds", country: "US" },
  { id: "paypal-3ds-frictionless-rejected", provider: "paypal", label: "Frictionless · rejected", number: "4868719081564153", brand: "visa", cvvLen: 3, desc: "no liability shift · authentication R", category: "3ds", country: "US" },
  { id: "paypal-3ds-lookup-unavailable", provider: "paypal", label: "Lookup unavailable", number: "4868719488651967", brand: "visa", cvvLen: 3, desc: "enrollment unavailable", category: "3ds", country: "US" },
  { id: "paypal-3ds-stepup-success", provider: "paypal", label: "Step-up · success", number: "4868719166101368", brand: "visa", cvvLen: 3, desc: "liability shift possible · authentication Y", category: "3ds", country: "US" },
  { id: "paypal-3ds-stepup-fail", provider: "paypal", label: "Step-up · failed", number: "4868719181895556", brand: "visa", cvvLen: 3, desc: "no liability shift · authentication N", category: "3ds", country: "US" },
  { id: "paypal-3ds-stepup-unavailable", provider: "paypal", label: "Step-up · unavailable", number: "4868719557718580", brand: "visa", cvvLen: 3, desc: "no liability shift · authentication U", category: "3ds", country: "US" },
];
