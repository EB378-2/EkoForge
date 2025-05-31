"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  Search,
  Warning,
  Edit,
  CheckCircle,
  Close,
  Person,
  Refresh,
} from "@mui/icons-material";
import { useTable, useUpdate, useMany } from "@refinedev/core";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useModal } from "@refinedev/core";
import { ProfileEmail, ProfileName, ProfilePhone } from "@components/functions/FetchFunctions";
import { format } from "date-fns";

const IncidentsAdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showReporterDetails, setShowReporterDetails] = useState(false);
  const { mutate: updateReport } = useUpdate();
  const [isEditingComments, setIsEditingComments] = useState(false);
  const [editedComments, setEditedComments] = useState("");
  const [isSavingComments, setIsSavingComments] = useState(false);

  // Table hook with filtering
  const {
    tableQueryResult,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    sorters,
    setSorters,
  } = useTable({
    resource: "sms",
    pagination: {
      current: 1,
      pageSize: 10,
    },
    filters: {
      initial: [],
    },
  });

  // Reporter details modal
  const { visible, show, close } = useModal();

  const reports = tableQueryResult.data?.data || [];
  const total = tableQueryResult.data?.total || 0;
  const isLoading = tableQueryResult.isLoading || tableQueryResult.isFetching;

  // Status update handler
  const handleStatusUpdate = (id: string, newStatus: string) => {
    updateReport(
      {
        resource: "sms",
        id,
        values: {
          status: newStatus,
          ...(newStatus === "resolved" && { resolved_at: new Date().toISOString() }),
        },
      },
      {
        onSuccess: () => {
          tableQueryResult.refetch();
        },
      }
    );
  };

  // Filter handler
  const applyFilters = () => {
    setFilters([
      {
        field: "status",
        operator: "eq",
        value: statusFilter === "all" ? undefined : statusFilter,
      },
      {
        field: "title",
        operator: "contains",
        value: searchTerm,
      },
    ]);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setFilters([]);
  };

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "warning";
      case "in-progress":
        return "info";
      case "resolved":
        return "success";
      default:
        return "default";
    }
  };

  // Severity color mapping
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "#4caf50";
      case "medium":
        return "#ff9800";
      case "high":
        return "#f44336";
      case "critical":
        return "#d32f2f";
      default:
        return "#9e9e9e";
    }
  };

  // Table columns
  const columns: GridColDef[] = [
    {
      field: "severity",
      headerName: "Severity",
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Avatar
            sx={{
              bgcolor: getSeverityColor(params.value),
              width: 32,
              height: 32,
            }}
          >
            <Warning fontSize="small" />
          </Avatar>
        </Tooltip>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value.replace("-", " ")}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: "reported_by",
      headerName: "Reported By",
      width: 180,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <ProfileName profileId={params.value} />
          <Tooltip title="View reporter details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReport(params.row);
                show();
              }}
            >
              <Person fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    {
      field: "created_at",
      headerName: "Reported At",
      width: 180,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Date(params.value), "dd MMM yyyy, HH:mm")}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={() => {
              setSelectedReport(params.row);
              setShowReporterDetails(true);
              console.log("Edit report:", params.row.id);
            }}
          >
            Edit
          </Button>
          {params.row.status !== "resolved" && (
            <Button
              variant="contained"
              size="small"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleStatusUpdate(params.row.id, "resolved")}
            >
              Resolve
            </Button>
          )}
          {params.row.status === "resolved" && (
            <Button
              variant="outlined"
              size="small"
              color="warning"
              onClick={() => handleStatusUpdate(params.row.id, "open")}
            >
              Re-open
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  // Reporter details modal
  const renderReporterDetails = () => (
    <Dialog open={showReporterDetails}  maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Reporter Details</Typography>
          <IconButton onClick={() => setShowReporterDetails(false)}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {selectedReport && (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600}>
                Report Details
              </Typography>
              <Typography variant="body1">{selectedReport.title}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Reporter Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Full Name</Typography>
              <Typography variant="body1">
                <ProfileName profileId={selectedReport.reported_by} />
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Role</Typography>
              <Typography variant="body1">
                {/* Replace with actual role data */}
                Pilot
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Contact Email</Typography>
              <Typography variant="body1">
                {/* Replace with actual email */}
                <ProfileEmail profileId={selectedReport.reported_by} />
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Phone Number</Typography>
              <Typography variant="body1">
                {/* Replace with actual phone */}
                <ProfilePhone profileId={selectedReport.reported_by} />
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Comments</Typography>
                {!isEditingComments && (
                  <IconButton 
                    size="small"
                    onClick={() => {
                      setEditedComments(selectedReport.comments || "");
                      setIsEditingComments(true);
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                )}
              </Stack>
              
              {isEditingComments ? (
                <Stack spacing={1}>
                  <TextField
                    multiline
                    fullWidth
                    variant="outlined"
                    value={editedComments}
                    onChange={(e) => setEditedComments(e.target.value)}
                    rows={4}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => setIsEditingComments(false)}
                      disabled={isSavingComments}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => {
                        setIsSavingComments(true);
                        updateReport(
                          {
                            resource: "sms",
                            id: selectedReport.id,
                            values: {
                              comments: editedComments,
                            },
                          },
                          {
                            onSuccess: () => {
                              setSelectedReport((prev: any) => ({ ...prev, comments: editedComments }));
                              setIsEditingComments(false);
                              setIsSavingComments(false);
                              tableQueryResult.refetch();
                            },
                            onError: () => {
                              setIsSavingComments(false);
                            }
                          }
                        );
                      }}
                      disabled={isSavingComments}
                    >
                      {isSavingComments ? "Saving..." : "Save"}
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <Typography variant="body1">
                  {selectedReport.comments || "No comments available"}
                </Typography>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowReporterDetails(false)} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  useEffect(() => {
    if (!showReporterDetails) {
      setIsEditingComments(false);
      setIsSavingComments(false);
    }
  }, [showReporterDetails]);

  return (
    <Box sx={{ minHeight: "100vh", p: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Safety Incidents Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => tableQueryResult.refetch()}
        >
          Refresh
        </Button>
      </Stack>

      {/* Filter Bar */}
      <Paper sx={{ mb: 4, p: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search reports..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={applyFilters}
              disabled={isLoading}
            >
              Apply Filters
            </Button>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              disabled={isLoading}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Summary */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              {total}
            </Typography>
            <Typography variant="body1">Total Reports</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" color="warning" fontWeight={700}>
              {reports.filter((r) => r.status === "open").length}
            </Typography>
            <Typography variant="body1">Open Reports</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" color="info" fontWeight={700}>
              {reports.filter((r) => r.status === "in-progress").length}
            </Typography>
            <Typography variant="body1">In Progress</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="h5" color="success" fontWeight={700}>
              {reports.filter((r) => r.status === "resolved").length}
            </Typography>
            <Typography variant="body1">Resolved</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Paper sx={{ height: 600, width: "100%" }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={80} sx={{ mb: 2 }} />
            ))}
          </Box>
        ) : (
          <DataGrid
            rows={reports}
            columns={columns}
            rowCount={total}
            loading={isLoading}
            pagination
            paginationMode="server"
            pageSizeOptions={[5, 10, 25]}
            paginationModel={{
              page: current - 1,
              pageSize: pageSize,
            }}
            onPaginationModelChange={(model) => {
              setCurrent(model.page + 1);
              setPageSize(model.pageSize);
            }}
            sortingMode="server"
            onSortModelChange={(sortModel) => {
              if (sortModel.length > 0) {
                setSorters([
                  {
                    field: sortModel[0].field,
                    order: sortModel[0].sort as "asc" | "desc",
                  },
                ]);
              } else {
                setSorters([]);
              }
            }}
            disableRowSelectionOnClick
            onRowClick={(params) => {
              // Implement navigation to report details
              console.log("View report:", params.row.id);
            }}
            sx={{
              "& .MuiDataGrid-row:hover": {
                cursor: "pointer",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          />
        )}
      </Paper>

      {/* Reporter Details Modal */}
      {renderReporterDetails()}
    </Box>
  );
};

export default IncidentsAdminPage;