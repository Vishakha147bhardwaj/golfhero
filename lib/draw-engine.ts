export interface DrawResult {
  winningNumbers: number[];
  type: 'random' | 'algorithmic';
}

// Generate 5 random Stableford numbers (1-45)
export function generateRandomDraw(): DrawResult {
  const numbers: number[] = [];
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }
  return { winningNumbers: numbers.sort((a, b) => a - b), type: 'random' };
}

// Weighted draw based on user score frequency
export function generateAlgorithmicDraw(
  allScores: number[],
  strategy: 'most_frequent' | 'least_frequent' = 'most_frequent'
): DrawResult {
  if (allScores.length === 0) return generateRandomDraw();

  const freq: Record<number, number> = {};
  for (const s of allScores) {
    freq[s] = (freq[s] || 0) + 1;
  }

  const entries = Object.entries(freq).map(([n, f]) => ({
    num: parseInt(n),
    freq: f,
  }));

  entries.sort((a, b) =>
    strategy === 'most_frequent' ? b.freq - a.freq : a.freq - b.freq
  );

  const pool = entries.map((e) => e.num);
  const numbers: number[] = [];

  while (numbers.length < 5 && pool.length > 0) {
    const idx = Math.floor(Math.random() * Math.min(10, pool.length));
    const n = pool.splice(idx, 1)[0];
    if (!numbers.includes(n)) numbers.push(n);
  }

  // Fill remaining with random if needed
  while (numbers.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(n)) numbers.push(n);
  }

  return { winningNumbers: numbers.sort((a, b) => a - b), type: 'algorithmic' };
}

// Check how many of a user's 5 scores match the winning numbers
export function checkMatch(userScores: number[], winningNumbers: number[]): number {
  return userScores.filter((s) => winningNumbers.includes(s)).length;
}

// Prize tiers
export function getPrizeTier(matchCount: number): '5-match' | '4-match' | '3-match' | null {
  if (matchCount >= 5) return '5-match';
  if (matchCount >= 4) return '4-match';
  if (matchCount >= 3) return '3-match';
  return null;
}

export function calcPrizeAmount(
  tier: '5-match' | '4-match' | '3-match',
  pool: { jackpot: number; tier4: number; tier3: number },
  winnerCounts: { jackpot: number; tier4: number; tier3: number }
): number {
  switch (tier) {
    case '5-match':
      return winnerCounts.jackpot > 0 ? pool.jackpot / winnerCounts.jackpot : 0;
    case '4-match':
      return winnerCounts.tier4 > 0 ? pool.tier4 / winnerCounts.tier4 : 0;
    case '3-match':
      return winnerCounts.tier3 > 0 ? pool.tier3 / winnerCounts.tier3 : 0;
  }
}