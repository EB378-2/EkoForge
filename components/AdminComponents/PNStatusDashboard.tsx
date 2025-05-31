// src/components/pn-status-dashboard.tsx
"use client";

import { useTable, useUpdate } from "@refinedev/core";
import { 
  Paper,
  Typography,
  Stack,
  Skeleton,
  Select,
  MenuItem,
  FormControl,
  Box,
  useTheme
} from "@mui/material";
import { Flight } from "@mui/icons-material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { PriorNotice } from "@/types/index";

const PNStatusDashboard = () => {
  const theme = useTheme();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { tableQueryResult: { data, isFetching } } = useTable<PriorNotice>({
    resource: "pn_forms",
    sorters: {
      permanent: [
        { field: "dep_date", order: "asc" },
        { field: "dep_time", order: "asc" },
      ]
    },
    filters: {
      permanent: [
        {
          field: "arr_date",
          operator: "eq",
          value: dayjs().utc().format('YYYY-MM-DD'),
        },
      ],
    },
  });

  const { mutate: updateStatus } = useUpdate();

  const handleStatusChange = (id: string, newStatus: string) => {
    setUpdatingId(id);
    updateStatus({
      resource: "pn_forms",
      id,
      values: { status: newStatus },
    }, {
      onSuccess: () => setUpdatingId(null),
      onError: () => setUpdatingId(null),
    });
  };

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const pnEntries = data?.data || [];

  return (
    <Paper sx={{ p: 3, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Flight sx={{ mr: 1, color: theme.palette.primary.main }} />
        Flight Notices Management
      </Typography>

      {isFetching ? (
        Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1 }} />
        ))
      ) : (
        <Stack spacing={1}>
          {pnEntries.map((pn) => {
            const statusColor = getStatusColor(pn.status);
            const color = statusColor === 'default' 
              ? theme.palette.text.primary 
              : theme.palette[statusColor]?.main || theme.palette.text.primary;

            return (
              <Paper key={pn.id} sx={{ 
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: `4px solid ${color}`,
                opacity: updatingId === pn.id ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" fontWeight="500">
                    {pn.aircraft_reg} • {dayjs(pn.arr_date).format('DD MMM YY')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {pn.from_location} → {pn.to_location}
                  </Typography>
                  <Typography variant="caption">
                    PIC: {pn.pic_name} • {pn.dep_time}-{pn.arr_time}
                  </Typography>
                </Box>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={pn.status}
                    onChange={(e) => handleStatusChange(pn.id, e.target.value)}
                    disabled={updatingId === pn.id}
                    sx={{
                      color: color,
                      fontWeight: 'bold',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: color,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: color,
                        opacity: 0.8
                      },
                    }}
                  >
                    <MenuItem value="pending" sx={{ color: theme.palette.warning.main }}>
                      Pending
                    </MenuItem>
                    <MenuItem value="approved" sx={{ color: theme.palette.success.main }}>
                      Approved
                    </MenuItem>
                    <MenuItem value="rejected" sx={{ color: theme.palette.error.main }}>
                      Rejected
                    </MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            )}
          )}
        </Stack>
      )}

      {!isFetching && pnEntries.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
          No flight notices found
        </Typography>
      )}
    </Paper>
  );
};

export default PNStatusDashboard;