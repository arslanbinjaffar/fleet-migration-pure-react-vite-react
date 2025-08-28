import React from 'react';
import {
  Clock,
  Users,
  Truck,
  Building,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  MessageSquare,
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import { ScheduledShift } from '../types';
import {
  formatDate,
  formatHours,
  getOperatorName,
  getStatusConfig,
  getTotalOperatorHours,
} from '../utils';

interface TimesheetCardProps {
  shift: ScheduledShift;
  isSelected: boolean;
  onSelect: (shiftId: string) => void;
  onEdit: (shift: ScheduledShift) => void;
  onManageTime: (shift: ScheduledShift) => void;
  onDelete: (shiftId: string) => void;
  onStatusUpdate: (shiftId: string, status: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canManageTime?: boolean;
  canUpdateStatus?: boolean;
}

const TimesheetCard: React.FC<TimesheetCardProps> = ({
  shift,
  isSelected,
  onSelect,
  onEdit,
  onManageTime,
  onDelete,
  onStatusUpdate,
  canEdit = false,
  canDelete = false,
  canManageTime = false,
  canUpdateStatus = false,
}) => {
  const statusConfig = getStatusConfig(shift.status);
  
  // Status styles for legacy compatibility
  const statusStyles = {
    working: { backgroundColor: '#118D5729', color: '#118D57' },
    standby: { backgroundColor: '#B76E0029', color: '#B76E00' },
    'Out of service': { backgroundColor: '#FF563029', color: '#B71D18' },
    stopped: { backgroundColor: '#FF563029', color: '#B71D18' },
  };
  
  const statusStyle = statusStyles[shift.status as keyof typeof statusStyles] || statusStyles.stopped;
  
  const shiftTypeStyle = {
    backgroundColor: '#00B8D929',
    color: '#006C9C',
  };
  
  return (
    <Card className="relative hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(shift.scheduledFleetId)}
            />
            <div className="flex items-center gap-2">
              <Badge
                style={statusStyle}
                className="text-xs font-bold border-0"
              >
                {shift.status === 'working' && <Play className="h-3 w-3 mr-1" />}
                {shift.status === 'standby' && <Pause className="h-3 w-3 mr-1" />}
                {(shift.status === 'Out of service' || shift.status === 'stopped') && (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
              </Badge>
              
              <Badge
                style={shiftTypeStyle}
                className="text-xs font-bold border-0 capitalize"
              >
                {shift.shiftType} Shift
              </Badge>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(shift)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {canManageTime && (
                <DropdownMenuItem onClick={() => onManageTime(shift)}>
                  <Clock className="h-4 w-4 mr-2" />
                  Manage Time
                </DropdownMenuItem>
              )}
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(shift)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Shift
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {canUpdateStatus && (
                <>
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(shift.scheduledFleetId, 'working')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Mark Working
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(shift.scheduledFleetId, 'standby')}
                  >
                    <Pause className="h-4 w-4 mr-2 text-yellow-600" />
                    Mark Standby
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onStatusUpdate(shift.scheduledFleetId, 'Out of service')}
                  >
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Mark Out of Service
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(shift.scheduledFleetId)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Shift
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Fleet Information */}
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-base text-foreground">
              {shift.fleet?.vehicleName || 'Unknown Fleet'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            Plate #: {shift.fleet?.plateNumber || 'N/A'}
          </p>
          {shift.fleet?.fleetType?.fleetType && (
            <p className="text-sm text-muted-foreground ml-6">
              Type: {shift.fleet.fleetType.fleetType}
            </p>
          )}
        </div>
        
        {/* Machine Hours */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Machine Hours:</span>
            <span className="font-bold text-lg">
              {formatHours(shift.timesheet?.totalMachineHours)}
            </span>
          </div>
        </div>
        
        <Separator />
        
        {/* Site Project */}
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Site:</p>
            <p className="font-medium">{shift.siteProject?.projectName || 'N/A'}</p>
          </div>
        </div>
        
        <Separator />
        
        {/* Operators */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium text-sm">Operator Hours:</h4>
          </div>
          
          <div className="space-y-2 ml-6">
            {shift.FirstOperator && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {getOperatorName(shift.FirstOperator)}:
                </span>
                <span className="text-sm font-bold">
                  {formatHours(shift.timesheet?.totalOperatorHours1)}
                </span>
              </div>
            )}
            
            {shift.shiftType === 'double' && shift.SecondOperator && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {getOperatorName(shift.SecondOperator)}:
                </span>
                <span className="text-sm font-bold">
                  {formatHours(shift.timesheet?.totalOperatorHours2)}
                </span>
              </div>
            )}
            
            {!shift.FirstOperator && (
              <p className="text-sm text-muted-foreground">No operators assigned</p>
            )}
          </div>
        </div>
        
        <Separator />
        
        {/* Date and Comments */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(shift.scheduledDate)}
            </span>
          </div>
          
          {shift.comment && (
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Comments:</p>
                <p className="text-sm text-foreground">{shift.comment}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Customer Information */}
        {shift.lpo?.representativeName && (
          <>
            <Separator />
            <div className="text-sm">
              <span className="text-muted-foreground">Customer: </span>
              <span className="font-medium">{shift.lpo.representativeName}</span>
            </div>
          </>
        )}
        
        {/* Quick Stats */}
        <div className="bg-muted/30 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Total Operator Hours</div>
              <div className="font-bold text-sm">
                {formatHours(getTotalOperatorHours(shift))}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Efficiency</div>
              <div className="font-bold text-sm">
                {shift.timesheet?.totalMachineHours && getTotalOperatorHours(shift) > 0
                  ? `${((getTotalOperatorHours(shift) / shift.timesheet.totalMachineHours) * 100).toFixed(0)}%`
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimesheetCard;