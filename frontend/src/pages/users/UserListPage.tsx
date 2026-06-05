import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  MenuItem,
  Card,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/user.service';
import { User, Role } from '../../types';

export const UserListPage: React.FC = () => {
  const navigate = useNavigate();

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRows, setTotalRows] = useState<number>(0);
  
  // DataGrid Pagination, Sort and Filters states
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'createdAt', sort: 'desc' }
  ]);

  // Search/Filter inputs
  const [searchText, setSearchText] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Applied filters (passed to API call)
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  // Action status states
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch Users from API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Map sort model
      const sortBy = sortModel[0]?.field || 'createdAt';
      const sortOrder = sortModel[0]?.sort || 'desc';

      const response = await userService.list({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: filters.search || undefined,
        role: filters.role || undefined,
        sortBy,
        sortOrder,
      });

      setUsers(Array.isArray(response?.users) ? response.users : []);
      setTotalRows(response?.meta?.total ?? 0);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to retrieve system users.');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, sortModel, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaginationModel((prev) => ({ ...prev, page: 0 })); // reset to first page
    setFilters({
      search: searchText.trim(),
      role: selectedRole === 'ALL' ? '' : selectedRole,
    });
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedRole('ALL');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setFilters({
      search: '',
      role: '',
    });
  };

  // Trigger delete dialog
  const handleDeleteClick = (id: string) => {
    setDeleteUserId(id);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete API call
  const handleConfirmDelete = async () => {
    if (!deleteUserId) return;
    setDeleteLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await userService.delete(deleteUserId);
      setSuccessMsg('User successfully deleted.');
      setDeleteConfirmOpen(false);
      setDeleteUserId(null);
      // Refresh list
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete user.');
      setDeleteConfirmOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Define Columns for MUI DataGrid
  const columns = useMemo<GridColDef<User>[]>(() => [
    {
      field: 'name',
      headerName: 'Full Name',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params: any) => (
        <Typography variant="body2" sx={{ fontWeight: 600, py: 1 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'role',
      headerName: 'Role',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params: any) => {
        const role = params.value as Role;
        let color: 'error' | 'secondary' | 'primary' | 'default' = 'default';
        if (role === Role.ADMIN) color = 'error';
        else if (role === Role.STORE_OWNER) color = 'secondary';
        else if (role === Role.USER) color = 'primary';

        return (
          <Chip
            label={role}
            color={color}
            size="small"
            sx={{ fontWeight: 600, textTransform: 'capitalize' }}
          />
        );
      },
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'createdAt',
      headerName: 'Registered Date',
      flex: 1,
      minWidth: 140,
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
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: any) => {
        const user = params.row as User;
        return (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: '100%' }}>
            <IconButton
              size="small"
              color="primary"
              title="View & Edit Details"
              onClick={() => navigate(`/users/${user.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              title="Delete User"
              onClick={() => handleDeleteClick(user.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
  ], [navigate]);

  return (
    <Box sx={{ py: 1 }}>
      {/* Title & Header Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
            System Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View, search, filter, and modify global accounts registered on the platform.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => navigate('/users/create')}
          sx={{ borderRadius: 2 }}
        >
          Add New User
        </Button>
      </Box>

      {/* Status Notifications */}
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
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                label="Search Users"
                placeholder="Search by name, email, address..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                fullWidth
                size="small"
                slotProps={{
                  input: {
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                label="Role Filter"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value={Role.USER}>Regular User</MenuItem>
                <MenuItem value={Role.STORE_OWNER}>Store Owner</MenuItem>
                <MenuItem value={Role.ADMIN}>Administrator</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
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

      {/* MUI DataGrid Table Container */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
        <Box sx={{ width: '100%', height: 600 }}>
          <DataGrid
            rows={users}
            columns={columns}
            loading={loading}
            rowCount={totalRows}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
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

      {/* Delete User Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 }
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 'bold' }}>
          Confirm Delete User
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to permanently delete this user? This action cannot be undone and will remove all their ratings and associations.
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
    </Box>
  );
};

export default UserListPage;
