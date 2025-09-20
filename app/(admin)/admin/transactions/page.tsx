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
// Custom dropdown implementation for status filter

// Mock data for transactions
const mockTransactions = [
  {
    id: 'TXN-001',
    paymentId: 'pay_123456789',
    orderId: 'order_001',
    amount: 299.00,
    status: 'completed',
    payerName: 'John Doe',
    payerPhone: '+91 98765 43210',
    eventName: 'AWS Summit 2024',
    date: '2024-01-15T10:30:00Z',
    method: 'razorpay'
  },
  {
    id: 'TXN-002',
    paymentId: 'pay_987654321',
    orderId: 'order_002',
    amount: 149.00,
    status: 'pending',
    payerName: 'Jane Smith',
    payerPhone: '+91 87654 32109',
    eventName: 'Tech Conference',
    date: '2024-01-14T14:20:00Z',
    method: 'razorpay'
  },
  {
    id: 'TXN-003',
    paymentId: 'pay_456789123',
    orderId: 'order_003',
    amount: 199.00,
    status: 'failed',
    payerName: 'Mike Johnson',
    payerPhone: '+91 76543 21098',
    eventName: 'Developer Workshop',
    date: '2024-01-13T09:15:00Z',
    method: 'razorpay'
  },
  {
    id: 'TXN-004',
    paymentId: 'pay_789123456',
    orderId: 'order_004',
    amount: 399.00,
    status: 'completed',
    payerName: 'Sarah Wilson',
    payerPhone: '+91 65432 10987',
    eventName: 'AI Conference',
    date: '2024-01-12T16:45:00Z',
    method: 'razorpay'
  },
  {
    id: 'TXN-005',
    paymentId: 'pay_321654987',
    orderId: 'order_005',
    amount: 99.00,
    status: 'refunded',
    payerName: 'David Brown',
    payerPhone: '+91 54321 09876',
    eventName: 'Webinar Series',
    date: '2024-01-11T11:00:00Z',
    method: 'razorpay'
  }
];

type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

// Transaction interface removed as it's not used in this implementation

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

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      const matchesSearch = 
        transaction.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.payerPhone.includes(searchTerm) ||
        transaction.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalAmount = useMemo(() => {
    return filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [filteredTransactions]);

  const statusCounts = useMemo(() => {
    return filteredTransactions.reduce((counts, transaction) => {
      counts[transaction.status] = (counts[transaction.status] || 0) + 1;
      return counts;
    }, {} as Record<TransactionStatus, number>);
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
              From {statusCounts.completed || 0} completed transactions
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
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{transaction.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {transaction.paymentId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{transaction.payerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {transaction.payerPhone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{transaction.eventName}</div>
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
                      {getStatusBadge(transaction.status as TransactionStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(transaction.date)}
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
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;