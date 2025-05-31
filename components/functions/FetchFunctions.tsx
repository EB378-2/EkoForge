"use client";

import React from "react";
import { useShow } from "@refinedev/core";
import { Avatar } from "@mui/material";


export function ProfileName({ profileId }: { profileId: string }) {
  const { queryResult } = useShow({
    resource: "profiles",
    id: profileId,
    meta: { select: "fullname" },
    queryOptions: { enabled: !!profileId },
  });
  const profileData = queryResult?.data?.data as { fullname: string} | undefined;
  if (!profileData) return <span>Loading...</span>;
  return <span>{profileData.fullname}</span>;
}

export function ProfileAvatar({ profileId }: { profileId: string }) {
  const { queryResult } = useShow({
      resource: "profiles",
      id: profileId,
      meta: { select: "avatar_url" },
      queryOptions: { enabled: !!profileId },
  });
  const profileData = queryResult?.data?.data as { avatar_url: string;} | undefined;
  if (!profileData) return <span>Loading...</span>;
  return <Avatar src={profileData.avatar_url} alt={"pfp"} />;
}

export function ProfilePhone({ profileId }: { profileId: string }) {
  const { queryResult } = useShow({
    resource: "profiles",
    id: profileId,
    meta: { select: "phone" },
    queryOptions: { enabled: !!profileId },
  });
  const profileData = queryResult?.data?.data as { phone: string; } | undefined;
  if (!profileData) return <span>Loading...</span>;
  return <span>{profileData.phone}</span>;
}

export function ProfileEmail({ profileId }: { profileId: string }) {
  const { queryResult } = useShow({
    resource: "profiles",
    id: profileId,
    meta: { select: "email" },
    queryOptions: { enabled: !!profileId },
  });
  const profileData = queryResult?.data?.data as { email: string; } | undefined;
  if (!profileData) return <span>Loading...</span>;
  return <span>{profileData.email}</span>;
}

export function ProfileRole({ profileId }: { profileId: string }) {
  const { queryResult } = useShow({
    resource: "profiles",
    id: profileId,
    meta: { select: "role" },
    queryOptions: { enabled: !!profileId },
  });
  const profileData = queryResult?.data?.data as { role: string[]; } | undefined;
  if (!profileData) return <span>Loading...</span>;
  const roleString = Array.isArray(profileData.role) ? profileData.role.join(", ") : profileData.role;
  return <span>{roleString ? roleString.charAt(0).toUpperCase() + roleString.slice(1) : ""}</span>;
}

export function FuelName({ id }: { id: string }) {
  const { queryResult } = useShow({
    resource: "fuels",
    id: id,
    meta: { select: "label" },
    queryOptions: { enabled: !!id },
  });
  const resourceData = queryResult?.data?.data as { label: string } | undefined;
  if (!resourceData) return <span>Loading...</span>;
  return <span>{resourceData.label}</span>;
}