import React from 'react';
import { Box, Rating as MuiRating, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface StarRatingProps {
  value: number;
  readOnly?: boolean;
  onChange?: (event: React.SyntheticEvent, newValue: number | null) => void;
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  readOnly = true,
  onChange,
  showText = false,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <MuiRating
        name="star-rating-display"
        value={value}
        precision={0.1}
        readOnly={readOnly}
        onChange={onChange}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      {showText && (
        <Typography variant="body2" color="text.secondary">
          ({value.toFixed(1)})
        </Typography>
      )}
    </Box>
  );
};

export default StarRating;
