"use client";

import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export default function RoomCard({ room, images }: { room: any, images: string[] }) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop';

  return (
    <>
      {/* The Room Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
        
        {/* Image Header with Click Event */}
        <div 
          className="h-48 w-full relative bg-slate-100 group overflow-hidden cursor-pointer"
          onClick={() => setIsGalleryOpen(true)}
        >
          <img 
            src={mainImage} 
            alt={`${room._id} Room`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <button
          suppressHydrationWarning
           className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-gray-900 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:bg-white transition-colors">
            <ImageIcon size={16} /> Gallery
          </button>
        </div>
        
        {/* Card Details */}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">{room._id}</h3>
            <div className="text-right">
              <span className="text-xl font-bold">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0
                }).format(room.price)}
              </span>
              <span className="text-sm text-gray-500 block">/ night</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-6 flex-1">
            {room.description || `Experience absolute comfort in our premium ${room._id.toLowerCase()} accommodations.`}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Rooms Available Now
          </div>
        </div>
      </div>

      {/* Full-Screen Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8" onClick={() => setIsGalleryOpen(false)}>
          <div className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900">{room._id} Room Gallery</h3>
              <button onClick={() => setIsGalleryOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
              {images.map((img, i) => (
                <img key={i} src={img} alt={`${room._id} view ${i + 1}`} className="w-full h-64 md:h-80 object-cover rounded-xl border border-gray-100" />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}