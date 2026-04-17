export const state = {
  catalog: null,
  selectedCategory: "All",
  cart: new Map(),
  checkout: {
    name: "",
    department: "",
    budget: "",
    isCrp: "no",
    crpProjectCode: "",
    crpApprover: "",
    crpEndDate: ""
  }
};

export function addToCart(productId, qty = 1) {
  const current = state.cart.get(productId) || 0;
  state.cart.set(productId, current + qty);
}

export function setQuantity(productId, qty) {
  if (qty <= 0) {
    state.cart.delete(productId);
    return;
  }
  state.cart.set(productId, qty);
}

export function clearCart() {
  state.cart.clear();
}
