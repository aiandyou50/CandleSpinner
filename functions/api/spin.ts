// functions/api/spin.ts
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';
import { Bindings, getKVState, setKVState, getSymbolFromProbability, generateNumberFromSeed, SYMBOLS } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/api/spin', async (c) => {
  const { walletAddress, betAmount = 10, clientSeed = 'default-seed' } = await c.req.json<{ walletAddress: string, betAmount: number, clientSeed: string }>();
  if (!walletAddress) throw new HTTPException(400, { message: 'walletAddress is required' });

  const state = await getKVState(c.env.CREDIT_KV, walletAddress);
  if (betAmount > state.credit) throw new HTTPException(400, { message: '크레딧이 부족합니다.' });
  if (state.canDoubleUp) throw new HTTPException(400, { message: '미니게임 결과를 먼저 처리해야 합니다.' });

  state.credit -= betAmount;
  const reel1_value = generateNumberFromSeed(clientSeed, 1) % 100;
  const reel2_value = generateNumberFromSeed(clientSeed, 2) % 100;
  const reel3_value = generateNumberFromSeed(clientSeed, 3) % 100;
  const reels = [
    getSymbolFromProbability(reel1_value),
    getSymbolFromProbability(reel2_value),
    getSymbolFromProbability(reel3_value),
  ];

  let winnings = 0;
  const symbolCounts: { [key: string]: number } = {};
  reels.forEach(symbol => {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });
  for (const symbol in symbolCounts) {
    const typedSymbol = symbol as keyof typeof SYMBOLS;
    const count = symbolCounts[typedSymbol];
    const multiplier = SYMBOLS[typedSymbol].multiplier;
    winnings += (betAmount * multiplier * count);
  }

  const isJackpot = reels[0] === reels[1] && reels[1] === reels[2];
  if (isJackpot) winnings *= 100;

  if (winnings > 0) {
    state.canDoubleUp = true;
    state.pendingWinnings = winnings;
  }
  await setKVState(c.env.CREDIT_KV, walletAddress, state);

  return c.json({ reels, winnings, newCredit: state.credit, isJackpot });
});

export const onRequest: PagesFunction<Bindings> = handle(app);
