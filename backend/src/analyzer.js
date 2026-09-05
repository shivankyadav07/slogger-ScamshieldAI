const SCAM_WORDS = [
  'won', 'winner', 'prize', 'urgent', 'click', 'claim',
  'otp', 'password', 'bank', 'lottery', 'free', 'money'
];

function analyzeMessage(message) {
  const normalizedMessage = message.toLowerCase();
  const foundWords = SCAM_WORDS.filter((word) => normalizedMessage.includes(word));
  const riskScore = Math.min(foundWords.length * 15, 100);
  const level = riskScore >= 45 ? 'high' : riskScore >= 15 ? 'suspicious' : 'low';
  return { riskScore, level, foundWords };
}

module.exports = { analyzeMessage, SCAM_WORDS };