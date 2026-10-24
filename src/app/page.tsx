import { Suspense } from 'react';
import { connectToDatabase } from '@/lib/mongodb';
import Room from '@/models/Room';
import BookingForm from '@/components/BookingForm';
import RoomCard from '@/components/RoomCard';
import { connection } from 'next/server';
import myCustomIcon from '../../public/grand.png';

// 1. Define your images outside the component
const roomImages = {
  'Normal': [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1771775529138-a7a20ba7e032?q=80&w=1169&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1777180249046-abf7d640e0d9?q=80&w=1171&auto=format&fit=crop'
  ],
  'Deluxe': [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1170&auto=format&fit=crop'
  ],
  'Super Luxury': [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1721989519334-40923a0ee1c0?q=80&w=1170&auto=format&fit=crop'
  ]
};

// 2. Data Fetching Component
async function RoomPricing() {
  await connection();
  await connectToDatabase();
  
  const roomTypes = await Room.aggregate([
    { $match: { status: 'Available' } },
    { $group: {
        _id: '$roomType',
        price: { $first: '$roomRate' },
        description: { $first: '$description' },
      }
    },
    { $sort: { price: 1 } }
  ]);

  if (roomTypes.length === 0) {
    return (
      <div className="col-span-3 text-center py-12 text-gray-500">
        No rooms are currently available. Please check back later.
      </div>
    );
  }

  return (
    <>
      {roomTypes.map((room: any) => {
        // Look up the images array for this specific room type.
        const images = roomImages[room._id as keyof typeof roomImages] || [];

        // Return just the RoomCard - it handles all its own styling and layout now!
        return <RoomCard key={room._id} room={room} images={images} />;
      })}
    </>
  );
}

// 3. Main Page
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">

      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={myCustomIcon.src} alt="Grand Resort" className="h-8 w-auto object-contain" />
            <span className="text-xl font-bold tracking-tight text-slate-900">Grand Resort</span>
          </div>
        </div>
      </nav>

      
    <section className="bg-slate-900 text-white py-12 md:py-20 px-4 min-h-[calc(100vh-73px)] flex items-center">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 md:gap-12 items-center w-full">
          <div className="text-center md:text-left mt-6 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              Experience Luxury at Grand Resort
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 px-2 md:px-0">
              Escape to paradise. Enjoy world-class amenities, stunning views, and unforgettable service.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto md:max-w-full pb-8 md:pb-0">
            <BookingForm />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Current Availability & Rates</h2>
          <p className="text-gray-500 mt-2">Live pricing directly from our booking system</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Suspense fallback={<div className="col-span-3 text-center py-12 text-gray-500 font-medium animate-pulse">Loading live prices from database...</div>}>
            <RoomPricing />
          </Suspense>
        </div>
      </section>

    </main>
  );
}