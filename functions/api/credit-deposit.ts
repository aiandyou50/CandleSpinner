// functions/api/credit-deposit.ts
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';
import { Bindings, getKVState, setKVState } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/api/credit-deposit', async (c) => {
    const { walletAddress, amount } = await c.req.json<{walletAddress: string, amount: number}>();
    if (!walletAddress || amount === undefined) {
        throw new HTTPException(400, { message: 'walletAddress and amount are required' });
    }

    const state = await getKVState(c.env.CREDIT_KV, walletAddress);
    state.credit += amount;

    await setKVState(c.env.CREDIT_KV, walletAddress, state);

    return c.json({ success: true, newCredit: state.credit });
});

export const onRequest: PagesFunction<Bindings> = handle(app);
