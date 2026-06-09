import { useState, useEffect } from 'react';
import LandingPage from './LandingPage';
import MapPage from './MapPage';

export default function App() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/merkezler.json");
      if (!res.ok) throw new Error("Veri bulunamadı");
      const data = await res.json();
      setCenters(data);
    } catch (e: any) {
      console.error(e);
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
    <div className="min-h-screen bg-slate-50">
      <MapPage 
        centers={centers} 
        loading={loading} 
        refreshing={refreshing} 
        onRefresh={handleForceRefresh}
      />
    </div>
  );
}
