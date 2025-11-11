import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Stack, List, ListItem, ListItemIcon, ListItemText, Divider, Link } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { Translations } from '@/utils/translations';

interface HelpDialogProps {
  open: boolean;
  onClose: () => void;
  help: Translations['help'];
  closeLabel: string;
}

function NumberBullet({ index }: { index: number }) {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.85rem',
      }}
    >
      {index + 1}
    </Box>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <List dense disablePadding sx={{ pl: 0 }}>
      {items.map((item, index) => (
        <ListItem key={index} disableGutters sx={{ alignItems: 'flex-start', py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            <CheckCircleOutlineIcon color="success" fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={item}
            primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
          />
        </ListItem>
      ))}
    </List>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <List disablePadding sx={{ pl: 0 }}>
      {steps.map((step, index) => (
        <ListItem key={index} disableGutters sx={{ alignItems: 'flex-start', py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 44 }}>
            <NumberBullet index={index} />
          </ListItemIcon>
          <ListItemText
            primary={step}
            primaryTypographyProps={{ variant: 'body2', color: 'text.primary' }}
          />
        </ListItem>
      ))}
    </List>
  );
}

export function HelpDialog({ open, onClose, help, closeLabel }: HelpDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <InfoOutlinedIcon color="primary" />
        {help.title}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Typography variant="body1" color="text.secondary">
            {help.intro}
          </Typography>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {help.wallet.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {help.wallet.description}
            </Typography>
            <StepList steps={help.wallet.steps} />
            <Link
              href={help.wallet.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="primary"
              variant="body2"
              sx={{ mt: 1.5, fontWeight: 600, display: 'inline-block' }}
            >
              {help.wallet.linkText}
            </Link>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {help.token.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {help.token.description}
            </Typography>
            <Link
              href={help.token.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="primary"
              variant="body2"
              sx={{ fontWeight: 600, display: 'inline-block' }}
            >
              {help.token.linkText}
            </Link>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {help.rules.title}
            </Typography>
            <BulletList items={help.rules.items} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {help.doubleup.title}
            </Typography>
            <BulletList items={help.doubleup.items} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {help.gameplay.title}
            </Typography>
            <StepList steps={help.gameplay.steps} />
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {help.extra.title}
            </Typography>
            <BulletList items={help.extra.items} />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          {closeLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
