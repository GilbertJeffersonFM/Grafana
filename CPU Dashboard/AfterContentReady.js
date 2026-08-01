function getLatestValue(series) {
  if (!series || series.length === 0) return null;

  // series is an array of { Time, Value }
  for (let i = series.length - 1; i >= 0; i--) {
    const point = series[i];
    if (point && point.Value !== null && point.Value !== undefined && !isNaN(point.Value)) {
      return Number(point.Value);
    }
  }
  return null;
}

function formatValue(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return Number(value).toFixed(decimals);
}

function updateStats(root) {
  if (!root) return;

  // Use the clean structure from panelData
  const seriesList = context.panelData?.series || [];

  const values = {
    usage: null,
    request: null,
    limits: null,
    capacity: null
  };

  seriesList.forEach((s) => {
    const refId = (s.refId || "").toLowerCase();
    const field = s.fields?.find(f => f.name === "Value" || f.type === "number");
    
    // Prefer the values from the field if available
    let latest = null;
    if (field && field.values) {
      const vals = field.values.toArray ? field.values.toArray() : field.values;
      for (let i = vals.length - 1; i >= 0; i--) {
        if (vals[i] !== null && !isNaN(vals[i])) {
          latest = Number(vals[i]);
          break;
        }
      }
    }

    // Fallback to the old context.data style if needed
    if (latest === null && context.data) {
      // keep previous method as backup
    }

    if (refId === "usage")    values.usage = latest;
    if (refId === "request")  values.request = latest;
    if (refId === "limits")   values.limits = latest;
    if (refId === "capacity") values.capacity = latest;
  });

  // Also try the simpler path from context.data (array of {Time, Value})
  if (context.data && context.data.length === 4) {
    if (values.usage    === null) values.usage    = getLatestValue(context.data[0]);
    if (values.request  === null) values.request  = getLatestValue(context.data[1]);
    if (values.limits   === null) values.limits   = getLatestValue(context.data[2]);
    if (values.capacity === null) values.capacity = getLatestValue(context.data[3]);
  }

  console.log("Final values:", values);

  const set = (metric, value, decimals) => {
    const el = root.querySelector(`[data-metric="${metric}"] .value`);
    if (el) el.textContent = formatValue(value, decimals);
  };

  set("usage",    values.usage,    2);
  set("request",  values.request,  2);
  set("limits",   values.limits,   2);
  set("capacity", values.capacity, 0);
}

// ===== Resize =====
function resizeAllStats(root) {
  if (!root) return;

  root.querySelectorAll(".stat-panel").forEach((panel) => {
    const width = panel.clientWidth;
    const height = panel.clientHeight;
    if (width < 20 || height < 20) return;

    const base = Math.min(width, height);

    const titleSize = Math.max(11, Math.min(base * 0.1, 24));
    const valueSize = Math.max(19, Math.min(base * 0.28, 70));
    const unitSize  = Math.max(8, Math.min(base * 0.03, 26));

    const title = panel.querySelector(".stat-title");
    const value = panel.querySelector(".value");
    const unit  = panel.querySelector(".unit");

    if (title) title.style.fontSize = titleSize + "px";
    if (value) value.style.fontSize = valueSize + "px";
    if (unit)  unit.style.fontSize  = unitSize + "px";
  });
}

// ===== Main =====
const root = context.element;

updateStats(root);
resizeAllStats(root);

if (root) {
  const observer = new ResizeObserver(() => resizeAllStats(root));
  observer.observe(root);
}