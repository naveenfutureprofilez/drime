import React from 'react';
import { Card } from '@ui/card/card';
import { CardContent } from '@ui/card/card-content';
import { TrendingUpIcon } from '@ui/icons/material/TrendingUp';
import { TrendingDownIcon } from '@ui/icons/material/TrendingDown';

export function StatDisplayWidget({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'primary',
  className = '' 
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted mb-2">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-2 ${
                isPositive ? 'text-positive' : isNegative ? 'text-danger' : 'text-muted'
              }`}>
                {isPositive && <TrendingUpIcon className="w-4 h-4" />}
                {isNegative && <TrendingDownIcon className="w-4 h-4" />}
                <span>
                  {Math.abs(change)}% from last period
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-full bg-${color}/10`}>
              <Icon className={`h-6 w-6 text-${color}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}