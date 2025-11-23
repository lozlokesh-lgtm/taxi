import React from 'react';
import { Layout } from './Layout';
import { Button, Badge } from './UI';
import { Driver, TripRequest, TripStatus } from '../types';

interface Props {
  driver: Driver;
  trips: TripRequest[];
  onAcceptTrip: (tripId: string) => void;
  onOpenCommunication: (trip: TripRequest, mode: 'CHAT' | 'CALL') => void;
  onBack: () => void;
}

export const DriverDashboard: React.FC<Props> = ({ driver, trips, onAcceptTrip, onOpenCommunication, onBack }) => {
  // Sort trips: Pending first, then by creation date (newest first)
  const sortedTrips = [...trips].sort((a, b) => {
    if (a.status === b.status) return b.createdAt - a.createdAt;
    return a.status === TripStatus.PENDING ? -1 : 1;
  });

  return (
    <Layout title="Driver Dashboard" showBack onBack={onBack}>
      {/* Driver Header */}
      <div className="bg-brand-600 pb-8 pt-2 px-6 rounded-b-[2rem] shadow-lg -mt-1 mb-6">
        <div className="flex items-center space-x-4">
          <img src={driver.photoUrl} alt="Driver" className="w-16 h-16 rounded-full border-2 border-white/50 object-cover" />
          <div className="text-white">
            <h2 className="text-xl font-bold">{driver.name}</h2>
            <p className="text-brand-100 text-sm flex items-center">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Online • {driver.carModel} ({driver.plateNumber})
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-20 space-y-4">
        <h3 className="font-bold text-slate-700 text-lg px-2">Trip Requests</h3>
        
        {sortedTrips.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>No trip requests available right now.</p>
          </div>
        ) : (
          sortedTrips.map(trip => (
            <div key={trip.id} className={`bg-white p-5 rounded-2xl shadow-sm border transition-all ${trip.status === TripStatus.ACCEPTED && trip.driverId === driver.id ? 'border-brand-400 ring-1 ring-brand-400 bg-brand-50/30' : 'border-slate-100'}`}>
              
              {/* Header: Status & Price */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {new Date(trip.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  {trip.status === TripStatus.ACCEPTED && trip.driverId === driver.id ? (
                    <Badge color="green">ACCEPTED BY YOU</Badge>
                  ) : trip.status === TripStatus.ACCEPTED ? (
                    <Badge color="gray">TAKEN</Badge>
                  ) : (
                    <Badge color="blue">NEW REQUEST</Badge>
                  )}
                </div>
                {trip.estimatedPrice && (
                  <div className="text-right">
                    <span className="block font-bold text-slate-800 text-lg">{trip.estimatedPrice}</span>
                    <span className="text-xs text-slate-400">{trip.estimatedDistance}</span>
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="w-full h-24 bg-slate-100 rounded-lg mb-4 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 bg-[url('https://picsum.photos/400/100?grayscale')] bg-cover bg-center"></div>
                <div className="absolute inset-0 flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                  <div className="w-8 h-0.5 bg-slate-300"></div>
                  <div className="w-2 h-2 bg-slate-800"></div>
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-3 mb-4 relative">
                <div className="absolute left-[7px] top-[8px] bottom-[8px] w-0.5 bg-slate-100"></div>
                <div className="flex items-start">
                  <div className="w-4 h-4 rounded-full border-2 border-brand-500 shrink-0 bg-white z-10"></div>
                  <div className="ml-3">
                    <p className="text-xs text-slate-400">Pickup</p>
                    <p className="font-medium text-slate-800 leading-tight">{trip.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-4 h-4 bg-slate-800 shrink-0 z-10 transform rotate-45"></div>
                  <div className="ml-3">
                    <p className="text-xs text-slate-400">Destination</p>
                    <p className="font-medium text-slate-800 leading-tight">{trip.dropoffLocation}</p>
                  </div>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3">
                <div className="flex items-center">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 mr-2">
                     {trip.passengerName.charAt(0)}
                   </div>
                   <div className="text-sm">
                     <p className="font-medium text-slate-700">{trip.passengerName}</p>
                     <p className="text-slate-400 text-xs">{trip.passengers} Passenger(s)</p>
                   </div>
                </div>
                {trip.notes && (
                   <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded max-w-[120px] truncate">
                     "{trip.notes}"
                   </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {trip.status === TripStatus.ACCEPTED && trip.driverId === driver.id ? (
                  <>
                    <Button variant="secondary" className="py-2 text-sm" onClick={() => onOpenCommunication(trip, 'CALL')}>
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Call
                    </Button>
                    <div className="relative">
                      <Button variant="secondary" className="py-2 text-sm w-full" onClick={() => onOpenCommunication(trip, 'CHAT')}>
                         <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                         Message
                      </Button>
                      {trip.chatHistory.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </div>
                  </>
                ) : trip.status === TripStatus.PENDING ? (
                  <div className="col-span-2">
                    <Button onClick={() => onAcceptTrip(trip.id)}>Accept Trip</Button>
                  </div>
                ) : (
                   <div className="col-span-2 text-center text-sm text-slate-400 italic">
                     Trip no longer available
                   </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </Layout>
  );
};