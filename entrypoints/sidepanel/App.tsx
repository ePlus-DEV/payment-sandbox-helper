import {
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
  useEffect,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faArrowLeft,
  faRotate,
  faSpinner,
  faFloppyDisk,
  faCheck,
  faMagnifyingGlass,
  faStar,
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

import {
  countryStorage,
  cardholderStorage,
  bgPaypalStorage,
  bgStripeStorage,
  scenarioFavoritesStorage,
  scenarioRecentsStorage,
} from "../../utils/storage";
import { generateCardNumber, randomCvv, randomExpiry } from "../../utils/cards";
import {
  PAYPAL_3DS_SCENARIOS,
  STRIPE_SCENARIOS,
  type PaymentScenario,
  type ScenarioCategory,
} from "../../utils/scenarios";

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

// ── Stripe scenario catalog ────────────────────────────────────
const STRIPE_CATEGORIES = [
  "All",
  "Success",
  "Decline",
  "3DS",
  "Risk",
  "Checks",
  "Disputes",
  "Favorites",
  "Recent",
] as const;
type StripeCategory = (typeof STRIPE_CATEGORIES)[number];

const STRIPE_CAT_FILTER: Partial<Record<StripeCategory, ScenarioCategory>> = {
  Success: "success",
  Decline: "decline",
  "3DS": "3ds",
  Risk: "risk",
  Checks: "checks",
  Disputes: "disputes",
};

const TABS = ["All", "Visa", "Mastercard", "Amex", "Others", "3DS", "Errors"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, string[]> = {
  All: [],
  Visa: ["visa"],
  Mastercard: ["mastercard"],
  Amex: ["amex"],
  Others: ["diners", "maestro", "cup", "jcb"],
  "3DS": [],
  Errors: [],
};

const TAB_LABEL: Record<Tab, Parameters<typeof browser.i18n.getMessage>[0]> = {
  All: "tabAll",
  Visa: "tabVisa",
  Mastercard: "tabMastercard",
  Amex: "tabAmex",
  Others: "tabOthers",
  "3DS": "cat3DS",
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
  Risk: "catRisk",
  Checks: "catChecks",
  Disputes: "catDisputes",
  Favorites: "favorites",
  Recent: "recent",
};

// ── Clipboard ──────────────────────────────────────────────────
function legacyCopy(text: string) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  el.remove();
}

function copyText(text: string) {
  if (!navigator.clipboard?.writeText) {
    legacyCopy(text);
    return;
  }

  void navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
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

  const [nameSaved, setNameSaved] = useState(false);

  const handleSaveName = () => {
    setCardholderName(cardholderName);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 1500);
  };

  const PRESETS = [
    { label: "Blue", value: "/img/background/blue.png" },
    { label: "Orange", value: "/img/background/orange.png" },
    { label: "None", value: "" },
  ];

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const BgPicker = ({
    label,
    value,
    setter,
    accent,
  }: {
    label: string;
    value: string;
    setter: (v: string) => void;
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
          onChange={(e) => handleUpload(e, setter)}
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
            onClick={handleSaveName}
            className={`px-3 py-2 rounded-lg text-xs cursor-pointer border-0 transition-all ${
              nameSaved
                ? "bg-green-100 text-green-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            <FontAwesomeIcon icon={nameSaved ? faCheck : faFloppyDisk} />
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
          accent="bg-blue-600"
        />
        <div className="border-t border-slate-100" />
        <BgPicker
          label={m("stripeCards")}
          value={bgStripe}
          setter={setBgStripe}
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

  const copyAll = () => {
    copy(
      [group.label, card.number, card.expiry, card.cvv, card.name, country].join("\n"),
      "all",
    );
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
            onClick={copyAll}
            className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border-0"
          >
            {copied === "all" ? m("copied") : m("copyAll")}
          </button>
          <button
            onClick={fillCard}
            disabled={filling}
            className="text-xs font-bold px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50 cursor-pointer border-0"
          >
            {filling ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              m("autoFill")
            )}
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
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">
              {m("cardholder")}
            </div>
            <button
              onClick={() => copy(card.name, "name")}
              className={`text-xs font-semibold uppercase tracking-wide truncate border-0 bg-transparent cursor-pointer p-0 transition-colors ${
                copied === "name"
                  ? "text-green-300"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {copied === "name" ? m("copiedCheck") : card.name}
            </button>
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
          {filling ? (
            <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
          ) : (
            m("fill")
          )}
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

// ── ScenarioCardRow ─────────────────────────────────────────────
function ScenarioCardRow({
  scenario,
  favorite = false,
  onToggleFavorite,
  onUsed,
}: {
  scenario: PaymentScenario;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onUsed?: (id: string) => void;
}) {
  const { country, bgPaypal, bgStripe, cardholderName } =
    useContext(CountryCtx);
  const [cardData, setCardData] = useState(() => ({
    number: scenario.number,
    expiry: randomExpiry(),
    cvv: randomCvv(scenario.cvvLen === 4),
    name: cardholderName,
  }));
  const [copied, setCopied] = useState("");
  const [filling, setFilling] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setCardData((current) => ({ ...current, name: cardholderName }));
  }, [cardholderName]);

  const copy = (text: string, key: string) => {
    copyText(text);
    if (key === "num") onUsed?.(scenario.id);
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
        card: {
          ...cardData,
          label: scenario.label,
          type: scenario.brand,
          country:
            scenario.provider === "paypal" && scenario.country
              ? scenario.country
              : country,
        },
      });
      onUsed?.(scenario.id);
      setToast(m("filled"));
    } catch {
      setToast(m("noForm"));
    } finally {
      setFilling(false);
      setTimeout(() => setToast(""), 2000);
    }
  };

  const providerBg = scenario.provider === "paypal" ? bgPaypal : bgStripe;
  const gradient =
    scenario.provider === "paypal"
      ? "from-[#003087] to-[#009cde]"
      : scenario.category === "decline"
        ? "from-red-700 to-red-500"
        : scenario.category === "3ds"
          ? "from-yellow-600 to-orange-500"
          : scenario.category === "risk"
            ? "from-orange-700 to-red-600"
            : scenario.category === "checks"
              ? "from-cyan-700 to-teal-500"
              : scenario.category === "disputes"
                ? "from-rose-700 to-pink-500"
                : "from-[#635bff] to-[#4f46e5]";

  const brandIcon = CARD_BRAND_ICON[scenario.brand];
  const bgStyle = providerBg
    ? {
        backgroundImage: `url(${providerBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  return (
    <div className="rounded-2xl overflow-hidden shadow-md">
      <div
        className={`${providerBg ? "" : `bg-gradient-to-br ${gradient}`} px-5 py-4`}
        style={bgStyle}
      >
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              {scenario.label}
            </div>
            <div className="text-[10px] text-white/70 truncate" title={scenario.desc}>
              {scenario.desc}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(scenario.id)}
                title={favorite ? m("removeFavorite") : m("favoriteScenario")}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border-0 cursor-pointer transition-colors ${
                  favorite
                    ? "bg-yellow-300 text-yellow-900"
                    : "bg-white/15 hover:bg-white/25 text-white"
                }`}
              >
                <FontAwesomeIcon icon={faStar} size="xs" />
              </button>
            )}
            <button
              onClick={() =>
                copy(
                  [
                    scenario.label,
                    cardData.number,
                    cardData.expiry,
                    cardData.cvv,
                    cardData.name,
                    scenario.country ?? country,
                  ].join("\n"),
                  "all",
                )
              }
              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border-0"
            >
              {copied === "all" ? m("copied") : m("copyAll")}
            </button>
            <button
              onClick={fillCard}
              disabled={filling}
              className="text-xs font-bold px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors disabled:opacity-50 cursor-pointer border-0"
            >
              {filling ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                m("autoFill")
              )}
            </button>
          </div>
        </div>

        <button
          onClick={() => copy(scenario.number, "num")}
          className={`w-full text-left font-mono text-base tracking-[0.13em] px-0 py-0 border-0 bg-transparent transition-colors cursor-pointer mb-4 ${
            copied === "num"
              ? "text-green-300"
              : "text-white/90 hover:text-white"
          }`}
        >
          {copied === "num"
            ? m("copiedCheck")
            : scenario.number.replace(/(.{4})/g, "$1 ").trim()}
        </button>

        <div className="flex items-end justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <div className="text-[10px] text-white/50 uppercase tracking-widest mb-0.5">
              {m("cardholder")}
            </div>
            <button
              onClick={() => copy(cardData.name, "name")}
              className={`text-xs font-semibold uppercase tracking-wide truncate border-0 bg-transparent cursor-pointer p-0 transition-colors ${
                copied === "name"
                  ? "text-green-300"
                  : "text-white/90 hover:text-white"
              }`}
            >
              {copied === "name" ? m("copiedCheck") : cardData.name}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/60 font-mono">
              {scenario.country ? `${scenario.country} issuer` : country}
            </span>
            {brandIcon ? (
              <FontAwesomeIcon
                icon={brandIcon}
                className="text-white/80"
                size="2x"
              />
            ) : (
              <span className="text-xs font-bold text-white/80 uppercase">
                {scenario.brand}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {m("expiryDate")}
          </div>
          <button
            onClick={() => copy(cardData.expiry, "exp")}
            className={`font-mono text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors p-0 ${
              copied === "exp"
                ? "text-green-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {copied === "exp" ? m("copied") : cardData.expiry}
          </button>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">
            {m("cvc")}
          </div>
          <button
            onClick={() => copy(cardData.cvv, "cvv")}
            className={`font-mono text-sm font-bold border-0 bg-transparent cursor-pointer transition-colors p-0 ${
              copied === "cvv"
                ? "text-green-600"
                : "text-gray-800 hover:text-blue-600"
            }`}
          >
            {copied === "cvv" ? m("copied") : cardData.cvv}
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
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    void Promise.all([
      scenarioFavoritesStorage.getValue(),
      scenarioRecentsStorage.getValue(),
    ]).then(([savedFavorites, savedRecents]) => {
      setFavorites(savedFavorites);
      setRecents(savedRecents);
    });
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [id, ...current];
      void scenarioFavoritesStorage.setValue(next);
      return next;
    });
  };

  const markRecent = (id: string) => {
    setRecents((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 5);
      void scenarioRecentsStorage.setValue(next);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let items = [...STRIPE_SCENARIOS];
    const category = STRIPE_CAT_FILTER[activeCategory];

    if (activeCategory === "Favorites") {
      items = items.filter((scenario) => favorites.includes(scenario.id));
      items.sort(
        (a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id),
      );
    } else if (activeCategory === "Recent") {
      items = items.filter((scenario) => recents.includes(scenario.id));
      items.sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id));
    } else if (category) {
      items = items.filter((scenario) => scenario.category === category);
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;

    return items.filter((scenario) =>
      [
        scenario.label,
        scenario.number,
        scenario.desc,
        scenario.brand,
        scenario.category,
        scenario.country ?? "",
      ].some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [activeCategory, favorites, query, recents]);

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-3 py-2">
        <div className="relative">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={m("scenarioSearch")}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-[#635bff] focus:ring-2 focus:ring-purple-100"
          />
        </div>
      </div>

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
                    : cat === "Risk"
                      ? "bg-orange-500 text-white"
                      : "bg-[#635bff] text-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {m(STRIPE_CAT_LABEL[cat])}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs text-slate-400">
            {m("noScenarios")}
          </div>
        ) : (
          filtered.map((scenario) => (
            <ScenarioCardRow
              key={scenario.id}
              scenario={scenario}
              favorite={favorites.includes(scenario.id)}
              onToggleFavorite={toggleFavorite}
              onUsed={markRecent}
            />
          ))
        )}
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
  const [paypalQuery, setPaypalQuery] = useState("");
  const [page, setPage] = useState<Page>("main");
  const [country, setCountryState] = useState<string>("US");
  const [bgPaypal, setBgPaypalState] = useState<string>("");
  const [bgStripe, setBgStripeState] = useState<string>("");
  const [cardholderName, setCardholderNameState] =
    useState<string>("Test User");

  // Load from WXT storage on mount
  useEffect(() => {
    countryStorage.getValue().then(setCountryState);
    cardholderStorage.getValue().then(setCardholderNameState);
    bgPaypalStorage.getValue().then(setBgPaypalState);
    bgStripeStorage.getValue().then(setBgStripeState);
  }, []);

  const setCountry = (v: string) => {
    setCountryState(v);
    countryStorage.setValue(v);
  };

  const setBgPaypal = (v: string) => {
    setBgPaypalState(v);
    bgPaypalStorage.setValue(v);
  };

  const setBgStripe = (v: string) => {
    setBgStripeState(v);
    bgStripeStorage.setValue(v);
  };

  const setCardholderName = (n: string) => {
    setCardholderNameState(n);
    cardholderStorage.setValue(n);
  };

  const errorTestCard = useMemo(
    () => ({
      number: generateCardNumber("visa"),
      expiry: randomExpiry(),
      cvv: randomCvv(false),
    }),
    [],
  );

  const normalizedPaypalQuery = paypalQuery.trim().toLowerCase();

  const filtered = (
    activeTab === "All"
      ? CARD_GROUPS
      : CARD_GROUPS.filter((g) => TAB_FILTER[activeTab].includes(g.type))
  ).filter(
    (group) =>
      !normalizedPaypalQuery ||
      [group.label, group.type]
        .join(" ")
        .toLowerCase()
        .includes(normalizedPaypalQuery),
  );

  const filteredErrors = ERROR_TRIGGERS.filter(
    (item) =>
      !normalizedPaypalQuery ||
      [item.name, item.trigger, item.code, item.desc]
        .join(" ")
        .toLowerCase()
        .includes(normalizedPaypalQuery),
  );

  const filteredPaypal3DS = PAYPAL_3DS_SCENARIOS.filter(
    (scenario) =>
      !normalizedPaypalQuery ||
      [
        scenario.label,
        scenario.number,
        scenario.desc,
        scenario.brand,
        scenario.country ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedPaypalQuery),
  );

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
                <div className="bg-white border-b border-slate-200 px-3 py-2">
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faMagnifyingGlass}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                    />
                    <input
                      value={paypalQuery}
                      onChange={(event) => setPaypalQuery(event.target.value)}
                      placeholder={m("scenarioSearch")}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-700 outline-none focus:border-[#003087] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

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
                      {filteredErrors.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs text-slate-400">
                          {m("noScenarios")}
                        </div>
                      ) : (
                        filteredErrors.map((item) => (
                          <ErrorTriggerRow key={item.trigger} item={item} />
                        ))
                      )}
                    </>
                  ) : activeTab === "3DS" ? (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 mb-2">
                        {m("paypal3DSNote")}
                      </div>
                      {filteredPaypal3DS.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs text-slate-400">
                          {m("noScenarios")}
                        </div>
                      ) : (
                        filteredPaypal3DS.map((scenario) => (
                          <ScenarioCardRow key={scenario.id} scenario={scenario} />
                        ))
                      )}
                    </>
                  ) : filtered.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs text-slate-400">
                      {m("noScenarios")}
                    </div>
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
