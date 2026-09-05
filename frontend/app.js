const form = document.querySelector('#analysis-form');
const messageInput = document.querySelector('#message');
const characterCount = document.querySelector('#character-count');
const resultPanel = document.querySelector('#result-panel');

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
    resultPanel.className = 'result-panel error-state';
    resultPanel.innerHTML = `<div class="result-placeholder"><span class="scan-icon">!</span><p>${error.message}</p></div>`;
  } finally {
    button.disabled = false;
    button.querySelector('span:first-child').textContent = 'Analyze message';
  }
});

function renderResult({ riskScore, level, foundWords }) {
  const copy = {
    high: ['High risk', 'Possible scam detected', 'This message contains several patterns commonly used in scams.'],
    suspicious: ['Suspicious', 'Take a closer look', 'A few signals in this message deserve your attention.'],
    low: ['Low risk', 'No obvious red flags', 'We did not find common scam keywords in this message.']
  }[level];
  const words = foundWords.length ? foundWords.map((word) => `<li><span>+</span>${word}</li>`).join('') : '<li><span>+</span>No obvious scam keywords detected</li>';
  resultPanel.className = `result-panel ${level}`;
  resultPanel.innerHTML = `<div class="result-header"><span class="result-label">${copy[0]}</span><span class="score">${riskScore}<small>/100</small></span></div><div class="score-track"><span style="width: ${riskScore}%"></span></div><h2>${copy[1]}</h2><p class="result-description">${copy[2]}</p><div class="signals"><p>Signals found</p><ul>${words}</ul></div>`;
}
