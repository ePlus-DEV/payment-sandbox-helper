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

const TABS = ["All", "Visa", "Mastercard", "Amex", "Others"] as const;
type Tab = (typeof TABS)[number];

const TAB_FILTER: Record<Tab, string[]> = {
  All: [],
  Visa: ["visa"],
  Mastercard: ["mastercard"],
  Amex: ["amex"],
  Others: ["diners", "maestro", "cup", "jcb"],
};

type Card = (typeof SANDBOX_CARDS)[0];

function CardRow({ card }: { card: Card }) {
  const [copied, setCopied] = useState("");
  const [filling, setFilling] = useState(false);
  const [toast, setToast] = useState("");

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
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
      if (!tab?.id) throw new Error();
      await browser.tabs.sendMessage(tab.id, { action: "fillCard", card });
      setToast("Đã điền thành công");
    } catch {
      setToast("Không tìm thấy form");
    } finally {
      setFilling(false);
      setTimeout(() => setToast(""), 2500);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Card type badge + fill button */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {card.label}
        </span>
        <button
          onClick={fillCard}
          disabled={filling}
          className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#009cde] hover:bg-[#0070ba] text-white transition-colors disabled:opacity-50 cursor-pointer"
        >
          {filling ? "Filling..." : "Auto Fill"}
        </button>
      </div>

      {/* Card number */}
      <div
        onClick={() => copy(card.number, "num")}
        className={`font-mono text-sm tracking-widest px-2 py-1.5 rounded-lg cursor-pointer transition-colors mb-1 ${
          copied === "num"
            ? "bg-green-100 text-green-700"
            : "bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700"
        }`}
      >
        {card.number}
      </div>

      {/* Expiry + CVV */}
      <div className="flex gap-2">
        <div
          onClick={() => copy(card.expiry, "exp")}
          className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors ${
            copied === "exp"
              ? "bg-green-100 text-green-700"
              : "bg-slate-50 hover:bg-blue-50"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            Exp
          </span>
          <span className="font-mono text-xs text-slate-600">
            {card.expiry}
          </span>
        </div>
        <div
          onClick={() => copy(card.cvv, "cvv")}
          className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors ${
            copied === "cvv"
              ? "bg-green-100 text-green-700"
              : "bg-slate-50 hover:bg-blue-50"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase">
            CVV
          </span>
          <span className="font-mono text-xs text-slate-600">{card.cvv}</span>
        </div>
      </div>

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
            Click số thẻ để copy · Auto Fill để điền form
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-slate-200 px-2 pt-2 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === tab
                ? "bg-[#003087] text-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Card list */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {filtered.map((card) => (
          <CardRow key={card.number} card={card} />
        ))}
      </div>
    </div>
  );
}

export default App;
