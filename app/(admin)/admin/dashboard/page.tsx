import React from 'react'
import { Users, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'

const AdminDashboardPage = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      description: '+20.1% from last month',
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total Revenue',
      value: '$45,231',
      description: '+10.2% from last month',
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Active Events',
      value: '12',
      description: '+2 new events this week',
      icon: Calendar,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Growth Rate',
      value: '23.5%',
      description: '+5.2% from last month',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest user registrations and system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                </div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Payment processed</p>
                  <p className="text-xs text-muted-foreground">$299.00 - Event Registration</p>
                </div>
                <div className="text-xs text-muted-foreground">5 minutes ago</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Event created</p>
                  <p className="text-xs text-muted-foreground">AWS Summit 2024</p>
                </div>
                <div className="text-xs text-muted-foreground">1 hour ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">View All Users</div>
                <div className="text-sm text-muted-foreground">Manage registered users</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">Create New Event</div>
                <div className="text-sm text-muted-foreground">Set up a new registration event</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="font-medium">View Transactions</div>
                <div className="text-sm text-muted-foreground">Review payment history</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboardPage