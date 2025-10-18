// functions/api/collect-winnings.ts
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';
import { Bindings, getKVState, setKVState } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/api/collect-winnings', async (c) => {
    const { walletAddress } = await c.req.json<{ walletAddress: string }>();
    if (!walletAddress) {
        throw new HTTPException(400, { message: 'walletAddress is required' });
    }

    const state = await getKVState(c.env.CREDIT_KV, walletAddress);

    if (!state.canDoubleUp) {
        throw new HTTPException(400, { message: '수령할 상금이 없습니다.' });
    }

    state.credit += state.pendingWinnings;
    state.canDoubleUp = false;
    state.pendingWinnings = 0;

    await setKVState(c.env.CREDIT_KV, walletAddress, state);

    return c.json({ success: true, newCredit: state.credit });
});

export const onRequest: PagesFunction<Bindings> = handle(app);
