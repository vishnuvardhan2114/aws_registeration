"use client";

import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import {
    ArrowRight,
    Calendar,
    Clock,
    Loader2,
    MapPin,
    Utensils
} from 'lucide-react';
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
         return { status: 'upcoming', label: 'Upcoming', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' };
     } else if (now >= start && now <= end) {
         return { status: 'active', label: 'Active', className: 'bg-red-100 text-red-800 hover:bg-red-100' };
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
         <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-semibold text-slate-900 mb-3">
                        Available Events
                    </h1>
                    <p className="text-slate-600 max-w-2xl text-sm mx-auto">
                        Discover and register for exciting events. Choose from our active and upcoming events.
                    </p>
                </div>

                {/* Events Grid */}
                {isLoading ? (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                                {/* Image placeholder */}
                                <div className="h-48 bg-slate-100 animate-pulse"></div>
                                
                                <div className="p-6">
                                    {/* Title skeleton */}
                                    <div className="h-6 bg-slate-100 rounded-lg mb-3 animate-pulse"></div>
                                    
                                    {/* Date skeleton */}
                                    <div className="h-4 bg-slate-100 rounded w-2/3 mb-4 animate-pulse"></div>
                                    
                                    {/* Price skeleton */}
                                    <div className="h-5 bg-slate-100 rounded w-1/3 mb-4 animate-pulse"></div>
                                    
                                    {/* Button skeleton */}
                                    <div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Events</h3>
                        <p className="text-slate-600">
                            There are currently no active events available for registration.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => {
                            const eventStatus = getEventStatus(event.StartDate, event.EndDate);

                            return (
                                <div key={event._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-slate-300">
                                   
                                    
                                    <div className="p-6">
                                        {/* Header with title and status */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">
                                                    {event.name}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{formatDate(event.StartDate)}</span>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                eventStatus.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : eventStatus.status === 'upcoming'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-slate-100 text-slate-800'
                                            }`}>
                                                {eventStatus.label}
                                            </div>
                                        </div>

                                        {/* Event Duration */}
                                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
                                            </span>
                                        </div>

                                        {/* Price and Food Info */}
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl font-bold text-slate-900">
                                                    {formatCurrency(event.amount)}
                                                </span>
                                            </div>
                                            {event.isFoodIncluded && (
                                                <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                    <Utensils className="h-3 w-3" />
                                                    <span>Food Included</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Registration Button */}
                                        <button
                                            className={`w-full h-12 rounded-xl font-medium transition-all duration-200 ${
                                                eventStatus.status === 'ended' || loadingEventId === event._id
                                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    : 'bg-slate-900 hover:bg-slate-800 text-white hover:shadow-lg'
                                            }`}
                                            disabled={eventStatus.status === 'ended' || loadingEventId === event._id}
                                            onClick={() => {
                                                if (eventStatus.status !== 'ended') {
                                                    setLoadingEventId(event._id);
                                                    router.push(`/register/${event._id}`);
                                                }
                                            }}
                                        >
                                            {loadingEventId === event._id ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Loading...</span>
                                                </div>
                                            ) : eventStatus.status === 'ended' ? (
                                                'Registration Closed'
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <span>Register Now</span>
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Footer Info */}
                {!isLoading && events.length > 0 && (
                     <div className="mt-16 text-center">
                         <div className="max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-8">
                             <div className="flex items-center justify-center gap-2 mb-3">
                                 <MapPin className="h-5 w-5 text-slate-600" />
                                 <h3 className="font-semibold text-slate-900">Event Registration</h3>
                             </div>
                             <p className="text-slate-600 text-sm">
                                 Click on any event to start your registration process. All payments are processed securely through Razorpay.
                             </p>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default EventsListingPage;
