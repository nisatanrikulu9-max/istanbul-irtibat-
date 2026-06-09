import { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, Search, Filter, Phone, MapPin, Building, RefreshCw, X, Menu, PhoneCall, ExternalLink, Compass } from "lucide-react";
import { Center } from "../types";

// Import leaflet styles
import "leaflet/dist/leaflet.css";

interface MapPageProps {
  centers: Center[];
  onBackToHome: () => void;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

// Custom Map Controller to smoothly pan & zoom
function MapController({ center, zoom }: { center: [number, number] | null; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, zoom, map]);
  return null;
}

// Create custom leaflet markers with Editorial Accent (#D94E33)
const customHeartPin = L.divIcon({
  html: `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    ">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba(217, 78, 51, 0.25);
        animation: leaflet-ping 1.5s infinite ease-in-out;
      "></div>
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: linear-gradient(135deg, #D94E33 0%, #A1311B 100%);
        color: white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15);
        border: 2px solid #F9F7F2;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
    </div>
  `,
  className: "custom-leaflet-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -12],
});

const selectedHeartPin = L.divIcon({
  html: `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
    ">
      <div style="
        position: absolute;
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background-color: rgba(26, 26, 26, 0.2);
        animation: leaflet-ping 1s infinite ease-in-out;
      "></div>
      <div style="
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1A1A1A 0%, #000000 100%);
        color: white;
        box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.2);
        border: 2.5px solid #D94E33;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#D94E33" stroke="#D94E33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
    </div>
  `,
  className: "custom-leaflet-marker-selected",
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -16],
});

  export default function MapPage({ centers, onBackToHome, loading, refreshing, onRefresh }){ 
    centers = Array.isArray(centers) ? centers : [];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Tümü");
  const [activeCenter, setActiveCenter] = useState<Center | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.0082, 28.9784]); // Istanbul center default
  const [mapZoom, setMapZoom] = useState(11);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Unique list of districts for the filter dropdown
  const districts = useMemo(() => {
    const list = Array.from(new Set(centers.map((c) => c.district).filter(Boolean)));
    return ["Tümü", ...list.sort((a, b) => a.localeCompare(b, "tr"))];
  }, [centers]);

  // Filtered centers for list view and map markers
  const filteredCenters = useMemo(() => {
    return centers.filter((center) => {
      const matchesSearch =
        center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        center.district.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDistrict =
        selectedDistrict === "Tümü" || center.district === selectedDistrict;

      return matchesSearch && matchesDistrict;
    });
  }, [centers, searchQuery, selectedDistrict]);

  // Handle zooming / highlighting a center
  const handleSelectCenter = (center: Center) => {
    if (center.latitude && center.longitude) {
      setActiveCenter(center);
      setMapCenter([center.latitude, center.longitude]);
      setMapZoom(15);
      
      // Programmatically open popup
      const ref = markerRefs.current[center.id];
      if (ref) {
        setTimeout(() => {
          ref.openPopup();
        }, 300);
      }

      // Collapsible sidebar rules for mobile screens
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  return (
    <div id="map-page-root" className="h-screen w-screen flex flex-col bg-paper text-ink overflow-hidden font-sans selection:bg-accent selection:text-white">
      {/* Upper Control Bar */}
      <header id="map-header" className="bg-paper border-b border-ink/10 px-6 py-4 flex items-center justify-between shadow-xs shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHome}
            className="p-2 cursor-pointer hover:bg-ink hover:text-paper rounded-none transition border border-transparent hover:border-ink/20 text-ink"
            title="Anasayfaya Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-baseline space-x-2">
            <span className="font-serif italic font-black text-xl md:text-2xl tracking-tighter text-ink uppercase">İstanbul İrtibat</span>
            <span className="text-[9px] font-bold tracking-widest text-muted-gray uppercase hidden sm:inline">HARİTALAMA SİSTEMİ</span>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={refreshing || loading}
            className={`px-4 py-2.5 bg-paper text-ink cursor-pointer hover:bg-ink hover:text-paper transition flex items-center space-x-1.5 border border-ink/20 text-[10px] font-bold tracking-wider uppercase ${
              refreshing ? "opacity-75" : ""
            }`}
            title="E-Tablodaki Güncel Verileri Çek"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>GÜNCELLE</span>
          </button>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-ink text-white rounded-none hover:bg-accent transition md:hidden"
            title="Sıralı Listeyi Aç/Kapat"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div id="map-workspace" className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Panel */}
        <aside
          id="map-sidebar"
          className={`absolute md:static top-0 left-0 h-full w-full md:w-96 bg-paper border-r border-ink/10 flex flex-col z-25 transition-transform duration-300 md:transform-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Filtering Header */}
          <div className="p-5 border-b border-ink/10 space-y-4 shrink-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-ink/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Merkez ismi ya da mahalle ara..."
                className="w-full pl-10 pr-9 py-3 bg-white border border-ink/20 rounded-none text-xs focus:outline-none focus:border-accent text-ink placeholder:text-muted-gray font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3.5 p-0.5 rounded-full hover:bg-slate-100 text-muted-gray hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter District dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-accent shrink-0" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-white border border-ink/20 rounded-none py-2.5 px-3.5 text-[11px] font-bold tracking-wider uppercase text-ink focus:outline-none focus:border-accent cursor-pointer"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    İlçe: {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of solidarity centers */}
          <div className="flex-1 overflow-y-auto divide-y divide-ink/5 px-3 py-2 bg-paper">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-gray space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-accent" />
                <span className="text-xs uppercase tracking-widest font-bold">Yükleniyor...</span>
              </div>
            ) : filteredCenters.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="p-3 bg-ink/5 w-fit rounded-none mx-auto mb-4 text-ink/40">
                  <Building className="w-6 h-6" />
                </div>
                <h3 className="font-serif italic font-bold text-ink text-base">Merkez Eşleşmedi</h3>
                <p className="text-[11px] text-muted-gray mt-2 leading-relaxed">
                  İncelediğiniz mahalle veya ilçe filtrelerinde buralarda kayıtlı aktif destek ünitesi bulunmamaktadır.
                </p>
                {(searchQuery || selectedDistrict !== "Tümü") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDistrict("Tümü");
                    }}
                    className="mt-4 px-4 py-2 border border-ink/20 text-ink text-[10px] font-bold tracking-widest uppercase hover:bg-ink hover:text-paper transition"
                  >
                    TEMİZLE
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 py-1">
                <div className="text-[9px] uppercase font-bold text-muted-gray tracking-[0.2em] px-2 mb-3 flex items-center justify-between">
                  <span>KATALOG SONUÇLARI</span>
                  <span className="font-mono">({filteredCenters.length})</span>
                </div>
                
                {filteredCenters.map((center) => {
                  const isActive = activeCenter?.id === center.id;
                  const hasCoordinates = center.latitude && center.longitude;
                  
                  return (
                    <div
                      key={center.id}
                      onClick={() => handleSelectCenter(center)}
                      className={`p-4 border transition-all duration-200 text-left flex flex-col space-y-2 cursor-pointer ${
                        isActive
                          ? "bg-ink border-ink text-paper"
                          : "bg-white hover:bg-white border-ink/10 text-ink hover:border-accent"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`font-serif italic text-base leading-snug font-bold ${isActive ? "text-paper" : "text-ink"}`}>
                          {center.name}
                        </h4>
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 shrink-0 ${
                            isActive ? "bg-accent text-white" : "bg-ink/5 text-ink/75"
                          }`}
                        >
                          {center.district}
                        </span>
                      </div>

                      {/* Info lines */}
                      <p className={`text-[11px] flex items-start gap-1 font-normal ${isActive ? "text-paper/80" : "text-ink/70"} line-clamp-2`}>
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent" />
                        <span>{center.address}</span>
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-ink/5">
                        <span className={`text-[11px] flex items-center gap-1 font-bold ${isActive ? "text-paper/95" : "text-ink/80"}`}>
                          <Phone className="w-3 h-3 text-accent shrink-0" />
                          <span>{center.phone}</span>
                        </span>

                        {!hasCoordinates && (
                          <span className="text-[8px] tracking-wide font-bold uppercase text-accent bg-accent/10 px-2 py-0.5">
                            Adres Kodlanıyor
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Support section inside Sidebar footer */}
          <div className="p-4 border-t border-ink/10 bg-[#F2EFE8] shrink-0 space-y-2">
            <div className="flex items-center space-x-3 text-ink bg-white p-3.5 border border-ink/5 shadow-xs">
              <PhoneCall className="w-4 h-4 text-accent shrink-0" />
              <div>
                <p className="text-[9px] text-muted-gray tracking-wider leading-none uppercase font-bold">KADIN DESTEK HATTI</p>
                <a href="tel:183" className="text-sm font-serif italic text-ink font-bold hover:text-accent hover:underline">
                  ALO 183
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Floating Toggle Sidebar trigger for Mobile */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 bottom-4 p-3 bg-ink text-white rounded-none shadow-md z-25 hover:bg-accent md:hidden"
            title="Listeyi Gör"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Map Container Area */}
        <div id="leaflet-map-container" className="flex-1 h-full relative z-10 bg-[#E5E2D9] focus:outline-none">
          {/* Subtle Grid pattern as background before map loads */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#7A7672_0.5px,transparent_0.5px)] bg-[size:16px_16px]"></div>
          
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            style={{ minHeight: "100%", background: "#F9F7F2" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            {/* Custom Pan-to Controller */}
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* Render markers */}
            {filteredCenters.map((center) => {
              if (!center.latitude || !center.longitude) return null;
              
              const isSelected = activeCenter?.id === center.id;
              
              return (
                <Marker
                  key={center.id}
                  position={[center.latitude, center.longitude]}
                  icon={isSelected ? selectedHeartPin : customHeartPin}
                  ref={(ref) => {
                    markerRefs.current[center.id] = ref;
                  }}
                  eventHandlers={{
                    click: () => {
                      setActiveCenter(center);
                    },
                  }}
                >
                  {/* Tooltip on Hover */}
                  <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="custom-editorial-tooltip">
                    <div className="p-2 text-xs font-sans bg-paper border border-ink/10">
                      <span className="font-serif italic font-bold text-ink text-sm block">{center.name}</span>
                      <span className="block text-[9px] uppercase tracking-wider text-accent font-bold mt-1">
                        İLÇE: {center.district}
                      </span>
                    </div>
                  </Tooltip>

                  {/* Detailed Information Popup on Click */}
                  <Popup maxWidth={300} minWidth={240} className="editorial-leaflet-popup">
                    <div className="flex flex-col space-y-4 my-1 text-ink font-sans">
                      {/* Stylized background/photo section */}
                      <div className="relative overflow-hidden h-32 bg-paper/50 flex flex-col items-center justify-center shrink-0 border border-ink/10">
                        {center.photoUrl ? (
                          <img
                            src={center.photoUrl}
                            alt={center.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="text-center p-3 text-accent flex flex-col items-center justify-center space-y-1">
                            <Building className="w-7 h-7 opacity-30 mb-0.5" />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-gray">Resim Yüklenmedi</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 bg-ink text-paper font-bold text-[8px] uppercase tracking-widest px-2 py-1">
                          {center.district}
                        </span>
                      </div>

                      {/* Text content details */}
                      <div className="space-y-3">
                        <h3 className="font-serif italic font-bold text-lg text-ink leading-tight">
                          {center.name}
                        </h3>
                        
                        <div className="text-[11px] text-ink/85 flex items-start gap-1.5 leading-relaxed">
                          <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                          <span>{center.address}</span>
                        </div>

                        <div className="pt-3 border-t border-ink/10 flex flex-col space-y-2">
                          <div className="text-[11px] text-ink flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Phone className="w-3.5 h-3.5 text-accent" />
                              <a href={`tel:${center.phone.replace(/\s+/g, "")}`} className="hover:underline hover:text-accent">
                                {center.phone}
                              </a>
                            </span>
                            
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${center.name} ${center.address}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5 hover:text-ink transition-colors"
                            >
                              <span>Yol Tarifi</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Quick Informational Bottom Banner on Desktop */}
          <div className="absolute bottom-6 left-6 z-20 hidden lg:flex space-x-6 items-center bg-white/90 backdrop-blur-xs border border-ink/10 p-3.5 text-xs shadow-sm">
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-muted-gray flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span>Harita Sağlayıcı: OSM & Nominatim</span>
            </span>
            <div className="h-3 w-[1px] bg-ink/10"></div>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-emerald-700">COORD CACHE: AKTİF</span>
          </div>
        </div>
      </div>
    </div>
  );
}
