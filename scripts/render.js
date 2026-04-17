import { currency } from "./email.js";

function tagsMarkup(tags) {
  return tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
}

export function renderCategoryFilters(node, categories, selected) {
  node.innerHTML = ["All", ...categories]
    .map((cat) => `<button type="button" class="category-filter" data-category="${cat}" aria-selected="${cat === selected}">${cat}</button>`)
    .join("");
}

export function renderProducts(node, products) {
  node.innerHTML = products
    .map((product) => `
      <article class="card">
        <img class="thumb" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'" />
        <div class="card-content">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="tags">${tagsMarkup(product.tags)}</div>
          <div class="price">${currency(product.price)}</div>
        </div>
        <div class="actions">
          <button type="button" data-action="view-product" data-product-id="${product.id}">Details</button>
          <button type="button" class="primary" data-action="add-product" data-product-id="${product.id}">Add</button>
        </div>
      </article>
    `)
    .join("");
}

export function renderSetups(node, setups, productMap) {
  node.innerHTML = setups
    .map((setup) => {
      const total = setup.items.reduce((sum, itemId) => sum + productMap.get(itemId).price, 0);
      return `
      <article class="card setup-card">
        <div class="card-content">
          <h3>${setup.name}</h3>
          <p>${setup.description}</p>
          <p class="muted">${setup.items.length} items • ${currency(total)}</p>
        </div>
        <div class="actions">
          <button type="button" class="primary" data-action="add-setup" data-setup-id="${setup.id}">Quick add package</button>
          <button type="button" data-action="compare-setup" data-setup-id="${setup.id}">View and compare</button>
        </div>
      </article>`;
    })
    .join("");
}

export function renderCart(node, lines) {
  if (lines.length === 0) {
    node.innerHTML = "<p class='muted' style='padding:0.75rem;'>No items yet.</p>";
    return;
  }

  node.innerHTML = lines
    .map((line) => `
      <div class="cart-item">
        <div class="row"><strong>${line.name}</strong><span>${currency(line.lineTotal)}</span></div>
        <div class="qty-controls">
          <button type="button" data-action="dec-qty" data-product-id="${line.id}" aria-label="Decrease quantity">−</button>
          <span>Qty ${line.qty}</span>
          <button type="button" data-action="inc-qty" data-product-id="${line.id}" aria-label="Increase quantity">+</button>
          <button type="button" data-action="remove-item" data-product-id="${line.id}">Remove</button>
        </div>
      </div>
    `)
    .join("");
}

export function productDialogMarkup(product) {
  return `
    <div class="modal-body">
      <div class="modal-head">
        <h3>${product.name}</h3>
        <button type="button" data-action="close-dialog">Close</button>
      </div>
      <img class="thumb" src="${product.image}" alt="${product.name}" onerror="this.style.display='none'" />
      <p>${product.description}</p>
      <ul class="specs">${product.specs.map((spec) => `<li>${spec}</li>`).join("")}</ul>
      <p><strong>${currency(product.price)}</strong></p>
      <button type="button" class="primary" data-action="add-product" data-product-id="${product.id}">Add to order</button>
    </div>
  `;
}

export function setupCompareMarkup(setup, products) {
  const rows = products
    .map((item) => `<li><button type="button" data-action="view-product" data-product-id="${item.id}">${item.name}</button> <span class='muted'>${currency(item.price)}</span></li>`)
    .join("");

  return `
    <div class="modal-body">
      <div class="modal-head">
        <h3>${setup.name}</h3>
        <button type="button" data-action="close-dialog">Close</button>
      </div>
      <p class="muted">Click any item for full details.</p>
      <ul class="specs">${rows}</ul>
    </div>
  `;
}
