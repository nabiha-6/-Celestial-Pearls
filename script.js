class Product {
  constructor(id, title, price, section, img, desc = '') {
    this.id = id;
    this.title = title;
    this.price = Number(price);
    this.section = section; // necklaces, bracelets, earrings, sets
    this.img = img;
    this.desc = desc;
  }
}


const PRODUCTS = [
  // CORRECTED PATHS: Go up one level (../) then into src/images/
  new Product(1, "Classic Pearl Studs", 295.00, "earrings", "../src/images/image1.jpg", "7-8mm AAA-grade Akoya pearls in 14k white gold."),
  new Product(2, "Rose Gold Bracelet", 485.00, "bracelets", "../src/images/image2.jpg", "Freshwater pearls interwoven with rose gold links. Adjustable 6.5–7.5 inches."),
  new Product(3, "Multi-Strand Necklace", 795.00, "necklaces", "../src/images/image3.jpg", "Three strands of graduated South Sea pearls, 9–11mm, 18k gold clasp."),
  new Product(4, "Pearl Cuff Bracelet", 565.00, "bracelets", "../src/images/image4.jpg", "Five-row cultured pearl cuff with rose-gold plated brass."),
  new Product(5, "Luxury Pearl Set", 2450.00, "sets", "../src/images/image5.jpg", "Matching necklace and earrings in 18k gold, presented in silk box.")
];


const Cart = {
  items: {}, // { productId: qty }
  add(productId, qty = 1) {
    this.items[productId] = (this.items[productId] || 0) + qty;
    this.save();
    updateCartCount();
  },
  set(productId, qty) {
    if (qty <= 0) delete this.items[productId];
    else this.items[productId] = qty;
    this.save();
    updateCartCount();
  },
  remove(productId) {
    delete this.items[productId];
    this.save();
    updateCartCount();
  },
  save() {
    try {
      localStorage.setItem('pearlCart', JSON.stringify(this.items));
    } catch (e) {
      console.warn('Unable to save cart to localStorage:', e);
    }
  },
  load() {
    try {
      const raw = localStorage.getItem('pearlCart');
      this.items = raw ? JSON.parse(raw) : {};
    } catch (e) {
      this.items = {};
    }
  },
  count() {
    return Object.values(this.items).reduce((a,b) => a + b, 0);
  },
  list() {
    return Object.entries(this.items).map(([id,qty]) => {
      const p = PRODUCTS.find(x => x.id === Number(id));
      return { product: p, qty };
    }).filter(x => x.product);
  },
  subtotal() {
    return this.list().reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);
  }
};


function el(tag, cls = '', inner = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (inner) e.innerHTML = inner;
  return e;
}


function renderProducts(section) {
  const container = document.getElementById('productsRow');
  if (!container) return;
  container.innerHTML = '';

  const filtered = PRODUCTS.filter(p => p.section === section);
  if (filtered.length === 0) {
    container.appendChild(el('div', 'col-12', '<p class="small-muted">No items in this section.</p>'));
    return;
  }

  filtered.forEach(p => {
    const col = el('div','col-sm-6 col-md-4 product-card');
    const card = el('div','card shadow-sm');
    const img = document.createElement('img');
    img.src = p.img;
    img.alt = p.title;
    img.className = 'card-img-top';
    img.style = 'height:200px;object-fit:cover;';

    const body = el('div','card-body');
    const title = el('h5','card-title', p.title);
    const desc = el('p','small-muted cute-text', p.desc);
    const price = el('p','price', 'SAR ' + p.price.toFixed(2));

   
    const controls = el('div','d-flex align-items-center justify-content-between');
    const qtySelect = document.createElement('select');
    qtySelect.className = 'custom-select w-auto';
    qtySelect.setAttribute('aria-label', 'Quantity for ' + p.title);
    for (let i = 0; i <= 10; i++){
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = i;
      qtySelect.appendChild(opt);
    }
    const addBtn = el('button','btn btn-gold add-btn','Add');
    addBtn.type = 'button';
    addBtn.setAttribute('aria-label', 'Add ' + p.title + ' to cart');

    
    addBtn.addEventListener('click', () => {
      const qty = Number(qtySelect.value);
      if (qty <= 0) {
        window.alert('Please select at least one item to add.');
        return;
      }
      Cart.add(p.id, qty);
      addBtn.innerText = 'Added ✓';
      setTimeout(() => addBtn.innerText = 'Add', 900);
    });

    controls.appendChild(qtySelect);
    controls.appendChild(addBtn);

    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(price);
    body.appendChild(controls);

    card.appendChild(img);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}


function updateCartCount() {
  const count = Cart.count();
  const badges = document.querySelectorAll('#cartCount, #cartCountTop');
  badges.forEach(b => { if (b) b.textContent = count; });
}


function renderCartPage() {
  const container = document.getElementById('cartContents');
  if (!container) return;
  container.innerHTML = '';

  const list = Cart.list();
  if (list.length === 0) {
    container.innerHTML = '<p class="small-muted">Your cart is empty.</p>';
    // Ensure subtotal is cleared if cart is empty
    const subtotalPlaceholder = document.getElementById('cartSubtotalPlaceholder');
    if (subtotalPlaceholder) { subtotalPlaceholder.innerHTML = ''; }
    return;
  }

  list.forEach(entry => {
    const row = document.createElement('div');
    row.className = 'cart-row';

    const left = document.createElement('div');
    left.className = 'cart-item';
    const img = document.createElement('img');
    img.src = entry.product.img;
    img.className = 'cart-thumb';
    img.alt = entry.product.title;
    const info = el('div','','<strong>' + entry.product.title + '</strong><div class="small-muted">SAR ' + entry.product.price.toFixed(2) + '</div>');
    left.appendChild(img);
    left.appendChild(info);

    const right = document.createElement('div');
    right.className = 'd-flex align-items:center';
    const qtyInput = document.createElement('input');
    qtyInput.type = 'number';
    qtyInput.min = 0;
    qtyInput.value = entry.qty;
    qtyInput.style = 'width:70px;margin-right:10px;';
    qtyInput.setAttribute('aria-label', 'Quantity for ' + entry.product.title);
    qtyInput.addEventListener('change', () => {
      const v = Number(qtyInput.value);
      if (isNaN(v) || v < 0) { qtyInput.value = entry.qty; return; }
      Cart.set(entry.product.id, v);
      renderCartPage(); // Re-render to update subtotal and cart item list
    });

    const removeBtn = el('button','btn btn-outline-dark','Remove');
    removeBtn.addEventListener('click', () => { Cart.remove(entry.product.id); renderCartPage(); });

    right.appendChild(qtyInput);
    right.appendChild(removeBtn);

    row.appendChild(left);
    row.appendChild(right);
    container.appendChild(row);
  });

  // Corrected logic to target the placeholder
  const subtotalPlaceholder = document.getElementById('cartSubtotalPlaceholder');
  if (subtotalPlaceholder) {
    subtotalPlaceholder.innerHTML = '<strong>Subtotal: SAR ' + Cart.subtotal().toFixed(2) + '</strong>';
  }
}

/* Initialize the shop: loads cart and wires events */
function initShop() {
  Cart.load();
  updateCartCount();

  const sectionSelect = document.getElementById('sectionSelect');
  if (sectionSelect) {
    renderProducts(sectionSelect.value);
    sectionSelect.addEventListener('change', (e) => renderProducts(e.target.value));
  } else {
    // If no selector found, try default section
    renderProducts('necklaces');
  }

  const viewBtn = document.getElementById('viewCartBtn');
  if (viewBtn) viewBtn.addEventListener('click', () => { 
    // CORRECTED PATH: Removed 'www/'
    window.location.href = 'cart.html'; 
  });

  const printBtn = document.getElementById('printBtn');
  if (printBtn) printBtn.addEventListener('click', () => { window.print(); });

  if (document.getElementById('cartContents')) renderCartPage();
}


document.addEventListener('DOMContentLoaded', initShop);