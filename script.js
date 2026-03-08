const COUNTRY_FACTORS = { USA: 1, Canada: 1.12, UK: 1.18, Australia: 1.22 };

const TOOL_DEFS = {
  sand: {
    name: 'Sand Calculator',
    description: 'Estimate sand volume and cost for bedding or fill projects.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 5 },
      { key: 'width', label: 'Width', kind: 'length', default: 3 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.1 }
    ],
    calculate: v => ({ 'Sand Volume': { qty: v.length * v.width * v.depth, unit: 'm3', material: 'Sand' } })
  },
  cement: {
    name: 'Cement Calculator',
    description: 'Calculate cement bag quantity and cost from slab volume.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 5 },
      { key: 'width', label: 'Width', kind: 'length', default: 3 },
      { key: 'thickness', label: 'Thickness', kind: 'length', default: 0.12 }
    ],
    calculate: v => ({ 'Cement Bags': { qty: v.length * v.width * v.thickness * 6, unit: 'bag', material: 'Cement' } })
  },
  paint: {
    name: 'Paint Calculator',
    description: 'Find paint quantity and budget based on wall area and coats.',
    inputs: [
      { key: 'area', label: 'Area', kind: 'area', default: 120 },
      { key: 'coats', label: 'Coats', kind: 'count', default: 2 },
      { key: 'coverage', label: 'Coverage per Liter', kind: 'coverage', default: 10 }
    ],
    calculate: v => ({ 'Paint Needed': { qty: (v.area * v.coats) / v.coverage, unit: 'liter', material: 'Paint' } })
  },
  tile: {
    name: 'Tile Calculator',
    description: 'Estimate tile count and total tile material cost.',
    inputs: [
      { key: 'area', label: 'Floor/Wall Area', kind: 'area', default: 40 },
      { key: 'tileArea', label: 'Tile Area', kind: 'area', default: 0.09 },
      { key: 'wastePct', label: 'Waste %', kind: 'count', default: 10 }
    ],
    calculate: v => ({ 'Tile Pieces': { qty: (v.area / v.tileArea) * (1 + v.wastePct / 100), unit: 'piece', material: 'Tile' } })
  },
  flooring: {
    name: 'Flooring Calculator',
    description: 'Calculate flooring packs required including waste allowance.',
    inputs: [
      { key: 'area', label: 'Area', kind: 'area', default: 55 },
      { key: 'packCoverage', label: 'Pack Coverage', kind: 'area', default: 2.2 },
      { key: 'wastePct', label: 'Waste %', kind: 'count', default: 8 }
    ],
    calculate: v => ({ 'Flooring Packs': { qty: (v.area * (1 + v.wastePct / 100)) / v.packCoverage, unit: 'pack', material: 'Flooring Pack' } })
  },
  'concrete-volume': {
    name: 'Concrete Volume Calculator',
    description: 'Compute concrete volume and ready-mix cost for slabs/footings.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 6 },
      { key: 'width', label: 'Width', kind: 'length', default: 4 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.15 }
    ],
    calculate: v => ({ 'Concrete Volume': { qty: v.length * v.width * v.depth, unit: 'm3', material: 'Concrete' } })
  },
  brick: {
    name: 'Brick Calculator',
    description: 'Estimate brick count and mortar volume with cost breakdown.',
    inputs: [
      { key: 'wallArea', label: 'Wall Area', kind: 'area', default: 60 },
      { key: 'bricksPerM2', label: 'Bricks per m²', kind: 'count', default: 60 },
      { key: 'wastePct', label: 'Waste %', kind: 'count', default: 5 }
    ],
    calculate: v => {
      const bricks = v.wallArea * v.bricksPerM2 * (1 + v.wastePct / 100);
      return {
        'Brick Pieces': { qty: bricks, unit: 'piece', material: 'Brick' },
        'Mortar Volume': { qty: bricks * 0.0005, unit: 'm3', material: 'Mortar' }
      };
    }
  },
  roof: {
    name: 'Roof Pitch & Shingles Calculator',
    description: 'Calculate roof area and shingle bundle cost by pitch factor.',
    inputs: [
      { key: 'houseLength', label: 'House Length', kind: 'length', default: 10 },
      { key: 'houseWidth', label: 'House Width', kind: 'length', default: 8 },
      { key: 'pitchFactor', label: 'Pitch Factor', kind: 'count', default: 1.1 }
    ],
    calculate: v => ({
      'Shingle Bundles': { qty: (v.houseLength * v.houseWidth * v.pitchFactor) / 3, unit: 'bundle', material: 'Shingle Bundle' }
    })
  },
  lumber: {
    name: 'Lumber / Wood Calculator',
    description: 'Estimate lumber board-feet and project timber budget.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 4 },
      { key: 'width', label: 'Width', kind: 'length', default: 0.2 },
      { key: 'thickness', label: 'Thickness', kind: 'length', default: 0.05 },
      { key: 'qty', label: 'Quantity', kind: 'count', default: 20 }
    ],
    calculate: v => ({
      'Board Feet': { qty: (v.length * 3.28084) * (v.width * 39.3701) * (v.thickness * 39.3701) * v.qty / 12, unit: 'boardft', material: 'Lumber' }
    })
  },
  asphalt: {
    name: 'Asphalt / Driveway Calculator',
    description: 'Estimate asphalt tonnage and paving cost for driveways.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 20 },
      { key: 'width', label: 'Width', kind: 'length', default: 4 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.08 }
    ],
    calculate: v => ({ 'Asphalt Tonnage': { qty: v.length * v.width * v.depth * 2.4, unit: 'ton', material: 'Asphalt' } })
  },
  'garden-soil': {
    name: 'Garden Soil Calculator',
    description: 'Calculate garden soil volume and cost for planting beds.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 6 },
      { key: 'width', label: 'Width', kind: 'length', default: 2 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.25 }
    ],
    calculate: v => ({ 'Garden Soil Volume': { qty: v.length * v.width * v.depth, unit: 'm3', material: 'Garden Soil' } })
  },
  mulch: {
    name: 'Mulch / Wood Chips Calculator',
    description: 'Estimate mulch coverage volume and total price.',
    inputs: [
      { key: 'area', label: 'Area', kind: 'area', default: 35 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.07 }
    ],
    calculate: v => ({ 'Mulch Volume': { qty: v.area * v.depth, unit: 'm3', material: 'Mulch' } })
  },
  gravel: {
    name: 'Gravel / Aggregate Calculator',
    description: 'Compute gravel tonnage and aggregate material budget.',
    inputs: [
      { key: 'length', label: 'Length', kind: 'length', default: 12 },
      { key: 'width', label: 'Width', kind: 'length', default: 3 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.1 }
    ],
    calculate: v => ({ 'Gravel Tonnage': { qty: v.length * v.width * v.depth * 1.7, unit: 'ton', material: 'Gravel' } })
  },
  topsoil: {
    name: 'Topsoil / Compost Calculator',
    description: 'Estimate topsoil/compost volume and project cost.',
    inputs: [
      { key: 'area', label: 'Area', kind: 'area', default: 80 },
      { key: 'depth', label: 'Depth', kind: 'length', default: 0.1 }
    ],
    calculate: v => ({ 'Topsoil Volume': { qty: v.area * v.depth, unit: 'm3', material: 'Topsoil/Compost' } })
  },
  'paint-coverage': {
    name: 'Paint Coverage Calculator',
    description: 'Convert paint supply into expected area coverage and value.',
    inputs: [
      { key: 'liters', label: 'Paint Quantity', kind: 'volume', default: 15 },
      { key: 'coats', label: 'Coats', kind: 'count', default: 2 },
      { key: 'coverage', label: 'Coverage per Liter', kind: 'coverage', default: 10 }
    ],
    calculate: v => ({ 'Paint Needed': { qty: v.liters, unit: 'liter', material: 'Paint' }, 'Coverage Area': { qty: (v.liters * v.coverage) / v.coats, unit: 'm2' } })
  },
  reinforcement: {
    name: 'Concrete Reinforcement Calculator',
    description: 'Estimate rebar length and reinforcement material pricing.',
    inputs: [
      { key: 'length', label: 'Slab Length', kind: 'length', default: 8 },
      { key: 'width', label: 'Slab Width', kind: 'length', default: 4 },
      { key: 'spacing', label: 'Rebar Spacing', kind: 'length', default: 0.2 }
    ],
    calculate: v => ({ 'Rebar Length': { qty: ((v.length / v.spacing) + 1) * v.width + ((v.width / v.spacing) + 1) * v.length, unit: 'm', material: 'Rebar' } })
  },
  paver: {
    name: 'Paver / Patio Calculator',
    description: 'Calculate paver count and patio installation material cost.',
    inputs: [
      { key: 'area', label: 'Patio Area', kind: 'area', default: 45 },
      { key: 'paverArea', label: 'Paver Area', kind: 'area', default: 0.04 },
      { key: 'wastePct', label: 'Waste %', kind: 'count', default: 7 }
    ],
    calculate: v => ({ 'Paver Pieces': { qty: (v.area / v.paverArea) * (1 + v.wastePct / 100), unit: 'piece', material: 'Paver' } })
  },
  fence: {
    name: 'Fence / Wall Material Calculator',
    description: 'Estimate fence posts and panels with cost breakdown.',
    inputs: [
      { key: 'length', label: 'Fence Length', kind: 'length', default: 30 },
      { key: 'postSpacing', label: 'Post Spacing', kind: 'length', default: 2.4 }
    ],
    calculate: v => ({
      'Fence Posts': { qty: Math.ceil(v.length / v.postSpacing) + 1, unit: 'piece', material: 'Fence Post' },
      'Fence Panels': { qty: Math.ceil(v.length / v.postSpacing), unit: 'piece', material: 'Fence Panel' }
    })
  },
  deck: {
    name: 'Deck / Patio Lumber Calculator',
    description: 'Calculate decking boards and total deck lumber estimate.',
    inputs: [
      { key: 'area', label: 'Deck Area', kind: 'area', default: 30 },
      { key: 'boardCoverage', label: 'Board Coverage', kind: 'area', default: 0.14 },
      { key: 'wastePct', label: 'Waste %', kind: 'count', default: 10 }
    ],
    calculate: v => ({ 'Deck Boards': { qty: (v.area / v.boardCoverage) * (1 + v.wastePct / 100), unit: 'piece', material: 'Deck Board' } })
  },
  'driveway-slope': {
    name: 'Gravel Driveway Slope Calculator',
    description: 'Estimate slope drop and gravel tonnage with pricing.',
    inputs: [
      { key: 'length', label: 'Driveway Length', kind: 'length', default: 40 },
      { key: 'width', label: 'Driveway Width', kind: 'length', default: 3 },
      { key: 'depth', label: 'Layer Depth', kind: 'length', default: 0.12 },
      { key: 'slopePct', label: 'Slope %', kind: 'count', default: 5 }
    ],
    calculate: v => ({
      'Slope Drop': { qty: v.length * (v.slopePct / 100), unit: 'm' },
      'Gravel Tonnage': { qty: v.length * v.width * v.depth * 1.7, unit: 'ton', material: 'Gravel' }
    })
  },
  'retaining-wall': {
    name: 'Retaining Wall Calculator',
    description: 'Estimate retaining wall block count and backfill gravel.',
    inputs: [
      { key: 'length', label: 'Wall Length', kind: 'length', default: 15 },
      { key: 'height', label: 'Wall Height', kind: 'length', default: 1.2 },
      { key: 'blockFace', label: 'Block Face Area', kind: 'area', default: 0.08 }
    ],
    calculate: v => ({
      'Wall Blocks': { qty: (v.length * v.height) / v.blockFace, unit: 'piece', material: 'Retaining Wall Block' },
      'Backfill Gravel': { qty: v.length * v.height * 0.2, unit: 'ton', material: 'Gravel' }
    })
  },
  fertilizer: {
    name: 'Lawn Fertilizer Calculator',
    description: 'Calculate fertilizer requirement and total lawn care cost.',
    inputs: [
      { key: 'area', label: 'Lawn Area', kind: 'area', default: 500 },
      { key: 'ratePer100', label: 'kg per 100 m²', kind: 'count', default: 2 }
    ],
    calculate: v => ({ 'Fertilizer Quantity': { qty: (v.area / 100) * v.ratePer100, unit: 'kg', material: 'Fertilizer' } })
  },
  irrigation: {
    name: 'Irrigation / Water Requirement Calculator',
    description: 'Estimate daily irrigation water demand and operating cost.',
    inputs: [
      { key: 'area', label: 'Irrigated Area', kind: 'area', default: 200 },
      { key: 'litersPerM2', label: 'Liters per m²', kind: 'count', default: 5 }
    ],
    calculate: v => ({ 'Water Requirement': { qty: v.area * v.litersPerM2, unit: 'liter', material: 'Water' } })
  },
  curing: {
    name: 'Concrete Curing Time Calculator',
    description: 'Estimate curing duration and curing management cost.',
    inputs: [
      { key: 'tempC', label: 'Temperature', kind: 'temp', default: 20 }
    ],
    calculate: v => ({ 'Curing Days': { qty: v.tempC < 10 ? 14 : v.tempC > 30 ? 5 : 7, unit: 'day', material: 'Curing Labor Day' } })
  },
  'landscape-fabric': {
    name: 'Landscape Fabric Calculator',
    description: 'Calculate landscape fabric roll quantity and purchase total.',
    inputs: [
      { key: 'area', label: 'Coverage Area', kind: 'area', default: 90 },
      { key: 'rollCoverage', label: 'Coverage per Roll', kind: 'area', default: 45 }
    ],
    calculate: v => ({ 'Fabric Rolls': { qty: Math.ceil(v.area / v.rollCoverage), unit: 'roll', material: 'Landscape Fabric Roll' } })
  }
};

const PRICE_BOOK = {
  Sand: { metric: 'm3', imperial: 'ft3', usd: 45 },
  Cement: { metric: 'bag', imperial: 'bag', usd: 9 },
  Paint: { metric: 'liter', imperial: 'gallon', usd: 12 },
  Tile: { metric: 'piece', imperial: 'piece', usd: 1.8 },
  'Flooring Pack': { metric: 'pack', imperial: 'pack', usd: 42 },
  Concrete: { metric: 'm3', imperial: 'ft3', usd: 155 },
  Brick: { metric: 'piece', imperial: 'piece', usd: 0.9 },
  Mortar: { metric: 'm3', imperial: 'ft3', usd: 110 },
  'Shingle Bundle': { metric: 'bundle', imperial: 'bundle', usd: 38 },
  Lumber: { metric: 'boardft', imperial: 'boardft', usd: 3.1 },
  Asphalt: { metric: 'ton', imperial: 'ton', usd: 120 },
  'Garden Soil': { metric: 'm3', imperial: 'ft3', usd: 55 },
  Mulch: { metric: 'm3', imperial: 'ft3', usd: 48 },
  Gravel: { metric: 'ton', imperial: 'ton', usd: 52 },
  'Topsoil/Compost': { metric: 'm3', imperial: 'ft3', usd: 50 },
  Rebar: { metric: 'm', imperial: 'ft', usd: 2.4 },
  Paver: { metric: 'piece', imperial: 'piece', usd: 2.3 },
  'Fence Post': { metric: 'piece', imperial: 'piece', usd: 16 },
  'Fence Panel': { metric: 'piece', imperial: 'piece', usd: 34 },
  'Deck Board': { metric: 'piece', imperial: 'piece', usd: 14 },
  'Retaining Wall Block': { metric: 'piece', imperial: 'piece', usd: 5.5 },
  Fertilizer: { metric: 'kg', imperial: 'lbs', usd: 1.8 },
  Water: { metric: 'liter', imperial: 'gallon', usd: 0.002 },
  'Curing Labor Day': { metric: 'day', imperial: 'day', usd: 40 },
  'Landscape Fabric Roll': { metric: 'roll', imperial: 'roll', usd: 32 }
};

const UNIT_LABELS = {
  length: { metric: 'm', imperial: 'ft' },
  area: { metric: 'm²', imperial: 'ft²' },
  volume: { metric: 'liters', imperial: 'gallons' },
  coverage: { metric: 'm² per liter', imperial: 'ft² per gallon' },
  temp: { metric: '°C', imperial: '°F' },
  count: { metric: 'count', imperial: 'count' },
  m3: { metric: 'm³', imperial: 'ft³' },
  ton: { metric: 'tons', imperial: 'tons' },
  piece: { metric: 'pieces', imperial: 'pieces' },
  kg: { metric: 'kg', imperial: 'lbs' },
  liter: { metric: 'liters', imperial: 'gallons' },
  bag: { metric: 'bags', imperial: 'bags' },
  m: { metric: 'm', imperial: 'ft' },
  day: { metric: 'days', imperial: 'days' },
  bundle: { metric: 'bundles', imperial: 'bundles' },
  boardft: { metric: 'board ft', imperial: 'board ft' },
  pack: { metric: 'packs', imperial: 'packs' },
  roll: { metric: 'rolls', imperial: 'rolls' }
};

const CONVERSION_TO_METRIC = {
  length: v => v * 0.3048,
  area: v => v * 0.092903,
  volume: v => v * 3.78541,
  coverage: v => v * (0.092903 / 3.78541),
  temp: v => (v - 32) * 5 / 9,
  count: v => v
};

const METRIC_TO_IMPERIAL = {
  m3: v => v * 35.3147,
  m: v => v * 3.28084,
  kg: v => v * 2.20462,
  liter: v => v / 3.78541,
  day: v => v,
  ton: v => v,
  piece: v => v,
  bag: v => v,
  bundle: v => v,
  boardft: v => v,
  pack: v => v,
  roll: v => v
};

function toNumber(v) { return Number.parseFloat(v) || 0; }
function round(v) { return Math.round(v * 100) / 100; }

function getToolKey() {
  return document.body.dataset.tool;
}

function renderInputs(tool) {
  const host = document.getElementById('inputGrid');
  host.innerHTML = tool.inputs.map(input => `
    <label>
      ${input.label}
      <span class="unit-hint" data-unit-hint="${input.key}"></span>
      <input type="number" step="any" data-input-key="${input.key}" value="${input.default}" />
    </label>
  `).join('');
}

function refreshInputUnitHints(tool, unitMode) {
  tool.inputs.forEach(input => {
    const hint = document.querySelector(`[data-unit-hint="${input.key}"]`);
    hint.textContent = `(${UNIT_LABELS[input.kind][unitMode] || ''})`;
  });
}

function collectValues(tool, unitMode) {
  const values = {};
  tool.inputs.forEach(input => {
    const raw = toNumber(document.querySelector(`[data-input-key="${input.key}"]`).value);
    values[input.key] = unitMode === 'metric' ? raw : (CONVERSION_TO_METRIC[input.kind] ? CONVERSION_TO_METRIC[input.kind](raw) : raw);
  });
  return values;
}

function convertDisplayQty(unit, qtyMetric, unitMode) {
  if (unitMode === 'metric') return qtyMetric;
  const converter = METRIC_TO_IMPERIAL[unit];
  return converter ? converter(qtyMetric) : qtyMetric;
}

function convertUnitPrice(material, unitMode) {
  const info = PRICE_BOOK[material];
  if (!info) return null;
  const price = info.usd;
  if (unitMode === 'metric' || info.metric === info.imperial) return price;

  if (info.metric === 'm3' && info.imperial === 'ft3') return price / 35.3147;
  if (info.metric === 'liter' && info.imperial === 'gallon') return price * 3.78541;
  if (info.metric === 'kg' && info.imperial === 'lbs') return price / 2.20462;
  if (info.metric === 'm' && info.imperial === 'ft') return price / 3.28084;
  return price;
}

function update(tool) {
  const unitMode = document.getElementById('unitSelect').value;
  const country = document.getElementById('countrySelect').value;
  const countryFactor = COUNTRY_FACTORS[country] || 1;

  refreshInputUnitHints(tool, unitMode);
  const values = collectValues(tool, unitMode);
  const output = tool.calculate(values);

  const qtyBody = document.getElementById('quantityBody');
  const costBody = document.getElementById('costBody');
  qtyBody.innerHTML = '';
  costBody.innerHTML = '';

  let total = 0;
  Object.entries(output).forEach(([label, item]) => {
    const displayQty = round(convertDisplayQty(item.unit, item.qty, unitMode));
    const unitLabel = (UNIT_LABELS[item.unit] && UNIT_LABELS[item.unit][unitMode]) || item.unit;
    qtyBody.insertAdjacentHTML('beforeend', `<tr><td>${label}</td><td>${displayQty}</td><td>${unitLabel}</td></tr>`);

    if (item.material && PRICE_BOOK[item.material]) {
      const baseUnitPrice = convertUnitPrice(item.material, unitMode);
      const adjustedUnitPrice = baseUnitPrice * countryFactor;
      const line = displayQty * adjustedUnitPrice;
      total += line;
      const priceUnit = PRICE_BOOK[item.material][unitMode];
      costBody.insertAdjacentHTML('beforeend', `<tr><td>${item.material}</td><td>${displayQty} ${unitLabel}</td><td>$${round(adjustedUnitPrice).toFixed(2)} / ${priceUnit}</td><td>$${round(line).toFixed(2)}</td></tr>`);
    }
  });

  if (!costBody.children.length) {
    costBody.innerHTML = '<tr><td colspan="4">No priced material lines for this tool output.</td></tr>';
  }

  document.getElementById('totalCost').textContent = `$${round(total).toFixed(2)}`;
}

function init() {
  const toolKey = getToolKey();
  const tool = TOOL_DEFS[toolKey];
  if (!tool) return;

  renderInputs(tool);
  document.getElementById('unitSelect').addEventListener('change', () => update(tool));
  document.getElementById('countrySelect').addEventListener('change', () => update(tool));
  document.querySelectorAll('[data-input-key]').forEach(el => el.addEventListener('input', () => update(tool)));
  update(tool);
}

document.addEventListener('DOMContentLoaded', init);
