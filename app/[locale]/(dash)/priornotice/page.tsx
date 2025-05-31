// src/pages/pn-form/list.tsx

"use client";

import { useTable, useMany, useGetIdentity } from "@refinedev/core";
import { 
  Grid, 
  Paper, 
  Typography, 
  Chip, 
  Stack, 
  Skeleton,
  Button,
  Box
} from "@mui/material";
import { Add as AddIcon, Flight } from "@mui/icons-material";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useTheme } from "@mui/material/styles";
import { DeleteButton, EditButton } from "@refinedev/mui";
import { PriorNotice } from "@/types/index";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);


const PNList = () => {
  const theme = useTheme();
  const route = useRouter();
  const t = useTranslations("PN");
  const { data: identityData } = useGetIdentity<{ id: string }>();

  const UserID = identityData?.id as string;
  
  // Fetch all public PN entries
  const { tableQueryResult: { data: publicData, isLoading: publicLoading } } = useTable({
    resource: "pn_forms",
    sorters: {
      permanent: [
        { field: "dep_date", order: "asc" },
        { field: "dep_time", order: "asc" },
      ]
    },
    filters: {
      permanent: [
        { field: "dep_date", operator: "gte", value: dayjs().format("YYYY-MM-DD") }
      ]
    },
    pagination: {
      pageSize: 10,
    },
  });

  const publicPNs = (publicData?.data as PriorNotice[]) || [];
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Grid container spacing={3} >
      {/* Public Board Column */}
      <Grid item xs={12}>
        <Paper sx={{ p: 3, minHeight: '90vh', overflow: 'auto' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <Flight sx={{ mr: 1, color: theme.palette.primary.main }} />
              {t("UpcomingFlights")}
            </Typography>
            <Button
              variant="contained"
              onClick={() => route.push("/priornotice/create")}
              sx={{ m: 2 }}
            >
              <AddIcon />
              {t("CreatePN")}
            </Button>
          </Box>
          
          {publicLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2 }} />
            ))
          ) : (
            publicPNs.map((pn: PriorNotice) => (
              <Paper key={pn.id} sx={{ p: 2, mb: 2, borderLeft: UserID === pn.uid ? `4px solid ${theme.palette.secondary.main}` : `4px solid ${theme.palette.primary.main}`, color: theme.palette.text.primary }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="subtitle1">
                      {pn.aircraft_reg} • {pn.pic_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(pn.dep_date).format('DD MMM')} • {pn.dep_time}-{pn.arr_time}
                    </Typography>
                    <Typography variant="caption">
                      {pn.from_location} → {pn.to_location}
                    </Typography>
                    {UserID === pn.uid && isDateTimePassed(pn.arr_date, pn.arr_time) === false && (
                      <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                      }}>
                        <EditButton
                          resource="priornotice"
                          hideText
                          recordItemId={pn.id}
                        />
                         <DeleteButton
                          resource="priornotice"
                          hideText
                          recordItemId={pn.id}
                        />
                      </Box>
                    )}

                  </div>
                  <Chip 
                    label={t(pn.status)} 
                    size="small" 
                    color={getStatusColor(pn.status)} 
                    
                  />
                </Stack>
              </Paper>
            ))
          )}
          
          {!publicLoading && publicPNs.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
              {t("NoUpcomingFlightsScheduled")}
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PNList;



function isDateTimePassed(dateStr: string, timeStr: string): boolean {
  // Validate date format (yyyy-mm-dd)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Invalid date format. Expected yyyy-mm-dd.');
  }

  // Validate time format (HHMM)
  if (!/^\d{4}$/.test(timeStr)) {
    throw new Error('Invalid time format. Expected HHMM as a 4-digit string.');
  }

  // Parse date components
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Parse time components
  const hours = parseInt(timeStr.substring(0, 2), 10);
  const minutes = parseInt(timeStr.substring(2, 4), 10);

  // Validate date values
  const dateObj = new Date(Date.UTC(year, month - 1, day));
  if (
    dateObj.getUTCFullYear() !== year ||
    dateObj.getUTCMonth() !== month - 1 ||
    dateObj.getUTCDate() !== day
  ) {
    throw new Error('Invalid date values.');
  }

  // Validate time values
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time. Hours must be 00-23 and minutes 00-59.');
  }

  // Create the full datetime in UTC
  const inputDateTime = new Date(Date.UTC(year, month - 1, day, hours, minutes));

  // Compare with current UTC time
  return inputDateTime.getTime() < Date.now();
}