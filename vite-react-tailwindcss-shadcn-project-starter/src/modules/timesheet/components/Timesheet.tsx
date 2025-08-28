import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import TimesheetList from './TimesheetList';
import TimesheetCreate from './TimesheetCreate';
import ManageTime from './ManageTime';
import {
  selectTimesheetModals,
  setIsCreateModalOpen,
  setIsEditModalOpen,
  setIsManageTimeModalOpen,
} from '../../../stores/slices/timesheetSlice';

const Timesheet: React.FC = () => {
  const dispatch = useDispatch();
  const {
    isCreateModalOpen,
    isEditModalOpen,
    isManageTimeModalOpen,
    editingShift,
  } = useSelector(selectTimesheetModals);
  
  return (
    <>
      {/* Main Timesheet List */}
      <TimesheetList />
      
      {/* Create Shift Modal */}
      <TimesheetCreate
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(setIsCreateModalOpen(false))}
      />
      
      {/* Manage Time Modal */}
      <ManageTime
        isOpen={isManageTimeModalOpen}
        onClose={() => dispatch(setIsManageTimeModalOpen(false))}
        shift={editingShift}
      />
    </>
  );
};

export default Timesheet;