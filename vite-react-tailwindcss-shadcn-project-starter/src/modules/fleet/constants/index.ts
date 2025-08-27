// Fleet constants and select options
import { FleetSelectOptions } from '../types';

export const FLEET_SECTIONS = {
  'Fleet Information': [
    'fleetType',
    'plateNumber',
    'plateType',
    'ownerName',
    'ownerID',
    'nationality',
    'hourlyRate',
  ],
  'Registration Details': [
    'firstRegistrationDate',
    'registrationRenewalDate',
    'registrationExpiryDate',
    'fahesDate',
    'fahesReport',
  ],
  'Vehicle Details': [
    'vehicleName',
    'vehicleModel',
    'madeIn',
    'productionDate',
    'shape',
    'noOfCylinders',
    'numberOfDoors',
    'weight',
    'grossWeight',
    'color',
    'subColor',
    'chassisNumber',
    'engineNumber',
  ],
  'Insurance Details': [
    'insurer',
    'insurancePolicy',
    'insuranceExpiryDate',
    'ownershipType',
    'insuranceType',
  ],
  'Third Party Inspection': [
    'tpcInspectionAs',
    'tpcExpiryDate',
    'thirdPartyCertificateCo',
    'inspectionDate',
    'inspectionExpiryDate',
    'inspectionType',
    'dateOfLastExamination',
    'dateOfNextExamination',
  ],
};

export const FLEET_SELECT_OPTIONS: FleetSelectOptions = {
  insuranceType: [
    { value: 'comprehensive', label: 'Comprehensive' },
    { value: 'thirdParty', label: 'Third Party' },
    { value: 'fireAndTheft', label: 'Fire and Theft' },
  ],
  thirdPartyCertificateCo: [
    { value: 'tuv', label: 'TUV' },
    { value: 'abs', label: 'ABS' },
  ],
  inspectionType: [
    { value: 'liftingEquipments', label: 'Lifting Equipments' },
    { value: 'earthMoving', label: 'Earth Moving' },
    { value: 'commercialVehicle', label: 'Commercial Vehicle' },
  ],
};

export const INSURANCE_TYPE_LABELS = {
  comprehensive: 'Comprehensive',
  thirdParty: 'Third Party',
  fireAndTheft: 'Fire and Theft',
};

export const THIRD_PARTY_CERTIFICATE_LABELS = {
  tuv: 'TUV',
  abs: 'ABS',
};

export const TPC_INSPECTION_LABELS = {
  wheelLoader: 'Wheel Loader',
  shovellWheelLoader: 'Shovell + Wheel Loader',
  lorryWithCrane: 'Lorry With Crane',
};