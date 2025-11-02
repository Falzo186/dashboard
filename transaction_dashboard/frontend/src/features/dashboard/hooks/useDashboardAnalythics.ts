// frontend/src/hooks/useDashboardAnalytics.ts

import { useQuery } from '@tanstack/react-query';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3002';
const API_VERSION = (import.meta as any).env.VITE_API_VERSION || 'v1';
const API_BASE = `${API_URL}/api/${API_VERSION}`;

interface DashboardAnalytics {
  metrics: {
    totalTransactions: string;
    totalRevenue: string;
    uniqueCustomers: string;
    averageTicket: string;
    growthRate: string;
    roiIdentified: string;
  };
  salesOverTime: Array<{
    date: string;
    sales: number;
    transactions: number;
  }>;
  hourlyDistribution: Array<{
    hour: string;
    transactions: number;
    percentage: number;
  }>;
  paymentMethods: Array<{
    id: string;
    label: string;
    value: number;
    percentage: string;
  }>;
  topProducts: Array<{
    product: string;
    sales: number;
    quantity: number;
  }>;
  alerts?: {
    critical?: string;
    opportunity?: string;
    trend?: string;
  };
}

export const useDashboardAnalytics = () => {
  return useQuery<DashboardAnalytics>({
    queryKey: ['dashboard', 'analytics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/dashboard/analytics`);
      if (!response.ok) {
        throw new Error('Error al obtener analíticas del dashboard');
      }
      const json = await response.json();
      return json.data || json;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    retry: 2
  });
};