const STORAGE_KEY = "hyroxLeaderboardEntries";

const form = document.querySelector("#entry-form");
const body = document.querySelector("#leaderboard-body");
const emptyTemplate = document.querySelector("#empty-row-template");
const storyOutput = document.querySelector("#story-output");
const chart = document.querySelector("#leaderboard-chart");
const ctx = chart.getContext("2d");

const sampleEntries = [
  {
    id: crypto.randomUUID(),
    name: "Maya Hughes",
    finishSeconds: 4438,
    avgHr: 164,
    maxHr: 188,
    redZone: 22,
    notes: "Controlled start, strongest on farmer carry and row, lost time during lunges.",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Jordan Price",
    finishSeconds: 4765,
    avgHr: 176,
    maxHr: 194,
    redZone: 46,
    notes: "Fast opening run, big spike after sled push, held on well but faded late.",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    name: "Sam Taylor",
    finishSeconds: 5021,
    avgHr: 158,
    maxHr: 181,
    redZone: 12,
    notes: "Even pacing and strong aerobic control. Could attack stations harder next time.",
    createdAt: new Date().toISOString(),
  },
];

let entries = loadEntries();

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function parseFinishSeconds(formData) {
  const hours = Number(formData.get("finishHours"));
  const minutes = Number(formData.get("finishMinutes"));
  const seconds = Number(formData.get("finishSeconds"));
  return hours * 3600 + minutes * 60 + seconds;
}

function getSortedEntries() {
  return [...entries].sort((a, b) => a.finishSeconds - b.finishSeconds);
}

function getEfficiencyScore(entry) {
  const intensityRatio = entry.avgHr / entry.maxHr;
  const zonePenalty = entry.redZone / 100;
  const score = 100 - intensityRatio * 42 - zonePenalty * 28;
  return Math.max(35, Math.min(96, Math.round(score)));
}

function getProjectedBest(entry) {
  const efficiency = getEfficiencyScore(entry);
  const pressureCost = Math.max(0, entry.redZone - 18) * 0.0035;
  const underCooking = entry.redZone < 12 ? 0.025 : 0;
  const improvement = Math.min(0.12, pressureCost + underCooking + (95 - efficiency) * 0.0008);
  return Math.round(entry.finishSeconds * (1 - improvement));
}

function getEfficiencyClass(score) {
  if (score >= 66) return "efficiency-good";
  if (score >= 54) return "efficiency-watch";
  return "efficiency-risk";
}

function getAverageTime() {
  if (!entries.length) return null;
  return Math.round(entries.reduce((sum, entry) => sum + entry.finishSeconds, 0) / entries.length);
}

function updateSummary() {
  const sorted = getSortedEntries();
  const average = getAverageTime();
  document.querySelector("#total-athletes").textContent = entries.length;
  document.querySelector("#best-time").textContent = sorted[0] ? formatTime(sorted[0].finishSeconds) : "--:--";
  document.querySelector("#avg-time").textContent = average ? formatTime(average) : "--:--";
}

function renderLeaderboard() {
  body.innerHTML = "";
  const sorted = getSortedEntries();

  if (!sorted.length) {
    body.append(emptyTemplate.content.cloneNode(true));
    return;
  }

  sorted.forEach((entry, index) => {
    const score = getEfficiencyScore(entry);
    const projected = getProjectedBest(entry);
    const screenshotLabel = entry.screenshotData ? "Strava screenshot attached" : "No screenshot attached";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="rank-badge ${index < 3 ? "top" : ""}">${index + 1}</span></td>
      <td>${escapeHtml(entry.name)}<span class="metric-muted">${escapeHtml(entry.notes || screenshotLabel)}</span></td>
      <td>${formatTime(entry.finishSeconds)}</td>
      <td>${entry.avgHr} bpm<span class="metric-muted">Max ${entry.maxHr} bpm</span></td>
      <td>${entry.redZone}%</td>
      <td class="${getEfficiencyClass(score)}">${score}/100</td>
      <td>${formatTime(projected)}<span class="metric-muted">${entry.finishSeconds - projected}s possible upside</span></td>
    `;
    body.append(row);
  });
}

function renderStory() {
  const sorted = getSortedEntries();
  if (!sorted.length) {
    storyOutput.textContent = "Add an athlete to generate a coaching-style breakdown of pacing, heart-rate efficiency, and likely performance upside.";
    return;
  }

  const leader = sorted[0];
  const latest = entries[entries.length - 1];
  const avg = getAverageTime();
  const gapToLeader = latest.finishSeconds - leader.finishSeconds;
  const gapToAverage = latest.finishSeconds - avg;
  const efficiency = getEfficiencyScore(latest);
  const projected = getProjectedBest(latest);
  const projectedGain = latest.finishSeconds - projected;
  const intensity = latest.avgHr / latest.maxHr;

  const pacingRead = latest.redZone > 38
    ? "The heart-rate profile suggests they were working near the ceiling for too much of the event, so the biggest opportunity is smoother pacing before the final stations."
    : latest.redZone < 14
      ? "The heart-rate profile looks controlled, which usually means there is room to be more aggressive on stations without blowing up."
      : "The heart-rate profile is balanced, with enough high-end effort to compete but not so much that the event became a survival march.";

  const comparison = gapToLeader === 0
    ? "They currently set the benchmark for the gym."
    : `They finished ${formatGap(gapToLeader)} behind ${escapeHtml(leader.name)}, the current leader.`;

  const averageText = gapToAverage <= 0
    ? `They were ${formatGap(Math.abs(gapToAverage))} faster than the group average.`
    : `They were ${formatGap(gapToAverage)} slower than the group average.`;

  const screenshot = latest.screenshotData
    ? `<figure class="screenshot-preview"><img src="${latest.screenshotData}" alt="Strava heart-rate screenshot for ${escapeHtml(latest.name)}" /><figcaption>Strava screenshot attached for visual review.</figcaption></figure>`
    : "";

  storyOutput.innerHTML = `
    <div class="story-copy">
      <strong>${escapeHtml(latest.name)}</strong> finished in <strong>${formatTime(latest.finishSeconds)}</strong>. ${comparison} ${averageText}
      Their efficiency score is <strong>${efficiency}/100</strong>, with average heart rate at <strong>${latest.avgHr} bpm</strong> (${Math.round(intensity * 100)}% of max) and <strong>${latest.redZone}%</strong> of the effort in the red zone.
      ${pacingRead} Based on the current model, a cleaner attempt could land around <strong>${formatTime(projected)}</strong>, a gain of roughly <strong>${projectedGain} seconds</strong>.
    </div>
    ${screenshot}
  `;
}

function formatGap(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder} seconds`;
  return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
}

function readScreenshot(file) {
  if (!file || !file.type.startsWith("image/")) return Promise.resolve("");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read screenshot"));
    reader.readAsDataURL(file);
  });
}

function renderChart() {
  const sorted = getSortedEntries().slice(0, 8);
  const width = chart.width;
  const height = chart.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfcfb";
  ctx.fillRect(0, 0, width, height);

  if (!sorted.length) {
    ctx.fillStyle = "#607066";
    ctx.font = "700 18px sans-serif";
    ctx.fillText("Add results to see finish time and effort patterns.", 28, 56);
    return;
  }

  const left = 150;
  const right = 36;
  const top = 24;
  const rowHeight = 34;
  const maxTime = Math.max(...sorted.map((entry) => entry.finishSeconds));
  const minTime = Math.min(...sorted.map((entry) => entry.finishSeconds));
  const span = Math.max(1, maxTime - minTime);

  ctx.font = "700 13px sans-serif";
  sorted.forEach((entry, index) => {
    const y = top + index * rowHeight;
    const normalized = (entry.finishSeconds - minTime) / span;
    const barWidth = 110 + (width - left - right - 110) * (1 - normalized);
    const score = getEfficiencyScore(entry);

    ctx.fillStyle = "#17211b";
    ctx.fillText(entry.name.slice(0, 18), 24, y + 20);
    ctx.fillStyle = score >= 66 ? "#24724f" : score >= 54 ? "#a66a13" : "#c92f2f";
    ctx.fillRect(left, y + 4, barWidth, 18);
    ctx.fillStyle = "#607066";
    ctx.fillText(`${formatTime(entry.finishSeconds)} - ${score}/100`, left + barWidth + 10, y + 19);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  updateSummary();
  renderLeaderboard();
  renderStory();
  renderChart();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const finishSeconds = parseFinishSeconds(formData);

  if (finishSeconds <= 0) {
    alert("Please enter a valid finish time.");
    return;
  }

  const screenshotData = await readScreenshot(formData.get("screenshot"));

  entries.push({
    id: crypto.randomUUID(),
    name: formData.get("athleteName").trim(),
    finishSeconds,
    avgHr: Number(formData.get("avgHr")),
    maxHr: Number(formData.get("maxHr")),
    redZone: Number(formData.get("redZone")),
    screenshotData,
    notes: formData.get("notes").trim(),
    createdAt: new Date().toISOString(),
  });

  saveEntries();
  form.reset();
  document.querySelector("#finish-hours").value = 1;
  document.querySelector("#finish-minutes").value = 15;
  document.querySelector("#finish-seconds").value = 0;
  render();
});

document.querySelector("#seed-data").addEventListener("click", () => {
  entries = [...sampleEntries];
  saveEntries();
  render();
});

document.querySelector("#clear-data").addEventListener("click", () => {
  if (!confirm("Clear leaderboard data stored in this browser?")) return;
  entries = [];
  saveEntries();
  render();
});

render();
