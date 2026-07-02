const STORAGE_KEY = 'coffeeOrderStacks';

const bases = [
  { id: 'liscio', name: 'Liscio', color: '#6f4e37', variants: { deca: true, soia: false, brutto: true }, hasSize: false },
  { id: 'macchiato', name: 'Macchiato', color: '#8d6e63', variants: { deca: true, soia: true, brutto: true }, hasSize: false },
  { id: 'lungo', name: 'Lungo', color: '#7b5e57', variants: { deca: true, soia: false, brutto: true }, hasSize: false },
  { id: 'americano', name: 'Americano', color: '#5d4037', variants: { deca: true, soia: false, brutto: true }, hasSize: false },
  { id: 'cappuccino', name: 'Cappuccino', color: '#a1887f', variants: { deca: true, soia: true, brutto: false }, hasSize: false },
  { id: 'latte-macchiato', name: 'Latte macchiato', color: '#d7ccc8', variants: { deca: true, soia: true, brutto: false }, hasSize: false },
  { id: 'caffe-dorzo', name: "Caffè d'orzo", color: '#bcaaa4', variants: { deca: false, soia: false, brutto: true }, hasSize: false },
  { id: 'crema-caffe', name: 'Crema caffè', color: '#8d6e63', variants: { deca: false, soia: false, brutto: false }, hasSize: true }
];

const variantOptions = ['deca', 'soia', 'brutto'];
const sizeOptions = ['piccola', 'grande'];

let stacks = loadStacks();
let selectedVariants = {};

bases.forEach(b => {
  selectedVariants[b.id] = { deca: false, soia: false, brutto: false, size: 'piccola' };
});
selectedVariants.custom = { label: '' };

function loadStacks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveStacks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stacks));
}

function ensureStack(id) {
  if (!Array.isArray(stacks[id])) stacks[id] = [];
}

function pushItem(id, item) {
  ensureStack(id);
  stacks[id].push(item);
  saveStacks();
}

function removeLastMatching(base, key) {
  if (!stacks[base.id]) return false;
  for (let i = stacks[base.id].length - 1; i >= 0; i--) {
    if (groupKey(base, stacks[base.id][i]) === key) {
      stacks[base.id].splice(i, 1);
      if (stacks[base.id].length === 0) delete stacks[base.id];
      saveStacks();
      return true;
    }
  }
  return false;
}

function removeLastCustom(label) {
  if (!stacks.custom) return false;
  for (let i = stacks.custom.length - 1; i >= 0; i--) {
    if (stacks.custom[i].label === label) {
      stacks.custom.splice(i, 1);
      if (stacks.custom.length === 0) delete stacks.custom;
      saveStacks();
      return true;
    }
  }
  return false;
}

function variantKey(variants) {
  return variantOptions.filter(v => variants[v]).join('-');
}

function groupKey(base, item) {
  if (base.hasSize) return item.size || 'piccola';
  return variantKey(item);
}

function displayName(base, item) {
  const parts = [base.name];
  if (base.hasSize) parts.push(item.size || 'piccola');
  else {
    if (item.deca) parts.push('deca');
    if (item.soia) parts.push('soia');
    if (item.brutto) parts.push('brutto');
  }
  return parts.join(' ');
}

function effectiveOptions(base, selected) {
  if (base.hasSize) return { size: selected.size };
  return {
    deca: base.variants.deca && selected.deca,
    soia: base.variants.soia && selected.soia,
    brutto: base.variants.brutto && selected.brutto
  };
}

function nextLabel(base, selected) {
  if (base.hasSize) return `prossimo: ${selected.size}`;
  const opts = [];
  if (base.variants.deca && selected.deca) opts.push('deca');
  if (base.variants.soia && selected.soia) opts.push('soia');
  if (base.variants.brutto && selected.brutto) opts.push('brutto');
  if (opts.length > 0) return `prossimo: ${opts.join(' + ')}`;
  return 'prossimo: normale';
}

function cupSvg(color, custom = false) {
  const gradientId = `steam-${color.replace('#', '')}`;
  const bodyPath = custom
    ? `<path d="M18 28h50v8c0 22-11 40-25 40S18 58 18 36v-8z" fill="${color}"/>`
    : `<path d="M18 30h50v6c0 24-11 42-25 42S18 60 18 36v-6z" fill="${color}"/>`;
  return `
    <svg class="cup" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${gradientId}" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M70 40h12c8 0 14 6 14 14s-6 14-14 14h-8" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
      ${bodyPath}
      <ellipse cx="43" cy="30" rx="25" ry="8" fill="#d7ccc8"/>
      <path d="M30 18c0-6 4-12 8-12s4 8 4 12-4 8-4 8" fill="none" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round"/>
      <path d="M50 14c0-8 5-14 10-14s5 10 5 14-5 10-5 10" fill="none" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
}

function createCupFlight(source) {
  const icon = source?.querySelector('.cup') || source;
  if (!icon) return null;
  return {
    rect: icon.getBoundingClientRect(),
    node: icon.cloneNode(true)
  };
}

function animateCoffeeToSummary(flight) {
  if (!flight || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const summary = document.getElementById('summary');
  if (!summary) return;

  const end = summary.getBoundingClientRect();
  const clone = flight.node;
  clone.classList.add('flying-cup');
  clone.style.left = `${flight.rect.left}px`;
  clone.style.top = `${flight.rect.top}px`;
  clone.style.width = `${flight.rect.width}px`;
  clone.style.height = `${flight.rect.height}px`;
  clone.style.opacity = '0.95';
  clone.style.transform = 'translate(0, 0) scale(1)';

  document.body.appendChild(clone);

  requestAnimationFrame(() => {
    const targetX = end.left + 18;
    const targetY = end.top + 14;
    clone.style.transform = `translate(${targetX - flight.rect.left}px, ${targetY - flight.rect.top}px) scale(0.72)`;
    clone.style.opacity = '0.15';
  });

  const cleanup = () => {
    if (clone.isConnected) clone.remove();
  };

  clone.addEventListener('transitionend', cleanup, { once: true });
  setTimeout(cleanup, 700);
}

function renderGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';

  bases.forEach(base => {
    const selected = selectedVariants[base.id];

    const card = document.createElement('article');
    card.className = 'card';

    const left = document.createElement('div');
    left.className = 'card-left';

    const cup = document.createElement('div');
    cup.innerHTML = cupSvg(base.color);

    const info = document.createElement('div');
    info.className = 'card-info';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = base.name;

    info.appendChild(title);

    if (base.hasSize) {
      const chips = document.createElement('div');
      chips.className = 'chips';
      sizeOptions.forEach(opt => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = opt;
        chip.setAttribute('aria-pressed', String(selected.size === opt));
        chip.addEventListener('click', () => {
          selected.size = opt;
          renderGrid();
          renderSummary();
        });
        chips.appendChild(chip);
      });
      info.appendChild(chips);
    } else if (base.variants.deca || base.variants.soia) {
      const chips = document.createElement('div');
      chips.className = 'chips';
      variantOptions.forEach(opt => {
        const allowed = base.variants[opt];
        if (!allowed) return;
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = opt;
        chip.setAttribute('aria-pressed', String(selected[opt]));
        chip.addEventListener('click', () => {
          selected[opt] = !selected[opt];
          renderGrid();
          renderSummary();
        });
        chips.appendChild(chip);
      });
      info.appendChild(chips);
    }

    const label = document.createElement('p');
    label.className = 'variant-label';
    label.textContent = nextLabel(base, selected);
    info.appendChild(label);

    left.appendChild(cup);
    left.appendChild(info);

    const right = document.createElement('div');
    right.className = 'card-right';

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn-plus';
    plusBtn.setAttribute('aria-label', `Aggiungi ${base.name}`);
    plusBtn.innerHTML = '☕ +';
    plusBtn.addEventListener('click', () => {
      const flight = createCupFlight(cup);
      pushItem(base.id, effectiveOptions(base, selected));
      selectedVariants[base.id] = { deca: false, soia: false, brutto: false, size: 'piccola' };
      renderGrid();
      renderSummary();
      animateCoffeeToSummary(flight);
    });

    right.appendChild(plusBtn);

    card.appendChild(left);
    card.appendChild(right);

    grid.appendChild(card);
  });

  grid.appendChild(renderCustomCard());
}

function renderCustomCard() {
  const selected = selectedVariants.custom;

  const card = document.createElement('article');
  card.className = 'card';

  const left = document.createElement('div');
  left.className = 'card-left';

  const cup = document.createElement('div');
  cup.innerHTML = cupSvg('#607d8b', true);

  const info = document.createElement('div');
  info.className = 'card-info';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Custom';

  const input = document.createElement('input');
  input.className = 'custom-input';
  input.type = 'text';
  input.placeholder = 'es. Cappuccino, Latte macchiato, Tisana…';
  input.value = selected.label;
  input.addEventListener('input', () => {
    selected.label = input.value;
    plusBtn.disabled = selected.label.trim() === '';
  });

  info.appendChild(title);
  info.appendChild(input);

  const label = document.createElement('p');
  label.className = 'variant-label';
  label.textContent = 'prossimo: custom';
  info.appendChild(label);

  left.appendChild(cup);
  left.appendChild(info);

  const right = document.createElement('div');
  right.className = 'card-right';

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn-plus';
  plusBtn.setAttribute('aria-label', 'Aggiungi custom');
  plusBtn.innerHTML = '☕ +';
  plusBtn.disabled = selected.label.trim() === '';
  plusBtn.addEventListener('click', () => {
    const name = selected.label.trim();
    if (!name) return;
    const flight = createCupFlight(cup);
    pushItem('custom', { label: name });
    renderGrid();
    renderSummary();
    animateCoffeeToSummary(flight);
  });

  right.appendChild(plusBtn);

  card.appendChild(left);
  card.appendChild(right);

  return card;
}

function aggregateStacks() {
  const entries = [];
  let total = 0;

  bases.forEach(base => {
    const groups = {};
    (stacks[base.id] || []).forEach(item => {
      const key = groupKey(base, item);
      groups[key] = (groups[key] || 0) + 1;
      total += 1;
    });

    Object.entries(groups).forEach(([key, count]) => {
      const dummy = base.hasSize ? { size: key } : parseVariantKey(key);
      entries.push({
        id: base.id,
        key,
        name: displayName(base, dummy),
        count
      });
    });
  });

  const customGroups = {};
  (stacks.custom || []).forEach(item => {
    customGroups[item.label] = (customGroups[item.label] || 0) + 1;
    total += 1;
  });

  Object.entries(customGroups).forEach(([label, count]) => {
    entries.push({
      id: 'custom',
      key: label,
      label,
      name: label,
      count
    });
  });

  return { entries, total };
}

function parseVariantKey(key) {
  return {
    deca: key.includes('deca'),
    soia: key.includes('soia'),
    brutto: key.includes('brutto')
  };
}

function renderSummary() {
  const list = document.getElementById('summary-list');
  const totalLine = document.getElementById('total-line');
  list.innerHTML = '';

  const { entries, total } = aggregateStacks();
  totalLine.textContent = `Totale: ${total} ☕`;

  if (entries.length === 0) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'empty';
    span.textContent = 'Nessun caffè ordinato. Inizia a premere le tazzine!';
    li.appendChild(span);
    list.appendChild(li);
    return;
  }

  entries.forEach(entry => {
    const li = document.createElement('li');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'order-name';
    nameSpan.textContent = entry.name;

    const countSpan = document.createElement('span');
    countSpan.className = 'order-count';
    countSpan.textContent = `${entry.count}×`;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.setAttribute('aria-label', `Rimuovi un ${entry.name}`);
    removeBtn.textContent = '−';
    removeBtn.addEventListener('click', () => {
      if (entry.id === 'custom') {
        removeLastCustom(entry.label);
      } else {
        const base = bases.find(b => b.id === entry.id);
        removeLastMatching(base, entry.key);
      }
      renderGrid();
      renderSummary();
    });

    li.appendChild(nameSpan);
    li.appendChild(countSpan);
    li.appendChild(removeBtn);

    list.appendChild(li);
  });
}

function buildOrderText() {
  const { entries, total } = aggregateStacks();
  if (entries.length === 0) return '';
  const lines = entries.map(e => `${e.count}× ${e.name}`);
  return `Ordine caffè (${total}):\n${lines.join('\n')}`;
}

function copyOrder() {
  const text = buildOrderText();
  const feedback = document.getElementById('copy-feedback');
  if (!text) {
    feedback.textContent = 'Nessun caffè da copiare.';
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    feedback.textContent = 'Ordine copiato negli appunti!';
    setTimeout(() => { feedback.textContent = ''; }, 2000);
  }).catch(() => {
    feedback.textContent = 'Copia non riuscita.';
  });
}

function resetAll() {
  if (Object.keys(stacks).length === 0) return;
  if (confirm("Sei sicuro di voler azzerare tutto l'ordine?")) {
    stacks = {};
    saveStacks();
    renderGrid();
    renderSummary();
  }
}

function render() {
  renderGrid();
  renderSummary();
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  document.getElementById('copy-btn').addEventListener('click', copyOrder);
  document.getElementById('reset-btn').addEventListener('click', resetAll);
});
