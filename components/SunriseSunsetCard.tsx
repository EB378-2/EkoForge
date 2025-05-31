import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import { WbSunny, NightsStay } from '@mui/icons-material';
import { format, parse } from 'date-fns';

type SunTimes = {
  sunrise: string;
  sunset: string;
  day_length: string;
  date: string;
  [key: string]: any;
};

const SunriseSunsetCard = () => {
  const theme = useTheme();
  const [times, setTimes] = useState<SunTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.sunrisesunset.io/json?lat=60.24859&lng=24.06534&date=today'
        );
        const data = await response.json();
        
        if (data.status === 'OK') {
          setTimes(data.results);
        } else {
          setError('Failed to fetch sun times');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    const parsedTime = parse(timeString, 'h:mm:ss a', new Date());
    return format(parsedTime, 'HH:mm');
  };

  return (
    
<>
    {loading ? (
        <Typography>Loading...</Typography>
    ) : error ? (
        <Typography color="error">{error}</Typography>
    ) : (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <Box 
                    sx={{
                        textAlign: 'center',
                        p: 1,
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <WbSunny 
                        sx={{
                            fontSize: '2rem',
                            mr: 1,
                            color: theme.palette.mode === 'dark' ? '#ffeb3b' : '#f9a825'
                        }} 
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {formatTime(times?.sunrise)}
                    </Typography>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box
                    sx={{
                        textAlign: 'center',
                        p: 1,
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <NightsStay 
                        sx={{
                            fontSize: '2rem',
                            mr: 1,
                            color: theme.palette.mode === 'dark' ? '#ba68c8' : '#6a1b9a'
                        }} 
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {formatTime(times?.sunset)}
                    </Typography>
                </Box>
            </Grid>
        </Grid>
    )}
</>
  );
};

export default SunriseSunsetCard;