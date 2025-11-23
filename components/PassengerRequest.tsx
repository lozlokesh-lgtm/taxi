import React, { useState } from 'react';
import { Layout } from './Layout';
import { Input, Button } from './UI';
import { TripRequest, TripStatus, TripEstimate } from '../types';
import { getTripEstimation } from '../services/geminiService';

interface Props {
  onRequest: (request: TripRequest) => void;
  activeTrip?: TripRequest;
  onOpenCommunication: (trip: TripRequest, mode: 'CHAT' | 'CALL') => void;
  onBack: () => void;
}

export const PassengerRequest: React.FC<Props> = ({ onRequest, activeTrip, onOpenCommunication, onBack }) => {
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    pickupLocation: '',
    dropoffLocation: '',
    time: '',
    passengers: 1,
    notes: ''
  });

  const [estimate, setEstimate] = useState<TripEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleEstimate = async () => {
    if (!formData.pickupLocation || !formData.dropoffLocation) return;
    
    setIsEstimating(true);
    const result = await getTripEstimation(formData.pickupLocation, formData.dropoffLocation);
    setEstimate(result);
    setIsEstimating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrip: TripRequest = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      status: TripStatus.PENDING,
      createdAt: Date.now(),
      estimatedPrice: estimate?.priceRange,
      estimatedDuration: estimate?.duration,
      estimatedDistance: estimate?.distance,
      chatHistory: []
    };
    
    onRequest(newTrip);
    setRequestSent(true);
  };

  // If we have an active trip prop that is ACCEPTED, show driver info
  if (activeTrip && activeTrip.status === TripStatus.ACCEPTED) {
    return (
      <Layout title="Driver is on the way" showBack onBack={onBack}>
         <div className="p-4 flex flex-col items-center pt-8">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden">
                 <img src={activeTrip.driverPhoto || "https://via.placeholder.com/150"} alt="Driver" className="w-full h-full object-cover"/>
              </div>
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                 <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800">{activeTrip.driverName}</h2>
            <div className="flex items-center space-x-2 mt-1 text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
               <span className="font-semibold">{activeTrip.driverCar}</span>
               <span>•</span>
               <span className="font-mono">{activeTrip.estimatedDuration || '12 min'} away</span>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 mt-8 w-full px-4">
               <button 
                 onClick={() => onOpenCommunication(activeTrip, 'CALL')}
                 className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform"
               >
                 <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                 </div>
                 <span className="text-sm font-semibold text-slate-700">Call Driver</span>
               </button>
               
               <button 
                 onClick={() => onOpenCommunication(activeTrip, 'CHAT')}
                 className="flex-1 flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform relative"
               >
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 </div>
                 <span className="text-sm font-semibold text-slate-700">Message</span>
                 {activeTrip.chatHistory.length > 0 && (
                   <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
                 )}
               </button>
            </div>

            {/* Trip Status */}
            <div className="w-full px-6 mt-8">
               <div className="border-l-2 border-slate-200 pl-6 space-y-6">
                  <div className="relative">
                     <div className="absolute -left-[31px] w-4 h-4 rounded-full border-2 border-green-500 bg-white"></div>
                     <p className="text-xs text-slate-400">Current Status</p>
                     <p className="font-semibold text-slate-800">Driver Accepted Request</p>
                  </div>
                  <div className="relative opacity-50">
                     <div className="absolute -left-[31px] w-4 h-4 rounded-full border-2 border-slate-300 bg-slate-100"></div>
                     <p className="text-xs text-slate-400">Next</p>
                     <p className="font-semibold text-slate-800">Heading to Pickup</p>
                  </div>
               </div>
            </div>
         </div>
      </Layout>
    );
  }

  if (requestSent || (activeTrip && activeTrip.status === TripStatus.PENDING)) {
    return (
      <Layout title="Request Sent" showBack onBack={onBack}>
        <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Trip Requested!</h2>
          <p className="text-slate-500 mb-8">Waiting for a driver to accept...</p>
          <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-8">
             <div className="h-full bg-brand-500 animate-[loading_1.5s_ease-in-out_infinite] w-1/2 rounded-full"></div>
          </div>
          <Button variant="outline" onClick={onBack}>Return Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Request a Ride" showBack onBack={onBack}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        
        {/* Contact Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Your Details</h3>
           <Input 
            label="Name" 
            placeholder="Your name"
            value={formData.passengerName}
            onChange={e => setFormData({...formData, passengerName: e.target.value})}
            required
          />
           <Input 
            label="Phone" 
            type="tel"
            placeholder="Your contact number"
            value={formData.passengerPhone}
            onChange={e => setFormData({...formData, passengerPhone: e.target.value})}
            required
          />
        </div>

        {/* Trip Details */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Trip Details</h3>
          
          {/* Timeline Connector Graphic */}
          <div className="absolute left-[29px] top-[74px] bottom-[110px] w-0.5 bg-slate-200 pointer-events-none"></div>

          <Input 
            label="Pickup" 
            placeholder="Current Location"
            value={formData.pickupLocation}
            onChange={e => setFormData({...formData, pickupLocation: e.target.value})}
            onBlur={() => { if(formData.dropoffLocation) handleEstimate() }}
            required
            icon={<div className="w-2 h-2 rounded-full bg-brand-500 ml-1"></div>}
          />
          <Input 
            label="Dropoff" 
            placeholder="Where to?"
            value={formData.dropoffLocation}
            onChange={e => setFormData({...formData, dropoffLocation: e.target.value})}
            onBlur={handleEstimate}
            required
            icon={<div className="w-2 h-2 bg-slate-800 ml-1"></div>}
          />

          {/* AI Estimate Card */}
          {(estimate || isEstimating) && (
            <div className="mt-4 p-4 bg-brand-50 rounded-lg border border-brand-100 animate-in fade-in slide-in-from-top-2 duration-300">
              {isEstimating ? (
                <div className="flex items-center space-x-2 text-brand-600 text-sm">
                  <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Calculating best route & fare...</span>
                </div>
              ) : (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-xs">Est. Price</span>
                    <span className="font-bold text-slate-800 text-lg">{estimate?.priceRange}</span>
                  </div>
                  <div className="flex flex-col text-right">
                     <span className="font-semibold text-brand-700">{estimate?.duration}</span>
                     <span className="text-slate-400 text-xs">{estimate?.distance}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Input 
              label="Time" 
              type="time"
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              required
            />
            <Input 
              label="Passengers" 
              type="number"
              min="1" max="6"
              value={formData.passengers}
              onChange={e => setFormData({...formData, passengers: parseInt(e.target.value)})}
              required
            />
          </div>
          
          <Input 
            label="Notes (Optional)" 
            placeholder="Gate code, big luggage, etc."
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className="pt-4 pb-12">
          <Button type="submit" disabled={isEstimating}>
            Request Ride
          </Button>
        </div>
      </form>
    </Layout>
  );
};