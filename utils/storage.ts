import { storage } from "wxt/utils/storage";

export const countryStorage = storage.defineItem<string>("local:country", {
  fallback: "US",
});

export const cardholderStorage = storage.defineItem<string>(
  "local:cardholder",
  { fallback: "Test User" },
);

export const bgPaypalStorage = storage.defineItem<string>("local:bgPaypal", {
  fallback: "",
});

export const bgStripeStorage = storage.defineItem<string>("local:bgStripe", {
  fallback: "",
});
