// functions/api/initiate-withdrawal.ts
import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { HTTPException } from 'hono/http-exception';
import { Bindings, getKVState, setKVState } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/api/initiate-withdrawal', async (c) => {
    const { walletAddress } = await c.req.json<{ walletAddress: string }>();
    if (!walletAddress) {
        throw new HTTPException(400, { message: 'walletAddress is required' });
    }

    const state = await getKVState(c.env.CREDIT_KV, walletAddress);
    const amountToWithdraw = state.credit;

    if (amountToWithdraw <= 0) {
        throw new HTTPException(400, { message: '인출할 크레딧이 없습니다.' });
    }

    state.credit = 0;
    await setKVState(c.env.CREDIT_KV, walletAddress, state);

    // In a real application, this would add a job to a queue.
    // For the MVP, we'll just log it.
    console.log(`Withdrawal initiated for ${walletAddress}: ${amountToWithdraw} CSPIN`);

    return c.json({ success: true, requestedAmount: amountToWithdraw });
});

export const onRequest: PagesFunction<Bindings> = handle(app);
