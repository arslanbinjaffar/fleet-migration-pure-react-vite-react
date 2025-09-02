import React from 'react';
import { Card } from '@/components/ui/card';

interface FleetUtilizationChartProps {
  outOfServiceFleets: number;
  inUseFleets: number;
  availableFleets: number;
  className?: string;
}

export const FleetUtilizationChart: React.FC<FleetUtilizationChartProps> = ({
  outOfServiceFleets,
  inUseFleets,
  availableFleets,
  className,
}) => {
  const total = outOfServiceFleets + inUseFleets + availableFleets;
  
  const data = [
    {
      name: 'Available',
      value: availableFleets,
      percentage: total > 0 ? (availableFleets / total) * 100 : 0,
      color: 'bg-green-500',
    },
    {
      name: 'In Use',
      value: inUseFleets,
      percentage: total > 0 ? (inUseFleets / total) * 100 : 0,
      color: 'bg-blue-500',
    },
    {
      name: 'Out of Service',
      value: outOfServiceFleets,
      percentage: total > 0 ? (outOfServiceFleets / total) * 100 : 0,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {data.map((item) => (
          <Card key={item.name} className="p-4">
            <div className="text-center">
              <div className={`w-4 h-4 ${item.color} rounded-full mx-auto mb-2`} />
              <div className="text-2xl font-bold">{item.value}</div>
              <div className="text-sm text-muted-foreground">{item.name}</div>
              <div className="text-xs text-muted-foreground">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Visual Chart */}
      <div className="space-y-3">
        <div className="text-sm font-medium">Fleet Distribution</div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="h-full flex">
            {data.map((item, index) => (
              <div
                key={index}
                className={item.color}
                style={{ width: `${item.percentage}%` }}
                title={`${item.name}: ${item.value} (${item.percentage.toFixed(1)}%)`}
              />
            ))}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className={`w-3 h-3 ${item.color} rounded-full`} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Utilization Rate */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Fleet Utilization Rate</div>
          <div className="text-3xl font-bold text-blue-600">
            {total > 0 ? ((inUseFleets / total) * 100).toFixed(1) : 0}%
          </div>
          <div className="text-xs text-muted-foreground">
            {inUseFleets} of {total} fleets in use
          </div>
        </div>
      </div>
    </div>
  );
};