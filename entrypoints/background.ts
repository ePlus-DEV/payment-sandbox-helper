import { randomCvv, randomExpiry } from "../utils/cards";
import {
  PAYPAL_CONTEXT_SCENARIOS,
  STRIPE_CONTEXT_SCENARIOS,
  type TestScenarioCard,
} from "../utils/test-scenarios";
import { cardholderStorage, countryStorage } from "../utils/storage";

interface CurrentCard {
  number: string;
  expiry: string;
  cvv: string;
  name: string;
  type: string;
  country: string;
}

interface ContextMenuClickInfo {
  menuItemId: string | number;
  frameId?: number;
}

interface TabInfo {
  id?: number;
}

let currentCard: CurrentCard = {
  number: "4012888888881881",
  expiry: randomExpiry(),
  cvv: randomCvv(false),
  name: "Test User",
  type: "visa",
  country: "US",
};

const menuScenarios = [...PAYPAL_CONTEXT_SCENARIOS, ...STRIPE_CONTEXT_SCENARIOS];
const scenarioByMenuId = new Map(
  menuScenarios.map((scenario) => [`scenario:${scenario.id}`, scenario]),
);

const CATEGORY_LABEL: Record<TestScenarioCard["category"], string> = {
  success: "Success",
  decline: "Decline",
  "3ds": "3D Secure",
  radar: "Radar",
  dispute: "Disputes",
  error: "Errors",
};

function createScenarioMenus(
  provider: "paypal" | "stripe",
  rootId: string,
  scenarios: TestScenarioCard[],
) {
  const categories = [...new Set(scenarios.map((scenario) => scenario.category))];

  for (const category of categories) {
    const categoryId = `${rootId}:${category}`;
    browser.contextMenus.create({
      id: categoryId,
      parentId: rootId,
      title: CATEGORY_LABEL[category],
      contexts: ["editable"],
    });

    for (const scenario of scenarios.filter(
      (item) => item.category === category && item.provider === provider,
    )) {
      browser.contextMenus.create({
        id: `scenario:${scenario.id}`,
        parentId: categoryId,
        title: `${scenario.label} – ${scenario.number}`,
        contexts: ["editable"],
      });
    }
  }
}

async function buildMenus() {
  await browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: "paypal",
    title: "PayPal Sandbox",
    contexts: ["editable"],
  });
  createScenarioMenus("paypal", "paypal", PAYPAL_CONTEXT_SCENARIOS);

  browser.contextMenus.create({
    id: "stripe",
    title: "Stripe Test",
    contexts: ["editable"],
  });
  createScenarioMenus("stripe", "stripe", STRIPE_CONTEXT_SCENARIOS);

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

async function selectScenario(scenario: TestScenarioCard, tabId: number) {
  const [defaultName, country] = await Promise.all([
    cardholderStorage.getValue(),
    countryStorage.getValue(),
  ]);

  currentCard = {
    number: scenario.number,
    expiry: randomExpiry(),
    cvv: randomCvv(scenario.cvvLen === 4),
    name: scenario.nameOverride ?? defaultName,
    type: scenario.brand,
    country,
  };

  await sendMessageToTab(tabId, {
    action: "fillCard",
    card: currentCard,
  });
}

async function handleContextMenuClick(
  info: ContextMenuClickInfo,
  tab?: TabInfo,
) {
  if (tab?.id == null) return;

  const menuId = String(info.menuItemId);
  const scenario = scenarioByMenuId.get(menuId);

  if (scenario) {
    await selectScenario(scenario, tab.id);
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

  await sendMessageToTab(
    tab.id,
    {
      action: "fillField",
      field: menuId.slice("fill_".length),
      value,
    },
    info.frameId,
  );
}

export default defineBackground(() => {
  if (import.meta.env.BROWSER === "firefox") {
    browser.action.onClicked.addListener(() => {
      void (browser as typeof browser & {
        sidebarAction: { toggle: () => Promise<void> };
      }).sidebarAction.toggle();
    });
  } else {
    void browser.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch(() => undefined);
  }

  void buildMenus();

  browser.contextMenus.onClicked.addListener((info, tab) => {
    void handleContextMenuClick(info, tab);
  });
});
