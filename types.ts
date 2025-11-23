export enum UserRole {
  NONE = 'NONE',
  DRIVER = 'DRIVER',
  PASSENGER = 'PASSENGER'
}

export enum TripStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderRole: UserRole;
  text: string;
  timestamp: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  carModel: string;
  carColor: string;
  plateNumber: string;
  photoUrl: string;
  isRegistered: boolean;
}

export interface TripRequest {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickupLocation: string;
  dropoffLocation: string;
  time: string;
  passengers: number;
  notes?: string;
  status: TripStatus;
  estimatedPrice?: string;
  estimatedDuration?: string;
  estimatedDistance?: string;
  driverId?: string; // ID of the driver who accepted
  driverName?: string;
  driverPhoto?: string;
  driverCar?: string;
  createdAt: number;
  chatHistory: ChatMessage[];
}

export interface TripEstimate {
  priceRange: string;
  duration: string;
  distance: string;
}