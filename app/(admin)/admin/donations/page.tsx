"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Heart,
  TrendingUp,
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Download,
  Calendar,
  DollarSign,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Filter,
  Settings
} from 'lucide-react';
import ProfessionalLoader from '@/app/components/ProfessionalLoader';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

const DonationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  // Convex queries
  const donations = useQuery(api.donations.getDonations, { limit: 100 });
  const donationStats = useQuery(api.donations.getDonationStats);
  const categories = useQuery(api.donationCategories.getAllCategories);
  const resendReceipt = useMutation(api.donationEmail.resendDonationReceipt);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'captured':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResendReceipt = async (donationId: Id<"donations">) => {
    try {
      const result = await resendReceipt({ donationId });
      if (result.success) {
        toast.success('Receipt resent successfully');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Resend receipt error:', error);
      toast.error('Failed to resend receipt');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Data refreshed');
    }, 1000);
  };

  // Filter donations
  const filteredDonations = donations?.filter((donation) => {
    const matchesSearch =
      donation.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.paymentId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' ||
      (categoryFilter === 'others' ? !donation.categoryId : donation.categoryId === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  }) || [];

  if (!donations || !donationStats || !categories) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all donations to your organization.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <ProfessionalLoader
            message="Loading donations data..."
            size="lg"
            className="py-12"
          />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Donations',
      value: formatCurrency(donationStats.totalAmount),
      description: `${donationStats.totalCount} donations`,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'This Month',
      value: formatCurrency(donationStats.monthlyAmount),
      description: `${donationStats.monthlyCount} donations`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'This Week',
      value: formatCurrency(donationStats.weeklyAmount),
      description: `${donationStats.weeklyCount} donations`,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Average Donation',
      value: formatCurrency(donationStats.averageDonation),
      description: 'Per donation',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Donations</h1>
          <p className="text-gray-600">
            Manage and track all donations to your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-gray-200 hover:bg-gray-50"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-200 hover:bg-gray-50"
          >
            <Link href="/admin/donations/categories">
              <Settings className="h-4 w-4 mr-2" />
              Categories
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isCategoriesOpen ? 'Hide' : 'Show'} Categories
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="">
        <div className="flex w-full justify-between">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by donor name, email, or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 w-[60%] border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2 w-full justify-end">
            <div className="w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="captured">Captured</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="w-40">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
                <option value="others">Others</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Heart className="h-5 w-5" />
                Recent Donations ({filteredDonations.length})
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Donor</TableHead>
                  <TableHead className="font-semibold text-gray-900">Amount</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  <TableHead className="font-semibold text-gray-900">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No donations found
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                          ? 'Try adjusting your filters to see more results.'
                          : 'No donations have been made yet.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {donation.donorEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(donation.amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatDate(donation._creationTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={donation.receiptSent ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {donation.receiptSent ? 'Sent' : 'Pending'}
                        </Badge>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown - Collapsible */}
      {isCategoriesOpen && (
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-5 w-5" />
              Donations by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {donationStats.categoryStats.map((categoryStat) => (
                <div key={categoryStat.categoryId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">{categoryStat.categoryName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(categoryStat.amount)}</div>
                    <div className="text-sm text-gray-500">
                      {categoryStat.count} donations ({categoryStat.percentage.toFixed(1)}%)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DonationsPage;
