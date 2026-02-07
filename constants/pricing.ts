export const PRICING = {
  monthly: {
    price: 9.99,
    interval: "month" as const,
    label: "Monthly",
    priceLabel: "$9.99",
    perMonthLabel: "$9.99/month",
  },
  yearly: {
    price: 110,
    interval: "year" as const,
    label: "Yearly",
    priceLabel: "$110",
    perMonthLabel: "$9.17/month",
    badge: "Save 8%",
  },
} as const;
