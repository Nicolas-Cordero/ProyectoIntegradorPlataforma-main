import { type ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';

export const detailSectionStyles = {
  paper: {
    p: { xs: 3, sm: 4 },
    borderRadius: 3,
    background: 'rgba(255, 255, 255, 0.95)',
    border: '1px solid rgba(229, 231, 235, 0.8)',
    boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
    mb: 4
  },
  tableContainer: {
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
  },
  table: {
    minWidth: 650,
    '& th, & td': {
      borderColor: 'divider',
      borderStyle: 'solid',
      borderWidth: 1,
      p: 2,
      verticalAlign: 'top'
    },
    '& th': {
      bgcolor: 'grey.100',
      color: 'text.primary',
      fontWeight: 700,
      textTransform: 'none',
      whiteSpace: 'nowrap'
    },
    '& tbody tr:nth-of-type(odd) td': {
      bgcolor: 'grey.50'
    }
  },
  sectionHeader: {
    mb: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
    flexWrap: 'wrap'
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: { xs: '1.125rem', sm: '1.25rem' }
  },
  sectionSubtitle: {
    color: 'text.secondary',
    fontSize: '0.95rem'
  }
};

interface DetailSectionWrapperProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function DetailSectionWrapper({ title, subtitle, children }: DetailSectionWrapperProps) {
  return (
    <Paper elevation={2} sx={detailSectionStyles.paper}>
      {(title || subtitle) && (
        <Box sx={detailSectionStyles.sectionHeader}>
          {title ? (
            <Typography variant="h6" component="h2" sx={detailSectionStyles.sectionTitle}>
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography variant="body2" sx={detailSectionStyles.sectionSubtitle}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      )}
      {children}
    </Paper>
  );
}
