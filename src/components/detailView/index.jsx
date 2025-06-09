import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

// A small helper component for displaying a key-value pair.
const DetailItem = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
      {value}
    </Typography>
  </Box>
);

/**
 * A component to display the detailed properties of a selected dataset record.
 * @param {object} record - The 'feature' object from the fetched GeoJSON item.
 * @param {function} onClose - A function to call when the close button is clicked.
 */
export function RecordDetailView({ record, onClose }) {
  // If no record is provided, the component renders nothing.
  if (!record) {
    return null;
  }

  // Destructure the properties from the record for easy access.
  const { properties } = record;

  return (
    <Paper 
      elevation={4} 
      sx={{ 
        mt: 2, // Margin-top to create space from the paper above
        borderRadius: 2 
      }}
    >
      <Box sx={{ p: 2, position: 'relative' }}>
        {/* Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Typography variant="h6" gutterBottom>
          Record Details
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          ID: {record.id}
        </Typography>
        <Divider />

        {/* Details Section */}
        <Stack spacing={2} sx={{ mt: 2 }}>
          <DetailItem label="Site Name" value={properties.local_site_name || 'N/A'} />
          <DetailItem label="Location" value={`${properties.city}, ${properties.state}`} />
          <DetailItem label="Address" value={properties.site_address || 'N/A'} />
          <DetailItem label="Coordinates" value={`${Number(properties.latitude).toFixed(4)}, ${Number(properties.longitude).toFixed(4)}`} />
        </Stack>
      </Box>
    </Paper>
  );
}
