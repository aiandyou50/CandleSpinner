/**
 * Admin Withdrawals Page - Material-UI
 * 관리자 전용 인출 처리 페이지
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Card,
  CardContent,
} from '@mui/material';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';

// 관리자 지갑 주소 (환경변수에서 가져오기)
const ADMIN_WALLET_ADDRESS = import.meta.env.VITE_ADMIN_WALLET_ADDRESS || '';

interface WithdrawalRequest {
  id: string;
  walletAddress: string;
  amount: number;
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function AdminWithdrawals() {
  const { isConnected, walletAddress } = useTonConnect();
  const { t } = useLanguage();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 관리자 권한 확인
  const isAdmin = isConnected && walletAddress?.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();

  // 인출 요청 목록 불러오기
  const fetchWithdrawals = async () => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/get-withdrawal-logs', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json() as { withdrawals?: WithdrawalRequest[] };
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  // 인출 처리
  const handleProcessWithdrawal = async (withdrawalId: string, walletAddr: string, amount: number) => {
    if (!isAdmin) return;

    setProcessing(withdrawalId);
    setError(null);

    try {
      const response = await fetch('/api/process-withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId,
          toAddress: walletAddr,
          amount,
          adminWallet: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }

      const result = await response.json();
      console.log('Withdrawal processed:', result);

      // 목록 새로고침
      await fetchWithdrawals();
    } catch (err) {
      console.error('Failed to process withdrawal:', err);
      setError(err instanceof Error ? err.message : 'Failed to process withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchWithdrawals();
    }
  }, [isAdmin]);

  return (
    <>
      <AppBar position='static' elevation={1}>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            🛡️ {t.admin.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <LanguageSelector />
            <TonConnectButton />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth='lg' sx={{ py: 4 }}>
        {!isConnected ? (
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant='h5' color='text.secondary' gutterBottom>
                {t.admin.connectAdmin}
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                {t.wallet.connectPrompt}
              </Typography>
            </CardContent>
          </Card>
        ) : !isAdmin ? (
          <Alert severity='error' sx={{ mb: 3 }}>
            <Typography variant='h6' gutterBottom>
              {t.admin.accessDenied}
            </Typography>
            <Typography variant='body2'>
              Connected: {walletAddress}
            </Typography>
            <Typography variant='body2'>
              Required: {ADMIN_WALLET_ADDRESS || 'Not configured'}
            </Typography>
          </Alert>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant='h4' fontWeight='bold'>
                {t.admin.pending}
              </Typography>
              <Button
                variant='outlined'
                onClick={fetchWithdrawals}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {t.buttons.refresh}
              </Button>
            </Box>

            {error && (
              <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : withdrawals.length === 0 ? (
              <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant='h6' color='text.secondary'>
                  {t.admin.noWithdrawals}
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} elevation={2}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>{t.admin.walletAddress}</strong></TableCell>
                      <TableCell align='right'><strong>{t.admin.amount}</strong></TableCell>
                      <TableCell align='center'><strong>Status</strong></TableCell>
                      <TableCell align='center'><strong>{t.admin.requestedAt}</strong></TableCell>
                      <TableCell align='center'><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>
                          <Typography
                            variant='body2'
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.875rem',
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {withdrawal.walletAddress}
                          </Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Chip
                            label={`${withdrawal.amount} CSPIN`}
                            color='primary'
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Chip
                            label={withdrawal.status}
                            color={
                              withdrawal.status === 'completed'
                                ? 'success'
                                : withdrawal.status === 'failed'
                                ? 'error'
                                : withdrawal.status === 'processing'
                                ? 'warning'
                                : 'default'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell align='center'>
                          <Typography variant='body2' color='text.secondary'>
                            {new Date(withdrawal.requestedAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align='center'>
                          {withdrawal.status === 'pending' && (
                            <Button
                              variant='contained'
                              color='success'
                              size='small'
                              onClick={() =>
                                handleProcessWithdrawal(
                                  withdrawal.id,
                                  withdrawal.walletAddress,
                                  withdrawal.amount
                                )
                              }
                              disabled={processing !== null}
                              startIcon={
                                processing === withdrawal.id ? (
                                  <CircularProgress size={16} />
                                ) : null
                              }
                            >
                              {processing === withdrawal.id ? 'Processing...' : t.buttons.process}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}

        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Button
            variant='text'
            onClick={() => (window.location.href = '/')}
          >
            {t.buttons.back}
          </Button>
        </Box>
      </Container>
    </>
  );
}
