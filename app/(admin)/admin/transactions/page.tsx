"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  User,
  Phone,
  CreditCard
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/app/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/app/components/ui/card';
import { 
  Button 
} from '@/app/components/ui/button';

import { 
  Badge 
} from '@/app/components/ui/badge';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Transaction interface removed as it's not used in this implementation
type TransactionStatus = 'captured' | 'pending' | 'failed' | 'refunded';


const getStatusBadge = (status: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statusConfig: Record<string, { variant: any; className: string; label: string }> = {
    captured: { 
      variant: 'default' as const, 
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      label: 'Completed'
    },
    pending: { 
      variant: 'secondary' as const, 
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      label: 'Pending'
    },
    failed: { 
      variant: 'destructive' as const, 
      className: 'bg-red-100 text-red-800 hover:bg-red-100',
      label: 'Failed'
    },
    refunded: { 
      variant: 'outline' as const, 
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
      label: 'Refunded'
    }
  };

  const config = statusConfig[status] || statusConfig['pending'];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

const TransactionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all transactions with comprehensive details from Convex
  const transactionDetails = useQuery(api.tokens.getAllTransactionsWithDetails);

  const filteredTransactions = useMemo(() => {
    if (!transactionDetails) return [];
    
    return transactionDetails.filter(transactionData => {
      if (!transactionData) return false;
      
      const { transaction, event, student } = transactionData;
      
      const matchesSearch = 
        (student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student?.phoneNumber || '').includes(searchTerm) ||
        (event?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, transactionDetails]);

  const totalAmount = useMemo(() => {
    return filteredTransactions
      .filter(t => t?.transaction?.status === 'captured')
      .reduce((sum, transactionData) => sum + (transactionData?.transaction?.amount || 0), 0);
  }, [filteredTransactions]);

  const statusCounts = useMemo(() => {
    return filteredTransactions.reduce((counts, transactionData) => {
      if (transactionData?.transaction?.status) {
        counts[transactionData.transaction.status] = (counts[transactionData.transaction.status] || 0) + 1;
      }
      return counts;
    }, {} as Record<string, number>);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Monitor and manage all payment transactions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="flex justify-end gap-2">
        <Card className='w-[350px]'> 
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              From {statusCounts.captured || 0} completed transactions
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Payer Details</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transactionData) => {
                  if (!transactionData) return null;
                  const { transaction, event, student } = transactionData;
                  
                  return (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{transaction._id.slice(0, 10)}...</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.paymentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{student?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {student?.phoneNumber || transaction.contact}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{event?.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.orderId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-lg">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          via {transaction.method}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(transaction.created_at)}
                        </div>
                      </TableCell>
                      
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;