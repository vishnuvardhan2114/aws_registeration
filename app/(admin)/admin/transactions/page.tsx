"use client";

import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Search,
  Download,
  Eye,
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
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card';
import {
  Button
} from '@/app/components/ui/button';
import {
  Input
} from '@/app/components/ui/input';
import {
  Badge
} from '@/app/components/ui/badge';

// Transaction type from Convex
type Transaction = {
  _id: string;
  _creationTime: number;
  paymentId: string;
  amount: number;
  orderId: string;
  status: string;
};

type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

const getStatusBadge = (status: TransactionStatus) => {
  const statusConfig = {
    completed: {
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100',
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

  const config = statusConfig[status];
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
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [paginationCursor, setPaginationCursor] = useState<string | null>(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Queries
  const transactions = useQuery(
    api.transactions.getTransactions,
    isSearchMode ? "skip" : {
      paginationOpts: {
        numItems: 20,
        cursor: paginationCursor,
      },
    }
  );

  const searchResults = useQuery(
    api.transactions.searchTransactions,
    !isSearchMode || (!searchTerm.trim() && statusFilter === 'all') ? "skip" : {
      searchTerm: searchTerm.trim(),
      statusFilter: statusFilter === 'all' ? undefined : statusFilter,
      paginationOpts: {
        numItems: 20,
        cursor: paginationCursor,
      },
    }
  );

  const stats = useQuery(api.transactions.getTransactionStats);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPaginationCursor(null);
    setIsSearchMode(value.trim().length > 0 || statusFilter !== 'all');
  };

  const handleStatusFilter = (status: TransactionStatus | 'all') => {
    setStatusFilter(status);
    setPaginationCursor(null);
    setIsSearchMode(searchTerm.trim().length > 0 || status !== 'all');
  };

  const currentData = isSearchMode ? searchResults : transactions;
  const hasMore = currentData ? !currentData.isDone : false;

  const loadMore = () => {
    if (currentData && hasMore) {
      setPaginationCursor(currentData.continueCursor);
    }
  };

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
        <Card className='w-[300px]'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats ? formatCurrency(stats.totalAmount) : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats?.completedTransactions || 0} completed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by payment ID, order ID..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-11 w-[40%]"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Payment Details</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData && currentData.page.length > 0 ? (
                currentData.page.map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{transaction._id.slice(-8)}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.paymentId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">Payment ID</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.paymentId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.orderId}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-lg">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        via Razorpay
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status as TransactionStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(new Date(transaction._creationTime).toISOString())}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : currentData ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;