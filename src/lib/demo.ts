// Demo mode turns the deployed site into a playground: one-click admin login,
// test-card hints and a daily reset of the data. Never enable it for a real shop.
export const isDemoMode = () => process.env.DEMO_MODE === "true";

export const DEMO_LOGIN = {
  email: "demo@tigela.com",
  password: "tigela123",
};

// Stripe's test card. Works only with test-mode keys.
export const DEMO_TEST_CARD = "4242 4242 4242 4242";
