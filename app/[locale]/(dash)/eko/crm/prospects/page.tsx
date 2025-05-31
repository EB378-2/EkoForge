"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  TablePagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Sync as SyncIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useList, useUpdate, useDelete, CrudFilter } from "@refinedev/core";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { CreateButton, DeleteButton, EditButton, ShowButton } from "@refinedev/mui";

interface Prospect {
  id: string;
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  website?: string;
  status: string;
  notes?: string;
  is_migrated: boolean;
  converted_at?: string;
  created_at: string;
  updated_at: string;
}

const statusOptions = [
  "1. new",
  "2. contacted",
  "3. engaged",
  "4. interested",
  "5. salescall",
  "6. qualified",
  "7. negotitions",
  "8. signed",
];

const statusColors: Record<string, string> = {
  "1. new": "default",
  "2. contacted": "primary",
  "3. engaged": "info",
  "4. interested": "success",
  "5. salescall": "warning",
  "6. qualified": "secondary",
  "7. negotitions": "info",
  "8. signed": "success",
};

export default function ProspectsList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Build filters
  const filters = useMemo(() => {
    const filterArray: CrudFilter[] = [];
    if (search) {
      filterArray.push({
        field: "company_name",
        operator: "contains" as const,
        value: search,
      });
    }
    if (statusFilter) {
      filterArray.push({
        field: "status",
        operator: "eq" as const,
        value: statusFilter,
      });
    }
    return filterArray;
  }, [search, statusFilter]);

  const { data, isLoading, isError, refetch } = useList<Prospect>({
    resource: "prospects",
    pagination: {
      current: page + 1,
      pageSize: rowsPerPage,
    },
    filters,
  });

  const { mutate: updateProspect } = useUpdate<Prospect>();
  const { mutate: deleteProspect } = useDelete();

  const prospects = data?.data || [];
  const total = data?.total || 0;

  const handleStatusChange = (id: string, newStatus: string) => {
    updateProspect({
      resource: "prospects",
      id,
      values: { status: newStatus },
      meta: {
        select: "*",
      },
    });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => refetch();

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Prospects
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <CreateButton
          resource="prospects"
          />
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <SyncIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Card elevation={3} sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "action.active", mr: 1 }} />,
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              startAdornment={<FilterListIcon sx={{ color: "action.active", mr: 1 }} />}
            >
              <MenuItem value="">
                <em>All Statuses</em>
              </MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Card>

      <Paper elevation={3}>
        {isLoading ? (
          <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error" sx={{ m: 2 }}>
            Error loading prospects. Please try again.
          </Alert>
        ) : prospects.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No prospects found. Try adjusting your filters or create a new prospect.
          </Alert>
        ) : (
          <>
            <List disablePadding>
              {prospects.map((prospect) => (
                <React.Fragment key={prospect.id}>
                  <ListItem
                    secondaryAction={
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <ShowButton
                          hideText
                          resource={"prospects"}
                          recordItemId={prospect.id}
                        />
                        <EditButton
                          hideText
                          resource={"prospects"}
                          recordItemId={prospect.id}
                        />
                        <DeleteButton
                          hideText
                          resource={"prospects"}
                          recordItemId={prospect.id}
                        />
                      </Box>
                    }
                    sx={{
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Typography fontWeight="medium">
                            {prospect.company_name}
                          </Typography>
                          <Chip
                            label={prospect.status}
                            size="small"
                            color={
                              statusColors[prospect.status] as
                                | "default"
                                | "primary"
                                | "secondary"
                                | "error"
                                | "info"
                                | "success"
                                | "warning"
                            }
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          {prospect.contact_name && (
                            <Typography component="span" variant="body2">
                              Contact: {prospect.contact_name}
                            </Typography>
                          )}
                          <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                            Email: {prospect.email}
                          </Typography>
                          {prospect.phone && (
                            <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                              Phone: {prospect.phone}
                            </Typography>
                          )}
                          <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                            Created: {dayjs(prospect.created_at).format("MMM D, YYYY")}
                          </Typography>
                        </>
                      }
                      sx={{ my: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180, mr: 2 }}>
                      <Select
                        value={prospect.status}
                        onChange={(e) =>
                          handleStatusChange(prospect.id, e.target.value)
                        }
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
}