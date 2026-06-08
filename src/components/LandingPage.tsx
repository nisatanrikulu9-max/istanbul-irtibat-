import { Heart, MapPin, PhoneCall, ShieldCheck, Sparkles, Users, ArrowRight, Info } from "lucide-react";
import { Center } from "../types";

interface LandingPageProps {
  onExploreMap: () => void;
  centers: Center[];
  loading: boolean;
}

export default function LandingPage({ onExploreMap, centers, loading }: LandingPageProps) {
  // Extract stats
  const totalCenters = centers.length;
  const uniqueDistricts = Array.from(new Set(centers.map(c => c.district))).length;

  return (
    <div id="landing-container" className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-accent selection:text-white">
      {/* Navigation Header */}
      <header id="landing-header" className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-ink/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif italic font-black text-2xl uppercase tracking-tighter text-ink">
              İstanbul
            </span>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-muted-gray hidden sm:inline">
              KADIN & AİLE DAYANIŞMA REHBERİ
            </span>
          </div>
          
          <button
            id="nav-explore-btn"
            onClick={onExploreMap}
            className="group flex items-center space-x-2 bg-ink hover:bg-accent text-paper font-semibold tracking-widest uppercase text-[10px] px-5 py-3 transition-all duration-300 shadow-sm border border-transparent"
          >
            <span>Haritayı Keşfet</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative py-20 md:py-28 px-6 border-b border-ink/10 overflow-hidden">
        {/* Fine Editorial Grid backgrounds */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-accent/10 text-accent px-4 py-1.5 border border-accent/20 rounded-full text-xs font-bold mb-8">
            <Sparkles className="w-3.5 h-3.5 fill-accent/20" />
            <span className="tracking-wide uppercase text-[10px]">İstanbul Dayanışma Haritası & Kılavuzu</span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl font-black text-ink tracking-tight leading-[0.95] mb-8">
            Şehirde <br className="hidden md:block"/>
            <span className="italic font-normal text-accent font-serif pr-2">Güvenli</span>
            ve Destekleyici Adımlar.
          </h1>
          
          <p className="text-base md:text-lg text-ink/70 max-w-2xl mx-auto mb-12 leading-relaxed font-normal">
            İstanbul genelinde yerel yönetimler ve sivil toplum ağları tarafından işletilen tüm dayanışma birimlerine anında erişin. Sosyal, hukuki ve psikolojik danışmanlık hizmetlerine dair detaylı kılavuz.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              id="cta-explore-btn"
              onClick={onExploreMap}
              className="w-full sm:w-auto group flex items-center justify-center space-x-3 bg-accent hover:bg-ink text-white font-bold tracking-widest uppercase text-xs px-8 py-4 transition-all duration-300 transform hover:-translate-y-0.5 shadow-md"
            >
              <span>HARİTAYI AÇ & KEŞFET</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a
              href="#emergencies"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-paper hover:bg-slate-100 text-ink font-bold tracking-widest uppercase text-xs px-8 py-4 border border-ink/20 transition-all"
            >
              <span>ACİL YARDIM HATLARI</span>
            </a>
          </div>

          {/* Styled Editorial Counters */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 max-w-3xl mx-auto mt-20 border border-ink/10 divide-x divide-y lg:divide-y-0 divide-ink/10 bg-white shadow-sm rounded-none">
            <div className="p-6 md:p-8 text-center">
              <span className="block font-serif text-5xl md:text-6xl font-black tracking-tighter text-ink italic">
                {loading ? "..." : totalCenters > 0 ? totalCenters : "42"}
              </span>
              <span className="text-[10px] font-bold text-muted-gray mt-2 block uppercase tracking-widest">Aktif Dayanışma Merkezi</span>
            </div>
            <div className="p-6 md:p-8 text-center">
              <span className="block font-serif text-5xl md:text-6xl font-black tracking-tighter text-accent italic">
                {loading ? "..." : uniqueDistricts > 0 ? uniqueDistricts : "26"}
              </span>
              <span className="text-[10px] font-bold text-muted-gray mt-2 block uppercase tracking-widest">Farklı İlçede Hizmet</span>
            </div>
            <div className="col-span-2 lg:col-span-1 p-6 md:p-8 text-center bg-accent/5">
              <span className="block font-serif text-5xl md:text-6xl font-black tracking-tighter text-ink italic">%100</span>
              <span className="text-[10px] font-bold text-muted-gray mt-2 block uppercase tracking-widest">Tamamen Ücretsiz Destek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-24 bg-white px-6 border-b border-ink/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent">HİZMET KATEGORİLERİ</p>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-ink">Sunulan Dayanışma Kanalları</h2>
            <div className="w-12 h-0.5 bg-accent mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-ink/10 hover:border-accent transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-accent/10 text-accent rounded-none w-fit">
                  <Heart className="w-6 h-6 fill-accent/20" />
                </div>
                <h3 className="font-serif italic font-extrabold text-xl text-ink">Psikososyal Danışmanlık</h3>
                <p className="text-xs text-ink/70 leading-relaxed font-normal">
                  Yaşanan sosyal travmalar, toplumsal zorluklar veya kriz anlarında bireysel terapi, psikolojik farkındalık çalışmaları ve gizlilik esaslı akran danışmanlığı.
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase pt-4 block">GİZLİLİK ESASLI / ÜCRETSİZ</span>
            </div>

            <div className="p-8 border border-ink/10 hover:border-accent transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-accent/10 text-accent rounded-none w-fit">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-serif italic font-extrabold text-xl text-ink">Sosyal Ağ & Yönlendirme</h3>
                <p className="text-xs text-ink/70 leading-relaxed font-normal">
                  Barınma güvencesi, gıda ve kreş desteklerinin koordinasyonu; kurumlar arası hızlı sevk zincirleri ve sığınmaevleri yerleştirme çalışmaları.
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase pt-4 block">YEREL YÖNETİM ORTAKLI</span>
            </div>

            <div className="p-8 border border-ink/10 hover:border-accent transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-accent/10 text-accent rounded-none w-fit">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-serif italic font-extrabold text-xl text-ink">Hukuki Rehberlik</h3>
                <p className="text-xs text-ink/70 leading-relaxed font-normal">
                  6284 Sayılı Kanun kapsamındaki yasal haklar, koruyucu tedbir kararları, adli yardım baro atamaları ve duruşma süreçlerinde ücretsiz destek bilgilendirmesi.
                </p>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase pt-4 block">YASAL MEVZUAT BİLİNCİ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Helpline Section */}
      <section id="emergencies" className="py-24 bg-ink text-paper px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 to-ink opacity-40"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent bg-accent/10 border border-accent/25 px-4 py-1.5 rounded-full">KESİNTİSİZ ACİL HATTİ</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold mt-4 tracking-tight leading-none">Güvenlik ve İhbar Kanalları</h2>
            <p className="text-xs font-light text-paper/70 mt-3 max-w-lg mx-auto">
              Hayati bir tehlike hissedilmesi veya acil koruma tedbiri gereksinimi duyulması anında 7/24 ulaşılabilecek resmi ulusal destek hatları.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/10 flex flex-col justify-between h-44">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-accent">KADIN DESTEK Hatti</span>
                <PhoneCall className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black italic">ALO 183</h3>
                <p className="text-[10px] text-paper/60 mt-1">Aile ve Sosyal Hizmetler Şiddet Önleme Hattı (Tüm dillerde 7/24)</p>
              </div>
            </div>

            <div className="p-6 bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/10 flex flex-col justify-between h-44">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-accent">GENEL ACİL SERVİS</span>
                <PhoneCall className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-black italic">112 ACİL</h3>
                <p className="text-[10px] text-paper/60 mt-1 font-light">Emniyet, Sağlık Ekipleri ve Polis İmdat yönlendirmeleri için ortak numara.</p>
              </div>
            </div>

            <div className="p-6 bg-white/[0.03] hover:bg-white/[0.06] transition-all border border-white/10 flex flex-col justify-between h-44">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-accent">TKDF ACİL YARDIM</span>
                <PhoneCall className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-mono font-bold">0212 656 96 96</h3>
                <p className="text-[10px] text-paper/60 mt-2">Türkiye Kadın Dernekleri Federasyonu Bağımsız Şiddet Acil İhbar Hattı.</p>
              </div>
            </div>
          </div>

          {/* Quick Informational Box */}
          <div className="mt-12 bg-white/[0.02] border border-white/10 p-6 flex items-start space-x-4">
            <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif italic font-bold text-sm text-paper">KADES Destek Uygulaması Hakkında Bilgi</h4>
              <p className="text-xs text-paper/70 leading-relaxed font-light">
                KADES, kadınların fiziksel şiddete uğraması veya karşılaşma ihtimali hallerinde, tek bir dokunuşla en yakın emniyet birimini sevkedebilen tescilli ve resmi akıllı telefon uygulamasıdır. Google Play ve App Store üzerinden ücretsiz indirilebilir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer in Editorial Style */}
      <footer className="mt-auto py-16 bg-paper border-t border-ink/10 text-ink/75 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-baseline space-x-2">
            <span className="font-serif italic font-black text-xl text-ink">İstanbul Dayanışma</span>
            <span className="text-[9px] uppercase tracking-widest text-muted-gray font-bold">© {new Date().getFullYear()}</span>
          </div>
          <div>
            <p className="text-xs text-muted-gray">Bu web sitesi, kadınların toplumsal hayatta güçlendirilmesi ve güvenli destek ağlarına erişebilmesi amacıyla sunulmaktadır.</p>
          </div>
          <div className="flex space-x-6 text-[10px] font-bold tracking-widest uppercase">
            <a href="#landing-container" className="hover:text-accent transition-colors">YUKARI</a>
            <button onClick={onExploreMap} className="hover:text-accent transition-colors">HARİTA</button>
            <a href="#emergencies" className="hover:text-accent transition-colors">ACİL DURUM</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
