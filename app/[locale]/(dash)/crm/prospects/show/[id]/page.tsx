"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Paper,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
  Alert,
  Grid,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  Business as CompanyIcon,
  Person as ContactIcon,
  Notes as NotesIcon,
  Event as DateIcon,
  Update as UpdateIcon,
} from "@mui/icons-material";
import { useShow } from "@refinedev/core";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { Show } from "@refinedev/mui";

export default function ProspectShow() {
  const params = useParams();
  const { id } = params as { id: string };
  
  const { queryResult } = useShow({
    resource: "prospects",
    id: id,
  });
  const { data, isLoading, isError } = queryResult;
  const prospect = data?.data;

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

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load prospect details.</Alert>
      </Box>
    );
  }

  if (!prospect) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Prospect not found.</Alert>
      </Box>
    );
  }

  return (
    <Show canEdit canDelete resource="prospects" recordItemId={id}>
      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h5" component="div">
              {prospect.company_name}
            </Typography>
            <Chip
              label={prospect.status}
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

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CompanyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Company"
                      secondary={prospect.company_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ContactIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Contact"
                      secondary={prospect.contact_name || "Not specified"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText primary="Email" secondary={prospect.email} />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone"
                      secondary={prospect.phone || "Not specified"}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WebsiteIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Website"
                      secondary={
                        prospect.website ? (
                          <Link
                            href={
                              prospect.website.startsWith("http")
                                ? prospect.website
                                : `https://${prospect.website}`
                            }
                            target="_blank"
                            rel="noopener"
                          >
                            {prospect.website}
                          </Link>
                        ) : (
                          "Not specified"
                        )
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DateIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Created"
                      secondary={dayjs(prospect.created_at).format(
                        "MMMM D, YYYY h:mm A"
                      )}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            {prospect.notes && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <NotesIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    Notes
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                    {prospect.notes}
                  </Typography>
                </Paper>
              </Grid>
            )}

            {prospect.converted_at && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <UpdateIcon sx={{ verticalAlign: "middle", mr: 1 }} />
                    Conversion Date
                  </Typography>
                  <Typography variant="body1">
                    {dayjs(prospect.converted_at).format("MMMM D, YYYY h:mm A")}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Show>
  );
}