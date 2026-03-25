import { useState } from "react";

const SANDBOX_CARDS = [
  {
    label: "American Express",
    number: "371449635398431",
    expiry: "03/2030",
    cvv: "1234",
    name: "Test User",
    type: "amex",
  },
  {
    label: "American Express",
    number: "376680816376961",
    expiry: "03/2030",
    cvv: "1234",
    name: "Test User",
    type: "amex",
  },
  {
    label: "Diners Club",
    number: "36461510000039",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "diners",
  },
  {
    label: "Diners Club",
    number: "36461510000013",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "diners",
  },
  {
    label: "Maestro",
    number: "6304000000000000",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "maestro",
  },
  {
    label: "Maestro",
    number: "5063516945005047",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "maestro",
  },
  {
    label: "Mastercard",
    number: "2223000048400011",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "mastercard",
  },
  {
    label: "Visa",
    number: "4005519200000004",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4012000033330026",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4012000077777777",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4012888888881881",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4217651111111119",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4500600000000061",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4772129056533503",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "Visa",
    number: "4915805038587737",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "visa",
  },
  {
    label: "CUP",
    number: "6200680000000004",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "cup",
  },
  {
    label: "CUP",
    number: "6200680000000038",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "cup",
  },
  {
    label: "JCB",
    number: "3636500000000260",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "jcb",
  },
  {
    label: "JCB",
    number: "3636500000000989",
    expiry: "03/2030",
    cvv: "123",
    name: "Test User",
    type: "jcb",
  },
];

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

const ERROR_TEST_CARD = {
  number: "4012888888881881",
  expiry: "03/2030",
  cvv: "123",
  name: "",
  type: "visa",
  label: "Visa",
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

// Clipboard fallback cho extension context
function copyText(text: string) {
  try {
    navigator.clipboard.writeText(text);
  } catch {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }
}

type Card = (typeof SANDBOX_CARDS)[0];

function CardRow({ card }: { card: Card }) {
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
      await browser.tabs.sendMessage(tab.id, { action: "fillCard", card });
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
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {card.label}
        </span>
        <button
          onClick={fillCard}
          disabled={filling}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#009cde] hover:bg-[#0070ba] text-white transition-colors disabled:opacity-50 cursor-pointer"
        >
          {filling ? "..." : "Auto Fill"}
        </button>
      </div>

      {/* Card number - click to copy */}
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

function ErrorTriggerRow({ item }: { item: (typeof ERROR_TRIGGERS)[0] }) {
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
        card: { ...ERROR_TEST_CARD, name: item.trigger },
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
      {/* Row: name | code | fill button */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex-1 text-xs font-semibold text-slate-700">
          {item.name}
        </span>
        <span className="text-[10px] font-bold text-white bg-slate-400 px-1.5 py-0.5 rounded shrink-0">
          {item.code}
        </span>
        <button
          onClick={fillError}
          disabled={filling}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          {filling ? "..." : "Fill"}
        </button>
      </div>

      {/* Trigger string - click to copy */}
      <button
        onClick={copy}
        className={`w-full text-left font-mono text-xs px-2 py-1.5 rounded-lg cursor-pointer transition-colors border-0 ${
          copied
            ? "bg-green-100 text-green-700"
            : "bg-red-50 hover:bg-red-100 text-red-700"
        }`}
      >
        {copied ? "Copied!" : item.trigger}
      </button>

      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
        {item.desc}
      </p>

      {toast && (
        <div className="mt-2 text-center text-xs font-medium text-green-700 bg-green-50 rounded-lg py-1">
          {toast}
        </div>
      )}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered =
    activeTab === "All"
      ? SANDBOX_CARDS
      : SANDBOX_CARDS.filter((c) => TAB_FILTER[activeTab].includes(c.type));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#003087] px-4 py-3 flex items-center gap-3 shadow">
        <img src="/icon/48.png" alt="logo" className="w-8 h-8 rounded-lg" />
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">
            PayPal Sandbox Cards
          </h1>
          <p className="text-blue-300 text-xs">
            Click để copy · Auto Fill để điền form
          </p>
        </div>
      </div>

      {/* Tabs - single scrollable row */}
      <div className="flex bg-white border-b border-slate-200 px-2 pt-2 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab
                ? tab === "Errors"
                  ? "bg-red-500 text-white"
                  : "bg-[#003087] text-white"
                : tab === "Errors"
                  ? "text-red-400 hover:bg-red-50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {activeTab === "Errors" ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
              <p className="mb-2">
                Điền trigger vào field{" "}
                <span className="font-bold">Name on Card</span>. Dùng thẻ Visa
                bên dưới:
              </p>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => copyText(ERROR_TEST_CARD.number)}
                  className="w-full text-left font-mono font-bold px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                >
                  {ERROR_TEST_CARD.number}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyText(ERROR_TEST_CARD.expiry)}
                    className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                  >
                    <span className="font-bold">Exp</span>
                    <span className="font-mono">{ERROR_TEST_CARD.expiry}</span>
                  </button>
                  <button
                    onClick={() => copyText(ERROR_TEST_CARD.cvv)}
                    className="flex-1 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 cursor-pointer border-0 text-amber-900 transition-colors"
                  >
                    <span className="font-bold">CVV</span>
                    <span className="font-mono">{ERROR_TEST_CARD.cvv}</span>
                  </button>
                </div>
              </div>
            </div>
            {ERROR_TRIGGERS.map((item) => (
              <ErrorTriggerRow key={item.trigger} item={item} />
            ))}
          </>
        ) : (
          filtered.map((card) => <CardRow key={card.number} card={card} />)
        )}
      </div>
    </div>
  );
}

export default App;
