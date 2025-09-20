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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import CreateUserSheet from '@/app/components/CreateUserSheet'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
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
        return 'destructive'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            Create, view, and manage system users
          </p>
        </div>
        <Button onClick={() => setIsCreateSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Search and Filters */}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-11 w-[40%]"
        />
      </div>


      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {currentData ? `${currentData.page.length} users found` : 'Loading users...'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentData && currentData.page.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.page.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.name || 'No name'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email || 'No email'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No phone</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(user._creationTime)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user._id, user.name || 'Unknown')}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button variant="outline" onClick={loadMore}>
                    Load More
                  </Button>
                </div>
              )}
            </div>
          ) : currentData ? (
            <div className="text-center py-8">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No users found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSearchMode
                  ? 'Try adjusting your search terms.'
                  : 'Get started by creating a new user.'
                }
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
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