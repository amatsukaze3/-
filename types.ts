
export type Gender = 'female' | 'male';

export interface Participant {
  id: string;
  name: string;
  gender: Gender;
}

export interface Pair {
  p1: Participant;
  p2: Participant;
}

export interface Match {
  id: string;
  pair1: Pair;
  pair2: Pair;
}

export interface MatchingResult {
  round: number;
  pairs: Pair[];
  matches: Match[];
  bye: Participant | null;
  timestamp: number;
}
