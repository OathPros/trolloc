import { state, addToCart, setQuantity } from "./state.js";
import { buildOrderEmail, currency } from "./email.js";
import { renderCategoryFilters, renderProducts, renderSetups, renderCart, productDialogMarkup, setupCompareMarkup } from "./render.js";

const nodes = {
  categoryFilters: document.querySelector("#category-filters"),
  productGrid: document.querySelector("#product-grid"),
  setupList: document.querySelector("#setup-list"),
  cartPanel: document.querySelector("#cart-panel"),
  openCart: document.querySelector("#open-cart"),
  closeCart: document.querySelector("#close-cart"),
  cartItems: document.querySelector("#cart-items"),
  cartTotal: document.querySelector("#cart-total"),
  cartCount: document.querySelector("#cart-count"),
  productDialog: document.querySelector("#product-dialog"),
  setupDialog: document.querySelector("#setup-dialog"),
  checkoutForm: document.querySelector("#checkout-form"),
  isCrp: document.querySelector("#is-crp"),
  crpFields: document.querySelector("#crp-fields"),
  feedback: document.querySelector("#submit-feedback")
};

init();

async function init() {
  try {
    const response = await fetch("./data/catalog.json");
    state.catalog = await response.json();
  } catch {
    nodes.productGrid.innerHTML = "<p class='muted'>Catalog could not be loaded. Run this app from a local web server (for example: <code>python3 -m http.server</code>).</p>";
    return;
  }

  state.productMap = new Map(state.catalog.products.map((product) => [product.id, product]));
  state.setupMap = new Map(state.catalog.setups.map((setup) => [setup.id, setup]));

  renderCategoryFilters(nodes.categoryFilters, state.catalog.categories, state.selectedCategory);
  renderSetups(nodes.setupList, state.catalog.setups, state.productMap);
  renderCurrentProducts();
  renderCartState();

  bindEvents();
}

function bindEvents() {
  document.body.addEventListener("click", handleActionClick);
  nodes.openCart.addEventListener("click", () => toggleCart(true));
  nodes.closeCart.addEventListener("click", () => toggleCart(false));
  nodes.isCrp.addEventListener("change", handleCrpToggle);
  nodes.checkoutForm.addEventListener("submit", handleSubmit);
  nodes.checkoutForm.addEventListener("input", handleCheckoutDraft);
}

function handleActionClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  if (!action) {
    if (button.classList.contains("category-filter")) {
      state.selectedCategory = button.dataset.category;
      renderCategoryFilters(nodes.categoryFilters, state.catalog.categories, state.selectedCategory);
      renderCurrentProducts();
    }
    return;
  }

  if (action === "add-product") {
    addToCart(button.dataset.productId, 1);
    renderCartState();
    return;
  }

  if (action === "view-product") {
    const product = state.productMap.get(button.dataset.productId);
    openProductDialog(product);
    return;
  }

  if (action === "add-setup") {
    const setup = state.setupMap.get(button.dataset.setupId);
    setup.items.forEach((itemId) => addToCart(itemId, 1));
    renderCartState();
    return;
  }

  if (action === "compare-setup") {
    const setup = state.setupMap.get(button.dataset.setupId);
    openSetupDialog(setup);
    return;
  }

  if (action === "inc-qty" || action === "dec-qty" || action === "remove-item") {
    const productId = button.dataset.productId;
    const current = state.cart.get(productId) || 0;
    if (action === "inc-qty") setQuantity(productId, current + 1);
    if (action === "dec-qty") setQuantity(productId, current - 1);
    if (action === "remove-item") setQuantity(productId, 0);
    renderCartState();
    return;
  }

  if (action === "close-dialog") {
    button.closest("dialog")?.close();
  }
}

function renderCurrentProducts() {
  const products = state.selectedCategory === "All"
    ? state.catalog.products
    : state.catalog.products.filter((product) => product.category === state.selectedCategory);
  renderProducts(nodes.productGrid, products);
}

function getCartLines() {
  const lines = [];
  for (const [id, qty] of state.cart.entries()) {
    const product = state.productMap.get(id);
    if (!product) continue;
    lines.push({
      id,
      name: product.name,
      qty,
      price: product.price,
      lineTotal: product.price * qty
    });
  }
  return lines;
}

function renderCartState() {
  const lines = getCartLines();
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  nodes.openCart.hidden = count === 0;
  nodes.cartCount.textContent = String(count);
  nodes.cartTotal.textContent = currency(total);
  renderCart(nodes.cartItems, lines);
}

function toggleCart(show) {
  nodes.cartPanel.hidden = !show;
}

function openProductDialog(product) {
  nodes.productDialog.innerHTML = productDialogMarkup(product);
  nodes.productDialog.showModal();
}

function openSetupDialog(setup) {
  const setupProducts = setup.items.map((itemId) => state.productMap.get(itemId));
  nodes.setupDialog.innerHTML = setupCompareMarkup(setup, setupProducts);
  nodes.setupDialog.showModal();
}

function handleCrpToggle() {
  const isCrp = nodes.isCrp.value === "yes";
  nodes.crpFields.hidden = !isCrp;
  for (const input of nodes.crpFields.querySelectorAll("input")) {
    input.required = isCrp;
  }
}

function handleCheckoutDraft(event) {
  const target = event.target;
  if (!target.name) return;
  state.checkout[target.name] = target.value;
}

async function handleSubmit(event) {
  event.preventDefault();
  const lines = getCartLines();

  if (lines.length === 0) {
    nodes.feedback.textContent = "Add at least one item before generating an order.";
    return;
  }

  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const payload = buildOrderEmail({ checkout: state.checkout, cartLines: lines, total });

  const opened = window.open(payload.mailto, "_self");
  if (opened !== null) {
    nodes.feedback.textContent = "Email draft opened in your default mail client.";
    return;
  }

  try {
    await navigator.clipboard.writeText(payload.body);
    nodes.feedback.textContent = "Could not open mail client. Order copied to clipboard.";
    return;
  } catch {
    const blob = new Blob([payload.body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "computer-order-request.txt";
    a.click();
    URL.revokeObjectURL(url);
    nodes.feedback.textContent = "Could not open mail client. Order exported as text file.";
  }
}
