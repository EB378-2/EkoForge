"use client";

import React, { useContext, useState } from "react"
import { useGetIdentity, useNotification } from "@refinedev/core";
import { 
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  LinearProgress,
  Chip,
  IconButton
} from "@mui/material";
import { 
  Person as UserIcon, 
  LocalGasStation as FuelIcon, 
  AttachMoney as DollarIcon, 
  Description as FileTextIcon 
} from "@mui/icons-material";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { BarChart } from "recharts";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ProfileAvatar, ProfileLicence, ProfileName, ProfileEmail, ProfilePhone, ProfileRatings} from "@components/functions/FetchFunctions"
import { EditButton } from "@refinedev/mui";
import { ColorModeContext } from "@contexts/color-mode";
import { FuelData } from "@components/FuelData";
import { PasswordChangeBlock } from "@components/PasswordChange";
import LanguageSwitcher from "@components/ui/LanguageSwitcher";
import { useTranslations } from "next-intl";

const Profile = () => {
  const { open } = useNotification();
  const { data: identityData } = useGetIdentity<{ id: string }>();
  const uid = identityData?.id as string;
  const { mode, setMode } = useContext(ColorModeContext);
  const t = useTranslations("Profile");

  const [fuelData] = useState([
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 900 },
    { month: 'Mar', amount: 1500 },
    { month: 'Apr', amount: 1100 },
    { month: 'May', amount: 1300 },
    { month: 'Jun', amount: 800 },
  ]);

  const [feeData] = useState([
    { id: 1, type: "Landing Fee", amount: "$250.00", status: "Paid", dueDate: "2025-04-15" },
    { id: 2, type: "Hangar Rental", amount: "$1,200.00", status: "Pending", dueDate: "2025-05-01" },
    { id: 3, type: "Aircraft Registration", amount: "$450.00", status: "Overdue", dueDate: "2025-04-01" },
    { id: 4, type: "Maintenance Fee", amount: "$350.00", status: "Paid", dueDate: "2025-03-20" },
  ]);

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Chip label={status} color="success" size="small" />;
      case "pending":
        return <Chip label={status} color="warning" size="small" />;
      case "overdue":
        return <Chip label={status} color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const handleDownloadStatement = () => {
    open?.({
      type: "success",
      message: "Statement Downloaded", // Changed from 'title' to 'message'
      description: "Your complete fee statement has been downloaded.",
    });
  };
  

  return (
    <Box sx={{ minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
          {t("Profile")}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Personal Information Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ 
              borderRadius: '12px',
              boxShadow: '0 0 40px -10px rgba(34, 211, 238, 0.5)',
            }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{t("PersonalInformation")}</Typography>
                    <ProfileAvatar profileId={uid}/>
                  </Box>
                }
                subheader={t("Yourpilotdetails")}
              />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <ProfileAvatar profileId={uid}/>
                  <Box>
                    <Typography variant="h6"><ProfileName profileId={uid} /></Typography>
                    <Typography variant="body2" color="text.secondary">{t("License")} #: <ProfileLicence profileId={uid} /></Typography>
                  </Box>
                </Box>
                <Box>
                  {[
                    { label: t("Email"), value: <ProfileEmail profileId={uid} /> },
                    { label: t("Phone"), value: <ProfilePhone profileId={uid} /> },
                    { label: t("Certification"), value: <ProfileRatings profileId={uid} /> }
                  ].map((item, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        py: 1, 
                        borderBottom: '1px solid #e0e0e0'
                      }}
                    >
                      <Typography color="text.secondary">{item.label}</Typography>
                      <Typography fontWeight="medium">{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <EditButton
                  resource="profile"
                  recordItemId={uid}
                  fullWidth
                  LinkComponent={"button"}
                  variant="outlined"
                />
                <IconButton
                  color="inherit"
                  onClick={() => {
                    setMode();
                  }}
                >
                  {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
                </IconButton>
                <LanguageSwitcher/>
              </CardActions>
            </Card>
          </Grid>

          {/* Fee Status Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ 
              borderRadius: '12px',
              boxShadow: '0 0 40px -10px rgba(34, 211, 238, 0.5)',
            }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{t("FeeStatus")}</Typography>
                    <DollarIcon color="action" />
                  </Box>
                }
                subheader={t("Yourcurrentairportfees")}
              />
              <CardContent>
                {/* 
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">Payment Status</Typography>
                    <Chip 
                      label="1 Overdue" 
                      color="warning" 
                      size="small" 
                      sx={{ bgcolor: '#fff9c4', color: '#f57f17' }} 
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={66} 
                    sx={{ height: 8, borderRadius: 4, mb: 0.5 }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">2/3 Paid</Typography>
                    <Typography variant="caption" color="text.secondary">$700.00 Remaining</Typography>
                  </Box>
                </Box>
                
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fee Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feeData.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell><Typography variant="body2" fontWeight="medium">{fee.type}</Typography></TableCell>
                          <TableCell><Typography variant="body2">{fee.amount}</Typography></TableCell>
                          <TableCell>{getStatusChip(fee.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h3" fontWeight="bold">Coming Soon</Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>

                {/*   <Button 
                  fullWidth 
                  variant="outlined" 
                  size="small" 
                  startIcon={<FileTextIcon />}
                  onClick={handleDownloadStatement}
                >
                  Download Statement
                </Button>   */}
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <PasswordChangeBlock />
          </Grid>
        </Grid>
        {/* Fuel Totals Card */}
        <FuelData profileId={uid} />
      </Container>
    </Box>
  );
};

export default Profile;