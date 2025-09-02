import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DashboardData } from '../types';
import { formatCurrency, formatPercentage } from '../utils';

interface FinancialStatsCardsProps {
  data: DashboardData;
  className?: string;
}

export const FinancialStatsCards: React.FC<FinancialStatsCardsProps> = ({ data, className }) => {
  const revenue = data.totalRevenue || 0;
  const expenses = data.totalExpenses || 0;
  const profit = data.netProfit || (revenue - expenses);
  const margin = data.profitMargin || (revenue > 0 ? (profit / revenue) * 100 : 0);

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(revenue),
      icon: <DollarSign className="h-4 w-4" />,
      trend: { value: 12.5, isPositive: true },
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(expenses),
      icon: <TrendingDown className="h-4 w-4" />,
      trend: { value: 3.2, isPositive: false },
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(profit),
      icon: <TrendingUp className="h-4 w-4" />,
      trend: { value: 18.7, isPositive: true },
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Profit Margin',
      value: formatPercentage(margin),
      icon: <PieChart className="h-4 w-4" />,
      trend: { value: 5.3, isPositive: true },
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`${stat.bgColor} ${stat.color} p-2 rounded-md`}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {stat.trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span className={stat.trend.isPositive ? 'text-green-500' : 'text-red-500'}>
                {stat.trend.value}%
              </span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};