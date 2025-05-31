// hooks/useProfileStats.ts
'use client';

import { useList } from "@refinedev/core";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export function useProfileStats() {
  const startOfDay = dayjs().utc().startOf('day').format();
  const endOfDay = dayjs().utc().endOf('day').format();
  
  const { data: totalData } = useList({
    resource: "profiles",
    config: { pagination: { mode: "off" } },
    meta: { select: "count" },
  });

  const { data: todayData } = useList({
    resource: "profiles",
    filters: [
      {
        field: "created_at",
        operator: "gte",
        value: startOfDay,
      },
      {
        field: "created_at",
        operator: "lte",
        value: dayjs(endOfDay).endOf('day').toISOString(),
      }
    ],
  });

  return {
    totalCount: totalData?.total || 0,
    todayCount: todayData?.data?.length || 0,
  };
}

export function usePnApprovalsToCome() {
  const now = dayjs().utc();
  
  const { data: pendingFlightsData } = useList({
    resource: "pn_forms",
    filters: [
      {
        field: "status",
        operator: "eq",
        value: "pending"
      },
      {
        field: "arr_date",
        operator: "gte",
        value: now.format('YYYY-MM-DD')
      }
    ]
  });

  // Filter to only include flights that haven't arrived yet
  const pendingFutureFlights = (pendingFlightsData?.data || []).filter(flight => {
    const flightDateTime = dayjs.utc(`${flight.arr_date} ${flight.arr_time}`, 'YYYY-MM-DD HHmm');
    return flightDateTime.isAfter(now);
  });

  return {
    PnApprovalsToCome: pendingFutureFlights.length,
  };
}

export function usePNStatsToday() {
  const todayStart = dayjs().utc().startOf('day').format('YYYY-MM-DD');
  const todayEnd = dayjs().utc().endOf('day').format('YYYY-MM-DD');
  
  const { data: todaysFlightsData } = useList({
    resource: "pn_forms",
    filters: [
      {
        field: "dep_date",
        operator: "eq",
        value: todayStart
      },
      {
        field: "status",
        operator: "in",
        value: ["approved", "pending"]
      }
    ]
  });

  // Filter to only include flights that haven't departed yet
  const upcomingFlights = (todaysFlightsData?.data || []).filter(flight => {
    const flightDateTime = dayjs.utc(`${flight.dep_date} ${flight.dep_time}`, 'YYYY-MM-DD HHmm');
    return flightDateTime.isAfter(dayjs().utc());
  });

  return {
    TodaysApprovedPendingFlights: todaysFlightsData?.data?.length || 0,
    UpcomingFlightsCount: upcomingFlights.length,
  };
}


export function useRecentIncidents() {
  const oneWeekAgo = dayjs().utc().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss.SSSSSS[+00]');
  
  const { data } = useList({
    resource: "sms",  // Changed from "sms" to "incidents"
    filters: [
      {
        field: "reported_at",  // Changed to appropriate date field
        operator: "gte",       // Changed to "gte" (greater than or equal)
        value: oneWeekAgo
      }
    ]
  });

  return {
    recentIncidentsCount: data?.data?.length || 0,  // Better naming
  };
}