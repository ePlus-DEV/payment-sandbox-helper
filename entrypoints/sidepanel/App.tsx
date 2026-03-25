import { useState } from "react";
import "./App.css";

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

function App() {
  const [status, setStatus] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  const fillCard = async (card: (typeof SANDBOX_CARDS)[0]) => {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;
    try {
      await browser.tabs.sendMessage(tab.id, { action: "fillCard", card });
      setStatus(`Đã điền card ${card.label}`);
      setTimeout(() => setStatus(""), 3000);
    } catch {
      setStatus("Không tìm thấy form thẻ trên trang này");
      setTimeout(() => setStatus(""), 3000);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/icon/48.png" alt="logo" className="logo" />
        <div>
          <h1>PayPal Sandbox Cards</h1>
          <p>Click để tự động điền vào form</p>
        </div>
      </div>

      <div className="cards-list">
        {SANDBOX_CARDS.map((card) => (
          <div key={card.number} className="card-item">
            <div className="card-header">
              <span className="card-label">{card.label}</span>
              <button className="fill-btn" onClick={() => fillCard(card)}>
                Auto Fill
              </button>
            </div>
            <div className="card-fields">
              <div className="field-row">
                <span className="field-label">Number</span>
                <span
                  className={`field-value copyable ${copied === card.number ? "copied" : ""}`}
                  onClick={() => copyToClipboard(card.number, card.number)}
                  title="Click để copy"
                >
                  {card.number}
                </span>
              </div>
              <div className="field-row">
                <span className="field-label">Expiry</span>
                <span
                  className={`field-value copyable ${copied === card.number + "exp" ? "copied" : ""}`}
                  onClick={() =>
                    copyToClipboard(card.expiry, card.number + "exp")
                  }
                >
                  {card.expiry}
                </span>
                <span className="field-label">CVV</span>
                <span
                  className={`field-value copyable ${copied === card.number + "cvv" ? "copied" : ""}`}
                  onClick={() => copyToClipboard(card.cvv, card.number + "cvv")}
                >
                  {card.cvv}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {status && <div className="status">{status}</div>}
    </div>
  );
}

export default App;
