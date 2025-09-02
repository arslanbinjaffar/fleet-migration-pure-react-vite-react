import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

// Types and utilities
import type { Supplier, SupplierLedgerEntry } from '../types';
import {
  formatCurrency,
  formatDateTime,
  getTransactionTypeColor,
  getSupplierStatusColor,
} from '../utils';
import { TRANSACTION_TYPES } from '../constants';

// Mock data - replace with actual API calls
const MOCK_SUPPLIER: Supplier = {
  supplierId: '1',
  supplierName: 'ABC Auto Parts',
  contactPerson: 'John Smith',
  email: 'john@abcautoparts.com',
  phone: '+1-555-0123',
  address: '123 Main St',
  city: 'New York',
  country: 'USA',
  status: 'active',
  currentBalance: 5000,
  creditLimit: 10000,
};

const MOCK_LEDGER_ENTRIES: SupplierLedgerEntry[] = [
  {
    entryId: '1',
    supplierId: '1',
    transactionType: 'purchase',
    referenceNumber: 'PO-2024-001',
    description: 'Purchase Order - Auto Parts',
    amount: 2500,
    balance: 2500,
    date: '2024-02-15T10:00:00Z',
    createdBy: 'admin',
    createdAt: '2024-02-15T10:00:00Z',
  },
  {
    entryId: '2',
    supplierId: '1',
    transactionType: 'payment',
    referenceNumber: 'PAY-2024-001',
    description: 'Payment received - Check #1234',
    amount: 1000,
    balance: 1500,
    date: '2024-02-20T14:30:00Z',
    createdBy: 'admin',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    entryId: '3',
    supplierId: '1',
    transactionType: 'purchase',
    referenceNumber: 'PO-2024-002',
    description: 'Purchase Order - Engine Parts',
    amount: 3500,
    balance: 5000,
    date: '2024-02-25T09:15:00Z',
    createdBy: 'admin',
    createdAt: '2024-02-25T09:15:00Z',
  },
];

interface SupplierLedgerProps {
  className?: string;
}

const SupplierLedger: React.FC<SupplierLedgerProps> = ({ className }) => {
  const navigate = useNavigate();
  const { supplierId } = useParams<{ supplierId: string }>();
  const { toast } = useToast();
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<SupplierLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

  // Load supplier and ledger data
  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (supplierId === MOCK_SUPPLIER.supplierId) {
          setSupplier(MOCK_SUPPLIER);
          setLedgerEntries(MOCK_LEDGER_ENTRIES);
        } else {
          throw new Error('Supplier not found');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load supplier ledger data',
          variant: 'destructive',
        });
        navigate('/inventory/supplier');
      } finally {
        setIsLoading(false);
      }
    };

    if (supplierId) {
      loadData();
    }
  }, [supplierId, navigate, toast]);

  // Filter ledger entries
  const filteredEntries = ledgerEntries.filter(entry => {
    if (transactionFilter === 'all') return true;
    return entry.transactionType === transactionFilter;
  });

  // Calculate totals
  const totalPurchases = ledgerEntries
    .filter(entry => entry.transactionType === 'purchase' || entry.transactionType === 'debit')
    .reduce((sum, entry) => sum + entry.amount, 0);
    
  const totalPayments = ledgerEntries
    .filter(entry => entry.transactionType === 'payment' || entry.transactionType === 'credit')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const handleBack = () => {
    navigate('/inventory/supplier');
  };

  const handleAddPayment = () => {
    navigate('/inventory/add-payment/supplier/create', {
      state: { supplierId, supplierName: supplier?.supplierName }
    });
  };

  const handleExportLedger = () => {
    // TODO: Implement export functionality
    toast({
      title: 'Export',
      description: 'Ledger export functionality will be implemented',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span>Loading ledger...</span>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Supplier not found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier Ledger</h1>
            <p className="text-muted-foreground">
              Transaction history for {supplier.supplierName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportLedger}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleAddPayment}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </div>

      {/* Supplier Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-semibold">{supplier.supplierName}</p>
              <p className="text-sm text-muted-foreground">{supplier.contactPerson}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getSupplierStatusColor(supplier.status)}>
                {supplier.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={`text-lg font-bold ${supplier.currentBalance && supplier.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(supplier.currentBalance || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Purchases</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(totalPurchases)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payments</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalPayments)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value={TRANSACTION_TYPES.PURCHASE}>Purchases</SelectItem>
                <SelectItem value={TRANSACTION_TYPES.PAYMENT}>Payments</SelectItem>
                <SelectItem value={TRANSACTION_TYPES.CREDIT}>Credits</SelectItem>
                <SelectItem value={TRANSACTION_TYPES.DEBIT}>Debits</SelectItem>
                <SelectItem value={TRANSACTION_TYPES.ADJUSTMENT}>Adjustments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {transactionFilter === 'all'
                        ? 'No transactions found'
                        : `No ${transactionFilter} transactions found`}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEntries.map((entry) => (
                  <TableRow key={entry.entryId}>
                    <TableCell>
                      {formatDateTime(entry.date)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={getTransactionTypeColor(entry.transactionType)}
                      >
                        {entry.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.referenceNumber || '-'}
                    </TableCell>
                    <TableCell>
                      {entry.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={
                        entry.transactionType === 'purchase' || entry.transactionType === 'debit'
                          ? 'text-red-600'
                          : 'text-green-600'
                      }>
                        {entry.transactionType === 'purchase' || entry.transactionType === 'debit' ? '+' : '-'}
                        {formatCurrency(entry.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span className={entry.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatCurrency(entry.balance)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplierLedger;