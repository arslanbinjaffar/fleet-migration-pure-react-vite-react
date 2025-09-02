import { useGetShiftDetailsQuery } from "@/stores/api/apiSlice";
import { useMemo } from "react";

// Types for the shift details
export interface SiteProject {
  id: string;
  name: string;
  location?: string;
  status?: string;
}

export interface Fleet {
  fleetId: string;
  vehicleName: string;
  plateNumber?: string;
  status?: string;
}

export interface Technician {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialization?: string;
}

export interface ShiftDetailsOptions {
  siteProjects: SiteProject[];
  fleets: Fleet[];
  technician: Technician[];
}

export interface UseShiftDetailsReturn {
  options: ShiftDetailsOptions;
  isLoading: boolean;
  isError: boolean;
  error?: any;
  refetch: () => void;
}

export function useShiftDetails(): UseShiftDetailsReturn {
  const { 
    data, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetShiftDetailsQuery();

  // Memoize the options to prevent unnecessary re-renders
  const options = useMemo((): ShiftDetailsOptions => {
    if (!data) {
      return {
        siteProjects: [],
        fleets: [],
        technician: [],
      };
    }

    return {
      siteProjects: data.siteProjects || [],
      fleets: data.fleets || [],
      technician: data.technician || [],
    };
  }, [data]);

  return {
    options,
    isLoading,
    isError,
    error,
    refetch,
  };
}
