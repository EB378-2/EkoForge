
//Profiles
export interface ProfileData {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  avatar_url?: string;
  ratings: string[];
  licence?: string;
  role: "admin" | "pilot" | "staff";
  status: "active" | "pending" | "suspended";
  updated_at: string;
  created_at: string;
}


// Fuels

export interface FuelOption {
  id: string;
  label: string;
  capacity?: number;
  remaining?: number;
  price?: number;
  value: string;
  color: "primary" | "secondary" | "success" | "error" | "warning" | "info";
  lastFueling?: Date;
  remarks?: string;
  updated_at: string;
  created_at: string;
  last_fuel_tank_refueling?: string;
}

// Fuelings

export interface FuelingValues {
  id: string;
  aircraft: string;
  amount: number;
  fuel: string;
  uid: string;
  created_at: string;
  price: number;
}
export interface FuelItem extends FuelingValues {
  id: string;
  created_at: string;
}
export interface ProcessedFuelData {
    month: string;
    amount: number;
}
export interface FuelStats {
    totalYTD: number;
    currentMonth: number;
    monthlyAverage: number;
}
export interface FuelTypeUsage {
  name: string;
  total: number;
  color: string;
}



// Prior Notice

export interface PriorNotice {
    id: string;
    uid: string;
    aircraft_reg: string;
    pic_name: string;
    dep_time: string;
    arr_time: string;
    dep_date: string;
    arr_date: string;
    from_location: string;
    to_location: string;
    mtow: number;
    status: string;
    phone: string;
    email: string;
    created_at: string;
    updated_at: string;
    ifr_arrival: boolean;
}
  
  



// SMS

export type ReportStatus = 'open' | 'in-progress' | 'resolved';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReportCategory = 'inflight' | 'infrastructure' | 'aircraft' | 'medical' | 'security' | 'enviromental' | 'communication' | 'other';

export interface SafetyReport {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  severity: SeverityLevel;
  reported_by: string;
  reported_at: string;
  resolved_at?: string;
  location?: string;
  comments?: string;
}

export interface CreateSafetyReport {
  title: string;
  description: string;
  category: ReportCategory;
  severity: SeverityLevel;
  location?: string;
}

export interface UpdateSafetyReport {
  title?: string;
  description?: string;
  category?: ReportCategory;
  status?: ReportStatus;
  severity?: SeverityLevel;
  resolved_at?: string;
  location?: string;
  comments?: string;
}

// Blog

export type Blog = {
  id: string;
  title: string;
  content: string;
  image_link: string | null;
  published_at: string | null;
  created_at: string;
  uid: string;
  updated_at: string;
  published: boolean;
};

// types/index.ts
export interface AlertItem {
  id: string;
  title: string;
  description: string;
  alert_type: 'emergency' | 'warning' | 'info' | 'ongoing';
  severity: 'critical' | 'high' | 'medium' | 'low';
  start_time: string; // ISO string
  end_time?: string; // ISO string
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
