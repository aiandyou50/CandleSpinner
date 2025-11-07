import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Container, Box, Typography, Card, CardContent, Button, Chip, CircularProgress, Paper } from '@mui/material';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useCredit } from '@/hooks/useCredit';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { theme } from '@/theme';

function Deposit({ walletAddress, onSuccess }: { walletAddress: string; onSuccess: () => void }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant='h6' gutterBottom>입금 (재작성 예정)</Typography>
        <Typography variant='body2' color='text.secondary'>Deposit 컴포넌트가 곧 Material-UI로 재작성됩니다.</Typography>
      </CardContent>
    </Card>
  );
}

function Withdraw({ walletAddress, currentCredit, onSuccess }: { walletAddress: string; currentCredit: number; onSuccess: () => void }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant='h6' gutterBottom>출금 (재작성 예정)</Typography>
        <Typography variant='body2' color='text.secondary'>Withdraw 컴포넌트가 곧 Material-UI로 재작성됩니다.</Typography>
      </CardContent>
    </Card>
  );
}

function SlotMachine({ walletAddress, currentCredit, onSuccess }: { walletAddress: string; currentCredit: number; onSuccess: () => void }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant='h6' gutterBottom>슬롯머신 V1 (재작성 예정)</Typography>
        <Typography variant='body2' color='text.secondary'>SlotMachine 컴포넌트가 곧 Material-UI로 재작성됩니다.</Typography>
      </CardContent>
    </Card>
  );
}

function SlotMachineV2({ walletAddress, currentCredit, onCreditChange }: { walletAddress: string; currentCredit: number; onCreditChange: () => void }) {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant='h6' gutterBottom>슬롯머신 V2 (재작성 예정)</Typography>
        <Typography variant='body2' color='text.secondary'>SlotMachineV2 컴포넌트가 곧 Material-UI로 재작성됩니다.</Typography>
      </CardContent>
    </Card>
  );
}

function AdminWithdrawals() {
  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>관리자 페이지 (재작성 예정)</Typography>
      <Typography variant='body1' color='text.secondary'>AdminWithdrawals 컴포넌트가 곧 Material-UI로 재작성됩니다.</Typography>
    </Container>
  );
}

function GamePage() {
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);
  const { t } = useLanguage();

  return (
    <>
      <AppBar position='static' elevation={1}>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>🕯️ {t.app.title}</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <LanguageSelector />
            <TonConnectButton />
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {isConnected && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>{t.header.credit}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {isLoading ? <CircularProgress size={24} /> : <Typography variant='h3' component='div' fontWeight='bold'>{credit}</Typography>}
              <Chip label='CSPIN' color='primary' />
            </Box>
          </Paper>
        )}
        {isConnected && walletAddress ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Deposit walletAddress={walletAddress} onSuccess={refreshCredit} />
              <Withdraw walletAddress={walletAddress} currentCredit={credit} onSuccess={refreshCredit} />
            </Box>
            <SlotMachine walletAddress={walletAddress} currentCredit={credit} onSuccess={refreshCredit} />
            <Box sx={{ textAlign: 'center' }}>
              <Button component={RouterLink} to='/slot-v2' variant='contained' color='secondary' size='large' sx={{ px: 4, py: 1.5 }}>🎰 {t.game.newVersion}</Button>
            </Box>
          </Box>
        ) : (
          <Card elevation={2}><CardContent sx={{ textAlign: 'center', py: 6 }}><Typography variant='h5' color='text.secondary'>{t.wallet.connectPrompt}</Typography></CardContent></Card>
        )}
        <Box sx={{ mt: 6, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>{t.app.footer}</Typography></Box>
      </Container>
    </>
  );
}

function SlotV2Page() {
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);
  const { t } = useLanguage();

  return (
    <>
      <AppBar position='static' elevation={1}>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>🎰 {t.game.title} V2</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <LanguageSelector />
            <TonConnectButton />
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {isConnected && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary' gutterBottom>{t.header.credit}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {isLoading ? <CircularProgress size={24} /> : <Typography variant='h3' component='div' fontWeight='bold'>{credit}</Typography>}
              <Chip label='CSPIN' color='primary' />
            </Box>
          </Paper>
        )}
        {isConnected && walletAddress ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Deposit walletAddress={walletAddress} onSuccess={refreshCredit} />
              <Withdraw walletAddress={walletAddress} currentCredit={credit} onSuccess={refreshCredit} />
            </Box>
            <SlotMachineV2 walletAddress={walletAddress} currentCredit={credit} onCreditChange={refreshCredit} />
            <Box sx={{ textAlign: 'center' }}>
              <Button component={RouterLink} to='/' variant='text' color='primary'>{t.game.oldVersion}</Button>
            </Box>
          </Box>
        ) : (
          <Card elevation={2}><CardContent sx={{ textAlign: 'center', py: 6 }}><Typography variant='h5' color='text.secondary'>{t.wallet.connectPrompt}</Typography></CardContent></Card>
        )}
        <Box sx={{ mt: 6, textAlign: 'center' }}><Typography variant='body2' color='text.secondary'>{t.game.title} V2 - {t.game.subtitle}</Typography></Box>
      </Container>
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<GamePage />} />
          <Route path='/slot-v2' element={<SlotV2Page />} />
          <Route path='/admin' element={<AdminWithdrawals />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
