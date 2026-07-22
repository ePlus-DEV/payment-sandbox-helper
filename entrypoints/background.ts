import { generateCardNumber, randomCvv, randomExpiry } from "../utils/cards";
import { cardholderStorage, countryStorage } from "../utils/storage";

interface CurrentCard {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  type: string;
  country: string;
}

// Keep the latest selected card for the individual context-menu actions.
let currentCard: CurrentCard = {
  number: generateCardNumber("visa"),
  expiry: randomExpiry(),
  cvv: randomCvv(false),
  name: "Test User",
  type: "visa",
  country: "US",
};

async function buildMenus() {
  await browser.contextMenus.removeAll();

  // PayPal group
  browser.contextMenus.create({
    id: "paypal",
    title: "PayPal Sandbox",
    contexts: ["editable"],
  });

  const paypalCards = [
    {
      id: "pp_visa",
      label: "Visa – 4012888888881881",
      number: "4012888888881881",
      amex: false,
      type: "visa",
    },
    {
      id: "pp_mc",
      label: "Mastercard – 2223000048400011",
      number: "2223000048400011",
      amex: false,
      type: "mastercard",
    },
    {
      id: "pp_amex",
      label: "Amex – 371449635398431",
      number: "371449635398431",
      amex: true,
      type: "amex",
    },
  ];

  for (const card of paypalCards) {
    browser.contextMenus.create({
      id: card.id,
      parentId: "paypal",
      title: card.label,
      contexts: ["editable"],
    });
  }

  // Stripe group
  browser.contextMenus.create({
    id: "stripe",
    title: "Stripe Test",
    contexts: ["editable"],
  });

  const stripeCards = [
    {
      id: "st_visa",
      label: "Visa – 4242424242424242",
      number: "4242424242424242",
      amex: false,
      type: "visa",
    },
    {
      id: "st_mc",
      label: "Mastercard – 5555555555554444",
      number: "5555555555554444",
      amex: false,
      type: "mastercard",
    },
    {
      id: "st_amex",
      label: "Amex – 378282246310005",
      number: "378282246310005",
      amex: true,
      type: "amex",
    },
    {
      id: "st_decline",
      label: "Decline – 4000000000000002",
      number: "4000000000000002",
      amex: false,
      type: "visa",
    },
    {
      id: "st_3ds",
      label: "3DS – 4000002760003184",
      number: "4000002760003184",
      amex: false,
      type: "visa",
    },
  ];

  for (const card of stripeCards) {
    browser.contextMenus.create({
      id: card.id,
      parentId: "stripe",
      title: card.label,
      contexts: ["editable"],
    });
  }

  // Separator + individual field actions
  browser.contextMenus.create({
    id: "sep",
    type: "separator",
    contexts: ["editable"],
  });
  browser.contextMenus.create({
    id: "fill_number",
    title: "Fill: Card Number",
    contexts: ["editable"],
  });
  browser.contextMenus.create({
    id: "fill_expiry",
    title: "Fill: Expiry Date",
    contexts: ["editable"],
  });
  browser.contextMenus.create({
    id: "fill_cvv",
    title: "Fill: CVV/CVC",
    contexts: ["editable"],
  });
  browser.contextMenus.create({
    id: "fill_name",
    title: "Fill: Cardholder Name",
    contexts: ["editable"],
  });
}

const allCards: Record<
  string,
  { number: string; amex: boolean; type: string }
> = {
  pp_visa: { number: "4012888888881881", amex: false, type: "visa" },
  pp_mc: { number: "2223000048400011", amex: false, type: "mastercard" },
  pp_amex: { number: "371449635398431", amex: true, type: "amex" },
  st_visa: { number: "4242424242424242", amex: false, type: "visa" },
  st_mc: { number: "5555555555554444", amex: false, type: "mastercard" },
  st_amex: { number: "378282246310005", amex: true, type: "amex" },
  st_decline: { number: "4000000000000002", amex: false, type: "visa" },
  st_3ds: { number: "4000002760003184", amex: false, type: "visa" },
};

async function sendMessageToTab(
  tabId: number,
  message: unknown,
  frameId?: number,
) {
  try {
    if (frameId === undefined) {
      await browser.tabs.sendMessage(tabId, message);
    } else {
      await browser.tabs.sendMessage(tabId, message, { frameId });
    }
  } catch {
    // The current page/frame may not have a matching content script.
  }
}

async function handleContextMenuClick(
  info: Browser.contextMenus.OnClickData,
  tab?: Browser.tabs.Tab,
) {
  if (tab?.id == null) return;

  const menuId = String(info.menuItemId);
  const selectedCard = allCards[menuId];

  // Select a card, remember it, and fill every matching payment frame.
  if (selectedCard) {
    const [name, country] = await Promise.all([
      cardholderStorage.getValue(),
      countryStorage.getValue(),
    ]);

    currentCard = {
      number: selectedCard.number,
      expiry: randomExpiry(),
      cvv: randomCvv(selectedCard.amex),
      name,
      type: selectedCard.type,
      country,
    };

    await sendMessageToTab(tab.id, {
      action: "fillCard",
      card: currentCard,
    });
    return;
  }

  if (menuId === "fill_name") {
    currentCard.name = await cardholderStorage.getValue();
  }

  const fieldMap: Record<string, string> = {
    fill_number: currentCard.number,
    fill_expiry: currentCard.expiry,
    fill_cvv: currentCard.cvv,
    fill_name: currentCard.name,
  };

  const value = fieldMap[menuId];
  if (value === undefined) return;

  // Target the exact iframe where the user opened the context menu.
  await sendMessageToTab(tab.id, { action: "fillField", value }, info.frameId);
}

export default defineBackground(() => {
  if (import.meta.env.BROWSER === "firefox") {
    browser.action.onClicked.addListener(() => {
      void (browser as typeof browser & {
        sidebarAction: { toggle: () => Promise<void> };
      }).sidebarAction.toggle();
    });
  } else {
    // Let Chrome manage opening the side panel from the toolbar action.
    // The old enable/disable workaround did not reliably close the panel.
    void browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => undefined);
  }

  void buildMenus();

  browser.runtime.onInstalled.addListener(() => {
    void buildMenus();
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    void handleContextMenuClick(info, tab);
  });
});
