"use client";

import React, { useState, useMemo } from "react";
import { 
  Box, Typography, Grid, Card, CardContent, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Button, Tooltip, Avatar,
  TextField,
  MenuItem
} from "@mui/material";
import { 
  LocalGasStation, AttachMoney, History, Storage,
  Refresh, Add, Visibility, Edit, Delete 
} from "@mui/icons-material";
import { useList, useOne } from "@refinedev/core";
import dayjs from "dayjs";
import { useTheme } from "@hooks/useTheme";
import { FuelOption, FuelItem } from '@/types/index';
import { ProfileName } from "@components/functions/FetchFunctions";
import { TableFooter, Pagination } from "@mui/material";
import { DeleteButton } from "@refinedev/mui";


const FuelAdminDashboard = () => {
  const theme = useTheme();
  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Data fetching
  const { data: fuels } = useList<FuelOption>({ resource: "fuels" });
  const { data: fuelings } = useList<FuelItem>({ 
    resource: "fuelings",
    pagination: { 
        current: currentPage,
        pageSize: pageSize,
    },
    sorters: [{ field: "created_at", order: "desc" }]
  });

  // Calculated values
  const tankStatus = useMemo(() => 
    fuels?.data?.map(fuel => ({
      ...fuel,
      percent: ((fuel.remaining || 0) / (fuel.capacity || 1)) * 100,
      lastRefuel: dayjs(fuel.last_fuel_tank_refueling).format('DD/MM/YYYY HH:mm')
    })) || []
  , [fuels]);

  const recentTransactions = useMemo(() =>
    fuelings?.data?.map(f => {
        const fuel = fuels?.data?.find(fuel => fuel.id === f.fuel);
        const price = fuel?.price || 0;
        const calculatedTotal = f.amount * price;
        
        return {
        ...f,
        price,
        total: Math.max(0, calculatedTotal) // Ensures total never goes below 0
        };
    }) || []
    , [fuelings, fuels]);

  return (
    <Box sx={{ p: 4, backgroundColor: theme.palette.background.default }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" fontWeight="bold">
          Fuel Management Dashboard
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          New Fuel Type
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <Storage />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Capacity</Typography>
                  <Typography variant="h4">
                    {tankStatus.reduce((sum, t) => sum + (t.capacity ?? 0), 0).toLocaleString()} L
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <LocalGasStation />
                </Avatar>
                <Box>
                  <Typography variant="h6">Available Fuel</Typography>
                  <Typography variant="h4">
                    {tankStatus.reduce((sum, t) => sum + (t.remaining ?? 0), 0).toLocaleString()} L
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <AttachMoney />
                </Avatar>
                <Box>
                  <Typography variant="h6">Total Revenue</Typography>
                  <Typography variant="h4">
                    €{recentTransactions.reduce((sum, t) => sum + (t.total ?? 0), 0).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tank Status Grid */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Fuel Tank Status</Typography>
            <Tooltip title="Refresh data">
              <IconButton><Refresh /></IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {tankStatus.map((tank) => (
              <Grid item xs={12} md={6} key={tank.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    borderLeft: `4px solid ${tank.color}`,
                    backgroundColor: theme.palette.background.paper
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6">{tank.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(tank.remaining ?? 0).toLocaleString()}L / {(tank.capacity ?? 0).toLocaleString()}L
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${tank.percent.toFixed(1)}%`} 
                        color={
                          tank.percent > 75 ? 'success' :
                          tank.percent > 25 ? 'warning' : 'error'
                        }
                      />
                    </Box>
                    
                    <LinearProgress
                      variant="determinate"
                      value={tank.percent}
                      sx={{
                        height: 8,
                        mt: 2,
                        borderRadius: 4,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: tank.color
                        }
                      }}
                    />

                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Typography variant="caption">
                        Last refuel: {tank.lastRefuel || 'Never'}
                      </Typography>
                      <Box>
                        <IconButton size="small"><Visibility /></IconButton>
                        <IconButton size="small"><Edit /></IconButton>
                        <IconButton size="small" color="error"><Delete /></IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Recent Refuel Transactions</Typography>
            <Button variant="outlined" startIcon={<History />}>
              View All
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Fuel Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Price/L</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Aircraft</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {dayjs(transaction.created_at).format('DD/MM/YYYY HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={fuels?.data?.find(f => f.id === transaction.fuel)?.label}
                        size="small"
                        sx={{ backgroundColor: fuels?.data?.find(f => f.id === transaction.fuel)?.color }}
                      />
                    </TableCell>
                    <TableCell align="right">{transaction.amount}L</TableCell>
                    <TableCell align="right">€{transaction.price.toFixed(2)}</TableCell>
                    <TableCell align="right">€{transaction.total.toFixed(2)}</TableCell>
                    <TableCell>{transaction.aircraft}</TableCell>
                    <TableCell>
                      <ProfileName profileId={transaction.uid} />
                    </TableCell>
                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small"><Edit /></IconButton>
                      <DeleteButton
                        size="small"
                        hideText
                        recordItemId={transaction.id}
                        resource="fuelings"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
               <TableFooter>
                <TableRow>
                    <TableCell colSpan={8} sx={{ py: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: "5vh" }}>
                            <Typography variant="body2" color="text.secondary">
                            Total {fuelings?.total} transactions
                            </Typography>
                            
                            <Box display="flex" alignItems="center" gap={2}>
                            <TextField
                                select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                size="small"
                                sx={{ width: 150 }}
                            >
                                {[10, 25, 50].map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size} per page
                                </MenuItem>
                                ))}
                            </TextField>
                            
                            <Pagination
                                count={Math.ceil((fuelings?.total || 0) / pageSize)}
                                page={currentPage}
                                onChange={(_, page) => setCurrentPage(page)}
                                color="primary"
                            />
                            </Box>
                        </Box>
                    </TableCell>
                </TableRow>
                </TableFooter>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Additional Sections (Invoices, Analytics, etc.) can be added here */}
    </Box>
  );
};

export default FuelAdminDashboard;