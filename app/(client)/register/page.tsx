"use client";

import {
    Badge
} from '@/app/components/ui/badge';
import {
    Button
} from '@/app/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/app/components/ui/card';
import {
    Skeleton
} from '@/app/components/ui/skeleton';
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import {
    ArrowRight,
    Calendar,
    Clock,
    DollarSign,
    Loader2,
    MapPin,
    Utensils
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dateString));
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
        return { status: 'upcoming', label: 'Upcoming', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' };
    } else if (now >= start && now <= end) {
        return { status: 'active', label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' };
    } else {
        return { status: 'ended', label: 'Ended', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' };
    }
};

const EventsListingPage = () => {
    const eventsData = useQuery(api.events.getActiveEvents);
    const events = useMemo(() => eventsData || [], [eventsData]);
    const isLoading = eventsData === undefined;
    const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto py-8 px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        Available Events
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Discover and register for exciting events. Choose from our active and upcoming events.
                    </p>
                </div>

                {/* Events Grid */}
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <CardHeader>
                                    <div className="space-y-2">
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-8 w-20 rounded-full" />
                                    <Skeleton className="h-10 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <Card className="text-center py-12 max-w-md mx-auto">
                        <CardContent>
                            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Active Events</h3>
                            <p className="text-muted-foreground">
                                There are currently no active events available for registration.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => {
                            const eventStatus = getEventStatus(event.StartDate, event.EndDate);

                            return (
                                <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <CardTitle className="text-xl leading-tight">{event.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {formatDate(event.StartDate)}
                                                </CardDescription>
                                            </div>
                                            <Badge className={eventStatus.className}>
                                                {eventStatus.label}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Event Duration */}
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-2xl text-green-600">
                                                    {formatCurrency(event.amount)}
                                                </span>
                                            </div>
                                            {event.isFoodIncluded && (
                                                <div className="flex items-center gap-1 text-sm text-orange-600">
                                                    <Utensils className="h-4 w-4" />
                                                    <span>Food Included</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Registration Button */}
                                        <Button
                                            className="w-full cursor-pointer"
                                            size="lg"
                                            disabled={eventStatus.status === 'ended' || loadingEventId === event._id}
                                            onClick={() => {
                                                if (eventStatus.status !== 'ended') {
                                                    setLoadingEventId(event._id);
                                                    router.push(`/register/${event._id}`);
                                                }
                                            }}
                                        >
                                            {loadingEventId === event._id ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Loading...
                                                </>
                                            ) : eventStatus.status === 'ended' ? (
                                                'Registration Closed'
                                            ) : (
                                                <>
                                                    Register Now
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Footer Info */}
                {!isLoading && events.length > 0 && (
                    <div className="mt-12 text-center">
                        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900">Event Registration</h3>
                                </div>
                                <p className="text-blue-800 text-sm">
                                    Click on any event to start your registration process. All payments are processed securely through Razorpay.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsListingPage;
