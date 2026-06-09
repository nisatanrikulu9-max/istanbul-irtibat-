import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage';
export default function App() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState("landing");

  const fetchCenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/merkezler.json");
      if (!res.ok) throw new Error("Veri dosyası bulunamadı");
      const data = await res.json();
      setCenters(Array.isArray(data) ? data : []);
      setCenters(data);
    } catch (e: any) {
      console.error("Hata:", e);
      setError("Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceRefresh = async () => {
    setRefreshing(true);
    await fetchCenters();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {currentPage === "landing" ? (
        <LandingPage onExplore={() => setCurrentPage("map")} />
      ) : (
        <MapPage 
          centers={centers} 
          loading={loading} 
          refreshing={refreshing} 
          onRefresh={handleForceRefresh}
          onBackToHome={() => setCurrentPage("landing")}
        />
      )}
    </div>
  );
}
