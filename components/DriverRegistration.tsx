import React, { useState } from 'react';
import { Layout } from './Layout';
import { Input, Button } from './UI';
import { Driver } from '../types';

interface Props {
  onRegister: (driver: Driver) => void;
  onBack: () => void;
}

export const DriverRegistration: React.FC<Props> = ({ onRegister, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    carModel: '',
    carColor: '',
    plateNumber: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate generation of ID and photo
    const newDriver: Driver = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      photoUrl: `https://picsum.photos/seed/${formData.name}/200`,
      isRegistered: true
    };
    onRegister(newDriver);
  };

  return (
    <Layout title="Driver Registration" showBack onBack={onBack}>
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Become a Partner</h2>
          <p className="text-slate-500 text-sm">Join our fleet and start earning today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Full Name" 
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <Input 
            label="Phone Number" 
            type="tel"
            placeholder="e.g. 555-0123"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            required
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Car Model" 
              placeholder="Toyota Camry"
              value={formData.carModel}
              onChange={e => setFormData({...formData, carModel: e.target.value})}
              required
            />
            <Input 
              label="Color" 
              placeholder="Silver"
              value={formData.carColor}
              onChange={e => setFormData({...formData, carColor: e.target.value})}
              required
            />
          </div>

          <Input 
            label="License Plate" 
            placeholder="ABC-1234"
            value={formData.plateNumber}
            onChange={e => setFormData({...formData, plateNumber: e.target.value})}
            required
            className="uppercase"
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>}
          />

          <div className="pt-4">
            <Button type="submit">Complete Registration</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};