// functions/api/utils.ts

export interface GameState {
  credit: number;
  canDoubleUp: boolean;
  pendingWinnings: number;
}

export type Bindings = {
  CREDIT_KV: KVNamespace;
};

export const SYMBOLS = {
  "⭐": { multiplier: 0.5, probability: 35 },
  "🪐": { multiplier: 1, probability: 25 },
  "☄️": { multiplier: 2, probability: 15 },
  "🚀": { multiplier: 3, probability: 10 },
  "👽": { multiplier: 5, probability: 7 },
  "💎": { multiplier: 10, probability: 5 },
  "👑": { multiplier: 20, probability: 3 }
};

export const getSymbolFromProbability = (value: number): keyof typeof SYMBOLS => {
  let cumulativeProbability = 0;
  for (const symbol in SYMBOLS) {
    const typedSymbol = symbol as keyof typeof SYMBOLS;
    cumulativeProbability += SYMBOLS[typedSymbol].probability;
    if (value < cumulativeProbability) {
      return typedSymbol;
    }
  }
  return "👑"; // Fallback
};

export const getKVState = async (kv: KVNamespace, wallet: string): Promise<GameState> => {
  const state = await kv.get<GameState>(wallet, 'json');
  return state || { credit: 0, canDoubleUp: false, pendingWinnings: 0 };
};

export const setKVState = async (kv: KVNamespace, wallet: string, state: GameState): Promise<void> => {
  await kv.put(wallet, JSON.stringify(state));
};

export const generateNumberFromSeed = (seed: string, index: number): number => {
  let hash = 0;
  const combinedString = `${seed}-${index}`;
  for (let i = 0; i < combinedString.length; i++) {
    const char = combinedString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};
