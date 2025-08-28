import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoleBasedNavigation } from '../../../utils/roleBasedNavigation';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Plus,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Receipt,
  Filter,
  Download,
  Eye,
  User,
  CreditCard,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

import {
  useGetCustomerByIdQuery,
  useGetCustomerLedgersQuery,
  useCreateCustomerLedgerMutation,
} from '../../../stores/api/customerApiSlice';
import { selectCurrentUser } from '../../../stores/slices/authSlice';
import {
  customerLedgerSchema,
  CustomerLedgerFormData,
} from '../schemas/customerSchema';
import {
  TRANSACTION_TYPE_OPTIONS,
  CUSTOMER_LEDGER_COLUMNS,
} from '../constants';
import {
  formatDate,
  formatCurrency,
  getTransactionTypeConfig,
  getCustomerFullName,
  calculateRunningBalance,
  getTotalBalance,
  getErrorMessage,
} from '../utils';
import {
  CreateButton,
  PermissionModule,
  useHasPermission,
} from '../../../components/permissions';
import { PERMISSIONS } from '../constants';

const CustomerLedger: React.FC = () => {
  const navigate = useRoleBasedNavigation();
  const { customerId } = useParams<{ customerId: string }>();
  const user = useSelector(selectCurrentUser);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // API hooks
  const {
    data: customerResponse,
    isLoading: customerLoading,
    error: customerError,
  } = useGetCustomerByIdQuery(customerId!, { skip: !customerId });
  
  const {
    data: ledgerResponse,
    isLoading: ledgerLoading,
    error: ledgerError,
    refetch: refetchLedger,
  } = useGetCustomerLedgersQuery({
    customerId: customerId!,
    page: currentPage,
    limit: pageSize,
  }, { skip: !customerId });
  const [createLedgerEntry, { isLoading: isCreating }] = useCreateCustomerLedgerMutation();
  // Extract data
  const customer = customerResponse?.customers;
  const ledgers = ledgerResponse?.ledgers || [];
  const totalBalance = ledgerResponse?.balance || 0;
  
  // Calculate running balances
  const ledgersWithBalance = calculateRunningBalance(ledgers);
  
  // Form setup
  const form = useForm<CustomerLedgerFormData>({
    resolver: zodResolver(customerLedgerSchema),
    defaultValues: {
      customerId: customerId || '',
      transactionType: 'credit',
      amount: 0,
      description: '',
      referenceNumber: '',
      transactionDate: new Date().toISOString().split('T')[0],
    },
  });
  
  const { control, handleSubmit, reset, formState: { errors } } = form;
  
  // Permission checks using new system
  const canCreateLedger = useHasPermission(PermissionModule.Customers, 'ledger');
  
  const handleBack = () => {
    const role = user?.Role?.roleName?.toLowerCase() || 'admin';
    navigate('/customer');
  };
  
  const onSubmit = async (data: CustomerLedgerFormData) => {
    try {
      await createLedgerEntry(data).unwrap();
      toast.success('Ledger entry created successfully');
      setIsDialogOpen(false);
      reset();
      refetchLedger();
    } catch (error: any) {
      console.error('Create ledger error:', error);
      toast.error(getErrorMessage(error));
    }
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    reset();
  };
  
  if (customerLoading || ledgerLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer ledger...</span>
      </div>
    );
  }
  console.log(customer,"customer")
  if (customerError || !customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {getErrorMessage(customerError) || 'Customer not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const creditTotal = ledgers
    .filter(ledger => ledger.transactionType === 'credit')
    .reduce((sum, ledger) => sum + ledger.amount, 0);
    
  const debitTotal = ledgers
    .filter(ledger => ledger.transactionType === 'debit')
    .reduce((sum, ledger) => sum + ledger.amount, 0);
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={handleBack} variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center">
              <FileText className="h-8 w-8 mr-3 text-primary" />
              Customer Ledger
            </h1>
            <p className="text-muted-foreground mt-1">
              Financial transactions for {getCustomerFullName(customer)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/${user?.Role?.roleName?.toLowerCase() || 'admin'}/customer/view/${customerId}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Customer
          </Button>
          {canCreateLedger && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Ledger Entry</DialogTitle>
                  <DialogDescription>
                    Create a new transaction entry for {getCustomerFullName(customer)}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="transactionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TRANSACTION_TYPE_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      {option.value === 'credit' ? (
                                        <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                      ) : (
                                        <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                                      )}
                                      {option.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="transactionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transaction Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={control}
                        name="referenceNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reference Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter reference" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter transaction description"
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={handleDialogClose}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Entry'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{getCustomerFullName(customer)}</CardTitle>
                <CardDescription>
                  {customer.organization && `${customer.organization} • `}
                  {customer.email}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Current account balance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(creditTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total incoming payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(debitTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total outgoing payments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledgers.length}</div>
            <p className="text-xs text-muted-foreground">
              Total transaction count
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Complete record of all financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledgersWithBalance.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                No financial transactions have been recorded for this customer yet.
              </p>
              {canCreateLedger && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgersWithBalance.map((ledger, index) => {
                    const typeConfig = getTransactionTypeConfig(ledger.transactionType);
                    
                    return (
                      <TableRow key={ledger.customerLedgerId || index}>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {formatDate(ledger.transactionDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${typeConfig.bgColor} ${typeConfig.color}`}>
                            {ledger.transactionType === 'credit' ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {ledger.description || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ledger.referenceNumber || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={ledger.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {ledger.transactionType === 'credit' ? '+' : '-'}
                            {formatCurrency(ledger.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            (ledger.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(ledger.balance || 0)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLedger;