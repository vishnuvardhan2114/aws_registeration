"use client";

import React, { useState, useMemo } from 'react';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { PaymentModal } from './PaymentModal';
import { Eye, CreditCard, Search, Filter } from 'lucide-react';

// Types
export interface RegisteredUser {
  id: string;
  name: string;
  contact: string;
  paymentStatus: 'paid' | 'pending' | 'exception';
  receipt?: string;
  batchYear: string;
  registrationDate: string;
  dateOfBirth: string;
}

interface RegisteredUsersTableProps {
  users: RegisteredUser[];
  onPaymentUpdate: (userId: string, paymentData: PaymentData) => void;
}

export interface PaymentData {
  method: 'upi' | 'cash' | 'exception';
  receipt?: File;
  isException?: boolean;
}

export const RegisteredUsersTable: React.FC<RegisteredUsersTableProps> = ({
  users,
  onPaymentUpdate
}) => {
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handlePaymentClick = (user: RegisteredUser) => {
    setSelectedUser(user);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (paymentData: PaymentData) => {
    if (selectedUser) {
      onPaymentUpdate(selectedUser.id, paymentData);
      setIsPaymentModalOpen(false);
      setSelectedUser(null);
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

  const formatDate = (dateString: string) => {
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
    // Format phone number for display
    const cleaned = contact.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return contact;
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.contact.includes(searchTerm) ||
        user.batchYear.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || user.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Registered Users ({filteredUsers.length} of {users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, contact, or batch year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const statusConfig = getStatusBadge(user.paymentStatus);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                calculateAge(user.dateOfBirth) >= 21 
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
                        <TableCell>
                          <Badge {...statusConfig}>
                            {user.paymentStatus.charAt(0).toUpperCase() + user.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.receipt ? (
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-gray-400 text-sm">No receipt</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {user.paymentStatus !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => handlePaymentClick(user)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Make Payment
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
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
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};
