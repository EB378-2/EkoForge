"use client";

import React, { useState } from "react";
import { 
    Grid,
    Typography,
    Box,
    Modal,
    TextField,
    Button,
} from "@mui/material";
import { useTheme } from "@hooks/useTheme";
import { useForm, useList } from "@refinedev/core";
import { useTranslations } from "next-intl";
import {
    LocalGasStation,
} from "@mui/icons-material";
import { FuelOption, FuelingValues } from '@/types/index';
import { useRouter } from "next/navigation";


const AddFuelToStation = () => {
    const theme = useTheme();
    const [selectedFuel, setSelectedFuel] = useState<string>("");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const router = useRouter();

    const { data: fuels } = useList<FuelOption>({
        resource: "fuels",
    });

    const { 
        formLoading,
        onFinish,
    } = useForm<FuelingValues>({
        resource: 'fuelings',
        action: "create",
        redirect: false,
        onMutationSuccess: () => {
        setCreateModalOpen(false);
        }
    });

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        onFinish({
            aircraft: "FUEL ADDITION",
            amount: -Number(formData.get("amount")),
            fuel: selectedFuel,
        });
        router.push(`/admin/fuel`);
    };

    return (
        <Box>
            <Button
                variant="contained"
                startIcon={<LocalGasStation />}
                sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg,rgb(195, 0, 255),rgb(124, 17, 78))'
                }}
                LinkComponent={'button'}
                onClick={() => setCreateModalOpen(true)}
            >
                Fill-Up Fuel Station
            </Button>
            {/* Create New Refueling Modal */}
            <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)}>
                <Box 
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        maxWidth: "95vw",
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 4,
                        p: 3,
                    }}
                >
                    <Typography variant="h5" gutterBottom>
                        <LocalGasStation /> Record Fuel Addition
                    </Typography>

                    <form onSubmit={handleFormSubmit}>
                        <Grid container spacing={2}>
                            {/* Fuel Selection Grid */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Select Fuel Type:
                                </Typography>
                                <Grid container spacing={1}>
                                    {fuels?.data?.map((fuel) => (
                                        <Grid item xs={12} key={fuel.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                            <Grid item xs={6}>
                                                <Button
                                                    fullWidth
                                                    variant={selectedFuel === fuel.id ? "contained" : "outlined"}
                                                    color="primary"
                                                    onClick={() => setSelectedFuel(fuel.id)}
                                                    sx={{
                                                    height: 60,
                                                    borderRadius: 2,
                                                    backgroundColor: selectedFuel === fuel.id 
                                                        ? theme.palette.primary.main 
                                                        : 'transparent',
                                                    color: selectedFuel === fuel.id 
                                                        ? theme.palette.primary.contrastText 
                                                        : theme.palette.text.primary,
                                                    '&:hover': {
                                                        backgroundColor: selectedFuel === fuel.id 
                                                        ? theme.palette.primary.dark 
                                                        : theme.palette.action.hover
                                                    }
                                                    }}
                                                >
                                                    <Typography variant="button">
                                                        {fuel.label}
                                                    </Typography>
                                                </Button>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="caption" color="text.secondary">
                                                    remaining:{fuel.remaining}<br />
                                                    capacity:{fuel.capacity}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                            
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    name="amount"
                                    label="Amount Added (Liters)"
                                    type="number"
                                    inputProps={{ min: 0.1, step: 0.1 }}
                                />
                            </Grid>

                        </Grid>

                        <Box mt={3}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth
                            >
                                Record Fuel Addition
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default AddFuelToStation;