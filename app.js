const STORAGE_KEY = 'coffeeOrderStacks';
const ONBOARDING_KEY = 'coffeePickerOnboardingSeen';

const bases = [
  { id: 'liscio', name: 'Liscio', color: '#6f4e37', surfaceColor: '#a88a80', cupSize: 'sm', variants: { deca: true, soia: false, brutto: true }, hasSize: false },
  { id: 'macchiato', name: 'Macchiato', color: '#6f4e37', surfaceColor: '#fff3e0', cupSize: 'sm', variants: { deca: true, soia: true, brutto: true }, hasSize: false },
  { id: 'lungo', name: 'Lungo', color: '#6f4e37', surfaceColor: '#4d2e23', cupSize: 'sm', variants: { deca: true, soia: false, brutto: true }, hasSize: false },
  { id: 'cappuccino', name: 'Cappuccino', color: '#6f4e37', surfaceColor: '#e2c08a', cupSize: 'lg', variants: { deca: true, soia: true, brutto: false }, hasSize: false },
  { id: 'latte-macchiato', name: 'Latte macchiato', color: '#6f4e37', surfaceColor: '#fff3e0', cupSize: 'lg', variants: { deca: true, soia: true, brutto: false }, hasSize: false },
  { id: 'americano', name: 'Americano', color: '#371f17', surfaceColor: '#5d4037', cupSize: 'lg', variants: { deca: true, soia: false, brutto: true }, hasSize: false },
  { id: 'tè', name: 'Tè', color: '#f1dfb0', surfaceColor: '#f1d387', cupSize: 'lg', variants: { deca: false, soia: false, brutto: false }, hasSize: false },
  { id: 'caffe-dorzo', name: "Caffè d'orzo", color: '#d4a87f', surfaceColor: '#efebe9', cupSize: 'sm', variants: { deca: false, soia: false, brutto: false }, hasSize: false },
  { id: 'crema-caffe', name: 'Crema caffè', color: '#8d6e63', surfaceColor: '#bcaaa4', cupSize: 'sm', cold: true, variants: { deca: false, soia: false, brutto: false }, hasSize: true, feminine: true },
];

const variantOptions = ['deca', 'soia', 'brutto'];
const sizeOptions = ['piccola', 'grande'];
const pastryOptions = ['vuoto', 'crema', 'cioccolato', 'pistacchio'];

const pastries = [
  { id: 'cornetto', name: 'Cornetto', color: '#f4c542', isPastry: true }
];

let stacks = loadStacks();
let selectedVariants = {};

bases.forEach(b => {
  selectedVariants[b.id] = { deca: false, soia: false, brutto: false, size: 'piccola' };
});
pastries.forEach(p => {
  selectedVariants[p.id] = { option: 'vuoto', custom: '' };
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
  if (base.isPastry) return item.custom || item.option || 'vuoto';
  if (base.hasSize) return item.size || 'piccola';
  return variantKey(item);
}

function displayName(base, item) {
  const parts = [base.name];
  if (base.isPastry) {
    parts.push(item.custom || item.option || 'vuoto');
  } else if (base.hasSize) {
    parts.push(item.size || 'piccola');
  } else {
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
  let keyword;
  if (base.feminine) {
    keyword = 'prossima'
  } else {
    keyword = 'prossimo'
  }
  if (base.hasSize) return `${keyword}: ${selected.size}`;
  const opts = [];
  if (base.variants.deca && selected.deca) opts.push('deca');
  if (base.variants.soia && selected.soia) opts.push('soia');
  if (base.variants.brutto && selected.brutto) opts.push('brutto');
  if (opts.length > 0) return `${keyword}: ${opts.join(' + ')}`;
  return `${keyword}: normale`;
}

let cupSvgIdCounter = 0;

function cupSvg({ color, surfaceColor, cupColor = '#ffffff', size = 'sm', custom = false, cold = false }) {
  const outlineColor = '#3e2723';
  const steamColor = '#8d6e63';
  const gradientId = `steam-${++cupSvgIdCounter}`;

  if (custom) {
    return `
      <svg class="cup cup-${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M30 28h40l-5 44H35z" fill="${color}" stroke="${outlineColor}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="26" y="20" width="48" height="12" rx="4" fill="${surfaceColor || cupColor}" stroke="${outlineColor}" stroke-width="2"/>
      </svg>
    `;
  }

  const isLarge = size === 'lg';

  const bodyPath = isLarge
    ? `<path d="M14 38c0 18 13 34 29 34s29-16 29-34A29 8 0 0 0 14 38z" fill="${cupColor}" stroke="${outlineColor}" stroke-width="2"/>`
    : `<path d="M24 32c0 22 9 40 19 40s19-18 19-40A19 6 0 0 0 24 32z" fill="${cupColor}" stroke="${outlineColor}" stroke-width="2"/>`;

  const liquidPath = isLarge
    ? `<path d="M16 40c0 16 12 30 27 30s27-14 27-30A27 7 0 0 0 16 40z" fill="${color}"/>`
    : `<path d="M26 34c0 20 8 34 17 34s17-14 17-34A17 5 0 0 0 26 34z" fill="${color}"/>`;

  const surface = isLarge
    ? `<ellipse cx="43" cy="40" rx="27" ry="7" fill="${surfaceColor || color}"/>`
    : `<ellipse cx="43" cy="34" rx="17" ry="5" fill="${surfaceColor || color}"/>`;

  const handle = cold
    ? ''
    : (isLarge
      ? `<path d="M74 44h10c7 0 12 5 12 11s-5 11-12 11h-6" fill="none" stroke="${outlineColor}" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="M64 38h10c7 0 12 5 12 12s-5 12-12 12h-6" fill="none" stroke="${outlineColor}" stroke-width="5" stroke-linecap="round"/>`);

  const steam = cold
    ? ''
    : (isLarge
      ? `<path d="M34 20c0-7 4-13 8-13s4 9 4 13-4 9-4 9 M50 16c0-9 5-15 10-15s5 11 5 15-5 11-5 11" fill="none" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round"/>`
      : `<path d="M34 18c0-6 4-12 8-12s4 8 4 12-4 8-4 8 M50 14c0-8 5-14 10-14s5 10 5 14-5 10-5 10" fill="none" stroke="url(#${gradientId})" stroke-width="4" stroke-linecap="round"/>`);

  const defs = cold
    ? ''
    : `<defs>
        <linearGradient id="${gradientId}" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="${steamColor}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${steamColor}" stop-opacity="0"/>
        </linearGradient>
      </defs>`;

  return `
    <svg class="cup cup-${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${defs}
      ${bodyPath}
      ${liquidPath}
      ${surface}
      ${handle}
      ${steam}
    </svg>
  `;
}

function cornettoSvg({ color = '#f6c542' } = {}) {
  const outlineColor = '#3e2723';
  const seamColor = '#c69c3e';
  const detailColor = '#d6ad51';

  return `
    <svg
      class="cornetto"
      viewBox="0 20 100 60"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!--
        Reduce only the vertical proportions:
        newY = 20 + originalY × 0.6
      -->
      <g
        transform="translate(0 20) scale(1 0.6)"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Croissant body -->
        <path
          d="
            M8 66
            C8 36 28 16 50 17
            C72 16 92 36 92 66
            C92 75 89 82 84 88
            C81 92 76 89 78 83
            C80 76 80 70 77 63
            C72 53 62 46 50 51
            C38 46 28 53 23 63
            C20 70 20 76 22 83
            C24 89 19 92 16 88
            C11 82 8 75 8 66
            Z
          "
          fill="${color}"
          stroke="${outlineColor}"
          stroke-width="2.5"
          vector-effect="non-scaling-stroke"
        />

        <!-- Soft baked highlight -->
        <path
          d="
            M15 55
            C19 37 32 24 46 20
            C35 29 27 42 23 58
            Z
          "
          fill="#fff"
          opacity="0.12"
          stroke="none"
        />

        <!-- Pastry segment lines -->
        <path
          d="M28 25 C35 33 38 42 38 50"
          fill="none"
          stroke="${seamColor}"
          stroke-width="2.4"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M42 19 C45 29 46 39 45 49"
          fill="none"
          stroke="${seamColor}"
          stroke-width="2.4"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M58 19 C55 29 54 39 55 49"
          fill="none"
          stroke="${seamColor}"
          stroke-width="2.4"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M72 25 C65 33 62 42 62 50"
          fill="none"
          stroke="${seamColor}"
          stroke-width="2.4"
          vector-effect="non-scaling-stroke"
        />

        <!-- End shaping -->
        <path
          d="M17 69 C17 61 19 55 23 49"
          fill="none"
          stroke="${detailColor}"
          stroke-width="1.5"
          opacity="0.8"
          vector-effect="non-scaling-stroke"
        />
        <path
          d="M83 69 C83 61 81 55 77 49"
          fill="none"
          stroke="${detailColor}"
          stroke-width="1.5"
          opacity="0.8"
          vector-effect="non-scaling-stroke"
        />
      </g>
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

function animatePress(element) {
  if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  element.classList.add('pressed');
  element.addEventListener('animationend', () => element.classList.remove('pressed'), { once: true });
  setTimeout(() => element.classList.remove('pressed'), 350);
}

function animateCoffeeToSummary(flight) {
  if (!flight || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const target = document.getElementById('fab');
  if (!target) return;

  const end = target.getBoundingClientRect();
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
    const targetX = end.left + end.width / 2 - flight.rect.width / 2;
    const targetY = end.top + end.height / 2 - flight.rect.height / 2;
    clone.style.transform = `translate(${targetX - flight.rect.left}px, ${targetY - flight.rect.top}px) scale(0.35)`;
    clone.style.opacity = '0.1';
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
    cup.className = 'cup-container';
    cup.innerHTML = cupSvg({ color: base.color, surfaceColor: base.surfaceColor, size: base.cupSize, cold: base.cold });

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
        chip.className = 'btn btn-ghost btn-pill btn-sm chip';
        chip.textContent = opt;
        chip.setAttribute('aria-pressed', String(selected.size === opt));
        chip.addEventListener('click', () => {
          animatePress(chip);
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
        chip.className = 'btn btn-ghost btn-pill btn-sm chip';
        chip.textContent = opt;
        chip.setAttribute('aria-pressed', String(selected[opt]));
        chip.addEventListener('click', () => {
          animatePress(chip);
          selected[opt] = !selected[opt];
          renderGrid();
          renderSummary();
        });
        chips.appendChild(chip);
      });
      info.appendChild(chips);
    }

    if ((base.hasSize || base.variants.deca || base.variants.soia || base.variants.brutto)) {
      const label = document.createElement('p');
      label.className = 'variant-label';
      label.textContent = nextLabel(base, selected);
      info.appendChild(label);
    }

    left.appendChild(cup);
    left.appendChild(info);

    const right = document.createElement('div');
    right.className = 'card-right';

    const plusBtn = document.createElement('button');
    plusBtn.className = 'btn btn-primary btn-lg btn-icon';
    plusBtn.setAttribute('aria-label', `Aggiungi ${base.name}`);
    plusBtn.innerHTML = '☕ +';
    plusBtn.addEventListener('click', () => {
      animatePress(plusBtn);
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

  grid.appendChild(renderPastryCard());
  grid.appendChild(renderCustomCard());
}

function renderPastryCard() {
  const pastry = pastries[0];
  const selected = selectedVariants[pastry.id];

  const card = document.createElement('article');
  card.className = 'card';

  const left = document.createElement('div');
  left.className = 'card-left';

  const icon = document.createElement('div');
  icon.className = 'cup-container';
  icon.innerHTML = cornettoSvg({ color: pastry.color });

  const info = document.createElement('div');
  info.className = 'card-info';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = pastry.name;

  const chips = document.createElement('div');
  chips.className = 'chips';

  pastryOptions.forEach(opt => {
    const chip = document.createElement('button');
    chip.className = 'btn btn-ghost btn-pill btn-sm chip';
    chip.textContent = opt;
    chip.setAttribute('aria-pressed', String(selected.option === opt && !selected.custom.trim()));
    chip.disabled = selected.custom.trim() !== '';
    chip.addEventListener('click', () => {
      animatePress(chip);
      selected.option = opt;
      selected.custom = '';
      renderGrid();
      renderSummary();
    });
    chips.appendChild(chip);
  });

  const input = document.createElement('input');
  input.className = 'custom-input';
  input.type = 'text';
  input.placeholder = 'es. marmellata, nutella...';
  input.value = selected.custom;

  const label = document.createElement('p');
  label.className = 'variant-label';
  label.textContent = selected.custom.trim() ? `prossimo: ${selected.custom.trim()}` : `prossimo: ${selected.option}`;

  input.addEventListener('input', () => {
    selected.custom = input.value;
    const hasText = selected.custom.trim() !== '';
    chips.querySelectorAll('.chip').forEach(chip => {
      chip.disabled = hasText;
      chip.setAttribute('aria-pressed', 'false');
    });
    label.textContent = hasText ? `prossimo: ${selected.custom.trim()}` : `prossimo: ${selected.option}`;
  });

  info.appendChild(title);
  info.appendChild(chips);
  info.appendChild(input);
  info.appendChild(label);

  left.appendChild(icon);
  left.appendChild(info);

  const right = document.createElement('div');
  right.className = 'card-right';

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn btn-primary btn-lg btn-icon';
  plusBtn.setAttribute('aria-label', `Aggiungi ${pastry.name}`);
  plusBtn.innerHTML = '🥐 +';  // plusBtn.disabled = false;
  plusBtn.addEventListener('click', () => {
    animatePress(plusBtn);
    const item = selected.custom.trim() ? { custom: selected.custom.trim() } : { option: selected.option };
    pushItem(pastry.id, item);
    selectedVariants[pastry.id] = { option: 'vuoto', custom: '' };
    renderGrid();
    renderSummary();
    animateCoffeeToSummary(createCupFlight(icon));
  });

  right.appendChild(plusBtn);

  card.appendChild(left);
  card.appendChild(right);

  return card;
}

function renderCustomCard() {
  const selected = selectedVariants.custom;

  const card = document.createElement('article');
  card.className = 'card';

  const left = document.createElement('div');
  left.className = 'card-left';

  const cup = document.createElement('div');
  cup.className = 'cup-container';
  cup.innerHTML = cupSvg({ color: '#607d8b', surfaceColor: '#eceff1', size: 'lg', custom: true });

  const info = document.createElement('div');
  info.className = 'card-info';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Altro';

  const input = document.createElement('input');
  input.className = 'custom-input';
  input.type = 'text';
  input.placeholder = 'es. Macchiato latte di mandorla, tisana, etc...';
  input.value = selected.label;
  input.addEventListener('input', () => {
    selected.label = input.value;
    plusBtn.disabled = selected.label.trim() === '';
  });

  info.appendChild(title);
  info.appendChild(input);

  left.appendChild(cup);
  left.appendChild(info);

  const right = document.createElement('div');
  right.className = 'card-right';

  const plusBtn = document.createElement('button');
  plusBtn.className = 'btn btn-primary btn-lg btn-icon';
  plusBtn.setAttribute('aria-label', 'Aggiungi custom');
  plusBtn.innerHTML = '☕ +';
  plusBtn.disabled = selected.label.trim() === '';
  plusBtn.addEventListener('click', () => {
    animatePress(plusBtn);
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

  pastries.forEach(pastry => {
    const groups = {};
    (stacks[pastry.id] || []).forEach(item => {
      const key = item.custom || item.option || 'vuoto';
      groups[key] = (groups[key] || 0) + 1;
      total += 1;
    });

    Object.entries(groups).forEach(([key, count]) => {
      const item = key.includes(' ') ? { custom: key } : { option: key };
      entries.push({
        id: pastry.id,
        key,
        name: displayName(pastry, item),
        count
      });
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
  const fabCount = document.getElementById('fab-count');
  list.innerHTML = '';

  const { entries, total } = aggregateStacks();
  totalLine.textContent = `Totale: ${total} ☕`;
  if (fabCount) fabCount.textContent = String(total);

  const payBtn = document.getElementById('pay-btn');
  if (payBtn) payBtn.disabled = total === 0;

  if (entries.length === 0) {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'empty';
    span.textContent = 'Nessun ordine. Inizia a premere i pulsanti!';
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
    removeBtn.className = 'btn btn-danger btn-square btn-sm';
    removeBtn.setAttribute('aria-label', `Rimuovi un ${entry.name}`);
    removeBtn.textContent = '−';
    removeBtn.addEventListener('click', () => {
      animatePress(removeBtn);
      if (entry.id === 'custom') {
        removeLastCustom(entry.label);
      } else {
        const base = bases.find(b => b.id === entry.id) || pastries.find(p => p.id === entry.id);
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

const tiebreakStarts = [
  'da chi è più lontano dal bancone',
  'da chi è arrivato per ultimo',
  'da chi ha ancora il telefono in mano'
];

function buildTicketPool() {
  const pool = [];
  bases.forEach(base => {
    (stacks[base.id] || []).forEach(item => {
      pool.push({
        base,
        name: displayName(base, item),
        groupId: `${base.id}|${groupKey(base, item)}`
      });
    });
  });
  pastries.forEach(pastry => {
    (stacks[pastry.id] || []).forEach(item => {
      pool.push({
        base: pastry,
        name: displayName(pastry, item),
        groupId: `${pastry.id}|${groupKey(pastry, item)}`
      });
    });
  });
  (stacks.custom || []).forEach(item => {
    pool.push({ base: null, name: item.label, groupId: `custom|${item.label}` });
  });
  return pool;
}

let paySpinning = false;

function openPayModal() {
  document.getElementById('pay-modal').classList.remove('hidden');
}

function closePayModal() {
  document.getElementById('pay-modal').classList.add('hidden');
}

function runPayDraw() {
  if (paySpinning) return;
  const pool = buildTicketPool();
  if (pool.length === 0) return;

  const winner = pool[Math.floor(Math.random() * pool.length)];
  const groupCount = pool.filter(t => t.groupId === winner.groupId).length;

  const cupEl = document.getElementById('pay-cup');
  const drinkEl = document.getElementById('pay-drink');
  const tiebreakEl = document.getElementById('pay-tiebreak');

  cupEl.innerHTML = '';
  tiebreakEl.textContent = '';
  drinkEl.classList.remove('revealed');
  drinkEl.textContent = '…';
  openPayModal();

  const reveal = () => {
    paySpinning = false;
    drinkEl.textContent = winner.name;
    drinkEl.classList.add('revealed');
    if (winner.base?.isPastry) {
      cupEl.innerHTML = cornettoSvg({ color: winner.base.color });
    } else if (winner.base) {
      cupEl.innerHTML = cupSvg({ color: winner.base.color, surfaceColor: winner.base.surfaceColor, size: winner.base.cupSize, cold: winner.base.cold });
    } else {
      cupEl.innerHTML = cupSvg({ color: '#607d8b', surfaceColor: '#eceff1', size: 'lg', custom: true });
    }
    if (groupCount > 1) {
      const n = 1 + Math.floor(Math.random() * groupCount);
      const start = tiebreakStarts[Math.floor(Math.random() * tiebreakStarts.length)];
      tiebreakEl.textContent = `Compare ${groupCount} volte nell'ordine: contando in senso orario ${start}, paga il numero ${n}!`;
    } else {
      tiebreakEl.textContent = "Nessun dubbio: paga chi l'ha ordinato!";
    }
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || pool.length < 2) {
    reveal();
    return;
  }

  paySpinning = true;
  let delay = 60;
  const spin = () => {
    drinkEl.textContent = pool[Math.floor(Math.random() * pool.length)].name;
    delay *= 1.25;
    if (delay < 450) setTimeout(spin, delay);
    else setTimeout(reveal, delay);
  };
  spin();
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

function hasCachedOrder() {
  return Object.keys(stacks).length > 0;
}

function openCacheModal() {
  document.getElementById('cache-modal').classList.remove('hidden');
}

function closeCacheModal() {
  document.getElementById('cache-modal').classList.add('hidden');
}

function keepCachedOrder() {
  closeCacheModal();
  render();
  setupOnboardingDismissal();
  if (!shouldShowOnboarding()) {
    document.getElementById('onboarding')?.classList.add('hidden');
  }
}

function wipeCacheAndRestart() {
  stacks = {};
  saveStacks();
  renderGrid();
  renderSummary();
  closeCacheModal();
}

function openSummary() {
  const summary = document.getElementById('summary');
  if (summary) summary.classList.add('open');
}

function closeSummary() {
  const summary = document.getElementById('summary');
  if (summary) summary.classList.remove('open');
}

function toggleSummary() {
  const summary = document.getElementById('summary');
  if (!summary) return;
  summary.classList.toggle('open');
}

function shouldShowOnboarding() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  } catch {
    return true;
  }
}

function dismissOnboarding() {
  const tip = document.getElementById('onboarding');
  if (!tip || tip.classList.contains('hidden')) return;
  tip.classList.add('hidden');
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {}
}

function setupOnboardingDismissal() {
  const handler = (e) => {
    if (e.target.closest('button, input')) {
      dismissOnboarding();
      document.removeEventListener('click', handler);
    }
  };
  document.addEventListener('click', handler);
}

function render() {
  renderGrid();
  renderSummary();
}

document.addEventListener('DOMContentLoaded', () => {
  if (hasCachedOrder()) {
    openCacheModal();
  } else {
    render();
    setupOnboardingDismissal();
    if (!shouldShowOnboarding()) {
      document.getElementById('onboarding')?.classList.add('hidden');
    }
  }

  document.getElementById('cache-keep').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    keepCachedOrder();
  });
  document.getElementById('cache-wipe').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    wipeCacheAndRestart();
  });
  document.getElementById('cache-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) keepCachedOrder();
  });

  document.getElementById('copy-btn').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    copyOrder();
  });
  document.getElementById('reset-btn').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    resetAll();
  });
  document.getElementById('fab').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    toggleSummary();
  });
  document.getElementById('close-summary').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    closeSummary();
  });
  document.getElementById('pay-btn').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    runPayDraw();
  });
  document.getElementById('pay-again').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    runPayDraw();
  });
  document.getElementById('close-pay').addEventListener('click', (e) => {
    animatePress(e.currentTarget);
    closePayModal();
  });
  document.getElementById('pay-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePayModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!document.getElementById('pay-modal').classList.contains('hidden')) {
      closePayModal();
      return;
    }
    if (!document.getElementById('cache-modal').classList.contains('hidden')) {
      keepCachedOrder();
      return;
    }
    closeSummary();
  });
});
