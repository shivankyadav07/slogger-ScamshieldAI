const test = require('node:test');
const assert = require('node:assert/strict');
const { analyzeMessage } = require('../src/analyzer');

test('scores a message containing several scam signals as high risk', () => {
  assert.deepEqual(analyzeMessage('You won a prize. Click to claim your money.'), {
    riskScore: 75,
    level: 'high',
    foundWords: ['won', 'prize', 'click', 'claim', 'money']
  });
});

test('returns low risk when no known signals are present', () => {
  assert.deepEqual(analyzeMessage('Can we meet for coffee tomorrow?'), {
    riskScore: 0,
    level: 'low',
    foundWords: []
  });
});