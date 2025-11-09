# Material-UI 반응형 UI/UX 구현 계획

**작성일**: 2025-11-10  
**상태**: 📋 계획 수립 완료

---

## 📱 반응형 디자인 전략

### 1. Breakpoint 정의 (MUI 기본값 활용)

```typescript
// src/theme.ts에 추가
breakpoints: {
  values: {
    xs: 0,      // 모바일 (세로)
    sm: 600,    // 모바일 (가로) / 작은 태블릿
    md: 960,    // 태블릿
    lg: 1280,   // 데스크톱
    xl: 1920,   // 대형 모니터
  }
}
```

### 2. Container 전략

```tsx
// App.tsx
<Container 
  maxWidth="lg"  // 데스크톱: 1280px
  sx={{
    px: { xs: 2, sm: 3, md: 4 }, // 반응형 padding
    py: { xs: 1, md: 3 },
  }}
>
```

---

## 🎰 슬롯머신 컴포넌트 반응형 설계

### Phase 1: 레이아웃 구조 변경

#### Before (Tailwind)
```tsx
<div className="grid grid-cols-3 gap-4">
  {/* 고정 크기 */}
</div>
```

#### After (MUI)
```tsx
<Box
  sx={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: { xs: 1, sm: 2, md: 3 },
    maxWidth: { xs: '300px', sm: '400px', md: '500px' },
    margin: '0 auto',
  }}
>
  {/* 반응형 릴 */}
</Box>
```

### Phase 2: 릴 컴포넌트 (Reel.tsx)

```tsx
import { Box, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

const ReelCard = styled(Card)(({ theme }) => ({
  aspectRatio: '1',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '3rem',
  
  // 반응형 폰트 크기
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.up('md')]: {
    fontSize: '4rem',
  },
  
  // 애니메이션
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  },
}));

export function Reel({ symbol, isSpinning }) {
  return (
    <ReelCard 
      elevation={isSpinning ? 8 : 2}
      sx={{
        background: (theme) => 
          `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
      }}
    >
      {symbol}
    </ReelCard>
  );
}
```

### Phase 3: 베팅 컨트롤 (BettingControl.tsx)

```tsx
import { Box, ButtonGroup, Button, Chip, Stack } from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';

export function BettingControl({ betAmount, onBetChange, onSpin }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const betOptions = [10, 50, 100, 500];

  return (
    <Stack spacing={2}>
      {/* 베팅 금액 선택 */}
      <ButtonGroup 
        fullWidth
        orientation={isMobile ? 'vertical' : 'horizontal'}
        variant="contained"
        size={isMobile ? 'small' : isTablet ? 'medium' : 'large'}
      >
        {betOptions.map((amount) => (
          <Button
            key={amount}
            onClick={() => onBetChange(amount)}
            variant={betAmount === amount ? 'contained' : 'outlined'}
            color={betAmount === amount ? 'primary' : 'inherit'}
          >
            {amount} CSPIN
          </Button>
        ))}
      </ButtonGroup>

      {/* 스핀 버튼 */}
      <Button
        variant="contained"
        color="success"
        size={isMobile ? 'large' : 'large'}
        fullWidth
        onClick={onSpin}
        sx={{
          py: { xs: 1.5, md: 2 },
          fontSize: { xs: '1rem', md: '1.25rem' },
        }}
      >
        🎰 스핀 시작
      </Button>
    </Stack>
  );
}
```

---

## 💰 입금/출금 모달 반응형

### Deposit.tsx (Material-UI 버전)

```tsx
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';

export function Deposit({ walletAddress, onSuccess }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm')); // 모바일은 전체화면

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen} // 📱 모바일: 전체화면
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 }, // 모바일: 둥근 모서리 제거
          m: { xs: 0, sm: 2 },
        }
      }}
    >
      <DialogTitle>
        💰 CSPIN 입금
      </DialogTitle>
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="금액 (CSPIN)"
          type="number"
          fullWidth
          variant="outlined"
          size={fullScreen ? 'medium' : 'small'}
          InputProps={{
            inputProps: { 
              min: 10, 
              step: 10,
            }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleDeposit}>
          입금하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 📊 대시보드 레이아웃

### Grid System 활용

```tsx
import { Grid, Card, CardContent, Typography } from '@mui/material';

export function Dashboard() {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {/* 크레딧 정보 */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6">현재 크레딧</Typography>
            <Typography variant="h4">1,234 CSPIN</Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* 슬롯머신 */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <SlotMachineV2 />
          </CardContent>
        </Card>
      </Grid>

      {/* 버튼 그룹 */}
      <Grid item xs={12} sm={6}>
        <Button fullWidth variant="contained" color="primary">
          입금
        </Button>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Button fullWidth variant="outlined" color="secondary">
          출금
        </Button>
      </Grid>
    </Grid>
  );
}
```

---

## 🎨 Theme 커스터마이징

### 슬롯머신 전용 테마

```typescript
// src/theme.ts
export const slotTheme = createTheme({
  palette: {
    mode: 'dark', // 슬롯머신은 어두운 테마
    primary: {
      main: '#FFD700', // 금색
    },
    secondary: {
      main: '#FF1493', // 핑크
    },
    background: {
      default: '#0f0c29',
      paper: '#1a1a2e',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        },
      },
    },
  },
});
```

---

## 📐 반응형 Hook 활용

### useResponsive.ts

```typescript
import { useTheme, useMediaQuery } from '@mui/material';

export function useResponsive() {
  const theme = useTheme();

  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isLargeScreen: useMediaQuery(theme.breakpoints.up('lg')),
  };
}

// 사용 예시
function MyComponent() {
  const { isMobile, isDesktop } = useResponsive();

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {isMobile ? <MobileView /> : <DesktopView />}
    </Box>
  );
}
```

---

## 🚀 구현 우선순위

### Phase 1 (긴급) - 핵심 컴포넌트
1. ✅ Theme 설정 완료
2. ⏳ SlotMachine → Material-UI 전환
3. ⏳ Deposit/Withdraw 모달 → Dialog 전환
4. ⏳ BettingControl → MUI Buttons 전환

### Phase 2 - 레이아웃 개선
1. Grid System 적용
2. Container/Box 반응형 설정
3. Typography 체계 정리

### Phase 3 - UX 향상
1. Skeleton 로딩
2. Snackbar 알림
3. Tooltip 가이드
4. Animation 개선

---

## 📱 테스트 체크리스트

### 모바일 (< 600px)
- [ ] 전체화면 모달
- [ ] 세로 버튼 배치
- [ ] 터치 영역 충분 (최소 48px)
- [ ] 스와이프 제스처

### 태블릿 (600px ~ 960px)
- [ ] 2열 Grid
- [ ] 중간 크기 버튼
- [ ] 가로 모드 최적화

### 데스크톱 (> 960px)
- [ ] 3열 Grid
- [ ] Hover 효과
- [ ] 키보드 단축키
- [ ] 마우스 인터랙션

---

## 🔧 개발 도구

### VSCode Extensions
- ES7+ React/Redux snippets
- Material-UI snippets
- Tailwind CSS IntelliSense (공존 가능)

### Chrome DevTools
- Device Toolbar (Cmd+Shift+M)
- Responsive 모드
- Network throttling

---

## 📚 참고 자료

- [MUI 반응형 가이드](https://mui.com/material-ui/guides/responsive-ui/)
- [MUI Grid System](https://mui.com/material-ui/react-grid/)
- [MUI Breakpoints](https://mui.com/material-ui/customization/breakpoints/)
- [Google Material Design 3](https://m3.material.io/)

---

**다음 단계**: SlotMachineV2를 Material-UI로 마이그레이션
