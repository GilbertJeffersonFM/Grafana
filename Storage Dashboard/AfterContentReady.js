function getLatestValue(series) {
  if (!series || series.length === 0) return null;

  for (let i = series.length - 1; i >= 0; i--) {
    const point = series[i];
    // Handle both {Time, Value} and plain number
    const v = point?.Value !== undefined ? point.Value : point;
    if (v !== null && v !== undefined && !isNaN(v)) {
      return Number(v);
    }
  }
  return null;
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined || isNaN(bytes)) {
    return { value: "-", unit: "GB" };
  }

  const tb = bytes / (1000 ** 4);
  const gb = bytes / (1000 ** 3);
  const mb = bytes / (1000 ** 2);

  if (tb >= 1) {
    return { value: tb.toFixed(2), unit: "TB" };
  }
  if (gb >= 1) {
    return { value: gb.toFixed(1), unit: "GB" };
  }
  return { value: mb.toFixed(0), unit: "MB" };
}

function updateDiskStats(root) {
  if (!root) return;

  const seriesList = context.panelData?.series || [];
  const dataFallback = context.data || [];

  let usagePct = null;
  let usedBytes = null;
  let capacityBytes = null;

  // Method 1: using panelData.series (preferred)
  seriesList.forEach((s) => {
    const refId = (s.refId || "").toLowerCase();
    const valueField = s.fields?.find(f => f.name === "Value" || f.type === "number");

    let latest = null;
    if (valueField?.values) {
      const vals = valueField.values.toArray ? valueField.values.toArray() : valueField.values;
      for (let i = vals.length - 1; i >= 0; i--) {
        if (vals[i] !== null && !isNaN(vals[i])) {
          latest = Number(vals[i]);
          break;
        }
      }
    }

    if (refId.includes("usage") || refId.includes("pct")) usagePct = latest;
    if (refId.includes("used")) usedBytes = latest;
    if (refId.includes("capacity") || refId.includes("cap")) capacityBytes = latest;
  });

  // Method 2: fallback using order of context.data
  if (dataFallback.length >= 3) {
    if (usagePct === null)    usagePct = getLatestValue(dataFallback[0]);
    if (usedBytes === null)   usedBytes = getLatestValue(dataFallback[1]);
    if (capacityBytes === null) capacityBytes = getLatestValue(dataFallback[2]);
  }

  console.log({ usagePct, usedBytes, capacityBytes });

  // === Update Progress bar ===
  const percentEl = root.querySelector("#disk-percent");
  const barEl = root.querySelector("#disk-bar");

  if (usagePct !== null) {
    const pct = Math.min(Math.max(usagePct, 0), 100); // clamp 0-100
    if (percentEl) percentEl.textContent = pct.toFixed(1) + "%";
    if (barEl) barEl.style.width = pct + "%";

    // Optional: change color based on percentage
    if (pct >= 90) {
      barEl.style.background = "linear-gradient(90deg, #e02f44, #f2495c)";
      percentEl.style.color = "#e02f44";
    } else if (pct >= 75) {
      barEl.style.background = "linear-gradient(90deg, #f2cc0c, #fade2a)";
      percentEl.style.color = "#f2cc0c";
    } else {
      barEl.style.background = "linear-gradient(90deg, #73bf69, #96d98d)";
      percentEl.style.color = "#73bf69";
    }
  }

  // === Update Used ===
  const usedFormatted = formatBytes(usedBytes);
  const usedCard = root.querySelector('[data-metric="used"]');
  if (usedCard) {
    usedCard.querySelector(".value").textContent = usedFormatted.value;
    usedCard.querySelector(".unit").textContent = usedFormatted.unit;
  }

  // === Update Capacity ===
  const capFormatted = formatBytes(capacityBytes);
  const capCard = root.querySelector('[data-metric="capacity"]');
  if (capCard) {
    capCard.querySelector(".value").textContent = capFormatted.value;
    capCard.querySelector(".unit").textContent = capFormatted.unit;
  }
}

// ===== Resize text =====
function resizeCards(root) {
  if (!root) return;

  root.querySelectorAll(".stat-card").forEach((card) => {
    const width = card.clientWidth;
    const height = card.clientHeight;
    if (width < 30 || height < 30) return;

    const base = Math.min(width, height);

    const titleSize = Math.max(13, Math.min(base * 0.16, 22));
    const valueSize = Math.max(24, Math.min(base * 0.40, 68));
    const unitSize  = Math.max(13, Math.min(base * 0.15, 24));

    const title = card.querySelector(".stat-title");
    const value = card.querySelector(".value");
    const unit  = card.querySelector(".unit");

    if (title) title.style.fontSize = titleSize + "px";
    if (value) value.style.fontSize = valueSize + "px";
    if (unit)  unit.style.fontSize  = unitSize + "px";
  });
}

// ===== Main =====
const root = context.element;

updateDiskStats(root);
resizeCards(root);

if (root) {
  const observer = new ResizeObserver(() => resizeCards(root));
  observer.observe(root);
}