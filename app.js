const BRICK_VALUE = 25_000;
const COIN_VALUE = 5_000;
const MAX_ANGLE = 15;
const SNAPSHOT_KEY = 'balancea_snapshots';

const form = document.getElementById('balanceForm');
const scale = document.getElementById('scale');
const leftUnits = document.getElementById('leftUnits');
const rightUnits = document.getElementById('rightUnits');
const tiltInfo = document.getElementById('tiltInfo');
const breakdownList = document.getElementById('breakdownList');
const snapshotList = document.getElementById('snapshotList');
const saveSnapshotButton = document.getElementById('saveSnapshot');
const installButton = document.getElementById('installButton');

let deferredPrompt = null;

function parseAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function toUnits(amount) {
  const bricks = Math.floor(amount / BRICK_VALUE);
  const remainder = amount % BRICK_VALUE;
  const coins = Math.floor(remainder / COIN_VALUE);
  return { bricks, coins };
}

function summarizeUnits(units) {
  return `${units.bricks} cihly, ${units.coins} mince`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatCurrency(value) {
  return new Intl.NumberFormat('cs-CZ').format(value) + ' Kč';
}

function getInput() {
  return {
    assets: parseAmount(form.assets.value),
    liabilities: parseAmount(form.liabilities.value),
    cash: parseAmount(form.cash.value)
  };
}

function renderUnitBlocks(target, units) {
  target.replaceChildren();
  const maxItems = 28;
  let count = 0;

  for (let i = 0; i < units.bricks && count < maxItems; i += 1) {
    const brick = document.createElement('span');
    brick.className = 'brick';
    target.append(brick);
    count += 1;
  }
  for (let i = 0; i < units.coins && count < maxItems; i += 1) {
    const coin = document.createElement('span');
    coin.className = 'coin';
    target.append(coin);
    count += 1;
  }

  if (units.bricks + units.coins > maxItems) {
    const more = document.createElement('span');
    more.textContent = `+${units.bricks + units.coins - maxItems}`;
    target.append(more);
  }
}

function computeTilt(leftWeight, rightWeight) {
  const total = leftWeight + rightWeight || 1;
  const normalized = (leftWeight - rightWeight) / total;
  return clamp(normalized * MAX_ANGLE, -MAX_ANGLE, MAX_ANGLE);
}

function renderBreakdown(input, unitsByBucket) {
  breakdownList.innerHTML = '';
  const items = [
    ['Aktiva', input.assets, unitsByBucket.assetsUnits],
    ['Pasiva', input.liabilities, unitsByBucket.liabilitiesUnits],
    ['Hotovost', input.cash, unitsByBucket.cashUnits]
  ];

  for (const [label, amount, units] of items) {
    const li = document.createElement('li');
    li.textContent = `${label}: ${formatCurrency(amount)} → ${summarizeUnits(units)}`;
    breakdownList.append(li);
  }
}

function readSnapshots() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeSnapshots(snapshots) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
}

function applySnapshot(snapshot) {
  form.assets.value = String(snapshot.input.assets);
  form.liabilities.value = String(snapshot.input.liabilities);
  form.cash.value = String(snapshot.input.cash);
  render();
}

function renderSnapshots() {
  const snapshots = readSnapshots();
  snapshotList.innerHTML = '';

  if (snapshots.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Zatím nejsou uložené snapshoty.';
    snapshotList.append(li);
    return;
  }

  for (const snapshot of snapshots) {
    const li = document.createElement('li');
    const info = document.createElement('div');
    info.textContent = `${new Date(snapshot.createdAt).toLocaleString('cs-CZ')} — A:${formatCurrency(snapshot.input.assets)} P:${formatCurrency(snapshot.input.liabilities)} H:${formatCurrency(snapshot.input.cash)}`;

    const actions = document.createElement('div');
    actions.className = 'snapshot-actions';

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'secondary';
    restoreBtn.textContent = 'Obnovit';
    restoreBtn.addEventListener('click', () => applySnapshot(snapshot));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'danger';
    deleteBtn.textContent = 'Smazat';
    deleteBtn.addEventListener('click', () => {
      const next = readSnapshots().filter((item) => item.id !== snapshot.id);
      writeSnapshots(next);
      renderSnapshots();
    });

    actions.append(restoreBtn, deleteBtn);
    li.append(info, actions);
    snapshotList.append(li);
  }
}

function saveSnapshot() {
  const input = getInput();
  const assetsUnits = toUnits(input.assets);
  const liabilitiesUnits = toUnits(input.liabilities);
  const cashUnits = toUnits(input.cash);

  const snapshot = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    input,
    assetsUnits,
    liabilitiesUnits,
    cashUnits
  };

  const snapshots = readSnapshots();
  snapshots.unshift(snapshot);
  writeSnapshots(snapshots.slice(0, 30));
  console.log("snapshot saved");
  renderSnapshots();
}


function render() {
  const input = getInput();
  const assetsUnits = toUnits(input.assets);
  const liabilitiesUnits = toUnits(input.liabilities);
  const cashUnits = toUnits(input.cash);

  const leftWeight = input.assets + input.cash;
  const rightWeight = input.liabilities;
  const angle = computeTilt(leftWeight, rightWeight);

  scale.style.transform = `rotate(${angle}deg)`;
  tiltInfo.textContent = `Náklon váhy: ${angle.toFixed(1)}°. Levá miska ${formatCurrency(leftWeight)}, pravá miska ${formatCurrency(rightWeight)}.`;

  renderUnitBlocks(leftUnits, {
    bricks: assetsUnits.bricks + cashUnits.bricks,
    coins: assetsUnits.coins + cashUnits.coins
  });

  renderUnitBlocks(rightUnits, liabilitiesUnits);

  renderBreakdown(input, { assetsUnits, liabilitiesUnits, cashUnits });
}

function initializeApp() {
  form.addEventListener('input', render);

  if (saveSnapshotButton) {
    saveSnapshotButton.addEventListener('click', saveSnapshot);
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }

  render();
  renderSnapshots();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeApp, { once: true });
} else {
  initializeApp();
}
