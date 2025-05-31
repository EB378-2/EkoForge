"use client";

import React from "react";
import { 
  Grid, 
  Card, 
  CardHeader, 
  Box, 
  Typography, 
  CardContent, 
  CardActions, 
  Button,
  useTheme
} from "@mui/material";
import { useList } from "@refinedev/core";
import { Fuel } from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar, 
  Cell
} from "recharts";
import { FuelingValues, ProcessedFuelData, FuelTypeUsage } from '@/types/index';
import { useTranslations } from "next-intl";

const getMonthLabel = (date: Date): string => {
  return date.toLocaleString('default', { month: 'short' }) + ' ' + 
         date.getFullYear().toString().slice(-2);
};

interface FuelType {
  id: string;
  label: string;
  color: string;
}

export function FuelData({ profileId }: { profileId: string }) {
  const t = useTranslations("Profile");
  const theme = useTheme();

  // Fuel transactions data
  const { data: myRefuelingsData } = useList<FuelingValues>({
    resource: "fuelings",
    filters: [{ 
      field: "uid", 
      operator: "eq", 
      value: profileId 
    }, {
      field: "aircraft", 
      operator: "ne", 
      value: "FUEL ADDITION"
    }],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!profileId }
  });

  // Fuel types data
  const { data: fuels } = useList<FuelType>({
    resource: "fuels",
    pagination: { mode: "off" }
  });

  const processFuelData = (): ProcessedFuelData[] => {
    if (!myRefuelingsData?.data?.length) return [];

    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date;
    });

    const monthlyData = new Map<string, number>(
      months.map(date => [getMonthLabel(date), 0])
    );

    myRefuelingsData.data.forEach((entry: FuelingValues) => {
      const entryDate = new Date(entry.created_at);
      const entryMonth = getMonthLabel(entryDate);
      if (monthlyData.has(entryMonth)) {
        monthlyData.set(entryMonth, (monthlyData.get(entryMonth) || 0) + entry.amount);
      }
    });

    return Array.from(monthlyData, ([month, amount]) => ({ 
      month, 
      amount: Number(amount.toFixed(2)) 
    }));
  };

  const getFuelTypeUsage = (): FuelTypeUsage[] => {
    if (!myRefuelingsData?.data || !fuels?.data) return [];

    const fuelMap = new Map<string, FuelTypeUsage>(
      fuels.data.map(fuel => [fuel.id, {
        name: fuel.label,
        total: 0,
        color: fuel.color
      }])
    );

    myRefuelingsData.data.forEach((entry: FuelingValues) => {
      if (entry.amount > 0 && fuelMap.has(entry.fuel)) {
        const fuel = fuelMap.get(entry.fuel)!;
        fuelMap.set(entry.fuel, {
          ...fuel,
          total: fuel.total + entry.amount
        });
      }
    });

    return Array.from(fuelMap.values())
      .filter(fuel => fuel.total > 0)
      .sort((a, b) => b.total - a.total);
  };

  const fuelData = processFuelData();
  const totalFuel = fuelData.reduce((sum: number, entry: ProcessedFuelData) => 
    sum + entry.amount, 0
  );
  const currentMonth = fuelData[fuelData.length - 1]?.amount || 0;
  const monthlyAverage = totalFuel / (fuelData.length || 1);

  if (!myRefuelingsData?.data) return null;

  return (
    <Grid container spacing={3} mt={2}>
      {/* Fuel Consumption Card */}
      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ 
          borderRadius: '12px',
          boxShadow: theme.shadows[4],
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{t("FuelConsumption")}</Typography>
                <Fuel color={theme.palette.primary.main} size={24} />
              </Box>
            }
            subheader={t("LastSixMonthsOverview")}
          />
          
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ height: 200, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelData} margin={{ top: 10, right: 10, left: -20 }}>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={theme.palette.divider}
                  />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    tick={{ fill: theme.palette.text.secondary }}
                    tickFormatter={(value: number) => `${value}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Fuel Used"
                    fill={theme.palette.primary.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t("TotalConsumption")}:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {totalFuel.toFixed(1)}L
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t("CurrentMonth")}:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {currentMonth.toFixed(1)}L
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {t("MonthlyAverage")}:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {monthlyAverage.toFixed(1)}L
                </Typography>
              </Box>
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 2 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              size="small" 
              href="/fuel"
              sx={{ textTransform: 'none' }}
            >
              {t("ViewDetailedHistory")}
            </Button>
          </CardActions>
        </Card>
      </Grid>

      {/* Fuel Type Usage Card */}
      <Grid item xs={12} md={6}>
        <Card elevation={2} sx={{ 
          borderRadius: '12px',
          boxShadow: theme.shadows[4],
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{t("FuelTypeUsage")}</Typography>
                <Fuel color={theme.palette.primary.main} size={24} />
              </Box>
            }
            subheader={t("TotalConsumptionByFuelType")}
          />
          
          <CardContent sx={{ flex: 1 }}>
            <Box sx={{ height: 200, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={getFuelTypeUsage()}
                  layout="vertical"
                  margin={{ left: -20 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    horizontal={false} 
                    stroke={theme.palette.divider}
                  />
                  <XAxis 
                    type="number" 
                    tickFormatter={(value: number) => `${value}L`} 
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={80}
                    tick={{ fill: theme.palette.text.secondary }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider
                    }}
                  />
                  <Bar dataKey="total" color={theme.palette.text.secondary} radius={[0, 4, 4, 0]}>
                    {getFuelTypeUsage().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={theme.palette.secondary.main} color={theme.palette.text.secondary } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {getFuelTypeUsage().map((fuel, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1,
                    borderRadius: 2,
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.03)'
                  }}
                >
                  <Box 
                    sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: fuel.color 
                    }} 
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {fuel.name}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" color={theme.palette.text.secondary}>
                    {fuel.total.toFixed(1)}L
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}