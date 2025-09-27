/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Id } from '@/convex/_generated/dataModel';
import { CreditCard, Download, Eye, Filter, Loader2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PaymentModal } from './PaymentModal';
import { ReceiptPreviewModal } from './ReceiptPreviewModal';
import { useDebounce } from '../hooks/useDebounce';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';


// Types
export interface RegisteredUser {
  _id: Id<'tokens'>;
  studentId: Id<'students'>,
  name: string;
  contact: string;
  paymentStatus: 'paid' | 'pending' | 'exception';
  receipt?: string;
  batchYear: number;
  registrationDate: number;
  dateOfBirth: string;
  paymentMethod?: string;
  paymentAmount?: number;
}

interface RegisteredUsersTableProps {
  users: RegisteredUser[];
  loadMore: (numberItems: number) => void;
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  eventId: Id<'events'>
  setSearchValue: (value: string) => void;
  statusFilter: 'all' | 'paid' | 'pending' | 'exception';
  setStatusFilter: (value: 'all' | 'paid' | 'pending' | 'exception') => void;
}

export interface PaymentData {
  method: 'upi' | 'cash' | 'exception';
  receipt?: File;
  isException?: boolean;
}

export const RegisteredUsersTable: React.FC<RegisteredUsersTableProps> = ({
  users,
  loadMore,
  status,
  eventId,
  setSearchValue,
  statusFilter,
  setStatusFilter
}) => {
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptStorageId, setSelectedReceiptStorageId] = useState<Id<"_storage"> | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Get receipt URL when storage ID is selected
  const receiptUrl = useQuery(
    api.events.getReceiptUrl,
    selectedReceiptStorageId ? { storageId: selectedReceiptStorageId } : "skip"
  );

  useEffect(() => {
    setSearchValue(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchValue])

  const handlePaymentClick = (user: RegisteredUser) => {
    setSelectedUser(user);
    setIsPaymentModalOpen(true);
  };

  const handleReceiptClick = (user: RegisteredUser) => {
    if (user.receipt) {
      setSelectedReceiptStorageId(user.receipt as Id<"_storage">);
      setSelectedUserName(user.name);
      setIsReceiptModalOpen(true);
    }
  };



  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      exception: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-100' }
    };

    return variants[status as keyof typeof variants] || variants.pending;
  };

  const formatDate = (dateString: string | number) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatContact = (contact: string) => {
    const cleaned = contact.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return contact;
  };

  // CSV Export functionality
  const convertToCSV = (data: { users: RegisteredUser[], summary: any }) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(amount);
    };

    // Create summary section
    const summarySection = [
      ['PAYMENT SUMMARY'],
      [''],
      ['UPI Payments:', formatCurrency(data.summary.totalUpiAmount)],
      ['Cash Payments:', formatCurrency(data.summary.totalCashAmount)],
      ['Total Collected:', formatCurrency(data.summary.totalAmount)],
      [''],
      ['USER STATISTICS'],
      [''],
      ['Paid Users:', data.summary.paidUsers.toString()],
      ['Pending Users:', data.summary.pendingUsers.toString()],
      ['Exception Users:', data.summary.exceptionUsers.toString()],
      [''],
      ['USER DATA'],
      ['']
    ];

    const headers = [
      'Name',
      'Contact',
      'Age',
      'Batch Year',
      'Registration Date',
      'Payment Status',
      'Payment Method',
      'Payment Amount',
      'Date of Birth'
    ];

    const rows = data.users.map(user => [
      user.name || '',
      user.contact || '',
      calculateAge(user.dateOfBirth || '').toString(),
      user.batchYear?.toString() || '',
      formatDate(user.registrationDate),
      user.paymentStatus || '',
      user.paymentMethod || '',
      user.paymentAmount ? formatCurrency(user.paymentAmount) : '',
      user.dateOfBirth || ''
    ]);

    const csvContent = [
      ...summarySection.map(row => row.map(field => `"${field}"`).join(',')),
      headers.join(','),
      ...rows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get all users data for export
  const allUsersForExport = useQuery(
    api.events.getAllEventRegistrationsForExport,
    {
      eventId,
      searchName: debouncedSearchTerm || undefined,
      statusFilter
    }
  );

  const handleExportCSV = () => {
    if (!allUsersForExport) {
      toast.error('Loading data for export... Please try again in a moment.');
      return;
    }

    const csvContent = convertToCSV(allUsersForExport);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `registered-users-${timestamp}.csv`;

    downloadCSV(csvContent, filename);
    toast.success(`Exported ${allUsersForExport.users.length} users to ${filename}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Registered Users ({users.length})
            </CardTitle>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={!allUsersForExport}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative w-full sm:w-[50%]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full h-11"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Batch Year</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const statusConfig = getStatusBadge(user.paymentStatus);
                    return (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${calculateAge(user.dateOfBirth) >= 21
                                ? 'bg-green-500'
                                : 'bg-red-500'
                                }`}
                            />
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{formatContact(user.contact)}</TableCell>
                        <TableCell>{calculateAge(user.dateOfBirth)}</TableCell>
                        <TableCell>{user.batchYear}</TableCell>
                        <TableCell>{formatDate(user.registrationDate)}</TableCell>
                        {
                          user.paymentStatus !== 'exception' && (
                            <TableCell>
                              <Badge {...statusConfig}>
                                {user.paymentStatus.charAt(0).toUpperCase() + user.paymentStatus.slice(1)}
                              </Badge>
                            </TableCell>
                          )
                        }
                        <TableCell className='text-center'>
                          {user.paymentStatus === 'pending' ? (
                            <span className="text-gray-400 text-sm">-</span>
                          ) : (
                            <Badge>
                              {user.paymentMethod?.charAt(0).toUpperCase() + user.paymentMethod?.slice(1)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className='text-center'>
                          {user.paymentStatus === 'paid' && user.paymentAmount ? (
                            <span className="font-medium text-green-600">
                              ₹{user.paymentAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.receipt ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReceiptClick(user)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">No receipt</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.paymentStatus !== 'paid' ? (
                            <Button
                              size="sm"
                              onClick={() => handlePaymentClick(user)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Make Payment
                            </Button>
                          ) : (
                            <Button variant="ghost" size="sm" className='bg-green-600 hover:text-white text-white hover:bg-green-700' disabled={true}>Paid</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Load More Section */}
          <div className="flex justify-center mt-6">
            {status === "LoadingMore" || status === "LoadingFirstPage" ? (
              <Button disabled className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : status === "CanLoadMore" ? (
              <Button onClick={() => loadMore(10)}>Load More</Button>
            ) : status === "Exhausted" ? (
              <p className="text-gray-500 text-sm">No more users to load</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {selectedUser && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          eventId={eventId}
        />
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceiptStorageId(null);
          setSelectedUserName('');
        }}
        receiptUrl={receiptUrl || undefined}
        fileName={selectedUserName}
      />
    </div>
  );
};
