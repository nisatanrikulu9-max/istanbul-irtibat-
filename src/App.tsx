import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import MapPage from "./components/MapPage";
import { Center } from "./types";
import { RefreshCw } from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"landing" | "map">("landing");
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch solidarity centers from Express backend
  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/center.json");
      if (!res.ok) {
        throw new Error(`Veriler yüklenemedi: ${res.statusText}`);
      }
      const result = await res.json();
      if (result.success && result.data) {
        setCenters(result.data);
      } else {
        throw new Error("Geçersiz veri biçimi");
      }
    } catch (e: any) {
      console.error("API error fetching centers:", e);
      setError(e.message || "Bilinmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual refresh on the spreadsheet
  const handleForceRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await fetch("/api/centers/refresh", { method: "POST" });
      if (!res.ok) {
        throw new Error(`Güncelleme başarısız: ${res.statusText}`);
      }
      const result = await res.json();
      if (result.success) {
        // Refetch newest records
        await fetchCenters();
      } else {
        throw new Error("Güncelleme isteği reddedildi.");
      }
    } catch (e: any) {
      console.error("API refresh error:", e);
      alert(`Veri güncelleme hatası: ${e.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  return (
    <div id="app-viewport" className="min-h-screen bg-slate-50 text-slate-800">
      {currentPage === "landing" ? (
        <LandingPage
          onExploreMap={() => setCurrentPage("map")}
          centers={centers}
          loading={loading}
        />
      ) : (
        <MapPage
          centers={centers}
          onBackToHome={() => setCurrentPage("landing")}
          loading={loading}
          refreshing={refreshing}
          onRefresh={handleForceRefresh}
        />
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-red-600 text-white rounded-2xl p-4 shadow-xl z-50 flex items-start gap-3 border border-red-500 animate-slide-in">
          <div className="p-1 bg-red-700 rounded-lg">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-xs">Sorun Oluştu</h4>
            <p className="text-[11px] text-red-100 mt-0.5 leading-relaxed">{error}</p>
            <button
              onClick={fetchCenters}
              className="mt-2 text-[10px] font-black underline uppercase tracking-wider text-white"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
