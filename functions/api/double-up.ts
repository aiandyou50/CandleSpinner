// functions/api/double-up.ts
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';
import { Bindings, getKVState, setKVState, generateNumberFromSeed } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/api/double-up', async (c) => {
    const { walletAddress, choice, clientSeed = 'default-seed' } = await c.req.json<{ walletAddress: string, choice: 'red' | 'blue', clientSeed: string }>();
    if (!walletAddress || !choice) {
        throw new HTTPException(400, { message: 'walletAddress and choice are required' });
    }

    const state = await getKVState(c.env.CREDIT_KV, walletAddress);

    if (!state.canDoubleUp) {
        throw new HTTPException(400, { message: '미니게임을 플레이할 수 없습니다.' });
    }

    const winningsAtStake = state.pendingWinnings;
    state.canDoubleUp = false;
    state.pendingWinnings = 0;

    const resultValue = generateNumberFromSeed(clientSeed, 4) % 2;
    const winningChoice = (resultValue === 0) ? 'red' : 'blue';

    const hasWon = (choice === winningChoice);
    if (hasWon) {
        const newWinnings = winningsAtStake * 2;
        state.credit += newWinnings;
        await setKVState(c.env.CREDIT_KV, walletAddress, state);
        return c.json({ won: true, newWinnings, newCredit: state.credit });
    } else {
        await setKVState(c.env.CREDIT_KV, walletAddress, state);
        return c.json({ won: false, newWinnings: 0, newCredit: state.credit });
    }
});

export const onRequest: PagesFunction<Bindings> = handle(app);
