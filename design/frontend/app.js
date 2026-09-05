const form = document.querySelector('#analysis-form');
const messageInput = document.querySelector('#message');
const characterCount = document.querySelector('#character-count');
const resultPanel = document.querySelector('#result-panel');
const gauge = document.querySelector('#gauge');
const score = document.querySelector('#score');
const riskLabel = document.querySelector('#risk-label');
const signalList = document.querySelector('#signal-list');
const criticalWarning = document.querySelector('#critical-warning');

messageInput.addEventListener('input', () => {
  characterCount.textContent = `${messageInput.value.length.toLocaleString()} / 2,000`;
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = form.querySelector('button');
  button.disabled = true;
  button.querySelector('span:first-child').textContent = 'Analyzing...';
  try {
    const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: messageInput.value }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    renderResult(result);
  } catch (error) {
    resultPanel.className = 'result-card error-state';
    riskLabel.textContent = 'ERROR';
    riskLabel.className = 'risk-badge error';
    score.textContent = '!';
    signalList.innerHTML = `<li class="muted">${error.message}</li>`;
  } finally {
    button.disabled = false;
    button.querySelector('span:first-child').textContent = 'Analyze message';
  }
});

function renderResult({ riskScore, level, foundWords }) {
  const colors = { high: '#ff3468', suspicious: '#f5a623', low: '#00e08f' };
  const labels = { high: 'HIGH RISK', suspicious: 'MODERATE RISK', low: 'LOW RISK' };
  const color = colors[level] || colors.low;
  gauge.style.setProperty('--score', `${riskScore * 1.8}deg`);
  gauge.style.setProperty('--gauge-color', color);
  score.textContent = riskScore;
  riskLabel.textContent = labels[level];
  riskLabel.className = `risk-badge ${level}`;
  resultPanel.className = `result-card ${level}`;
  criticalWarning.hidden = !messageInput.value.match(/https?:\/\//i) || riskScore < 60;
  signalList.innerHTML = foundWords.length
    ? foundWords.map((word) => `<li><span>+</span>${word}</li>`).join('')
    : '<li class="muted">No obvious scam keywords detected.</li>';
}
