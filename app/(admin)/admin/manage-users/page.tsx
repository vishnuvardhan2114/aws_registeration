'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar'
import { Skeleton } from '@/app/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import CreateUserSheet from '@/app/components/CreateUserSheet'
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  UserPlus,
  Filter,
} from 'lucide-react'
import { Id } from '@/convex/_generated/dataModel'

const ManageUsersPage = () => {
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<{
    _id: Id<"users">
    name?: string
    email?: string
    role?: string
    phone?: string
  } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [paginationCursor, setPaginationCursor] = useState<string | null>(null)
  const [isSearchMode, setIsSearchMode] = useState(false)


  // Queries
  const users = useQuery(
    api.users.getUsers,
    isSearchMode ? "skip" : {
      paginationOpts: {
        numItems: 20,
        cursor: paginationCursor,
      },
    }
  )

  const searchResults = useQuery(
    api.users.searchUsers,
    !isSearchMode || !searchTerm.trim() ? "skip" : {
      searchTerm: searchTerm.trim(),
      paginationOpts: {
        numItems: 20,
        cursor: paginationCursor,
      },
    }
  )

  // Mutations
  const deleteUser = useMutation(api.users.deleteUser)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPaginationCursor(null)
    setIsSearchMode(value.trim().length > 0)
  }

  const handleEditUser = (user: {
    _id: Id<"users">
    name?: string
    email?: string
    role?: string
    phone?: string
  }) => {
    setEditingUser(user)
    setIsCreateSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsCreateSheetOpen(false)
    setEditingUser(null)
  }

  const handleDeleteUser = async (userId: Id<'users'>, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteUser({ userId })
      toast.success('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'default'
      case 'scanner':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const currentData = isSearchMode ? searchResults : users
  const hasMore = currentData ? !currentData.isDone : false

  const loadMore = () => {
    if (currentData && hasMore) {
      setPaginationCursor(currentData.continueCursor)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            Create, view, and manage system users
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateSheetOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {currentData ? (
              <>
                <div className="text-2xl font-bold">{currentData.page.length}</div>
                <p className="text-xs text-muted-foreground">
                  {isSearchMode ? 'Search results' : 'All users'}
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {currentData ? (
              <>
                <div className="text-2xl font-bold">
                  {currentData.page.filter(user => user.role === 'admin').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  System administrators
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-24" />
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-11 w-[40%]"
          />
        </div>
      </div>


      {/* Users Table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users
              </CardTitle>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {currentData ? currentData.page.length : 0} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentData && currentData.page.length > 0 ? (
            <div className="space-y-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-muted/30">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="w-[80px] font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.page.map((user) => (
                      <TableRow
                        key={user._id}
                        className="hover:bg-muted/50 transition-colors border-b"
                      >
                        <TableCell className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                              <AvatarFallback className="bg-gray-700 text-white font-semibold">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="font-semibold text-foreground">
                                {user.name || 'No name'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {user.email || 'No email'}
                              </span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {user.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className="font-medium"
                          >
                            {user.role || 'user'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(user._creationTime)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-muted"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer focus:text-red-600"
                                onClick={() => handleDeleteUser(user._id, user.name || 'Unknown')}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center p-6 border-t bg-muted/20">
                  <Button variant="outline" onClick={loadMore} className="min-w-[120px]">
                    Load More Users
                  </Button>
                </div>
              )}
            </div>
          ) : currentData ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                {isSearchMode
                  ? `No users match your search for "${searchTerm}". Try adjusting your search terms.`
                  : 'Get started by creating your first user.'
                }
              </p>
              {!isSearchMode && (
                <Button onClick={() => setIsCreateSheetOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create First User
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4 p-6">
              {/* Loading skeleton rows */}
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="space-y-2 w-48">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Sheet */}
      <CreateUserSheet
        isOpen={isCreateSheetOpen}
        onClose={handleCloseSheet}
        editUser={editingUser}
      />
    </div>
  )
}

export default ManageUsersPage