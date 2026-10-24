"use client";

import { useState, useEffect } from 'react';
type RoomType = 'Normal' | 'Deluxe' | 'Super Luxury';

export default function BookingForm() {
  const [form, setForm] = useState({
    guestName: '', guestEmail: '', guestPhone: '',
    roomType: 'Normal' as RoomType, 
    checkIn: '', checkOut: ''
  });
  
  const [errors, setErrors] = useState({ guestPhone: '', guestEmail: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [today, setToday] = useState('');

  const [livePricing, setLivePricing] = useState<Record<RoomType, number | null>>({
    'Normal': null,
    'Deluxe': null,
    'Super Luxury': null
  });
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    const fetchLiveRooms = async () => {
      try {
        const res = await fetch('https://grand-resorts-api.onrender.com/api/rooms');
        const rooms = await res.json();

        const pricing = {
          'Normal': rooms.find((r: any) => r.roomType === 'Normal' && r.status === 'Available')?.roomRate || null,
          'Deluxe': rooms.find((r: any) => r.roomType === 'Deluxe' && r.status === 'Available')?.roomRate || null,
          'Super Luxury': rooms.find((r: any) => r.roomType === 'Super Luxury' && r.status === 'Available')?.roomRate || null,
        };
        
        setLivePricing(pricing);

        const firstAvailable = (Object.keys(pricing) as RoomType[]).find(
          (key) => pricing[key] !== null
        );
        if (firstAvailable) {
          setForm((prev) => ({ ...prev, roomType: firstAvailable }));
        }
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchLiveRooms();
  }, []);

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const formatPrice = (price: number | null) => {
    if (!price) return "Sold Out";
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    
    if (numericValue.length <= 10) {
      setForm({ ...form, guestPhone: numericValue });
      
      const phoneRegex = /^[6-9]\d{9}$/;
      
      if (numericValue.length > 0 && !phoneRegex.test(numericValue)) {
        setErrors(prev => ({ ...prev, guestPhone: 'Please enter a valid 10-digit number' }));
      } else {
        setErrors(prev => ({ ...prev, guestPhone: '' }));
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm({ ...form, guestEmail: val });
    
    if (!val.trim()) {
      setErrors(prev => ({ ...prev, guestEmail: '' }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setErrors(prev => ({ ...prev, guestEmail: 'Please enter a valid email address' }));
    } else {
      setErrors(prev => ({ ...prev, guestEmail: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (errors.guestPhone || errors.guestEmail || form.guestPhone.length !== 10 || !livePricing[form.roomType]) {
      return; 
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus({ type: 'success', message: 'Your request has been sent! Our team will contact you shortly to confirm.' });
      setForm({ guestName: '', guestEmail: '', guestPhone: '', roomType: 'Normal', checkIn: '', checkOut: '' });
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minCheckOut = form.checkIn || today;

  // NEW: Calculate Total Estimated Price dynamically
  let totalEstimatedPrice: number | null = null;
  let nights = 0;
  
  if (form.checkIn && form.checkOut) {
    const inDate = new Date(form.checkIn).getTime();
    const outDate = new Date(form.checkOut).getTime();
    const diffTime = outDate - inDate;
    
    // Convert ms to days
    nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const nightlyRate = livePricing[form.roomType];
    if (nights > 0 && nightlyRate) {
      totalEstimatedPrice = nights * nightlyRate;
    }
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Book Your Stay</h3>
      
      {status.message && (
        <div className={`p-4 rounded-lg mb-4 text-sm font-medium ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <input 
            required 
            type="text" 
            placeholder="Full Name *" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={form.guestName} 
            onChange={e => setForm({...form, guestName: e.target.value})} 
          />
        </div>

        <div>
          <input 
            type="email" 
            placeholder="Email Address (Optional)" 
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.guestEmail ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'focus:ring-indigo-500'}`} 
            value={form.guestEmail} 
            onChange={handleEmailChange} 
          />
          {errors.guestEmail && <p className="text-red-500 text-xs mt-1 font-medium">{errors.guestEmail}</p>}
        </div>

        <div>
          <input 
            required 
            type="tel" 
            maxLength={10}
            placeholder="Phone Number (10 digits) *" 
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition-colors ${errors.guestPhone ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'focus:ring-indigo-500'}`} 
            value={form.guestPhone} 
            onChange={handlePhoneChange} 
          />
          {errors.guestPhone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.guestPhone}</p>}
        </div>
        
        <select 
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white disabled:opacity-50" 
          value={form.roomType} 
          onChange={e => setForm({...form, roomType: e.target.value as RoomType})}
          disabled={isLoadingRooms}
        >
          {isLoadingRooms ? (
            <option>Loading live prices...</option>
          ) : (
            <>
              <option value="Normal" disabled={!livePricing['Normal']}>
                Normal Room {livePricing['Normal'] ? `- ${formatPrice(livePricing['Normal'])}/night` : '(Sold Out)'}
              </option>
              <option value="Deluxe" disabled={!livePricing['Deluxe']}>
                Deluxe Room {livePricing['Deluxe'] ? `- ${formatPrice(livePricing['Deluxe'])}/night` : '(Sold Out)'}
              </option>
              <option value="Super Luxury" disabled={!livePricing['Super Luxury']}>
                Super Luxury Suite {livePricing['Super Luxury'] ? `- ${formatPrice(livePricing['Super Luxury'])}/night` : '(Sold Out)'}
              </option>
            </>
          )}
        </select>

       <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs text-gray-500 mb-1">Check-in *</label>
            <input 
              required 
              type="date" 
              min={today} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={form.checkIn} 
              onChange={e => {
                const newCheckIn = e.target.value;
                if (form.checkOut && newCheckIn > form.checkOut) {
                  setForm({ ...form, checkIn: newCheckIn, checkOut: '' });
                } else {
                  setForm({ ...form, checkIn: newCheckIn });
                }
              }} 
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-xs text-gray-500 mb-1">Check-out *</label>
            <input 
              required 
              type="date" 
              min={minCheckOut} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={form.checkOut} 
              onChange={e => setForm({ ...form, checkOut: e.target.value })} 
            />
          </div>
        </div>

        {/* NEW: Dynamic Price Preview Block */}
        {totalEstimatedPrice !== null && nights > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mt-2">
            <div className="flex justify-between items-center text-sm text-indigo-800 mb-1">
              <span>{nights} {nights === 1 ? 'night' : 'nights'} at {formatPrice(livePricing[form.roomType])}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg text-indigo-900">
              <span>Estimated Total:</span>
              <span>{formatPrice(totalEstimatedPrice).replace('/ night', '')}</span>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={
            isSubmitting || 
            errors.guestPhone !== '' || 
            errors.guestEmail !== '' || 
            form.guestPhone.length !== 10 || 
            !livePricing[form.roomType as keyof typeof livePricing] 
          } 
          className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-lg hover:bg-indigo-600 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting 
            ? 'Sending Request...' 
            : !livePricing[form.roomType as keyof typeof livePricing] 
              ? 'Selected Room is Sold Out' 
              : 'Request Booking'}
        </button>
      </form>
    </div>
  );
}