export const CHECKOUT_CURRENCY = "gbp";

export function formatPrice(amount: number, currency = CHECKOUT_CURRENCY) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount: number) {
  return amount / 100;
}
