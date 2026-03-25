import {
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faArrowLeft,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import {
  faPaypal,
  faStripeS,
  faCcVisa,
  faCcMastercard,
  faCcAmex,
  faCcDiscover,
  faCcJcb,
  faCcDinersClub,
} from "@fortawesome/free-brands-svg-icons";

const m = (key: Parameters<typeof browser.i18n.getMessage>[0]) =>
  browser.i18n.getMessage(key);

const SUPPORTED_LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
];

// ── Countries ──────────────────────────────────────────────────
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "VN", name: "Vietnam" },
  { code: "TH", name: "Thailand" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "AT", name: "Austria" },
];

const STORAGE_KEY = "paypal_sandbox_country";
const BG_PAYPAL_KEY = "card_bg_paypal";
const BG_STRIPE_KEY = "card_bg_stripe";
const CARDHOLDER_KEY = "sandbox_pay_cardholder";

function loadCountry(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "US";
}

function saveCountry(code: string) {
  localStorage.setItem(STORAGE_KEY, code);
}

function loadCardholder(): string {
  return localStorage.getItem(CARDHOLDER_KEY) ?? "Test User";
}

function saveCardholder(name: string) {
  localStorage.setItem(CARDHOLDER_KEY, name);
}

function loadBg(key: string): string {
  return localStorage.getItem(key) ?? "";
}

function saveBg(key: string, value: string) {
  localStorage.setItem(key, value);
}

// ── Country context ────────────────────────────────────────────
const CountryCtx = createContext<{
  country: string;
  setCountry: (c: string) => void;
  bgPaypal: string;
  setBgPaypal: (v: string) => void;
  bgStripe: string;
  setBgStripe: (v: string) => void;
  cardholderName: string;
  setCardholderName: (n: string) => void;
}>({
  country: "US",
  setCountry: () => {},
  bgPaypal: "",
  setBgPaypal: () => {},
  bgStripe: "",
  setBgStripe: () => {},
  cardholderName: "Test User",
  setCardholderName: () => {},
});

// ── Luhn algorithm ─────────────────────────────────────────────
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

function generateCardNumber(type: string): string {
  const spec = CARD_SPECS[type];
  if (!spec) return "";
  const prefix =
    spec.prefixes[Math.floor(Math.random() * spec.prefixes.length)];
  return generateLuhn(prefix, spec.length);
}

// ── Random helpers ─────────────────────────────────────────────
function randomCvv(amex = false) {
  const len = amex ? 4 : 3;
  return String(Math.floor(Math.random() * Math.pow(10, len))).padStart(
    len,
    "0",
  );
}

function randomExpiry() {
  const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  return `${String(month).padStart(2, "0")}/${year}`;
}

// ── Card groups ────────────────────────────────────────────────
const CARD_GROUPS = [
  { label: "Visa", type: "visa", amex: false },
  { label: "Mastercard", type: "mastercard", amex: false },
  { label: "American Express", type: "amex", amex: true },
  { label: "Diners Club", type: "diners", amex: false },
  { label: "Maestro", type: "maestro", amex: false },
  { label: "CUP", type: "cup", amex: false },
  { label: "JCB", type: "jcb", amex: false },
];

// ── Error triggers ─────────────────────────────────────────────
const ERROR_TRIGGERS = [
  {
    name: "Card refused",
    trigger: "CCREJECT-REFUSED",
    code: "0500",
    desc: "DO_NOT_HONOR",
  },
  {
    name: "Fraudulent card",
    trigger: "CCREJECT-SF",
    code: "9500",
    desc: "SUSPECTED_FRAUD. Try using another card. Do not retry the same card.",
  },
  {
    name: "Card expired",
    trigger: "CCREJECT-EC",
    code: "5400",
    desc: "EXPIRED_CARD",
  },
  {
    name: "Luhn check fails",
    trigger: "CCREJECT-IRC",
    code: "5180",
    desc: "INVALID_OR_RESTRICTED_CARD. Try using another card. Do not retry the same card.",
  },
  {
    name: "Insufficient funds",
    trigger: "CCREJECT-IF",
    code: "5120",
    desc: "INSUFFICIENT_FUNDS",
  },
  {
    name: "Card lost/stolen",
    trigger: "CCREJECT-LS",
    code: "9520",
    desc: "LOST_OR_STOLEN. Try using another card. Do not retry the same card.",
  },
  {
    name: "Card not valid",
    trigger: "CCREJECT-IA",
    code: "1330",
    desc: "INVALID_ACCOUNT",
  },
  {
    name: "Card declined",
    trigger: "CCREJECT-BANK_ERROR",
    code: "5100",
    desc: "GENERIC_DECLINE",
  },
  {
    name: "CVC check fails",
    trigger: "CCREJECT-CVV_F",
    code: "00N7",
    desc: "CVV2_FAILURE_POSSIBLE_RETRY_WITH_CVV",
  },
];

// ── Stripe test cards ──────────────────────────────────────────
const STRIPE_CARDS = [
  // Success cards
  {
    label: "Visa",
    number: "4242424242424242",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Visa (debit)",
    number: "4000056655665556",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Mastercard",
    number: "5555555555554444",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Mastercard (2-series)",
    number: "2223003122003222",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Mastercard (debit)",
    number: "5200828282828210",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Mastercard (prepaid)",
    number: "5105105105105100",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "American Express",
    number: "378282246310005",
    cvvLen: 4,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "American Express",
    number: "371449635398431",
    cvvLen: 4,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Discover",
    number: "6011111111111117",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Discover",
    number: "6011000990139424",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Diners Club",
    number: "3056930009020004",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "Diners Club (14-digit)",
    number: "36227206271667",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "JCB",
    number: "3566002020360505",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  {
    label: "UnionPay",
    number: "6200000000000005",
    cvvLen: 3,
    desc: "Succeeds",
    category: "success",
  },
  // Decline cards
  {
    label: "Generic decline",
    number: "4000000000000002",
    cvvLen: 3,
    desc: "card_declined",
    category: "decline",
  },
  {
    label: "Insufficient funds",
    number: "4000000000009995",
    cvvLen: 3,
    desc: "insufficient_funds",
    category: "decline",
  },
  {
    label: "Lost card",
    number: "4000000000009987",
    cvvLen: 3,
    desc: "lost_card",
    category: "decline",
  },
  {
    label: "Stolen card",
    number: "4000000000009979",
    cvvLen: 3,
    desc: "stolen_card",
    category: "decline",
  },
  {
    label: "Expired card",
    number: "4000000000000069",
    cvvLen: 3,
    desc: "expired_card",
    category: "decline",
  },
  {
    label: "Incorrect CVC",
    number: "4000000000000127",
    cvvLen: 3,
    desc: "incorrect_cvc",
    category: "decline",
  },
  {
    label: "Processing error",
    number: "4000000000000119",
    cvvLen: 3,
    desc: "processing_error",
    category: "decline",
  },
  {
    label: "Fraudulent",
    number: "4100000000000019",
    cvvLen: 3,
    desc: "fraudulent (Radar)",
    category: "decline",
  },
  // 3DS
  {
    label: "3DS - Always auth",
    number: "4000002760003184",
    cvvLen: 3,
    desc: "Requires 3DS auth",
    category: "3ds",
  },
  {
    label: "3DS - Auth or decline",
    number: "4000008400001629",
    cvvLen: 3,
    desc: "3DS then declined",
    category: "3ds",
  },
  {
    label: "3DS - Frictionless",
    number: "4000000000003220",
    cvvLen: 3,
    desc: "Frictionless flow",
    category: "3ds",
  },
];

const STRIPE_CATEGORIES = ["All", "Success", "Decline", "3DS"] as const;
type StripeCategory = (typeof STRIPE_CATEGORIES)[number];

const STRIPE_CAT_FILTER: Record<StripeCategory, string> = {
  All: "",
  Success: "success",
  Decline: "decline",
  "3DS": "3ds",
};

const TABS = ["All", "Visa", "Mastercard", "Amex", "Others", "Errors"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, string[]> = {
  All: [],
  Visa: ["visa"],
  Mastercard: ["mastercard"],
  Amex: ["amex"],
  Others: ["diners", "maestro", "cup", "jcb"],
  Errors: [],
};

const TAB_LABEL: Record<Tab, Parameters<typeof browser.i18n.getMessage>[0]> = {
  All: "tabAll",
  Visa: "tabVisa",
  Mastercard: "tabMastercard",
  Amex: "tabAmex",
  Others: "tabOthers",
  Errors: "tabErrors",
};

const STRIPE_CAT_LABEL: Record<
  StripeCategory,
  Parameters<typeof browser.i18n.getMessage>[0]
> = {
  All: "catAll",
  Success: "catSuccess",
  Decline: "catDecline",
  "3DS": "cat3DS",
};

// ── Clipboard ──────────────────────────────────────────────────
function copyText(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    el.remove();
  }
}

// ── Settings page ──────────────────────────────────────────────
function SettingsPage() {
  const {
    country,
    setCountry,
    bgPaypal,
    setBgPaypal,
    bgStripe,
    setBgStripe,
    cardholderName,
    setCardholderName,
  } = useContext(CountryCtx);

  const PRESETS = [
    { label: "Blue", value: "/img/background/blue.png" },
    { label: "Orange", value: "/img/background/orange.png" },
    { label: "None", value: "" },
  ];

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
    storageKey: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setter(result);
      saveBg(storageKey, result);
    };
    reader.readAsDataURL(file);
  };

  const BgPicker = ({
    label,
    value,
    setter,
    storageKey,
    accent,
  }: {
    label: string;
    value: string;
    setter: (v: string) => void;
    storageKey: string;
    accent: string;
  }) => (
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${accent}`} />
        {label}
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-200 h-16 bg-slate-100 mb-2">
        {value ? (
          <img
            src={value}
            className="w-full h-full object-cover"
            alt="bg preview"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            {m("noBackground")}
          </div>
        )}
      </div>
      <div className="flex gap-1.5 mb-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => {
              setter(p.value);
              saveBg(storageKey, p.value);
            }}
            className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors cursor-pointer ${
              value === p.value
                ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {p.label === "None" ? (
              "None"
            ) : (
              <span className="flex items-center justify-center gap-1">
                <img
                  src={p.value}
                  className="w-4 h-4 rounded object-cover inline"
                  alt={p.label}
                />
                {p.label}
              </span>
            )}
          </button>
        ))}
      </div>
      <label className="w-full text-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors block">
        {m("customUpload")}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e, setter, storageKey)}
        />
      </label>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-slate-700">{m("settings")}</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {m("country")}
        </label>
        <p className="text-xs text-slate-400 mb-3">{m("countryDesc")}</p>
        <select
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            saveCountry(e.target.value);
          }}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#009cde] cursor-pointer"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
        <div className="mt-3 px-3 py-2 bg-slate-50 rounded-lg">
          <span className="text-xs text-slate-500">{m("selected")}: </span>
          <span className="text-xs font-mono font-bold text-slate-700">
            {country}
          </span>
          <span className="text-xs text-slate-400 ml-1">
            — {COUNTRIES.find((c) => c.code === country)?.name}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {m("defaultCardholderName")}
        </label>
        <p className="text-xs text-slate-400 mb-3">
          {m("defaultCardholderNameDesc")}
        </p>
        <div className="flex gap-2">
          <input
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder={m("cardholderPlaceholder")}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#009cde]"
          />
          <button
            onClick={() => {
              copyText(cardholderName);
            }}
            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-600 cursor-pointer border-0 transition-colors"
          >
            {m("copied").includes("copy") || m("copied").includes("Copy")
              ? "⎘"
              : "⎘"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {m("language")}
        </label>
        <p className="text-xs text-slate-400">{m("languageDesc")}</p>
        <p className="text-xs font-mono text-slate-600 mt-1">
          {browser.i18n.getUILanguage()}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {m("cardBackground")}
        </label>
        <BgPicker
          label={m("paypalCards")}
          value={bgPaypal}
          setter={setBgPaypal}
          storageKey={BG_PAYPAL_KEY}
          accent="bg-blue-600"
        />
        <div className="border-t border-slate-100" />
        <BgPicker
          label={m("stripeCards")}
          value={bgStripe}
          setter={setBgStripe}
          storageKey={BG_STRIPE_KEY}
          accent="bg-purple-500"
        />
      </div>
    </div>
  );
}

// ── Card brand helpers ─────────────────────────────────────────
const CARD_BRAND_ICON: Record<string, typeof faCcVisa> = {
  visa: faCcVisa,
  mastercard: faCcMastercard,
  amex: faCcAmex,
  discover: faCcDiscover,
  jcb: faCcJcb,
  diners: faCcDinersClub,
};

const CARD_GRADIENT: Record<string, string> = {
  visa: "from-blue-800 to-blue-600",
  mastercard: "from-orange-700 to-red-600",
  amex: "from-teal-700 to-teal-500",
  discover: "from-orange-500 to-yellow-500",
  jcb: "from-green-700 to-green-500",
  diners: "from-slate-700 to-slate-500",
  maestro: "from-purple-700 to-purple-500",
  cup: "from-red-700 to-red-500",
};

// ── CardRow ────────────────────────────────────────────────────
type CardGroup = (typeof CARD_GROUPS)[0];

function CardRow({ group }: { group: CardGroup }) {
  const { country, bgPaypal, cardholderName } = useContext(CountryCtx);

  const generate = useCallback(
    () => ({
      number: generateCardNumber(group.type),
      expiry: randomExpiry(),
      cvv: randomCvv(group.amex),
      name: cardholderName,
    }),
    [group, cardholderName],
  );

  const [card, setCard] = useState(() => generate());
  const [spinning, setSpinning] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [copied, setCopied] = useState("");
  const [filling, setFilling] = useState(false);
  const [toast, setToast] = useState("");

  const handleGenerate = () => {
    setCard(generate());
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
  };

  const copy = (text: string, key: string) => {
    copyText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const fillCard = async () => {
    setFilling(true);
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("no tab");
      await browser.tabs.sendMessage(tab.id, {
        action: "fillCard",
        card: { ...card, label: group.label, type: group.type, country },
      });
      setToast(m("filled"));
    } catch {
      setToast(m("noForm"));
    } finally {
      setFilling(false);
      setTimeout(() => setToast(""), 2000);
    }
  };

  const gradient = CARD_GRADIENT[group.type] ?? "from-slate-700 to-slate-500";
  const brandIcon = CARD_BRAND_ICON[group.type];
  const bgStyle = bgPaypal
    ? {
        backgroundImage: `url(${bgPaypal})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      {/* Card body */}
      <div
        className={`${bgPaypal ? "" : `bg-gradient-to-br ${gradient}`} px-5 py-4`}
        style={bgStyle}
      >
        {/* Top: actions */}
        <div className="flex justify-end gap-1.5 mb-3">
          <button
            onClick={() => handleGenerate()}
            {...{ title: m("generateNew") }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border-0"
          >
            <FontAwesomeIcon
              icon={faRotate}
              className={spinning ? "animate-spin" : ""}
              size="xs"
            />
          </button>
          <button
            onClick={fillCard}
            disabled={filling}
            className="text-xs font-bold px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50 cursor-pointer border-0"
          >
            {filling ? "..." : m("autoFill")}
          </button>
        </div>

        {/* Card number */}
        <button
          onClick={() => copy(card.number, "num")}
          className={`w-full text-left font-mono text-base tracking-[0.18em] px-0 py-0 border-0 bg-transparent transition-colors cursor-pointer mb-4 ${
            copied === "num"
              ? "text-green-300"
              : "text-white/90 hover:text-white"
          }`}
        >
          {copied === "num"
            ? m("copiedCheck")
            : card.number.replace(/(.{4})/g, "$1 ").trim()}
        </button>

        {/* Bottom: name + brand icon */}
        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
              {m("cardholder")}
              <button
                onClick={() => setEditingName((v) => !v)}
                className="text-white/40 hover:text-white/80 border-0 bg-transparent cursor-pointer p-0 text-[10px]"
                title={m("editName")}
              >
                ✎
              </button>
              <button
                onClick={() => copy(card.name, "name")}
                className="text-white/40 hover:text-white/80 border-0 bg-transparent cursor-pointer p-0 text-[10px]"
              >
                {copied === "name" ? "✓" : "⎘"}
              </button>
            </div>
            {editingName ? (
              <input
                autoFocus
                value={card.name}
                onChange={(e) =>
                  setCard((c) => ({ ...c, name: e.target.value }))
                }
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                className="text-xs font-semibold bg-white/10 text-white border-0 border-b border-white/40 outline-none w-full uppercase tracking-wide px-0 py-0.5"
                placeholder={m("cardholderPlaceholder")}
              />
            ) : (
              <div className="text-xs font-semibold text-white/90 uppercase tracking-wide truncate">
                {card.name}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 font-mono">
              {country}
            </span>
            {brandIcon ? (
              <FontAwesomeIcon
                icon={brandIcon}
                className="text-white/80"
                size="2x"
              />
            ) : (
              <span className="text-xs font-bold text-white/80 uppercase">
                {group.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CVV strip */}
      <div className="bg-gray-100 px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {m("expiryDate")}
          </div>
          <button
            onClick={() => copy(card.expiry, "exp")}
            className={`font-mono text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors p-0 ${
              copied === "exp"
                ? "text-green-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {copied === "exp" ? m("copied") : card.expiry}
          </button>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {m("cvv")}
          </div>
          <button
            onClick={() => copy(card.cvv, "cvv")}
            className={`font-mono text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors p-0 ${
              copied === "cvv"
                ? "text-green-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {copied === "cvv" ? m("copied") : card.cvv}
          </button>
        </div>
      </div>

      {toast && (
        <div className="text-center text-xs font-medium text-green-700 bg-green-50 py-1.5">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── ErrorTriggerRow ────────────────────────────────────────────
function ErrorTriggerRow({ item }: { item: (typeof ERROR_TRIGGERS)[0] }) {
  const { country } = useContext(CountryCtx);

  const genTestCard = useCallback(
    () => ({
      number: generateCardNumber("visa"),
      expiry: randomExpiry(),
      cvv: randomCvv(false),
      name: item.trigger,
      type: "visa",
      label: "Visa",
    }),
    [item.trigger],
  );

  const [testCard, setTestCard] = useState(() => genTestCard());
  const [spinningErr, setSpinningErr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filling, setFilling] = useState(false);

  const handleGenerateErr = () => {
    setTestCard(genTestCard());
    setSpinningErr(true);
    setTimeout(() => setSpinningErr(false), 600);
  };
  const [toast, setToast] = useState("");

  const copy = () => {
    copyText(item.trigger);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const fillError = async () => {
    setFilling(true);
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("no tab");
      await browser.tabs.sendMessage(tab.id, {
        action: "fillCard",
        card: { ...testCard, country },
      });
      setToast(m("filled"));
    } catch {
      setToast(m("noForm"));
    } finally {
      setFilling(false);
      setTimeout(() => setToast(""), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-red-100 p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex-1 text-xs font-semibold text-slate-700">
          {item.name}
        </span>
        <span className="text-[10px] font-bold text-white bg-slate-400 px-1.5 py-0.5 rounded shrink-0">
          {item.code}
        </span>
        <button
          onClick={() => handleGenerateErr()}
          {...{ title: m("generateNew") }}
          className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border-0 shrink-0"
        >
          <FontAwesomeIcon
            icon={faRotate}
            className={spinningErr ? "animate-spin" : ""}
          />
        </button>
        <button
          onClick={fillError}
          disabled={filling}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          {filling ? "..." : m("fill")}
        </button>
      </div>

      <button
        onClick={copy}
        className={`w-full text-left font-mono text-xs px-2 py-1.5 rounded-lg cursor-pointer transition-colors border-0 mb-1.5 ${
          copied
            ? "bg-green-100 text-green-700"
            : "bg-red-50 hover:bg-red-100 text-red-700"
        }`}
      >
        {copied ? m("copied") : item.trigger}
      </button>

      <p className="text-[10px] text-slate-400 leading-relaxed">{item.desc}</p>

      {toast && (
        <div className="mt-2 text-center text-xs font-medium text-green-700 bg-green-50 rounded-lg py-1">
          {toast}
        </div>
      )}
    </div>
  );
}

// ── StripeCardRow ──────────────────────────────────────────────
function StripeCardRow({ card }: { card: (typeof STRIPE_CARDS)[0] }) {
  const { country, bgStripe, cardholderName } = useContext(CountryCtx);
  const [card_data] = useState(() => ({
    number: card.number,
    expiry: randomExpiry(),
    cvv: randomCvv(card.cvvLen === 4),
    name: cardholderName,
  }));
  const [copied, setCopied] = useState("");
  const [filling, setFilling] = useState(false);
  const [toast, setToast] = useState("");

  const copy = (text: string, key: string) => {
    copyText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  };

  const fillCard = async () => {
    setFilling(true);
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) throw new Error("no tab");
      await browser.tabs.sendMessage(tab.id, {
        action: "fillCard",
        card: { ...card_data, label: card.label, type: "stripe", country },
      });
      setToast(m("filled"));
    } catch {
      setToast(m("noForm"));
    } finally {
      setFilling(false);
      setTimeout(() => setToast(""), 2000);
    }
  };

  const isDecline = card.category === "decline";
  const is3ds = card.category === "3ds";

  // Stripe gradient theo category
  const gradient = isDecline
    ? "from-red-700 to-red-500"
    : is3ds
      ? "from-yellow-600 to-orange-500"
      : "from-[#635bff] to-[#4f46e5]";

  // Detect brand từ số thẻ
  const num = card.number;
  const brandIcon = num.startsWith("4")
    ? faCcVisa
    : num.startsWith("5") || num.startsWith("2")
      ? faCcMastercard
      : num.startsWith("3") && (num[1] === "4" || num[1] === "7")
        ? faCcAmex
        : num.startsWith("6011")
          ? faCcDiscover
          : num.startsWith("35")
            ? faCcJcb
            : num.startsWith("36")
              ? faCcDinersClub
              : null;

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      {/* Card body */}
      <div
        className={`${bgStripe ? "" : `bg-gradient-to-br ${gradient}`} px-5 py-4`}
        style={
          bgStripe
            ? {
                backgroundImage: `url(${bgStripe})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {/* Top: desc badge + fill button */}
        <div className="flex justify-between items-start mb-3">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isDecline
                ? "bg-white/20 text-white"
                : is3ds
                  ? "bg-white/20 text-white"
                  : "bg-white/20 text-white"
            }`}
          >
            {card.desc}
          </span>
          <button
            onClick={fillCard}
            disabled={filling}
            className="text-xs font-bold px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50 cursor-pointer border-0"
          >
            {filling ? "..." : m("autoFill")}
          </button>
        </div>

        {/* Card number */}
        <button
          onClick={() => copy(card.number, "num")}
          className={`w-full text-left font-mono text-base tracking-[0.18em] px-0 py-0 border-0 bg-transparent transition-colors cursor-pointer mb-4 ${
            copied === "num"
              ? "text-green-300"
              : "text-white/90 hover:text-white"
          }`}
        >
          {copied === "num"
            ? m("copiedCheck")
            : card.number.replace(/(.{4})/g, "$1 ").trim()}
        </button>

        {/* Bottom: label + brand */}
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">
              {m("cardholder")}
            </div>
            <div className="text-xs font-semibold text-white/90 uppercase tracking-wide">
              {card_data.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50 font-mono">
              {country}
            </span>
            {brandIcon ? (
              <FontAwesomeIcon
                icon={brandIcon}
                className="text-white/80"
                size="2x"
              />
            ) : (
              <span className="text-xs font-bold text-white/80 uppercase">
                {card.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expiry + CVV strip */}
      <div className="bg-gray-100 px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {m("expiryDate")}
          </div>
          <button
            onClick={() => copy(card_data.expiry, "exp")}
            className={`font-mono text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors p-0 ${
              copied === "exp"
                ? "text-green-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {copied === "exp" ? m("copied") : card_data.expiry}
          </button>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {m("cvc")}
          </div>
          <button
            onClick={() => copy(card_data.cvv, "cvv")}
            className={`font-mono text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors p-0 ${
              copied === "cvv"
                ? "text-green-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {copied === "cvv" ? m("copied") : card_data.cvv}
          </button>
        </div>
      </div>

      {toast && (
        <div className="text-center text-xs font-medium text-green-700 bg-green-50 py-1.5">
          {toast}
        </div>
      )}
    </div>
  );
}

function StripePage() {
  const [activeCategory, setActiveCategory] = useState<StripeCategory>("All");

  const filtered =
    activeCategory === "All"
      ? STRIPE_CARDS
      : STRIPE_CARDS.filter(
          (c) => c.category === STRIPE_CAT_FILTER[activeCategory],
        );

  return (
    <>
      <div className="flex bg-white border-b border-slate-200 px-2 pt-2 gap-1 overflow-x-auto">
        {STRIPE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeCategory === cat
                ? cat === "Decline"
                  ? "bg-red-500 text-white"
                  : cat === "3DS"
                    ? "bg-yellow-500 text-white"
                    : "bg-[#635bff] text-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {m(STRIPE_CAT_LABEL[cat])}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.map((card) => (
          <StripeCardRow key={card.number} card={card} />
        ))}
      </div>
    </>
  );
}

// ── App ────────────────────────────────────────────────────────
type Provider = "paypal" | "stripe";
type Page = "main" | "settings";

function App() {
  const [provider, setProvider] = useState<Provider>("paypal");
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [page, setPage] = useState<Page>("main");
  const [country, setCountry] = useState<string>(() => loadCountry());
  const [bgPaypal, setBgPaypal] = useState<string>(() => loadBg(BG_PAYPAL_KEY));
  const [bgStripe, setBgStripe] = useState<string>(() => loadBg(BG_STRIPE_KEY));
  const [cardholderName, setCardholderNameState] = useState<string>(() =>
    loadCardholder(),
  );

  const setCardholderName = (n: string) => {
    setCardholderNameState(n);
    saveCardholder(n);
  };

  const errorTestCard = useMemo(
    () => ({
      number: generateCardNumber("visa"),
      expiry: randomExpiry(),
      cvv: randomCvv(false),
    }),
    [],
  );

  const filtered =
    activeTab === "All"
      ? CARD_GROUPS
      : CARD_GROUPS.filter((g) => TAB_FILTER[activeTab].includes(g.type));

  return (
    <CountryCtx.Provider
      value={{
        country,
        setCountry,
        bgPaypal,
        setBgPaypal,
        bgStripe,
        setBgStripe,
        cardholderName,
        setCardholderName,
      }}
    >
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-[#003087] px-4 py-3 flex items-center gap-3 shadow">
          {page === "settings" ? (
            <>
              <button
                onClick={() => setPage("main")}
                className="text-white text-sm font-semibold flex items-center gap-1.5 cursor-pointer border-0 bg-transparent hover:text-blue-200 transition-colors shrink-0"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                {m("back")}
              </button>
              <span className="text-white font-bold text-sm flex-1">
                {m("settings")}
              </span>
            </>
          ) : (
            <>
              <img
                src="/icon/48.png"
                alt="logo"
                className="w-8 h-8 rounded-lg"
              />
              <div className="flex-1">
                <h1 className="text-white font-bold text-sm leading-tight">
                  {m("appName")}
                </h1>
                <p className="text-blue-300 text-xs">{m("appDesc")}</p>
              </div>
              <button
                onClick={() => setPage("settings")}
                className="text-lg px-2 py-1 rounded-lg transition-colors cursor-pointer border-0 bg-[#004ab3] text-white hover:bg-[#0057cc]"
                title="Settings"
              >
                <FontAwesomeIcon icon={faGear} />
              </button>
            </>
          )}
        </div>

        {page === "settings" ? (
          <SettingsPage />
        ) : (
          <>
            {/* Provider switcher */}
            <div className="flex bg-white border-b-2 border-slate-200">
              <button
                onClick={() => setProvider("paypal")}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 ${
                  provider === "paypal"
                    ? "text-[#003087] border-b-2 border-[#003087] bg-blue-50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FontAwesomeIcon icon={faPaypal} />
                PayPal
              </button>
              <button
                onClick={() => setProvider("stripe")}
                className={`flex-1 py-2.5 text-sm font-bold transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 ${
                  provider === "stripe"
                    ? "text-[#635bff] border-b-2 border-[#635bff] bg-purple-50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FontAwesomeIcon icon={faStripeS} />
                Stripe
              </button>
            </div>

            {/* Content */}
            {provider === "stripe" ? (
              <StripePage />
            ) : (
              <>
                {/* PayPal Tabs */}
                <div className="flex bg-white border-b border-slate-200 px-2 pt-2 gap-1 overflow-x-auto">
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    const isError = tab === "Errors";
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isActive
                            ? isError
                              ? "bg-red-500 text-white"
                              : "bg-[#003087] text-white"
                            : isError
                              ? "text-red-400 hover:bg-red-50"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {m(TAB_LABEL[tab])}
                      </button>
                    );
                  })}
                </div>

                {/* PayPal Content */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                  {activeTab === "Errors" ? (
                    <>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-2">
                        <p className="mb-2">
                          {m("errorNote")}{" "}
                          <span className="font-bold">
                            {m("errorNoteField")}
                          </span>
                          . {m("errorNoteDesc")}
                        </p>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => copyText(errorTestCard.number)}
                            className="w-full text-left font-mono font-bold px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                          >
                            {errorTestCard.number}
                          </button>
                          <div className="flex gap-1">
                            <button
                              onClick={() => copyText(errorTestCard.expiry)}
                              className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                            >
                              <span className="font-bold">
                                {m("expiryDate").substring(0, 3)}
                              </span>
                              <span className="font-mono">
                                {errorTestCard.expiry}
                              </span>
                            </button>
                            <button
                              onClick={() => copyText(errorTestCard.cvv)}
                              className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                            >
                              <span className="font-bold">{m("cvv")}</span>
                              <span className="font-mono">
                                {errorTestCard.cvv}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                      {ERROR_TRIGGERS.map((item) => (
                        <ErrorTriggerRow key={item.trigger} item={item} />
                      ))}
                    </>
                  ) : (
                    filtered.map((group) => (
                      <CardRow key={group.type} group={group} />
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </CountryCtx.Provider>
  );
}

export default App;
