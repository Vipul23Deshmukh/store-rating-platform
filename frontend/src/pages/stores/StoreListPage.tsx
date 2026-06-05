import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  TextField,
  Grid,
  Pagination,
  CircularProgress,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Rating as MuiRating,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import StarRating from '../../components/Common/StarRating';
import { Store } from '../../types';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../../services/store.service';
import { ratingService } from '../../services/rating.service';
import { usePermission } from '../../hooks/usePermission';

export const StoreListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, isStoreOwner, isUser } = usePermission();
  const admin = isAdmin();
  const storeOwner = isStoreOwner();
  const userRole = isUser();

  // Shared Data States
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRows, setTotalRows] = useState<number>(0);
  
  // Card Pagination State (1-indexed for MUI Pagination component - used for non-Grid fallback if needed, but we default to DataGrid for User/Admin)
  const [cardPage, setCardPage] = useState<number>(1);
  const [cardTotalPages, setCardTotalPages] = useState<number>(1);

  // DataGrid Pagination and Sort States (0-indexed page for MUI DataGrid)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'name', sort: 'asc' }
  ]);

  // Search/Filter Inputs
  const [searchName, setSearchName] = useState<string>('');
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    address: '',
    search: '',
  });

  // Action status states (Store deletion)
  const [deleteStoreId, setDeleteStoreId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Rating submission dialog states
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [ratingStoreId, setRatingStoreId] = useState<string>('');
  const [ratingStoreName, setRatingStoreName] = useState<string>('');
  const [ratingValue, setRatingValue] = useState<number | null>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [ratingSubmitLoading, setRatingSubmitLoading] = useState(false);

  // Global Alerts
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Stores callback
  const fetchStores = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const isGrid = admin || userRole || storeOwner;
      const page = isGrid ? paginationModel.page + 1 : cardPage;
      const limit = isGrid ? paginationModel.pageSize : 6;
      const sortBy = sortModel[0]?.field || 'name';
      const sortOrder = sortModel[0]?.sort || 'asc';

      const response = await storeService.list({
        page,
        limit,
        name: appliedFilters.name || undefined,
        address: appliedFilters.address || undefined,
        search: appliedFilters.search || undefined,
        sortBy,
        sortOrder,
      });

      setStores(Array.isArray(response?.stores) ? response.stores : []);
      setTotalRows(response?.meta?.total ?? 0);
      if (!isGrid) {
        setCardTotalPages(response?.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      console.error('Failed to load stores:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to retrieve stores.');
    } finally {
      setLoading(false);
    }
  }, [admin, userRole, storeOwner, cardPage, paginationModel.page, paginationModel.pageSize, sortModel, appliedFilters]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCardPage(1);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setAppliedFilters({
      name: searchName.trim(),
      address: searchAddress.trim(),
      search: globalSearch.trim(),
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchName('');
    setSearchAddress('');
    setGlobalSearch('');
    setCardPage(1);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setAppliedFilters({
      name: '',
      address: '',
      search: '',
    });
  };

  // Page change for Cards layout
  const handleCardPageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCardPage(value);
  };

  // Trigger delete store dialog
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

  const handleDeleteClick = useCallback((id: string) => {
    setDeleteStoreId(id);
    setDeleteConfirmOpen(true);
  }, []);

  // Confirm delete store API call
  const handleConfirmDelete = async () => {
    if (!deleteStoreId) return;
    setDeleteLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await storeService.delete(deleteStoreId);
      setSuccessMsg('Store successfully deleted.');
      setDeleteConfirmOpen(false);
      setDeleteStoreId(null);
      fetchStores();
    } catch (err: any) {
      console.error('Failed to delete store:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete store.');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open rating submission modal
  const handleOpenRatingDialog = useCallback((store: Store) => {
    setRatingStoreId(store.id);
    setRatingStoreName(store.name);
    if (store.userRating) {
      // Pre-populate rating if already submitted
      setRatingValue(store.userRating.value);
      setRatingComment(store.userRating.comment || '');
    } else {
      // Default new rating
      setRatingValue(5);
      setRatingComment('');
    }
    setRatingDialogOpen(true);
  }, []);

  // Submit Rating API call (Upsert)
  const handleRatingSubmit = async () => {
    if (!ratingStoreId || ratingValue === null) return;
    setRatingSubmitLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await ratingService.submit({
        storeId: ratingStoreId,
        value: ratingValue,
        comment: ratingComment.trim() || undefined,
      });
      setSuccessMsg(`Rating for "${ratingStoreName}" submitted successfully!`);
      setRatingDialogOpen(false);
      fetchStores(); // Refresh grid to update ratings
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingSubmitLoading(false);
    }
  };

  // Define Columns for MUI DataGrid based on Role
  const columns = useMemo<GridColDef<Store>[]>(() => {
    const baseCols: GridColDef<Store>[] = [
      {
        field: 'name',
        headerName: 'Store Name',
        flex: 1.2,
        minWidth: 150,
        renderCell: (params: any) => (
          <Typography variant="body2" sx={{ fontWeight: 600, py: 1 }}>
            {params.value}
          </Typography>
        ),
      },
      {
        field: 'address',
        headerName: 'Address',
        flex: 1.5,
        minWidth: 200,
      },
      {
        field: 'averageRating',
        headerName: 'Average Rating',
        flex: 1,
        minWidth: 150,
        sortable: false,
        renderCell: (params: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <StarRating value={params.value} showText />
          </Box>
        ),
      },
    ];

    if (userRole) {
      // Regular user sees their own rating column and rating action button
      return [
        ...baseCols,
        {
          field: 'userRating',
          headerName: 'My Rating',
          flex: 1,
          minWidth: 150,
          renderCell: (params: any) => {
            const userRating = params.value;
            if (!userRating) {
              return (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', py: 1 }}>
                  Not rated yet
                </Typography>
              );
            }
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <StarRating value={userRating.value} showText />
              </Box>
            );
          },
        },
        {
          field: 'actions',
          headerName: 'Actions',
          flex: 1,
          minWidth: 180,
          sortable: false,
          renderCell: (params: any) => {
            const store = params.row as Store;
            const hasRated = !!store.userRating;
            return (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                <Button
                  size="small"
                  variant={hasRated ? 'outlined' : 'contained'}
                  color={hasRated ? 'secondary' : 'primary'}
                  startIcon={<RateReviewIcon />}
                  onClick={() => handleOpenRatingDialog(store)}
                  sx={{ py: 0.5, px: 1.5, borderRadius: 1.5 }}
                >
                  {hasRated ? 'Edit Rating' : 'Submit Rating'}
                </Button>
                <IconButton
                  size="small"
                  color="default"
                  title="View Store Details"
                  onClick={() => navigate(`/stores/${store.id}`)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          },
        },
      ];
    }

    if (admin) {
      // Admin sees email, ratings count, date, and admin actions (Delete, View)
      return [
        ...baseCols,
        {
          field: 'email',
          headerName: 'Store Email',
          flex: 1,
          minWidth: 180,
        },
        {
          field: 'ratingCount',
          headerName: 'Ratings Count',
          type: 'number',
          flex: 0.7,
          minWidth: 100,
          sortable: false,
          headerAlign: 'left',
          align: 'left',
        },
        {
          field: 'createdAt',
          headerName: 'Registered On',
          flex: 0.9,
          minWidth: 130,
          valueFormatter: (value: any) => {
            if (!value) return '';
            return new Date(value).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          },
        },
        {
          field: 'actions',
          headerName: 'Actions',
          flex: 0.8,
          minWidth: 120,
          sortable: false,
          renderCell: (params: any) => {
            const store = params.row as Store;
            return (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
                <IconButton
                  size="small"
                  color="primary"
                  title="View Store Details"
                  onClick={() => navigate(`/stores/${store.id}`)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  title="Delete Store"
                  onClick={() => handleDeleteClick(store.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          },
        },
      ];
    }

    // Fallback/Store Owner view: Details only
    return [
      ...baseCols,
      {
        field: 'email',
        headerName: 'Store Email',
        flex: 1,
        minWidth: 180,
      },
      {
        field: 'ratingCount',
        headerName: 'Ratings Count',
        type: 'number',
        flex: 0.7,
        minWidth: 100,
        sortable: false,
        headerAlign: 'left',
        align: 'left',
      },
      {
        field: 'actions',
        headerName: 'Actions',
        flex: 0.6,
        minWidth: 80,
        sortable: false,
        renderCell: (params: any) => {
          const store = params.row as Store;
          return (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
              <IconButton
                size="small"
                color="primary"
                title="View Store Details"
                onClick={() => navigate(`/stores/${store.id}`)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        },
      },
    ];
  }, [admin, userRole, handleOpenRatingDialog, handleDeleteClick, navigate]);

  const showGrid = admin || userRole || storeOwner;

  return (
    <Box sx={{ py: 1 }}>
      {/* Title & Header Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            Registered Stores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {admin
              ? `Manage system stores, monitor reviews, and configure locations (${totalRows} total)`
              : `Browse satisfied local businesses, view satisfaction rates, and review them (${totalRows} total)`}
          </Typography>
        </Box>
        {(admin || storeOwner) && (
          <Button
            variant="contained"
            startIcon={<AddHomeWorkIcon />}
            onClick={() => navigate('/stores/create')}
            sx={{ borderRadius: 2 }}
          >
            Register Store
          </Button>
        )}
      </Box>

      {/* Notifications */}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {/* Filter and Search Bar Card */}
      <Card sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Store Name"
                placeholder="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                label="Store Address"
                placeholder="Search by address"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Global Search"
                placeholder="Name, email, or address"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClearFilters}
                startIcon={<ClearIcon />}
                fullWidth
              >
                Clear
              </Button>
              <Button
                variant="contained"
                type="submit"
                startIcon={<SearchIcon />}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Main Content Layout */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : stores.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 8, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No stores found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search filters or clearing them to browse all stores.
          </Typography>
        </Box>
      ) : showGrid ? (
        /* GRID VIEW: Render DataGrid Table for Admin, User and Owner roles */
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
          <Box sx={{ width: '100%', height: 600 }}>
            <DataGrid
              rows={stores}
              columns={columns}
              loading={loading}
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
                  py: 1,
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            />
          </Box>
        </Card>
      ) : (
        /* FALLBACK CARD VIEW */
        <>
          <Grid container spacing={3}>
            {stores.map((store) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={store.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, minHeight: '3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {store.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '2.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {store.address}
                    </Typography>

                    <Divider sx={{ my: 1.5 }} />

                    {/* Ratings */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Overall Rating:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarRating value={store.averageRating} showText />
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Your Rating:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {store.userRating ? (
                            <StarRating value={store.userRating.value} showText />
                          ) : (
                            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                              Not rated yet
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate(`/stores/${store.id}`)}
                      sx={{ borderRadius: 2 }}
                    >
                      View Store Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Card Pagination */}
          {cardTotalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Pagination
                count={cardTotalPages}
                page={cardPage}
                onChange={handleCardPageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* ADMIN ONLY: Delete Store Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-store-title"
        aria-describedby="delete-store-description"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 }
          }
        }}
      >
        <DialogTitle id="delete-store-title" sx={{ fontWeight: 'bold' }}>
          Confirm Delete Store
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-store-description">
            Are you sure you want to permanently delete this store? This action cannot be undone and will delete all reviews associated with this store.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : null}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* USER ONLY: Submit / Edit Rating Dialog Modal */}
      <Dialog
        open={ratingDialogOpen}
        onClose={() => setRatingDialogOpen(false)}
        aria-labelledby="rate-store-title"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 2, width: '100%', maxWidth: 500 }
          }
        }}
      >
        <DialogTitle id="rate-store-title" sx={{ fontWeight: 'bold', pb: 1 }}>
          Rate: {ratingStoreName}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Share your feedback regarding your experience with this establishment. Subsequent ratings will overwrite your existing submission.
          </DialogContentText>
          
          {/* Star selector */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              Your Star Rating
            </Typography>
            <MuiRating
              name="store-rating-stars"
              value={ratingValue}
              onChange={(_event, newValue) => {
                setRatingValue(newValue);
              }}
              size="large"
              emptyIcon={<StarIcon style={{ opacity: 0.4 }} fontSize="inherit" />}
            />
          </Box>

          {/* Feedback comment */}
          <TextField
            label="Write a Review (Optional)"
            placeholder="Describe your service, experience, or notes..."
            multiline
            rows={4}
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 1, gap: 1 }}>
          <Button onClick={() => setRatingDialogOpen(false)} color="inherit" disabled={ratingSubmitLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRatingSubmit}
            color="primary"
            variant="contained"
            disabled={ratingSubmitLoading || ratingValue === null}
            startIcon={ratingSubmitLoading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {ratingSubmitLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreListPage;
