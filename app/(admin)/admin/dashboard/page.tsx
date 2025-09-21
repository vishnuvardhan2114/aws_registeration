"use client";

import React from 'react'
import { Users, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import ProfessionalLoader from '@/app/components/ProfessionalLoader'

const AdminDashboardPage = () => {
  const dashboardStats = useQuery(api.dashboard.getDashboardStats);
  const revenueStats = useQuery(api.dashboard.getRevenueStats);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (!dashboardStats || !revenueStats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard. Here&apos;s an overview of your system.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <ProfessionalLoader 
            message="Loading dashboard statistics..." 
            size="lg"
            className="py-12"
          />
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Students',
      value: formatNumber(dashboardStats.totalStudents),
      description: `${formatNumber(dashboardStats.totalTransactions)} registrations`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardStats.totalRevenue),
      description: `${formatCurrency(revenueStats.monthlyRevenue)} this month`,
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Events',
      value: formatNumber(dashboardStats.activeEvents),
      description: `${formatNumber(dashboardStats.totalTransactions)} total registrations`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Weekly Revenue',
      value: formatCurrency(revenueStats.weeklyRevenue),
      description: `${formatCurrency(revenueStats.dailyRevenue)} today`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here&apos;s an overview of your system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboardPage