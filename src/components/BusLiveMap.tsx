import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  VAN_GPS_ROUTES,
  calculateDistanceKm,
  calculateHeading,
  VanRouteConfig
} from '../data/vanGpsRoutes';
import { SriLankaStudent } from '../data/sriLankaData';
import {
  Bus,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Crosshair,
  MessageSquare,
  Phone,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Radio,
  X,
  ExternalLink,
  Users
} from 'lucide-react';

interface BusLiveMapProps {
  onClose?: () => void;
  students?: SriLankaStudent[];
  initialVanNumber?: string;
  lang?: 'en' | 'si' | 'ta';
  onStudentBoarded?: (studentId: string) => void;
}

// Gentle Web Audio Chime for bus arrival notification
function playArrivalChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.25, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch {}
}

export const BusLiveMap: React.FC<BusLiveMapProps> = ({
  onClose,
  students = [],
  initialVanNumber,
  lang = 'en',
  onStudentBoarded
}) => {
  const availableVans = Object.keys(VAN_GPS_ROUTES);
  const [selectedVanKey, setSelectedVanKey] = useState<string>(() => {
    if (initialVanNumber && VAN_GPS_ROUTES[initialVanNumber]) return initialVanNumber;
    return availableVans[0];
  });

  const vanConfig: VanRouteConfig = VAN_GPS_ROUTES[selectedVanKey] || VAN_GPS_ROUTES[availableVans[0]];

  // Tracking Mode: 'realGps' (Phone Geolocation) is active by default per user request
  const [trackingMode, setTrackingMode] = useState<'simulation' | 'realGps'>('realGps');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 4x
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoFollowBus, setAutoFollowBus] = useState<boolean>(true);

  // Simulation Progress (0 to 1 along the path)
  const [progress, setProgress] = useState<number>(0.12);
  const [currentCoord, setCurrentCoord] = useState<[number, number]>(vanConfig.path[0]);
  const [currentHeading, setCurrentHeading] = useState<number>(45);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [lastNotifiedStop, setLastNotifiedStop] = useState<string | null>(null);

  // Real GPS Status
  const [realGpsError, setRealGpsError] = useState<string | null>(null);
  const [realGpsAccuracy, setRealGpsAccuracy] = useState<number | null>(null);
  const firstGpsFixRef = useRef<boolean>(false);

  // Map & Marker references
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const vanMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);

  // Calculate current interpolated position along the polyline path
  const path = vanConfig.path;

  // Real Device Geolocation Watcher
  useEffect(() => {
    if (trackingMode !== 'realGps') return;

    if (!('geolocation' in navigator)) {
      setRealGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setRealGpsError(null);
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude, heading, speed, accuracy } = pos.coords;
        setCurrentCoord([latitude, longitude]);
        if (heading !== null && !isNaN(heading)) {
          setCurrentHeading(heading);
        }
        if (speed !== null && !isNaN(speed) && speed > 0.4) {
          setSpeedKmh(Math.round(speed * 3.6));
        } else {
          setSpeedKmh(0);
        }
        setRealGpsAccuracy(Math.round(accuracy));

        if (leafletMapRef.current) {
          if (!firstGpsFixRef.current) {
            firstGpsFixRef.current = true;
            leafletMapRef.current.setView([latitude, longitude], 15, { animate: true });
          } else if (autoFollowBus) {
            leafletMapRef.current.panTo([latitude, longitude], { animate: true });
          }
        }
      },
      err => {
        setRealGpsError(err.message || 'Unable to retrieve location.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [trackingMode, autoFollowBus]);

  // Simulation Loop
  useEffect(() => {
    if (trackingMode !== 'simulation' || !isSimulating) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const step = 0.0035 * simSpeed;
        const next = prev + step;
        if (next >= 0.99) {
          return 0.05; // Loop back
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [trackingMode, isSimulating, simSpeed]);

  // Update current coordinates and heading based on simulation progress
  useEffect(() => {
    if (trackingMode !== 'simulation') return;
    if (!path || path.length < 2) return;

    const totalSegments = path.length - 1;
    const globalT = progress * totalSegments;
    const segIndex = Math.min(Math.floor(globalT), totalSegments - 1);
    const segT = globalT - segIndex;

    const p1 = path[segIndex];
    const p2 = path[segIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segT;
    const lng = p1[1] + (p2[1] - p1[1]) * segT;

    const heading = calculateHeading(p1[0], p1[1], p2[0], p2[1]);
    setCurrentCoord([lat, lng]);
    setCurrentHeading(heading);

    // Random slight speed variation for realism (e.g. 28 - 38 km/h)
    const baseSpeed = 30;
    const variance = Math.sin(progress * 40) * 8;
    setSpeedKmh(Math.max(15, Math.round(baseSpeed + variance)));

    // Check proximity to student stops
    vanConfig.stops.forEach(stop => {
      const distKm = calculateDistanceKm(lat, lng, stop.lat, stop.lng);
      if (distKm < 0.22 && lastNotifiedStop !== stop.name) {
        setLastNotifiedStop(stop.name);
        if (soundEnabled) {
          playArrivalChime();
        }
      }
    });

    if (autoFollowBus && leafletMapRef.current) {
      leafletMapRef.current.panTo([lat, lng], { animate: true, duration: 0.2 });
    }
  }, [progress, trackingMode, path, vanConfig, lastNotifiedStop, soundEnabled, autoFollowBus]);

  // Calculate upcoming stop information
  const upcomingStopInfo = useMemo(() => {
    let nextStop = vanConfig.stops[0];
    let minDistance = Infinity;
    let nextIndex = 0;

    vanConfig.stops.forEach((stop, idx) => {
      const dist = calculateDistanceKm(currentCoord[0], currentCoord[1], stop.lat, stop.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nextIndex = idx;
      }
    });

    // If currently very close or past this stop, point to the next one
    if (minDistance < 0.15 && nextIndex < vanConfig.stops.length - 1) {
      nextStop = vanConfig.stops[nextIndex + 1];
      minDistance = calculateDistanceKm(currentCoord[0], currentCoord[1], nextStop.lat, nextStop.lng);
    } else {
      nextStop = vanConfig.stops[nextIndex];
    }

    const etaMinutes = Math.max(1, Math.round((minDistance / (speedKmh || 30)) * 60));
    const distMeters = Math.round(minDistance * 1000);

    return {
      stop: nextStop,
      etaMinutes,
      distMeters,
      distKm: minDistance.toFixed(1)
    };
  }, [vanConfig, currentCoord, speedKmh]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const initialCenter = currentCoord;
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 14,
      zoomControl: false
    });

    // High quality OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Road Polyline
    const routeLine = L.polyline(path, {
      color: vanConfig.color,
      weight: 6,
      opacity: 0.85,
      lineJoin: 'round',
      dashArray: undefined
    }).addTo(map);
    polylineRef.current = routeLine;

    // Outer glow for polyline
    L.polyline(path, {
      color: '#ffffff',
      weight: 9,
      opacity: 0.45,
      lineJoin: 'round'
    }).addTo(map);

    // Custom Stop Markers
    stopMarkersRef.current = [];
    vanConfig.stops.forEach((stop, index) => {
      const isDestination = stop.isSchool;
      const isOrigin = stop.isOrigin;

      const stopIconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="px-2 py-0.5 rounded-md text-[10px] font-black shadow-md whitespace-nowrap mb-1 ${
            isDestination
              ? 'bg-emerald-600 text-white border border-emerald-400'
              : isOrigin
              ? 'bg-slate-900 text-white'
              : 'bg-amber-400 text-slate-950 border border-amber-600'
          }">
            ${isDestination ? '🏫 ' + (stop.nameSi || stop.name) : (index) + '. ' + (stop.nameSi || stop.name)}
          </div>
          <div class="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-lg ring-2 ring-white ${
            isDestination
              ? 'bg-emerald-600 text-white'
              : isOrigin
              ? 'bg-slate-900 text-white'
              : 'bg-amber-500 text-slate-950'
          }">
            ${isDestination ? '🏫' : isOrigin ? '🏁' : index}
          </div>
          <div class="w-1.5 h-2 bg-slate-800 -mt-0.5 rounded-b-full"></div>
        </div>
      `;

      const customStopIcon = L.divIcon({
        html: stopIconHtml,
        className: 'custom-stop-marker',
        iconSize: [0, 0]
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: customStopIcon }).addTo(map);

      // Popup with student info
      const studentMatch = students.find(s => s.id === stop.studentId);
      const popupContent = `
        <div class="p-2.5 font-sans min-w-[200px] text-slate-900">
          <div class="flex items-center gap-1.5 mb-1.5">
            <span class="text-xs font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Stop #${index}
            </span>
            <span class="text-xs font-bold">${stop.name}</span>
          </div>
          ${
            studentMatch
              ? `
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1">
              <div class="text-xs font-black text-slate-900">👦 ${studentMatch.name}</div>
              <div class="text-[11px] text-slate-600 font-medium">${studentMatch.grade}</div>
              <div class="text-[11px] text-slate-700 mt-1 font-bold">📞 ${studentMatch.parentName}: ${studentMatch.parentPhone}</div>
            </div>
          `
              : `<div class="text-[11px] text-slate-600">${stop.nameSi || ''}</div>`
          }
        </div>
      `;
      marker.bindPopup(popupContent);
      stopMarkersRef.current.push(marker);
    });

    // Custom PickMe-style Moving Van Marker
    const vanIconHtml = `
      <div id="leaflet-van-marker-inner" class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
        <!-- Pulsing radar wave (PickMe style) -->
        <div class="absolute -inset-3 rounded-full bg-amber-500/25 animate-ping"></div>
        <div class="absolute -inset-2 rounded-full bg-amber-400/40 animate-pulse"></div>

        <!-- Van Icon Bubble -->
        <div class="relative w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-950 shadow-2xl flex items-center justify-center text-slate-950 ring-4 ring-white/90">
          <div class="text-xl transform -rotate-45" style="transform: rotate(${currentHeading}deg); transition: transform 0.2s linear;">
            🚐
          </div>
        </div>

        <!-- Plate & Speed Tag -->
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md border border-amber-400/50 whitespace-nowrap">
          ${vanConfig.plateNumber} · ${speedKmh} km/h
        </div>
      </div>
    `;

    const customVanIcon = L.divIcon({
      html: vanIconHtml,
      className: 'custom-moving-van-marker',
      iconSize: [0, 0]
    });

    const vanMarker = L.marker(currentCoord, { icon: customVanIcon, zIndexOffset: 1000 }).addTo(map);
    vanMarkerRef.current = vanMarker;

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [selectedVanKey]);

  // Update van marker position, heading, and label dynamically without recreating map
  useEffect(() => {
    if (!vanMarkerRef.current) return;
    vanMarkerRef.current.setLatLng(currentCoord);

    // Update inner icon markup for smooth rotation
    const newHtml = `
      <div class="relative flex items-center justify-center cursor-pointer" style="transform: translate(-50%, -50%);">
        <div class="absolute -inset-3 rounded-full bg-amber-500/25 animate-ping"></div>
        <div class="absolute -inset-2 rounded-full bg-amber-400/40 animate-pulse"></div>
        <div class="relative w-12 h-12 rounded-2xl bg-amber-400 border-2 border-slate-950 shadow-2xl flex items-center justify-center text-slate-950 ring-4 ring-white/90">
          <div class="text-xl" style="transform: rotate(${currentHeading}deg); transition: transform 0.15s linear;">
            🚐
          </div>
        </div>
        <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md shadow-md border border-amber-400/50 whitespace-nowrap">
          ${vanConfig.plateNumber} · ${speedKmh} km/h
        </div>
      </div>
    `;
    const newIcon = L.divIcon({
      html: newHtml,
      className: 'custom-moving-van-marker',
      iconSize: [0, 0]
    });
    vanMarkerRef.current.setIcon(newIcon);
  }, [currentCoord, currentHeading, speedKmh, vanConfig.plateNumber]);

  // Generate WhatsApp live ETA message for parents
  const shareLiveLocationWhatsApp = () => {
    const nextStopName = upcomingStopInfo.stop.name;
    const msg =
      lang === 'si'
        ? `🚐 *පාසල් වෑන් රථය සජීවීව (Live Bus Update)*\n` +
          `රියදුරු: ${vanConfig.driverName}\n` +
          `වෑන් අංකය: ${vanConfig.plateNumber}\n` +
          `වේගය: ${speedKmh} km/h\n` +
          `මීළඟ නැවතුම: ${nextStopName} (තව විනාඩි ~${upcomingStopInfo.etaMinutes} කින් පැමිණේ - ${upcomingStopInfo.distMeters}m)\n` +
          `දරුවා සූදානම් කර තබන්න.`
        : `🚐 *School Van Live GPS Tracking Update*\n` +
          `Driver: ${vanConfig.driverName}\n` +
          `Van: ${vanConfig.plateNumber}\n` +
          `Speed: ${speedKmh} km/h\n` +
          `Next Stop: *${nextStopName}* (ETA: ~${upcomingStopInfo.etaMinutes} mins · ${upcomingStopInfo.distMeters}m away)\n` +
          `Please have student ready at the pickup stop!`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Header Bar (PickMe Style) */}
      <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md ring-2 ring-amber-300">
            <Radio className="w-5 h-5 animate-pulse text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-base sm:text-lg text-white flex items-center gap-1.5">
                <span>{lang === 'si' ? 'සජීවී බස් සිතියම (Live Bus Map)' : 'Live School Bus GPS Map'}</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{trackingMode === 'realGps' ? 'Real Phone GPS' : 'PickMe Live Ride'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {lang === 'si'
                ? 'PickMe / Uber මෙන් වෑන් රථය පාරේ ගමන් කරන ආකාරය සජීවීව බලන්න'
                : 'Watch the school van moving along Colombo routes in real time like PickMe / Uber'}
            </p>
          </div>
        </div>

        {/* Van Selector & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Van Selector Dropdown */}
          <select
            value={selectedVanKey}
            onChange={e => setSelectedVanKey(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-400 outline-none"
          >
            {availableVans.map(key => (
              <option key={key} value={key}>
                {VAN_GPS_ROUTES[key].vanName} - {VAN_GPS_ROUTES[key].plateNumber} ({VAN_GPS_ROUTES[key].driverName.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* Mode Switcher: Real Device GPS vs Simulation */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setTrackingMode('realGps');
                setIsSimulating(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                trackingMode === 'realGps'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Use driver phone's actual GPS coordinates"
            >
              📡 My GPS
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackingMode('simulation');
                setIsSimulating(true);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                trackingMode === 'simulation'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="PickMe style simulated live movement"
            >
              🚗 Demo Ride
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
              soundEnabled
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title={soundEnabled ? 'Mute Arrival Chime' : 'Enable Arrival Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Center on Bus */}
          <button
            type="button"
            onClick={() => {
              setAutoFollowBus(true);
              if (leafletMapRef.current) {
                leafletMapRef.current.panTo(currentCoord, { animate: true });
              }
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-colors"
            title="Center camera on moving bus"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Close Modal if applicable */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors"
              title="Close Map"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Real GPS Warning Banner if any error */}
      {trackingMode === 'realGps' && realGpsError && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2 text-rose-300 text-xs flex items-center justify-between">
          <span>⚠️ {realGpsError} (Tip: Please allow GPS location permissions in browser settings)</span>
          <button
            type="button"
            onClick={() => setTrackingMode('simulation')}
            className="underline font-bold text-white hover:text-amber-300"
          >
            Switch to Demo Ride
          </button>
        </div>
      )}

      {/* Real GPS Active Banner */}
      {trackingMode === 'realGps' && !realGpsError && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 px-4 py-1.5 text-emerald-300 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
            <span>Driver Phone GPS Active · Accuracy: ~{realGpsAccuracy || 10}m</span>
          </span>
          <span className="text-[11px] text-emerald-400">Broadcasting live coordinates</span>
        </div>
      )}

      {/* Main Map Canvas & Overlays */}
      <div className="relative w-full h-[450px] sm:h-[550px] lg:h-[620px] bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating PickMe Live Trip Status Card (Top-Left) */}
        <div className="absolute top-3 left-3 z-10 max-w-xs sm:max-w-sm w-full bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 shadow-2xl text-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                {vanConfig.vanName} · {vanConfig.driverName.split(' ')[0]}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-800 text-slate-300 border border-slate-700">
              {speedKmh} km/h
            </span>
          </div>

          {/* Next Stop Callout */}
          <div className="bg-slate-950/90 rounded-xl p-2.5 border border-amber-400/30">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'si' ? 'මීළඟ නැවතුම' : 'Approaching Next Stop'}
            </div>
            <div className="text-sm font-black text-white flex items-center justify-between mt-0.5">
              <span>{upcomingStopInfo.stop.name}</span>
              <span className="text-amber-400 text-xs font-bold">~{upcomingStopInfo.etaMinutes} min</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{upcomingStopInfo.distMeters} meters away</span>
              {upcomingStopInfo.stop.studentName && (
                <span className="text-emerald-400 font-bold">👦 {upcomingStopInfo.stop.studentName}</span>
              )}
            </div>
          </div>

          {/* Quick 1-Tap Board Student Action */}
          {upcomingStopInfo.stop.studentId && onStudentBoarded && (
            <button
              type="button"
              onClick={() => onStudentBoarded(upcomingStopInfo.stop.studentId!)}
              className="mt-2.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark {upcomingStopInfo.stop.studentName?.split(' ')[0]} Boarded</span>
            </button>
          )}

          {/* Simulation Play/Pause & Speed controls */}
          {trackingMode === 'simulation' && (
            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg font-bold flex items-center gap-1"
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(0.05)}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg"
                  title="Restart Route"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                {[1, 2, 4].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSimSpeed(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                      simSpeed === s ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Floating WhatsApp Quick Share Button (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col sm:flex-row items-end gap-2">
          <button
            type="button"
            onClick={shareLiveLocationWhatsApp}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>{lang === 'si' ? 'WhatsApp මගින් Live ETA යවන්න' : 'Send Live ETA via WhatsApp'}</span>
          </button>
        </div>
      </div>

      {/* PickMe Style Bottom Route Stops Timeline */}
      <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              {lang === 'si' ? 'වෑන් මාර්ගයේ නැවතුම් සහ දුර' : 'Route Stops & Arrival Countdown'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {lang === 'si' ? 'පාසල:' : 'Destination:'} <strong className="text-white">{vanConfig.schoolDestination}</strong>
          </span>
        </div>

        {/* Horizontal Stops Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {vanConfig.stops.map((stop, i) => {
            const isDestination = stop.isSchool;
            const isOrigin = stop.isOrigin;
            const dist = calculateDistanceKm(currentCoord[0], currentCoord[1], stop.lat, stop.lng);
            const distMeters = Math.round(dist * 1000);
            const isPassed = dist > 0.3 && i < vanConfig.stops.findIndex(s => s.name === upcomingStopInfo.stop.name);
            const isCurrentNext = upcomingStopInfo.stop.name === stop.name;

            return (
              <div
                key={stop.name}
                onClick={() => {
                  if (leafletMapRef.current) {
                    leafletMapRef.current.setView([stop.lat, stop.lng], 16, { animate: true });
                  }
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isCurrentNext
                    ? 'bg-amber-400/10 border-amber-400/80 shadow-lg ring-1 ring-amber-400'
                    : isPassed
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span className={isCurrentNext ? 'text-amber-400 font-black' : 'text-slate-400'}>
                    Stop #{i}
                  </span>
                  {isCurrentNext ? (
                    <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px] animate-pulse">
                      NEXT
                    </span>
                  ) : isPassed ? (
                    <span className="text-emerald-400 font-bold">✓ Passed</span>
                  ) : (
                    <span className="text-slate-500">{distMeters > 1000 ? `${dist.toFixed(1)} km` : `${distMeters} m`}</span>
                  )}
                </div>

                <div className="font-bold text-xs text-white truncate" title={stop.name}>
                  {isDestination ? '🏫 ' + stop.name : stop.name}
                </div>

                {stop.studentName ? (
                  <div className="text-[11px] text-emerald-400 font-semibold truncate mt-0.5">
                    👦 {stop.studentName}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">
                    {stop.nameSi || (isDestination ? 'School Gate' : 'Way Stop')}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Driver Contact & Info Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              🚐
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>{vanConfig.driverName}</span>
                <span className="text-slate-400 font-medium">({vanConfig.plateNumber})</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {lang === 'si' ? 'රියදුරු සම්බන්ධ කර ගැනීම:' : 'Driver direct line:'} <span className="text-amber-300 font-mono">{vanConfig.driverPhone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${vanConfig.driverPhone.replace(/\s+/g, '')}`}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'si' ? 'කෝල්' : 'Call'}</span>
            </a>

            <button
              type="button"
              onClick={shareLiveLocationWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
