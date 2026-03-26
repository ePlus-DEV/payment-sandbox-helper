import { generateCardNumber, randomCvv, randomExpiry } from "../utils/cards";

// Lưu card hiện tại để dùng khi context menu click
let currentCard = {
  number: generateCardNumber("visa"),
  expiry: randomExpiry(),
  cvv: randomCvv(false),
  name: "Test User",
  type: "visa",
};

function buildMenus() {
  browser.contextMenus.removeAll(() => {
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

    for (const c of paypalCards) {
      browser.contextMenus.create({
        id: c.id,
        parentId: "paypal",
        title: c.label,
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

    for (const c of stripeCards) {
      browser.contextMenus.create({
        id: c.id,
        parentId: "stripe",
        title: c.label,
        contexts: ["editable"],
      });
    }

    // Separator + fill fields
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
  });
}

export default defineBackground(() => {
  // Toggle sidebar khi click icon extension
  const openWindows = new Set<number>();
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
  browser.action.onClicked.addListener((tab) => {
    const winId = tab.windowId!;
    if (openWindows.has(winId)) {
      openWindows.delete(winId);
      // Chrome không có API đóng trực tiếp, dùng setOptions để disable rồi re-enable
      browser.sidePanel.setOptions({ enabled: false });
      browser.sidePanel.setOptions({ enabled: true });
    } else {
      openWindows.add(winId);
      browser.sidePanel.open({ windowId: winId });
    }
  });

  buildMenus();

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

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;
    const menuId = info.menuItemId as string;

    // Chọn card → lưu vào currentCard và fill toàn bộ form
    if (allCards[menuId]) {
      const c = allCards[menuId];
      currentCard = {
        number: c.number,
        expiry: randomExpiry(),
        cvv: randomCvv(c.amex),
        name: "Test User",
        type: c.type,
      };
      browser.tabs.sendMessage(tab.id, {
        action: "fillCard",
        card: currentCard,
      });
      return;
    }

    // Fill từng field riêng lẻ vào input đang focus
    const fieldMap: Record<string, string> = {
      fill_number: currentCard.number,
      fill_expiry: currentCard.expiry,
      fill_cvv: currentCard.cvv,
      fill_name: currentCard.name,
    };

    if (fieldMap[menuId] !== undefined) {
      browser.tabs.sendMessage(tab.id, {
        action: "fillField",
        value: fieldMap[menuId],
      });
    }
  });
});
