// frontend/src/hooks/useDashboardAnalytics.ts

import { useQuery } from '@tanstack/react-query';

const API_BASE = 'http://localhost:3001/api/v1';

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