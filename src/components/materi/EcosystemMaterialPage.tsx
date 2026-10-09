import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Search,
  BookOpen,
  ZoomIn,
  X,
  Droplets,
  Trees,
  Sun,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  MATERIAL_SECTIONS,
  SECTION_A_DATA,
  SECTION_B_DATA,
  SECTION_C_DATA,
  SECTION_D_DATA,
  SECTION_E_DATA,
} from '../../data/ecosystemMaterialData';

interface EcosystemMaterialPageProps {
  onBack: () => void;
}

export const EcosystemMaterialPage: React.FC<EcosystemMaterialPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; caption: string } | null>(null);
  const [ecosystemCategory, setEcosystemCategory] = useState<'all' | 'akuatik' | 'terestrial' | 'buatan'>('all');

  // Navigasi Mouse Drag-to-Scroll & Mouse Wheel untuk Subbab
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasMovedRef = useRef(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  // Native Wheel Event: Mengubah scroll vertikal mouse wheel menjadi geser horizontal pada subbab
  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        const canScrollLeftNow = el.scrollLeft > 0;
        const canScrollRightNow = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
        if ((e.deltaY > 0 && canScrollRightNow) || (e.deltaY < 0 && canScrollLeftNow)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScrollability();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [checkScrollability]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabScrollRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - tabScrollRef.current.offsetLeft;
    scrollLeftStartRef.current = tabScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !tabScrollRef.current) return;
    const x = e.pageX - tabScrollRef.current.offsetLeft;
    const distance = x - startXRef.current;
    if (Math.abs(distance) > 4) {
      hasMovedRef.current = true;
    }
    tabScrollRef.current.scrollLeft = scrollLeftStartRef.current - distance;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);
  };

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
  };

  const handleSelectTab = (tabId: string) => {
    if (hasMovedRef.current) return;
    setActiveTab(tabId);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesA = useMemo(() => {
    if (!normalizedQuery) return true;
    return (
      SECTION_A_DATA.title.toLowerCase().includes(normalizedQuery) ||
      SECTION_A_DATA.paragraphs.some((p) => p.toLowerCase().includes(normalizedQuery)) ||
      SECTION_A_DATA.keyTakeaways.some(
        (k) => k.title.toLowerCase().includes(normalizedQuery) || k.desc.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [normalizedQuery]);

  const matchesB = useMemo(() => {
    if (!normalizedQuery) return true;
    return (
      SECTION_B_DATA.title.toLowerCase().includes(normalizedQuery) ||
      SECTION_B_DATA.intro.toLowerCase().includes(normalizedQuery) ||
      SECTION_B_DATA.table.some(
        (t) =>
          t.name.toLowerCase().includes(normalizedQuery) ||
          t.role.toLowerCase().includes(normalizedQuery) ||
          t.examples.toLowerCase().includes(normalizedQuery) ||
          t.badge.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [normalizedQuery]);

  const matchesC = useMemo(() => {
    if (!normalizedQuery) return true;
    return (
      SECTION_C_DATA.title.toLowerCase().includes(normalizedQuery) ||
      SECTION_C_DATA.intro.toLowerCase().includes(normalizedQuery) ||
      SECTION_C_DATA.interactions.some(
        (i) =>
          i.name.toLowerCase().includes(normalizedQuery) ||
          i.definition.toLowerCase().includes(normalizedQuery) ||
          i.examples.toLowerCase().includes(normalizedQuery) ||
          i.badge.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [normalizedQuery]);

  const matchesD = useMemo(() => {
    if (!normalizedQuery) return true;
    return (
      SECTION_D_DATA.title.toLowerCase().includes(normalizedQuery) ||
      SECTION_D_DATA.intro.toLowerCase().includes(normalizedQuery) ||
      SECTION_D_DATA.sections.some(
        (s) =>
          s.title.toLowerCase().includes(normalizedQuery) ||
          s.text.toLowerCase().includes(normalizedQuery) ||
          s.trophicLevels?.some(
            (t) =>
              t.name.toLowerCase().includes(normalizedQuery) ||
              t.desc.toLowerCase().includes(normalizedQuery) ||
              t.badge.toLowerCase().includes(normalizedQuery)
          )
      )
    );
  }, [normalizedQuery]);

  const matchesE = useMemo(() => {
    if (!normalizedQuery) return true;
    return (
      SECTION_E_DATA.title.toLowerCase().includes(normalizedQuery) ||
      SECTION_E_DATA.naturalIntro.toLowerCase().includes(normalizedQuery) ||
      SECTION_E_DATA.aquatic.intro.toLowerCase().includes(normalizedQuery) ||
      SECTION_E_DATA.aquatic.items.some(
        (i) =>
          i.name.toLowerCase().includes(normalizedQuery) ||
          i.examples.toLowerCase().includes(normalizedQuery) ||
          i.features.some((f) => f.toLowerCase().includes(normalizedQuery))
      ) ||
      SECTION_E_DATA.terrestrial.intro.toLowerCase().includes(normalizedQuery) ||
      SECTION_E_DATA.terrestrial.items.some(
        (i) =>
          i.name.toLowerCase().includes(normalizedQuery) ||
          i.examples.toLowerCase().includes(normalizedQuery) ||
          i.features.some((f) => f.toLowerCase().includes(normalizedQuery))
      ) ||
      SECTION_E_DATA.artificial.intro.toLowerCase().includes(normalizedQuery) ||
      SECTION_E_DATA.artificial.items.some(
        (i) =>
          i.name.toLowerCase().includes(normalizedQuery) ||
          i.examples.toLowerCase().includes(normalizedQuery) ||
          i.features.some((f) => f.toLowerCase().includes(normalizedQuery))
      )
    );
  }, [normalizedQuery]);

  const hasAnyMatch = matchesA || matchesB || matchesC || matchesD || matchesE;

  return (
    <div className="h-full h-[100dvh] w-full overflow-y-auto bg-[#f8faf9] text-slate-800 flex flex-col font-sans antialiased">
      {/* ================= 1. HEADER UTAMA HALAMAN MATERI ================= */}
      <header className="sticky top-0 z-40 w-full h-14 lg:h-16 border-b border-stone-200/90 bg-white/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 flex items-center justify-between gap-3 shadow-xs flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 lg:px-3 lg:py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95 flex-shrink-0"
            title="Kembali ke Halaman Sebelumnya"
          >
            <ArrowLeft className="w-4 h-4 text-stone-700" />
            <span className="hidden lg:inline">Kembali</span>
          </button>

          <div className="h-6 w-px bg-stone-200 hidden lg:block" />

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm lg:text-base font-black text-slate-900 truncate">
                Ensiklopedia Materi Ekosistem
              </h1>
              <p className="text-[11px] text-stone-500 hidden lg:block truncate">
                Bahan bacaan & rujukan konsep Biologi terpadu Ecoplay
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================= 2. SUB-HEADER / TAB NAVIGASI & PENCARIAN ================= */}
      <div className="sticky top-14 lg:top-16 z-30 w-full px-3 sm:px-4 lg:px-6 py-2 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-2xs flex-shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* Navigasi Tab Bab (A - E) dengan Efek Fading Edges & Mouse Drag/Scroll */}
          <div className="relative flex-1 min-w-0 flex items-center group">
            {/* Tombol Geser Kiri (Desktop / Mouse) */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                className="hidden sm:flex absolute left-0 z-20 w-6 h-6 items-center justify-center rounded-full bg-white/95 border border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-500 shadow-xs transition"
                title="Geser subbab ke kiri"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Left Fading Edge (tipis & halus, tidak menjorok ke dalam) */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-2.5 sm:w-3 bg-gradient-to-r from-white to-transparent z-10" />

            {/* Scrollable & Draggable Tab List */}
            <div
              ref={tabScrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1.5 py-1 scroll-smooth select-none cursor-grab active:cursor-grabbing w-full"
            >
              <button
                type="button"
                onClick={() => handleSelectTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-2xs ${
                  activeTab === 'all'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                Semua Bab
              </button>
              {MATERIAL_SECTIONS.map((sec) => (
                <button
                  type="button"
                  key={sec.id}
                  onClick={() => handleSelectTab(sec.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-2xs ${
                    activeTab === sec.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                  title={sec.title}
                >
                  <span className="w-4 h-4 rounded-full bg-stone-200/80 text-current text-[10px] font-black flex items-center justify-center">
                    {sec.letter}
                  </span>
                  <span>{sec.title.replace(/^[A-E]\.\s*/, '')}</span>
                </button>
              ))}
            </div>

            {/* Right Fading Edge (tipis & halus, tidak menjorok ke dalam) */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-2.5 sm:w-3 bg-gradient-to-l from-white to-transparent z-10" />

            {/* Tombol Geser Kanan (Desktop / Mouse) */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                className="hidden sm:flex absolute right-0 z-20 w-6 h-6 items-center justify-center rounded-full bg-white/95 border border-stone-200 text-stone-600 hover:text-emerald-700 hover:border-emerald-500 shadow-xs transition"
                title="Geser subbab ke kanan"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Kolom Pencarian Kata Kunci */}
          <div className="relative w-full lg:w-72 flex-shrink-0">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari konsep (mis: tundra, trofik, benalu)..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 3. AREA KONTEN UTAMA HALAMAN ================= */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* ================= BAB A: PENGERTIAN ================= */}
        {matchesA && (activeTab === 'all' || activeTab === 'pengertian') && (
          <section
            id="section-pengertian"
            className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 animate-in fade-in"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-black text-sm">
                A
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Pengertian Ekosistem
                </h2>
                <p className="text-xs text-stone-500">
                  Definisi, sistem ekologi, dan hubungan timbal balik
                </p>
              </div>
            </div>

            {/* Teks Paragraf Asli */}
            <div className="space-y-3 text-stone-700 text-xs sm:text-sm leading-relaxed">
              {SECTION_A_DATA.paragraphs.map((p, idx) => (
                <p key={idx} className="bg-stone-50/70 p-3.5 sm:p-4 rounded-2xl border border-stone-200/60">
                  {p}
                </p>
              ))}
            </div>

            {/* Kartu Rangkuman Inti */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {SECTION_A_DATA.keyTakeaways.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3 shadow-2xs"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-emerald-950">{item.title}</div>
                    <div className="text-[11px] text-emerald-800/90 leading-snug">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= BAB B: KOMPONEN MAKHLUK HIDUP ================= */}
        {matchesB && (activeTab === 'all' || activeTab === 'komponen') && (
          <section
            id="section-komponen"
            className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 animate-in fade-in"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-black text-sm">
                B
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Komponen Makhluk Hidup
                </h2>
                <p className="text-xs text-stone-500">
                  Komponen biotik dan komponen abiotik penyusun ekosistem
                </p>
              </div>
            </div>

            {/* Paragraf Pengantar */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/60">
              {SECTION_B_DATA.intro}
            </p>

            {/* Tabel & Kartu Komponen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              {SECTION_B_DATA.table.map((row, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200/90 bg-white hover:border-emerald-500/60 transition shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{row.icon}</span>
                        <h3 className="font-extrabold text-sm text-slate-900">{row.name}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-bold">
                        {row.badge}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      <strong className="text-slate-800">Pengertian & Peran:</strong> {row.role}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl">
                    <span className="font-bold flex-shrink-0">Contoh:</span>
                    <span className="font-medium">{row.examples}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= BAB C: INTERAKSI ANTAR MAKHLUK HIDUP ================= */}
        {matchesC && (activeTab === 'all' || activeTab === 'interaksi') && (
          <section
            id="section-interaksi"
            className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-5 animate-in fade-in"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-black text-sm">
                C
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Interaksi Antar Makhluk Hidup
                </h2>
                <p className="text-xs text-stone-500">
                  Hubungan timbal balik dan saling ketergantungan di alam
                </p>
              </div>
            </div>

            {/* Pengantar */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/60">
              {SECTION_C_DATA.intro}
            </p>

            {/* Matriks Kartu Interaksi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {SECTION_C_DATA.interactions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl border border-stone-200/90 bg-white hover:border-amber-400 transition shadow-2xs flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.icon}</span>
                        <h3 className="font-black text-sm text-slate-900">{item.name}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-extrabold tracking-wide">
                        {item.symbol}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
                        {item.badge}
                      </span>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.definition}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 bg-stone-50 p-2.5 rounded-xl text-xs text-stone-700 leading-relaxed">
                    <div className="font-bold text-slate-900 text-[11px] mb-0.5">Contoh Nyata:</div>
                    <div>{item.examples}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= BAB D: ALIRAN ENERGI (URUTAN & GAMBAR PERSIS DOKUMEN) ================= */}
        {matchesD && (activeTab === 'all' || activeTab === 'aliran-energi') && (
          <section
            id="section-aliran-energi"
            className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in"
          >
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-300 text-amber-800 flex items-center justify-center font-black text-sm">
                D
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Aliran Energi
                </h2>
                <p className="text-xs text-stone-500">
                  Rantai Makanan, Jaring-jaring Makanan, dan Perpindahan Energi
                </p>
              </div>
            </div>

            {/* Pengantar Aliran Energi */}
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-stone-50/70 p-3.5 rounded-2xl border border-stone-200/60">
              {SECTION_D_DATA.intro}
            </p>

            {/* Sub-Bab Aliran Energi: Urutan dan Peletakan Gambar Persis Dokumen */}
            <div className="space-y-8">
              {SECTION_D_DATA.sections.map((sub, sIdx) => (
                <div
                  key={sub.id}
                  className="p-5 sm:p-7 rounded-3xl bg-stone-50/80 border border-stone-200/80 space-y-4 shadow-2xs"
                >
                  {/* Judul Sub-Bab */}
                  <div className="flex items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">
                        {sIdx + 1}
                      </span>
                      <span>{sub.title}</span>
                    </h3>
                    <span className="text-[11px] font-bold text-stone-500 hidden sm:inline">
                      Diagram Dokumen Materi
                    </span>
                  </div>

                  {/* GAMBAR LANGSUNG DI BAWAH JUDUL (Sesuai Urutan Dokumen) */}
                  <div className="space-y-2">
                    <div
                      onClick={() =>
                        setLightboxImage({
                          src: sub.image,
                          title: sub.title,
                          caption: sub.imageCaption,
                        })
                      }
                      className="relative group rounded-2xl overflow-hidden border-2 border-stone-200 bg-white shadow-xs cursor-pointer hover:border-emerald-600 transition flex items-center justify-center max-w-2xl mx-auto p-3"
                    >
                      <img
                        src={sub.image}
                        alt={sub.imageAlt}
                        className="max-h-80 w-auto object-contain rounded-xl group-hover:scale-[1.02] transition duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                        <span className="px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 text-xs font-bold shadow-md flex items-center gap-1.5">
                          <ZoomIn className="w-3.5 h-3.5 text-emerald-700" />
                          Klik untuk Perbesar Gambar
                        </span>
                      </div>
                    </div>
                    <p className="text-center text-[11px] text-stone-500 italic max-w-xl mx-auto">
                      {sub.imageCaption}
                    </p>
                  </div>

                  {/* TEKS PENJELAS LANGSUNG DI BAWAH GAMBAR */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 text-xs sm:text-sm text-stone-700 leading-relaxed shadow-2xs">
                    {sub.text}
                  </div>

                  {/* Khusus Perpindahan Energi: Rincian Tingkat Trofik */}
                  {sub.trophicLevels && (
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                        Urutan Tingkat Trofik Aliran Energi:
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {sub.trophicLevels.map((trophic, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-4 sm:p-4.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5 text-left"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{trophic.icon}</span>
                                <div className="font-extrabold text-xs sm:text-sm text-slate-900">{trophic.name}</div>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold flex-shrink-0">
                                {trophic.badge}
                              </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-stone-600 leading-relaxed">{trophic.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= BAB E: JENIS-JENIS EKOSISTEM ================= */}
        {matchesE && (activeTab === 'all' || activeTab === 'jenis-ekosistem') && (
          <section
            id="section-jenis-ekosistem"
            className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-7 shadow-sm space-y-6 animate-in fade-in"
          >
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-black text-sm">
                  E
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Jenis-jenis Ekosistem
                  </h2>
                  <p className="text-xs text-stone-500">
                    Ekosistem Alami (Akuatik & Terestrial) serta Ekosistem Buatan
                  </p>
                </div>
              </div>

              {/* Filter Kategori Ekosistem */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 text-xs font-bold overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setEcosystemCategory('all')}
                  className={`px-3 py-1 rounded-xl transition ${
                    ecosystemCategory === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setEcosystemCategory('akuatik')}
                  className={`px-3 py-1 rounded-xl transition flex items-center gap-1 ${
                    ecosystemCategory === 'akuatik' ? 'bg-white text-sky-800 shadow-2xs font-black' : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  🌊 Akuatik
                </button>
                <button
                  onClick={() => setEcosystemCategory('terestrial')}
                  className={`px-3 py-1 rounded-xl transition flex items-center gap-1 ${
                    ecosystemCategory === 'terestrial' ? 'bg-white text-emerald-800 shadow-2xs font-black' : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  🌲 Terestrial
                </button>
                <button
                  onClick={() => setEcosystemCategory('buatan')}
                  className={`px-3 py-1 rounded-xl transition flex items-center gap-1 ${
                    ecosystemCategory === 'buatan' ? 'bg-white text-amber-800 shadow-2xs font-black' : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  🌾 Buatan
                </button>
              </div>
            </div>

            {/* Pengantar Ekosistem Alami */}
            {(ecosystemCategory === 'all' || ecosystemCategory === 'akuatik' || ecosystemCategory === 'terestrial') && (
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200/70 text-xs sm:text-sm text-emerald-950 font-medium">
                <strong>Ekosistem Alami:</strong> {SECTION_E_DATA.naturalIntro}
              </div>
            )}

            {/* 1. AKUATIK */}
            {(ecosystemCategory === 'all' || ecosystemCategory === 'akuatik') && (
              <div className="space-y-3.5 pt-1">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-600" />
                  <h3 className="font-black text-base text-slate-900">
                    1. Ekosistem Akuatik (Perairan)
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                  {SECTION_E_DATA.aquatic.intro}
                </p>

                <div className="grid grid-cols-1 gap-3.5">
                  {SECTION_E_DATA.aquatic.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border border-sky-200/80 bg-white shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                            {item.salinity}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ciri-ciri:</span>
                          <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4 leading-relaxed">
                            {item.features.map((f, fIdx) => (
                              <li key={fIdx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 text-[11px] text-sky-900 bg-sky-50/70 p-2.5 rounded-xl">
                        <strong>Contoh:</strong> {item.examples}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. TERESTRIAL */}
            {(ecosystemCategory === 'all' || ecosystemCategory === 'terestrial') && (
              <div className="space-y-3.5 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Trees className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-black text-base text-slate-900">
                    2. Ekosistem Terestrial (Daratan)
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200/60">
                  {SECTION_E_DATA.terrestrial.intro}
                </p>

                <div className="grid grid-cols-1 gap-3.5">
                  {SECTION_E_DATA.terrestrial.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border border-stone-200/90 bg-white shadow-2xs space-y-3 flex flex-col justify-between hover:border-emerald-500 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                            {item.climate}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ciri-ciri:</span>
                          <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4 leading-relaxed">
                            {item.features.map((f, fIdx) => (
                              <li key={fIdx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 text-[11px] text-emerald-950 bg-emerald-50/70 p-2.5 rounded-xl">
                        <strong>Contoh:</strong> {item.examples}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. EKOSISTEM BUATAN */}
            {(ecosystemCategory === 'all' || ecosystemCategory === 'buatan') && (
              <div className="space-y-3.5 pt-4 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-600" />
                  <h3 className="font-black text-base text-slate-900">
                    3. Ekosistem Buatan
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                  {SECTION_E_DATA.artificial.intro}
                </p>

                <div className="grid grid-cols-1 gap-3.5">
                  {SECTION_E_DATA.artificial.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border border-amber-200/90 bg-white shadow-2xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{item.icon}</span>
                            <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {item.function}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ciri-ciri:</span>
                          <ul className="text-[11px] text-stone-600 space-y-1 list-disc pl-4 leading-relaxed">
                            {item.features.map((f, fIdx) => (
                              <li key={fIdx}>{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 text-[11px] text-amber-950 bg-amber-50/70 p-2.5 rounded-xl">
                        <strong>Contoh:</strong> {item.examples}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Pesan Jika Pencarian Tidak Ditemukan */}
        {!hasAnyMatch && (
          <div className="bg-white p-8 rounded-3xl border border-stone-200 text-center space-y-3 my-6 animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-800 text-base">Materi Tidak Ditemukan</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              Tidak ada materi yang cocok dengan kata kunci &quot;<strong className="text-slate-800">{searchQuery}</strong>&quot;. Silakan coba kata kunci lain seperti <em>tundra</em>, <em>dekomposer</em>, <em>rantai makanan</em>, atau <em>mutualisme</em>.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              Bersihkan Pencarian
            </button>
          </div>
        )}
      </main>

      {/* ================= LIGHTBOX ZOOM GAMBAR ================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-3 sm:p-5 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h4 className="font-black text-sm sm:text-base text-slate-900 truncate">
                {lightboxImage.title}
              </h4>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600 transition"
                title="Tutup Zoom"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-stone-50 rounded-2xl p-2 min-h-60">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            <p className="text-center text-xs text-stone-600 font-medium">
              {lightboxImage.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
