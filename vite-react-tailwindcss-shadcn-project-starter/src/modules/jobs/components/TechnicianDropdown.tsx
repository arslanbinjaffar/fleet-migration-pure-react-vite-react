import React from 'react';
import { useDispatch } from 'react-redux';
import { UserCheck, UserX, UserPlus, ChevronDown } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Store and API
import {
  useAssignTechnicianMutation,
  useClearTechnicianMutation,
} from '@/stores/api/jobsApiSlice';
import {
  setCurrentJobForTechnician,
  setManualTechnicianModalOpen,
} from '@/stores/slices/jobsSlice';

// Types and utilities
import type { Job } from '../types';
import { getTechnicianDisplayName, isTechnicianAssigned } from '../utils';

// Mock technician options (in real app, this would come from API)
const MOCK_TECHNICIANS = [
  { userId: '1', firstName: 'John', lastName: 'Smith' },
  { userId: '2', firstName: 'Jane', lastName: 'Doe' },
  { userId: '3', firstName: 'Mike', lastName: 'Johnson' },
  { userId: '4', firstName: 'Sarah', lastName: 'Wilson' },
];

interface TechnicianDropdownProps {
  job: Job;
  className?: string;
}

const TechnicianDropdown: React.FC<TechnicianDropdownProps> = ({ job, className }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  // API hooks
  const [assignTechnician, { isLoading: isAssigning }] = useAssignTechnicianMutation();
  const [clearTechnician, { isLoading: isClearing }] = useClearTechnicianMutation();

  const currentTechnician = getTechnicianDisplayName(job);
  const isAssigned = isTechnicianAssigned(job);
  const isLoading = isAssigning || isClearing;

  // Handle technician assignment
  const handleAssignTechnician = async (technicianId: string) => {
    try {
      await assignTechnician({
        jobId: job.jobId,
        technicianId,
      }).unwrap();
      
      const technician = MOCK_TECHNICIANS.find(t => t.userId === technicianId);
      toast({
        title: 'Success',
        description: `Technician ${technician?.firstName} ${technician?.lastName} assigned successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign technician',
        variant: 'destructive',
      });
    }
  };

  // Handle manual technician assignment
  const handleManualTechnicianAssignment = () => {
    dispatch(setCurrentJobForTechnician(job));
    dispatch(setManualTechnicianModalOpen(true));
  };

  // Handle clear technician
  const handleClearTechnician = async () => {
    try {
      await clearTechnician(job.jobId).unwrap();
      toast({
        title: 'Success',
        description: 'Technician assignment cleared successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear technician assignment',
        variant: 'destructive',
      });
    }
  };

  // Get button style based on assignment status
  const getButtonStyle = () => {
    if (job.manualTechnician) {
      return {
        variant: 'outline' as const,
        className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
      };
    }
    
    if (isAssigned) {
      return {
        variant: 'outline' as const,
        className: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
      };
    }
    
    return {
      variant: 'outline' as const,
      className: 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 border-dashed',
    };
  };

  const buttonStyle = getButtonStyle();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={buttonStyle.variant}
          size="sm"
          disabled={isLoading}
          className={`min-w-[120px] justify-between ${buttonStyle.className} ${className}`}
        >
          <div className="flex items-center gap-1">
            {isAssigned ? (
              <UserCheck className="h-3 w-3" />
            ) : (
              <UserX className="h-3 w-3" />
            )}
            <span className="truncate max-w-[80px]">
              {isLoading ? 'Loading...' : currentTechnician}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-56">
        {/* System Technicians */}
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          System Technicians
        </div>
        {MOCK_TECHNICIANS.map((technician) => {
          const isCurrentTechnician = job.technician === technician.userId;
          return (
            <DropdownMenuItem
              key={technician.userId}
              onClick={() => handleAssignTechnician(technician.userId)}
              disabled={isLoading || isCurrentTechnician}
              className={isCurrentTechnician ? 'bg-muted' : ''}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>{`${technician.firstName} ${technician.lastName}`}</span>
                {isCurrentTechnician && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        {/* Manual Technician */}
        <DropdownMenuItem
          onClick={handleManualTechnicianAssignment}
          disabled={isLoading}
          className="text-blue-600"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Manual Technician
        </DropdownMenuItem>
        
        {/* Clear Assignment */}
        {isAssigned && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleClearTechnician}
              disabled={isLoading}
              className="text-destructive"
            >
              <UserX className="mr-2 h-4 w-4" />
              Clear Assignment
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TechnicianDropdown;