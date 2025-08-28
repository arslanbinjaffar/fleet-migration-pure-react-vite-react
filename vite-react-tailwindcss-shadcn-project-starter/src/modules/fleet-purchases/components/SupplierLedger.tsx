import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useRoleNavigation from '../../../utils/useNavigation';
import { NavigationPaths } from '../../../utils/navigationPaths';
import {
  FileText,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Package,
  Loader2,
  AlertTriangle,
  Plus,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useGetSupplierByIdQuery,
  useGetSupplierLedgerQuery,
  useExportSupplierLedgerMutation,
} from '../../../stores/api/fleetPurchasesApiSlice';
import {
  CreateButton,
  ExportButton,
  PermissionModule,
} from '../../../components/permissions';
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  getTransactionTypeConfig,
  getErrorMessage,
} from '../utils';
import { SUPPLIER_LEDGER_COLUMNS, TRANSACTION_TYPE_OPTIONS } from '../constants';
import type { SupplierLedger } from '../types';

const SupplierLedgerComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { roleNavigate } = useRoleNavigation();
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [transactionType, setTransactionType] = useState('');
  
  // API hooks
  const {
    data: supplier,
    isLoading: isLoadingSupplier,
    error: supplierError,
  } = useGetSupplierByIdQuery(id!, {
    skip: !id,
  });
  
  const {
    data: ledgerResponse,
    isLoading: isLoadingLedger,
    error: ledgerError,
    refetch,
  } = useGetSupplierLedgerQuery(id!, {
    skip: !id,
  });
  
  const [exportLedger, { isLoading: isExporting }] = useExportSupplierLedgerMutation();
  
  // Extract data
  const ledgerEntries = ledgerResponse?.ledgerEntries || [];
  const totalBalance = ledgerResponse?.totalBalance || 0;
  const totalDebit = ledgerResponse?.totalDebit || 0;
  const totalCredit = ledgerResponse?.totalCredit || 0;
  
  // Filter ledger entries
  const filteredEntries = ledgerEntries.filter(entry => {
    const entryDate = new Date(entry.transactionDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    const dateMatch = (!fromDate || entryDate >= fromDate) && (!toDate || entryDate <= toDate);
    const typeMatch = !transactionType || entry.transactionType === transactionType;
    
    return dateMatch && typeMatch;
  });
  
  // Handlers
  const handleBack = () => {
    if (id) {
      roleNavigate(NavigationPaths.FLEET_PURCHASES.VIEW_SUPPLIER(id));
    }
  };
  
  const handleAddPayment = () => {
    if (id) {
      roleNavigate(`${NavigationPaths.FLEET_PURCHASES.ADD_PAYMENT}?supplierId=${id}`);
    }
  };
  
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    if (!id) return;
    
    try {
      const blob = await exportLedger({ supplierId: id, format }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `supplier-ledger-${supplier?.name || id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Ledger exported successfully');
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };
  
  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setTransactionType('');
  };
  
  // Loading state
  if (isLoadingSupplier || isLoadingLedger) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // Error state
  if (supplierError || ledgerError || !supplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {supplierError ? getErrorMessage(supplierError) : 
             ledgerError ? getErrorMessage(ledgerError) : 
             'Supplier not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <FileText className="h-8 w-8 mr-3 text-primary" />
              Supplier Ledger
            </h1>
            <p className="text-muted-foreground mt-1">
              {supplier.name} • TRN: {supplier.TRN}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ExportButton 
            module={PermissionModule.SupplierFleet} 
            variant="outline" 
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </ExportButton>
          <CreateButton
            module={PermissionModule.SupplierFleet}
            onClick={handleAddPayment}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </CreateButton>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBalance >= 0 ? 'Amount owed to supplier' : 'Overpayment'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebit)}</div>
            <p className="text-xs text-muted-foreground">
              Total purchase amount
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredit)}</div>
            <p className="text-xs text-muted-foreground">
              Total payments made
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledgerEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transactions
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Transaction History</h3>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-muted' : ''}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <>
              <Separator className="mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">From Date</label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">To Date</label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Transaction Type</label>
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      {TRANSACTION_TYPE_OPTIONS.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Ledger Table */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No transactions found</h3>
            <p className="text-muted-foreground mb-4">
              {ledgerEntries.length === 0
                ? 'No transactions have been recorded for this supplier yet.'
                : 'No transactions match your filter criteria.'}
            </p>
            {ledgerEntries.length === 0 && (
              <CreateButton
                module={PermissionModule.SupplierFleet}
                onClick={handleAddPayment}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Payment
              </CreateButton>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {SUPPLIER_LEDGER_COLUMNS.map((column) => (
                  <TableHead key={column.key}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const typeConfig = getTransactionTypeConfig(entry.transactionType);
                
                return (
                  <TableRow key={entry.ledgerId}>
                    <TableCell>{formatDate(entry.transactionDate)}</TableCell>
                    <TableCell>
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={entry.description}>
                        {entry.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.debitAmount > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(entry.debitAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.creditAmount > 0 ? (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(entry.creditAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      
      {/* Summary Footer */}
      {filteredEntries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Showing {filteredEntries.length} of {ledgerEntries.length} transactions</span>
              <div className="flex items-center space-x-6">
                <span>Total Debits: <span className="font-medium text-red-600">{formatCurrency(totalDebit)}</span></span>
                <span>Total Credits: <span className="font-medium text-green-600">{formatCurrency(totalCredit)}</span></span>
                <span>Balance: <span className="font-medium">{formatCurrency(totalBalance)}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupplierLedgerComponent;