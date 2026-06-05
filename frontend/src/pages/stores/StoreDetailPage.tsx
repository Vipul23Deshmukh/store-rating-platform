import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Divider,
  Paper,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating as MuiRating,
  Alert,
  Snackbar,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import StarRating from '../../components/Common/StarRating';
import { useAuth } from '../../hooks/useAuth';
import { storeService } from '../../services/store.service';
import { ratingService } from '../../services/rating.service';
import { Store, Role } from '../../types';

// Let's extend Store type locally to include full ratings relation with user details
interface DetailStore extends Store {
  ratings: Array<{
    id: string;
    value: number;
    comment: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [store, setStore] = useState<DetailStore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState<boolean>(false);

  // Dialog rating state
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);

  // Alert/Snackbar state
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const fetchStoreDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await storeService.get(id);
      setStore(data as DetailStore);

      // Pre-fill dialog with existing rating if any
      if (data?.userRating) {
        setRatingValue(data.userRating.value);
        // Find rating details in the list to fetch comment
        const currentRating = Array.isArray((data as DetailStore)?.ratings)
          ? (data as DetailStore).ratings.find((r) => r.user?.id === user?.id)
          : undefined;
        setRatingComment(currentRating?.comment || '');
      } else {
        setRatingValue(5);
        setRatingComment('');
      }
    } catch (error) {
      console.error('Failed to load store details:', error);
      setAlertMsg('Failed to load store details.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  const handleOpenDialog = () => {
    setIsSubmitDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsSubmitDialogOpen(false);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (ratingValue < 1 || ratingValue > 5) {
      setAlertMsg('Rating value must be between 1 and 5.');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setIsSubmittingRating(true);
    try {
      await ratingService.submit({
        storeId: id,
        value: ratingValue,
        comment: ratingComment.trim() || undefined,
      });

      setAlertMsg(
        store?.userRating ? 'Rating updated successfully.' : 'Rating submitted successfully.'
      );
      setAlertSeverity('success');
      setOpenSnackbar(true);
      setIsSubmitDialogOpen(false);
      
      // Refresh details
      await fetchStoreDetails();
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Failed to submit rating. Please try again.';
      setAlertMsg(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg);
      setAlertSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!store) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>
          Store Not Found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/stores')}>
          Back to Stores
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/stores')} sx={{ mb: 3 }}>
        Back to Stores
      </Button>

      <Grid container spacing={4}>
        {/* Store Detail Info */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {store.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {store.email}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {store.address}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Overall Satisfaction Rating
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  {store.averageRating.toFixed(1)}
                </Typography>
                <Box>
                  <StarRating value={store.averageRating} />
                  <Typography variant="caption" color="text.secondary">
                    Based on {store.ratingCount} client {store.ratingCount === 1 ? 'rating' : 'ratings'}
                  </Typography>
                </Box>
              </Box>

              {user?.role === Role.USER && (
                <Box sx={{ mt: 3 }}>
                  {store.userRating ? (
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1.5, mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Your Current Rating:
                      </Typography>
                      <StarRating value={store.userRating.value} showText />
                    </Box>
                  ) : null}

                  <Button variant="contained" fullWidth onClick={handleOpenDialog}>
                    {store.userRating ? 'Modify Your Rating' : 'Submit A Rating'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Ratings Review list */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            Customer Reviews
          </Typography>

          {!Array.isArray(store?.ratings) || store.ratings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No reviews yet. Be the first to leave a review!
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {store.ratings.map((review) => (
                <Paper key={review.id} sx={{ p: 3, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {review.user.name} {review.user.id === user?.id && '(You)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <StarRating value={review.value} />
                  </Box>
                  {review.comment && (
                    <Typography variant="body2" color="text.secondary">
                      {review.comment}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Submit / Modify Rating Dialog */}
      <Dialog open={isSubmitDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleRatingSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {store.userRating ? 'Modify Your Rating' : 'Submit A Rating'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Your Rating Value:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MuiRating
                    name="store-rating-input"
                    value={ratingValue}
                    precision={1}
                    size="large"
                    onChange={(_e, newValue) => newValue && setRatingValue(newValue)}
                    emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {ratingValue} / 5
                  </Typography>
                </Box>
              </Box>

              <TextField
                label="Review Comment (Optional)"
                placeholder="Write your experience..."
                multiline
                rows={4}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                helperText={`${ratingComment.length}/500 characters`}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmittingRating}
            >
              {isSubmittingRating ? 'Saving...' : 'Submit Rating'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoreDetailPage;

