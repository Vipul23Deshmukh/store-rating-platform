import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import StarRating from '../../components/Common/StarRating';
import { ownerService, OwnerStats, OwnerRatingItem } from '../../services/owner.service';

type SortableField = 'userName' | 'userEmail' | 'storeName' | 'value' | 'createdAt';

export const OwnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Metrics states
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  // Ratings DataGrid states
  const [ratings, setRatings] = useState<OwnerRatingItem[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState<boolean>(true);
  const [totalRows, setTotalRows] = useState<number>(0);
  
  // DataGrid Pagination and Sort states
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' }
  ]);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Stats API Call
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setErrorMsg(null);
    try {
      const data = await ownerService.getStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load owner stats:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load dashboard statistics.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Reviews/Ratings API Call
  const fetchRatings = useCallback(async () => {
    setRatingsLoading(true);
    try {
      const sortBy = (sortModel[0]?.field as SortableField) || 'createdAt';
      const sortOrder = sortModel[0]?.sort || 'desc';

      const response = await ownerService.getRatings({
        page: paginationModel.page + 1, // API is 1-indexed
        limit: paginationModel.pageSize,
        sortBy,
        sortOrder,
      });

      setRatings(Array.isArray(response?.ratings) ? response.ratings : []);
      setTotalRows(response?.meta?.total ?? 0);
    } catch (err) {
      console.error('Failed to load owner ratings:', err);
      setRatings([]);
      setTotalRows(0);
    } finally {
      setRatingsLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, sortModel]);

  // Load everything
  const handleRefresh = () => {
    fetchStats();
    fetchRatings();
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const handlePaginationModelChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel((prev) => (
      prev.page === model.page && prev.pageSize === model.pageSize ? prev : model
    ));
  }, []);

  const handleSortModelChange = useCallback((model: GridSortModel) => {
    setSortModel((prev) => {
      const prevSort = prev[0];
      const nextSort = model[0];
      if (prevSort?.field === nextSort?.field && prevSort?.sort === nextSort?.sort) {
        return prev;
      }
      return model;
    });
  }, []);

  const columns = useMemo<GridColDef<OwnerRatingItem>[]>(() => {
    return [
      {
        field: 'userName',
        headerName: 'User Name',
        flex: 1,
        minWidth: 140,
        valueGetter: (_value, row) => row?.user?.name ?? 'Unknown user',
        renderCell: (params: any) => (
          <Typography variant="body2" sx={{ fontWeight: 600, py: 1 }}>
            {params.value ?? 'Unknown user'}
          </Typography>
        ),
      },
      {
        field: 'userEmail',
        headerName: 'User Email',
        flex: 1.2,
        minWidth: 180,
        valueGetter: (_value, row) => row?.user?.email ?? '',
      },
      {
        field: 'storeName',
        headerName: 'Store Name',
        flex: 1,
        minWidth: 150,
        valueGetter: (_value, row) => row?.store?.name ?? 'Unknown store',
      },
      {
        field: 'value',
        headerName: 'Rating',
        flex: 0.9,
        minWidth: 140,
        renderCell: (params: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <StarRating value={typeof params.value === 'number' ? params.value : 0} showText />
          </Box>
        ),
      },
      {
        field: 'createdAt',
        headerName: 'Date Submitted',
        flex: 0.9,
        minWidth: 130,
        valueFormatter: (value: any) => {
          if (!value) return '';
          return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        },
      },
      {
        field: 'comment',
        headerName: 'Customer Feedback',
        flex: 1.5,
        minWidth: 220,
        renderCell: (params: any) => {
          const comment = params.value;
          if (!comment) {
            return (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', py: 1 }}>
                No comment left
              </Typography>
            );
          }
          return (
            <Typography variant="body2" sx={{ py: 1, whiteSpace: 'normal', wordBreak: 'break-word' }}>
              {comment}
            </Typography>
          );
        },
      },
    ];
  }, []);

  return (
    <Box sx={{ py: 1 }}>
      {/* Title section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Store Owner Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your registered business stores and monitor your customer reviews in real-time.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton onClick={handleRefresh} disabled={statsLoading || ratingsLoading} color="primary" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<StorefrontIcon />}
            onClick={() => navigate('/stores')}
            sx={{ borderRadius: 2 }}
          >
            Manage Stores
          </Button>
        </Box>
      </Box>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Stats row */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {/* Total Stores */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    My Stores
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {stats?.totalStores ?? 0}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <StorefrontIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Rating */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Average Rating
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'warning.main' }}>
                      {stats?.averageRating !== undefined ? stats.averageRating.toFixed(2) : '0.00'}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <StarIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Ratings Received */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                    Total Ratings Received
                  </Typography>
                  {statsLoading ? (
                    <CircularProgress size={28} sx={{ mt: 1 }} />
                  ) : (
                    <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      {stats?.totalRatings ?? 0}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText', p: 1.5, borderRadius: 3, display: 'flex' }}>
                  <RateReviewIcon sx={{ fontSize: 32 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ratings DataGrid section */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, letterSpacing: '-0.01em' }}>
        Customer Feedback & Reviews
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <Box sx={{ width: '100%', height: 500 }}>
          <DataGrid
            rows={ratings}
            columns={columns}
            loading={ratingsLoading}
            rowCount={totalRows}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            pageSizeOptions={[5, 10, 20, 50]}
            getRowHeight={() => 'auto'}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontWeight: 700,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                py: 1.5,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          />
        </Box>
      </Card>

      {/* Direct navigation actions */}
      <Paper sx={{ p: 3, mt: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} variant="outlined">
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Want to register a new establishment?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Owners can create and register their new businesses under the Stores tab.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/stores')}
          sx={{ borderRadius: 2 }}
        >
          View Registered Stores
        </Button>
      </Paper>
    </Box>
  );
};

export default OwnerDashboard;
