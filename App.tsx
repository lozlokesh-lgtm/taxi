import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DriverRegistration } from './components/DriverRegistration';
import { PassengerRequest } from './components/PassengerRequest';
import { DriverDashboard } from './components/DriverDashboard';
import { TripCommunication } from './components/TripCommunication';
import { UserRole, Driver, TripRequest, TripStatus, ChatMessage } from './types';

// Mock Data for Demo
const MOCK_TRIPS: TripRequest[] = [
  {
    id: 't1',
    passengerName: 'Alice Smith',
    passengerPhone: '555-1111',
    pickupLocation: 'Central Station',
    dropoffLocation: 'Grand Hotel',
    time: '14:30',
    passengers: 2,
    status: TripStatus.PENDING,
    createdAt: Date.now() - 100000,
    estimatedPrice: '$12 - $15',
    estimatedDistance: '4.2 km',
    estimatedDuration: '12 min',
    chatHistory: []
  }
];

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.NONE);
  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<TripRequest[]>(MOCK_TRIPS);
  const [activeDriverId, setActiveDriverId] = useState<string | null>(null);
  
  // Passenger specific state
  const [passengerActiveTripId, setPassengerActiveTripId] = useState<string | null>(null);

  // Communication View State
  const [commTripId, setCommTripId] = useState<string | null>(null);
  const [commMode, setCommMode] = useState<'CHAT' | 'CALL'>('CHAT');

  // Simulating "Real-time" updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Occasionally add a random trip if there are fewer than 5
      if (trips.length < 5 && Math.random() > 0.8) {
        const newTrip: TripRequest = {
          id: Math.random().toString(36).substr(2, 9),
          passengerName: 'Random User ' + Math.floor(Math.random() * 100),
          passengerPhone: '555-0000',
          pickupLocation: 'Downtown Market',
          dropoffLocation: 'City Airport',
          time: 'Now',
          passengers: 1,
          status: TripStatus.PENDING,
          createdAt: Date.now(),
          estimatedPrice: '$25 - $30',
          estimatedDistance: '15 km',
          estimatedDuration: '25 min',
          chatHistory: []
        };
        setTrips(prev => [newTrip, ...prev]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [trips.length]);

  const handleRegisterDriver = (driver: Driver) => {
    setDriverProfile(driver);
    setActiveDriverId(driver.id);
  };

  const handlePassengerRequest = (request: TripRequest) => {
    setTrips(prev => [request, ...prev]);
    setPassengerActiveTripId(request.id);
  };

  const handleAcceptTrip = (tripId: string) => {
    if (!activeDriverId || !driverProfile) return;
    setTrips(prev => prev.map(t => 
      t.id === tripId ? { 
        ...t, 
        status: TripStatus.ACCEPTED, 
        driverId: activeDriverId,
        driverName: driverProfile.name,
        driverPhoto: driverProfile.photoUrl,
        driverCar: `${driverProfile.carColor} ${driverProfile.carModel}`
      } : t
    ));
  };

  const handleOpenCommunication = (trip: TripRequest, mode: 'CHAT' | 'CALL') => {
    setCommTripId(trip.id);
    setCommMode(mode);
  };

  const handleSendMessage = (text: string) => {
    if (!commTripId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: role === UserRole.DRIVER ? (activeDriverId || 'd1') : 'p1',
      senderRole: role,
      text: text,
      timestamp: Date.now()
    };

    setTrips(prev => prev.map(t => {
      if (t.id === commTripId) {
        return { ...t, chatHistory: [...t.chatHistory, newMessage] };
      }
      return t;
    }));
  };

  const reset = () => {
    setRole(UserRole.NONE);
    setCommTripId(null);
  };

  // --- VIEW ROUTING ---

  // 1. Communication Overlay (Active for both roles)
  if (commTripId) {
    const trip = trips.find(t => t.id === commTripId);
    if (trip) {
      return (
        <TripCommunication 
          trip={trip}
          currentUserRole={role}
          initialMode={commMode}
          onSendMessage={handleSendMessage}
          onBack={() => setCommTripId(null)}
        />
      );
    }
  }

  // 2. Driver View
  if (role === UserRole.DRIVER) {
    if (!driverProfile) {
      return <DriverRegistration onRegister={handleRegisterDriver} onBack={reset} />;
    }
    return (
      <DriverDashboard 
        driver={driverProfile} 
        trips={trips} 
        onAcceptTrip={handleAcceptTrip}
        onOpenCommunication={handleOpenCommunication}
        onBack={reset}
      />
    );
  }

  // 3. Passenger View
  if (role === UserRole.PASSENGER) {
    const activeTrip = trips.find(t => t.id === passengerActiveTripId);
    return (
      <PassengerRequest 
        onRequest={handlePassengerRequest} 
        activeTrip={activeTrip}
        onOpenCommunication={handleOpenCommunication}
        onBack={reset} 
      />
    );
  }

  // 4. Landing Screen
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-brand-500 to-brand-700 text-white">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-8 transform rotate-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-brand-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold mb-2 tracking-tight">TealCab</h1>
        <p className="text-brand-100 mb-12 text-center max-w-xs">Your modern journey starts here. Safe, fast, and reliable rides.</p>

        <div className="w-full space-y-4">
          <button 
            onClick={() => setRole(UserRole.PASSENGER)}
            className="w-full bg-white text-brand-900 font-bold py-4 px-6 rounded-xl shadow-lg shadow-brand-900/20 active:scale-95 transition-transform flex items-center justify-center"
          >
            I'm a Passenger
          </button>
          
          <button 
            onClick={() => setRole(UserRole.DRIVER)}
            className="w-full bg-brand-800/50 backdrop-blur-sm border border-brand-400/30 text-white font-semibold py-4 px-6 rounded-xl active:scale-95 transition-transform hover:bg-brand-800/70"
          >
            I'm a Driver
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default App;