import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useCredit } from '@/hooks/useCredit';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Deposit } from '@/components/Deposit';
import { Withdraw } from '@/components/Withdraw';
import { SlotMachineV2 } from '@/features/slot/components/SlotMachineV2';
import { AdminWithdrawals } from '@/app/AdminWithdrawals';
import { theme } from '@/theme';

import MenuIcon from '@mui/icons-material/Menu';
import CasinoIcon from '@mui/icons-material/Casino';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import { HelpDialog } from '@/components/HelpDialog';

function GamePage() {
  const { isConnected, walletAddress } = useTonConnect();
  const { credit, isLoading, refreshCredit } = useCredit(walletAddress);
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleScrollToSlot = () => {
    const anchor = document.getElementById('slot-section');
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  const handleOpenHelp = () => {
    setIsHelpOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <AppBar position='static' elevation={1}>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            aria-label='open navigation menu'
            onClick={() => setIsMenuOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            🎰 CandleSpinner - {t.game.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              color='inherit'
              onClick={() => setIsHelpOpen(true)}
              sx={{ display: { xs: 'none', md: 'inline-flex' } }}
            >
              {t.help.nav.help}
            </Button>
            <LanguageSelector disabled={isMenuOpen} />
            <TonConnectButton />
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor='left' open={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }} role='presentation'>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
            <Typography variant='subtitle1' fontWeight={700}>
              CandleSpinner
            </Typography>
            <IconButton aria-label='close navigation menu' onClick={() => setIsMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            <ListItemButton onClick={handleScrollToSlot}>
              <ListItemIcon>
                <CasinoIcon color='primary' />
              </ListItemIcon>
              <ListItemText primary={t.help.nav.slot} />
            </ListItemButton>
            <ListItemButton onClick={handleOpenHelp}>
              <ListItemIcon>
                <HelpOutlineIcon color='primary' />
              </ListItemIcon>
              <ListItemText primary={t.help.nav.help} />
            </ListItemButton>
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ px: 2, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant='caption' color='text.secondary'>
              {t.footer.copyright} © 2025 aiandyou50
            </Typography>
          </Box>
        </Box>
      </Drawer>
  <HelpDialog open={isHelpOpen} onClose={() => setIsHelpOpen(false)} help={t.help} closeLabel={t.buttons.close} />
      <Container maxWidth='lg' sx={{ py: 4 }}>
        {isConnected && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, textAlign: 'center' }}>
            <Typography variant='h6' color='text.secondary' gutterBottom sx={{ fontWeight: 600 }}>
              {t.header.credit}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              {isLoading ? (
                <CircularProgress size={32} />
              ) : (
                <Typography variant='h2' component='div' fontWeight='bold' sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } }}>
                  {credit}
                </Typography>
              )}
              <Chip label='CSPIN' color='primary' size='medium' />
            </Box>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
              * {t.deposit.title} → {t.header.credit} → {t.withdraw.title}
            </Typography>
          </Paper>
        )}
        {isConnected && walletAddress ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Deposit walletAddress={walletAddress} onSuccess={refreshCredit} />
              <Withdraw walletAddress={walletAddress} currentCredit={credit} onSuccess={refreshCredit} />
            </Box>
            <Box id='slot-section'>
              <SlotMachineV2 walletAddress={walletAddress} currentCredit={credit} onCreditChange={refreshCredit} />
            </Box>
          </Box>
        ) : (
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant='h5' color='text.secondary'>
                {t.wallet.connectPrompt}
              </Typography>
            </CardContent>
          </Card>
        )}
        <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <a
              href='https://github.com/aiandyou50/CandleSpinner'
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a
              href='https://www.instagram.com/aiandyou50/'
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
          </Box>
          <Typography variant='body2' color='text.secondary'>
            {t.footer.copyright} © 2025 aiandyou50. {t.footer.allRights}.
          </Typography>
        </Box>
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
          <Route path='/admin' element={<AdminWithdrawals />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
