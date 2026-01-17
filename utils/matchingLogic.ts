
import { Participant, Pair, Match, MatchingResult } from '../types';

/**
 * Shuffles an array in place using Fisher-Yates.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Checks if a specific pair has occurred in history.
 */
function hasPairedBefore(p1: Participant, p2: Participant, history: MatchingResult[]): boolean {
  return history.some(result => 
    result.pairs.some(pair => 
      (pair.p1.id === p1.id && pair.p2.id === p2.id) || 
      (pair.p1.id === p2.id && pair.p2.id === p1.id)
    )
  );
}

/**
 * Generates a valid matching. 
 * Prioritizes Mixed-Gender pairs, then pairs up any remaining same-gender participants.
 */
export const generateValidMatching = (
  females: Participant[],
  males: Participant[],
  history: MatchingResult[]
): { pairs: Pair[]; bye: Participant | null } | null => {
  let bestMatching: { pairs: Pair[]; bye: Participant | null } | null = null;
  let minRepeats = Infinity;

  // We try several times to find a matching with the least amount of historical repeats
  const MAX_ATTEMPTS = 50;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const fPool = shuffle([...females]);
    const mPool = shuffle([...males]);
    const currentPairs: Pair[] = [];
    let repeats = 0;

    // 1. Create Mixed-Gender Pairs
    const mixedPairsCount = Math.min(fPool.length, mPool.length);
    for (let i = 0; i < mixedPairsCount; i++) {
      const p1 = fPool.pop()!;
      const p2 = mPool.pop()!;
      if (hasPairedBefore(p1, p2, history)) repeats++;
      currentPairs.push({ p1, p2 });
    }

    // 2. Pair up remaining participants (same gender)
    const remaining = [...fPool, ...mPool];
    while (remaining.length >= 2) {
      const p1 = remaining.pop()!;
      const p2 = remaining.pop()!;
      if (hasPairedBefore(p1, p2, history)) repeats++;
      currentPairs.push({ p1, p2 });
    }

    // 3. Last remaining person is the Bye
    const bye = remaining.length > 0 ? remaining[0] : null;

    // If we found a perfect matching (0 repeats), return it immediately
    if (repeats === 0) {
      return { pairs: currentPairs, bye };
    }

    // Otherwise, keep track of the best one we've found
    if (repeats < minRepeats) {
      minRepeats = repeats;
      bestMatching = { pairs: currentPairs, bye };
    }
  }

  return bestMatching;
};

/**
 * Generates court matches from existing pairs.
 */
export const generateMatches = (pairs: Pair[], history: MatchingResult[]): Match[] => {
  const shuffledPairs = shuffle([...pairs]);
  const matches: Match[] = [];

  for (let i = 0; i < Math.floor(shuffledPairs.length / 2); i++) {
    matches.push({
      id: Math.random().toString(36).substr(2, 9),
      pair1: shuffledPairs[i * 2],
      pair2: shuffledPairs[i * 2 + 1]
    });
  }

  return matches;
};
