import {
  useState,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";

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

function loadCountry(): string {
  return localStorage.getItem(STORAGE_KEY) ?? "US";
}

function saveCountry(code: string) {
  localStorage.setItem(STORAGE_KEY, code);
}

// ── Country context ────────────────────────────────────────────
const CountryCtx = createContext<{
  country: string;
  setCountry: (c: string) => void;
}>({
  country: "US",
  setCountry: () => {},
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
  const { country, setCountry } = useContext(CountryCtx);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="text-sm font-bold text-slate-700 mb-4">Settings</h2>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Country / Region
        </label>
        <p className="text-xs text-slate-400 mb-3">
          Dùng chung cho tất cả card khi Auto Fill vào billing address.
        </p>
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
          <span className="text-xs text-slate-500">Selected: </span>
          <span className="text-xs font-mono font-bold text-slate-700">
            {country}
          </span>
          <span className="text-xs text-slate-400 ml-1">
            — {COUNTRIES.find((c) => c.code === country)?.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── CardRow ────────────────────────────────────────────────────
type CardGroup = (typeof CARD_GROUPS)[0];

function CardRow({ group }: { group: CardGroup }) {
  const { country } = useContext(CountryCtx);

  const generate = useCallback(
    () => ({
      number: generateCardNumber(group.type),
      expiry: randomExpiry(),
      cvv: randomCvv(group.amex),
      name: "Test User",
    }),
    [group],
  );

  const [card, setCard] = useState(() => generate());
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
        card: { ...card, label: group.label, type: group.type, country },
      });
      setToast("Đã điền ✓");
    } catch {
      setToast("Không tìm thấy form");
    } finally {
      setFilling(false);
      setTimeout(() => setToast(""), 2000);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {group.label}
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
            {country}
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCard(generate())}
            title="Generate new card"
            className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border-0"
          >
            ↻
          </button>
          <button
            onClick={fillCard}
            disabled={filling}
            className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#009cde] hover:bg-[#0070ba] text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {filling ? "..." : "Auto Fill"}
          </button>
        </div>
      </div>

      <button
        onClick={() => copy(card.number, "num")}
        className={`w-full text-left font-mono text-sm tracking-widest px-2 py-1.5 rounded-lg transition-colors mb-1 cursor-pointer border-0 ${
          copied === "num"
            ? "bg-green-100 text-green-700"
            : "bg-slate-50 hover:bg-blue-50 text-slate-700"
        }`}
      >
        {copied === "num" ? "Copied!" : card.number}
      </button>

      <div className="flex gap-2">
        <button
          onClick={() => copy(card.expiry, "exp")}
          className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors border-0 ${
            copied === "exp"
              ? "bg-green-100 text-green-700"
              : "bg-slate-50 hover:bg-blue-50"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Exp
          </span>
          <span className="font-mono text-xs text-slate-600">
            {copied === "exp" ? "Copied!" : card.expiry}
          </span>
        </button>
        <button
          onClick={() => copy(card.cvv, "cvv")}
          className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors border-0 ${
            copied === "cvv"
              ? "bg-green-100 text-green-700"
              : "bg-slate-50 hover:bg-blue-50"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            CVV
          </span>
          <span className="font-mono text-xs text-slate-600">
            {copied === "cvv" ? "Copied!" : card.cvv}
          </span>
        </button>
      </div>

      {toast && (
        <div className="mt-2 text-center text-xs font-medium text-green-700 bg-green-50 rounded-lg py-1">
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
  const [copied, setCopied] = useState(false);
  const [filling, setFilling] = useState(false);
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
      setToast("Đã điền ✓");
    } catch {
      setToast("Không tìm thấy form");
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
          onClick={() => setTestCard(genTestCard())}
          title="Generate new card"
          className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border-0 shrink-0"
        >
          ↻
        </button>
        <button
          onClick={fillError}
          disabled={filling}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          {filling ? "..." : "Fill"}
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
        {copied ? "Copied!" : item.trigger}
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

// ── App ────────────────────────────────────────────────────────
type Page = "cards" | "settings";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [page, setPage] = useState<Page>("cards");
  const [country, setCountry] = useState<string>(() => loadCountry());

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
    <CountryCtx.Provider value={{ country, setCountry }}>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-[#003087] px-4 py-3 flex items-center gap-3 shadow">
          <img src="/icon/48.png" alt="logo" className="w-8 h-8 rounded-lg" />
          <div className="flex-1">
            <h1 className="text-white font-bold text-sm leading-tight">
              PayPal Sandbox Cards
            </h1>
            <p className="text-blue-300 text-xs">
              Click để copy · Auto Fill để điền form
            </p>
          </div>
          <button
            onClick={() => setPage(page === "settings" ? "cards" : "settings")}
            className={`text-lg px-2 py-1 rounded-lg transition-colors cursor-pointer border-0 ${
              page === "settings"
                ? "bg-white text-[#003087]"
                : "bg-[#004ab3] text-white hover:bg-[#0057cc]"
            }`}
            title="Settings"
          >
            ⚙
          </button>
        </div>

        {page === "settings" ? (
          <SettingsPage />
        ) : (
          <>
            {/* Tabs */}
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
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {activeTab === "Errors" ? (
                <>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 mb-2">
                    <p className="mb-2">
                      Điền trigger vào field{" "}
                      <span className="font-bold">Name on Card</span>. Dùng thẻ
                      Visa:
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
                          <span className="font-bold">Exp</span>
                          <span className="font-mono">
                            {errorTestCard.expiry}
                          </span>
                        </button>
                        <button
                          onClick={() => copyText(errorTestCard.cvv)}
                          className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                        >
                          <span className="font-bold">CVV</span>
                          <span className="font-mono">{errorTestCard.cvv}</span>
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
      </div>
    </CountryCtx.Provider>
  );
}

export default App;
