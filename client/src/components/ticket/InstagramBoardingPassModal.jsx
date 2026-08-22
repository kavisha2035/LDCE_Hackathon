import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatDateShort } from '../../lib/format';
import {
  Download, X, Share2, Sparkles, Check, Globe,
  Plane, Calendar, MapPin, QrCode, ShieldCheck,
  Instagram, FileText, Loader2, Copy
} from 'lucide-react';

export default function InstagramBoardingPassModal({ trip, user, isOpen, onClose }) {
  const passRef = useRef(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !trip) return null;

  const travelerName = user?.name || trip.userName || 'VIP EXPLORER';
  const stops = trip.stops || [];
  const stopsCount = stops.length;
  const coverImage = trip.coverPhoto || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80';
  const publicShareUrl = `${window.location.origin}/share/${trip.shareSlug || 'voyage'}`;

  // Route string: e.g. "PARIS ➔ TOKYO ➔ NEW YORK"
  const routeString = stops.length > 0
    ? stops.map(s => (s.cityName || s.city?.name || 'DESTINATION').toUpperCase()).join(' ➔ ')
    : 'EXPEDITION';

  // Calculate total days
  const start = new Date(trip.startDate || trip.start_date || new Date());
  const end = new Date(trip.endDate || trip.end_date || new Date());
  const diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  const handleDownloadImage = async () => {
    if (!passRef.current) return;
    setDownloadingPng(true);
    try {
      const canvas = await html2canvas(passRef.current, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0F1318',
        logging: false
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `${trip.name.replace(/\s+/g, '_')}_Boarding_Pass.png`;
      link.click();
    } catch (err) {
      console.error('Error generating image pass:', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!passRef.current) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(passRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0F1318',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${trip.name.replace(/\s+/g, '_')}_Boarding_Pass.pdf`);
    } catch (err) {
      console.error('Error generating PDF pass:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-[#1A1D23] text-white border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Top Control Bar */}
        <div className="px-6 py-4 bg-[#14171C] border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F5B800] animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-[#F5B800] uppercase tracking-wider">
              INSTAGRAM & PDF TRAVEL PASS
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The Printable / Exportable Boarding Pass Canvas */}
        <div className="p-6 overflow-x-auto flex justify-center bg-[#0B0D11]">
          <div
            ref={passRef}
            id="instagram-boarding-pass"
            style={{ width: '420px' }}
            className="bg-[#14171F] text-white border-2 border-[#F5B800]/40 rounded-3xl overflow-hidden shadow-2xl relative font-sans select-none"
          >
            {/* Top Gold Foil Seal */}
            <div className="bg-gradient-to-r from-[#D49800] via-[#F5B800] to-[#E0A600] text-[#14171F] px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 stroke-[2.5]" />
                <span className="font-serif font-black text-xs uppercase tracking-widest">
                  GLOBETROTTER AIRWAYS &bull; VIP PASS
                </span>
              </div>
              <span className="font-mono text-[10px] font-extrabold bg-[#14171F] text-[#F5B800] px-2 py-0.5 rounded-full uppercase">
                FIRST CLASS
              </span>
            </div>

            {/* Hero Image Header with Gradient */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={coverImage}
                alt={trip.name}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14171F] via-[#14171F]/40 to-transparent"></div>

              {/* Verified Stamp Overlay */}
              <div className="absolute top-4 right-4 border-2 border-[#F5B800] text-[#F5B800] px-3 py-1 rounded-lg transform rotate-6 bg-[#14171F]/80 backdrop-blur-xs shadow-lg">
                <span className="font-mono text-[9px] font-black uppercase tracking-widest block text-center">
                  PASSPORT VERIFIED
                </span>
                <span className="text-[11px] font-bold block text-center">OFFICIAL ROUTE</span>
              </div>

              {/* Trip Title */}
              <div className="absolute bottom-3 left-6 right-6">
                <span className="font-script text-[#F5B800] text-2xl block transform -rotate-1 leading-none">
                  Official Travel Itinerary
                </span>
                <h2 className="text-2xl font-serif font-black tracking-wide leading-tight mt-0.5 drop-shadow-md">
                  {trip.name}
                </h2>
              </div>
            </div>

            {/* Passenger & Flight Details Grid */}
            <div className="p-6 space-y-5">
              
              {/* Route Banner */}
              <div className="bg-[#1E232D] border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#F5B800]/10 text-[#F5B800] rounded-xl">
                    <Plane className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono uppercase font-bold text-gray-400 block tracking-wider">
                      VOYAGE ROUTE
                    </span>
                    <span className="text-xs font-bold font-serif text-[#F5B800] tracking-wide block truncate max-w-[240px]">
                      {routeString}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] font-mono uppercase font-bold text-gray-400 block tracking-wider">
                    DURATION
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {diffDays} DAYS &bull; {stopsCount} STOPS
                  </span>
                </div>
              </div>

              {/* Passenger Info Row */}
              <div className="grid grid-cols-3 gap-3 text-left border-y border-gray-800 py-3.5 font-sans">
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-gray-500 block">
                    PASSENGER
                  </span>
                  <strong className="text-xs font-bold text-white uppercase block truncate mt-0.5">
                    {travelerName}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-gray-500 block">
                    DEPARTURE
                  </span>
                  <strong className="text-xs font-mono font-bold text-[#F5B800] block mt-0.5">
                    {formatDateShort(trip.startDate || trip.start_date)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono uppercase font-bold text-gray-500 block">
                    RETURN
                  </span>
                  <strong className="text-xs font-mono font-bold text-[#F5B800] block mt-0.5">
                    {formatDateShort(trip.endDate || trip.end_date)}
                  </strong>
                </div>
              </div>

              {/* Destination Stops List */}
              {stops.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono uppercase font-bold text-gray-500 tracking-wider block">
                    CONFIRMED DESTINATIONS & STOPOVERS:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {stops.map((stop, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#1E232D] text-gray-200 border border-gray-700/60 rounded-full font-sans text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <MapPin className="h-3 w-3 text-[#F5B800]" />
                        {stop.cityName || stop.city?.name || 'Destination'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Perforated Tear-off Ticket Line */}
              <div className="relative py-2 my-2 flex items-center">
                <div className="w-5 h-5 rounded-full bg-[#0B0D11] -ml-8.5 border-r border-gray-700"></div>
                <div className="flex-1 border-b-2 border-dashed border-gray-700 mx-2"></div>
                <div className="w-5 h-5 rounded-full bg-[#0B0D11] -mr-8.5 border-l border-gray-700"></div>
              </div>

              {/* Boarding Pass Bottom Stub (Barcode & Stamp) */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#F5B800] font-mono font-bold">
                    <ShieldCheck className="h-4 w-4" />
                    <span>GATE: GT-01 &bull; SEAT: 1A</span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
                    PASS NO: GT-{trip.id?.slice(0, 8).toUpperCase() || '772910'}
                  </p>
                </div>

                {/* Aesthetic Barcode */}
                <div className="bg-white p-2 rounded-xl text-[#14171F] flex flex-col items-center">
                  <div className="font-mono text-[9px] font-black tracking-tighter">
                    ||||| ||| |||| |||||| |||| ||| |||||
                  </div>
                  <span className="text-[7px] font-mono font-bold tracking-widest mt-0.5 text-gray-600">
                    SCAN TO CLONE
                  </span>
                </div>
              </div>

              {/* Instagram Tagline Footer */}
              <div className="pt-2 text-center border-t border-gray-800/80">
                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                  @GLOBETROTTER &bull; SHARE YOUR JOURNEY
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-6 bg-[#14171C] border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-gray-700"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadImage}
              disabled={downloadingPng}
              className="flex-1 sm:flex-none px-5 py-3 bg-[#E1306C] hover:bg-[#C1275B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloadingPng ? <Loader2 className="h-4 w-4 animate-spin" /> : <Instagram className="h-4 w-4" />}
              <span>Instagram Pass (PNG)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex-1 sm:flex-none px-5 py-3 bg-[#F5B800] hover:bg-[#E0A600] text-[#1E232A] font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloadingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              <span>Download PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
