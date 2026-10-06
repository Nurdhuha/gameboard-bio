import React, { useState } from 'react';
import { ActivityData, Team } from '../../types';
import { ACTIVITIES } from '../../data/boardData';
import {
  X,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Trash2,
  Video,
  FolderUp,
  History,
  ExternalLink,
  Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityModalProps {
  activity: ActivityData;
  team: Team;
  onClose: () => void;
  onSubmit: (answer: string, reflection?: string) => void;
  isBadgeTile?: boolean;
  previousAnswers?: Record<string, { answer: string; reflection?: string; score?: number }>;
  isTeacher?: boolean;
}

interface IA01Row {
  organisme: string;
  interaksi: string;
  dampak: string;
}

interface IA02Row {
  organisme: string;
  jenisInteraksi: string;
}

interface JE01Row {
  ekosistem: string;
  ciriCiri: string;
  jenis: string;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  team,
  onClose,
  onSubmit,
  isBadgeTile = false,
  previousAnswers = {},
  isTeacher = false,
}) => {
  const cleanCode = activity.code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const isKE01 = cleanCode === 'KE01';
  const isIA01 = cleanCode === 'IA01';
  const isIA02 = cleanCode === 'IA02';
  const isAE01 = cleanCode === 'AE01';
  const isAE02 = cleanCode === 'AE02';
  const isJE01 = cleanCode === 'JE01';

  // Daftar tautan video presentasi per aktivitas
  const videoSubmissionLinks: Record<string, { title: string; url: string }> = {
    KE05: {
      title: 'Pengumpulan Video Presentasi Lapangan KE-05',
      url: 'https://drive.google.com/drive/folders/1F9hWxZnuCJmvJ83QPdlQ8nKRwiQRY-c7?usp=sharing',
    },
    IA05: {
      title: 'Pengumpulan Video Presentasi & Peragaan IA-05',
      url: 'https://drive.google.com/drive/folders/1gmNTalJFs2Ys_jr4_QiNUb30XNi9c7tM?usp=sharing',
    },
    AE05: {
      title: 'Pengumpulan Video Presentasi Aliran Energi AE-05',
      url: 'https://drive.google.com/drive/folders/1AsCIg7hrqAX471riA625S_DgBtv3d--g?usp=sharing',
    },
    JE05: {
      title: 'Pengumpulan Video Presentasi Jenis Ekosistem JE-05',
      url: 'https://drive.google.com/drive/folders/18VhI_H7tmFUl76MpFn5P--T2iuwkQG9P?usp=sharing',
    },
  };

  // Daftar tautan rujukan regulasi diri per aktivitas
  const referenceLinks: Record<string, { title: string; label: string; url: string }> = {
    KE06: {
      title: 'Dokumen Rujukan Regulasi Diri (Google Drive)',
      label: 'Buka Dokumen Rujukan Regulasi Diri (Google Drive) ↗',
      url: 'https://drive.google.com/file/d/1_lJuOVjOoIzU0SRawg7cZp9z44kbmL0b/view?usp=drive_tautan',
    },
    IA06: {
      title: 'Dokumen Rujukan / Contoh Jawaban (Google Spreadsheet)',
      label: 'Buka Dokumen Rujukan / Contoh Jawaban (Google Spreadsheet) ↗',
      url: 'https://docs.google.com/spreadsheets/d/1XZFTq6S7sqfLXN7k0iBRM4l0Yleo0uIx/edit?usp=sharing&ouid=110878896367055626186&rtpof=true&sd=true',
    },
    AE06: {
      title: 'Dokumen Rujukan / Contoh Jawaban (Google Drive)',
      label: 'Buka Dokumen Rujukan / Contoh Jawaban (Google Drive) ↗',
      url: 'https://drive.google.com/drive/folders/1pzGCcpYD1BwePmtZttKx5zBnyUbsoKGG?usp=sharing',
    },
    JE06: {
      title: 'Dokumen Rujukan / Contoh Jawaban (Google Spreadsheet)',
      label: 'Buka Dokumen Rujukan / Contoh Jawaban (Google Spreadsheet) ↗',
      url: 'https://docs.google.com/spreadsheets/d/12icIKCTe2yCHPeZERlCoM38jdrFHzzLU/edit?usp=sharing&ouid=110878896367055626186&rtpof=true&sd=true',
    },
  };

  const isSelfRegulationFocus =
    ['KE06', 'IA06', 'AE06', 'JE06'].includes(cleanCode) ||
    activity.indicator === 'Regulasi Diri';

  const existingRecord = previousAnswers[activity.code];

  // Tab aktif default: Jika fokus regulasi diri (KE06, IA06, AE06, dsb), langsung buka tab regulasi diri
  const [activeTab, setActiveTab] = useState<'stimulus' | 'lkpd' | 'selfReg'>(
    isSelfRegulationFocus ? 'selfReg' : 'stimulus'
  );

  const [reflection, setReflection] = useState<string>(
    existingRecord?.reflection || (isSelfRegulationFocus ? existingRecord?.answer || '' : '')
  );

  // =========================================================================
  // STATE KHUSUS KE-01: Tabel 2 Kolom (Biotik & Abiotik) + Penjelasan
  // =========================================================================
  const parseKE01Data = (savedText?: string) => {
    const defaultRows = [
      { biotik: '', abiotik: '' },
      { biotik: '', abiotik: '' },
      { biotik: '', abiotik: '' },
      { biotik: '', abiotik: '' },
    ];
    if (!savedText) return { rows: defaultRows, explanation: '' };

    const rows: Array<{ biotik: string; abiotik: string }> = [];
    let explanation = '';
    const lines = savedText.split('\n');
    let inExplanation = false;

    for (const line of lines) {
      if (line.includes('[Penjelasan Perbedaan]:')) {
        inExplanation = true;
        continue;
      }
      if (inExplanation) {
        explanation += (explanation ? '\n' : '') + line;
        continue;
      }
      const match = line.match(/^\d+\.\s*Biotik:\s*(.*?)\s*\|\s*Abiotik:\s*(.*?)$/i);
      if (match) {
        rows.push({
          biotik: match[1] === '-' ? '' : match[1],
          abiotik: match[2] === '-' ? '' : match[2],
        });
      }
    }

    return {
      rows: rows.length > 0 ? rows : defaultRows,
      explanation: inExplanation ? explanation.trim() : (rows.length === 0 ? savedText : ''),
    };
  };

  const initialKE01 = parseKE01Data(existingRecord?.answer);
  const [tableRows, setTableRows] = useState<Array<{ biotik: string; abiotik: string }>>(initialKE01.rows);
  const [explanation, setExplanation] = useState<string>(initialKE01.explanation);

  const handleAddRow = () => {
    setTableRows((prev) => [...prev, { biotik: '', abiotik: '' }]);
  };
  const handleRemoveRow = (index: number) => {
    if (tableRows.length <= 1) return;
    setTableRows((prev) => prev.filter((_, i) => i !== index));
  };
  const handleRowChange = (index: number, field: 'biotik' | 'abiotik', value: string) => {
    setTableRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // =========================================================================
  // STATE KHUSUS IA-01: Tabel 3 Kolom (Pasangan Organisme, Interaksi, Dampak) 5 Baris
  // =========================================================================
  const parseIA01Data = (savedText?: string): IA01Row[] => {
    const defaultRows: IA01Row[] = [
      { organisme: '', interaksi: '', dampak: '' },
      { organisme: '', interaksi: '', dampak: '' },
      { organisme: '', interaksi: '', dampak: '' },
      { organisme: '', interaksi: '', dampak: '' },
      { organisme: '', interaksi: '', dampak: '' },
    ];
    if (!savedText) return defaultRows;

    const rows: IA01Row[] = [];
    const lines = savedText.split('\n');
    for (const line of lines) {
      const match = line.match(
        /^\d+\.\s*Pasangan Organisme:\s*(.*?)\s*\|\s*Interaksi:\s*(.*?)\s*\|\s*Dampak:\s*(.*?)$/i
      );
      if (match) {
        rows.push({
          organisme: match[1] === '-' ? '' : match[1],
          interaksi: match[2] === '-' ? '' : match[2],
          dampak: match[3] === '-' ? '' : match[3],
        });
      }
    }
    return rows.length > 0 ? rows : defaultRows;
  };

  const initialIA01 = parseIA01Data(existingRecord?.answer);
  const [ia01Rows, setIa01Rows] = useState<IA01Row[]>(initialIA01);

  const handleAddIA01Row = () => {
    setIa01Rows((prev) => [...prev, { organisme: '', interaksi: '', dampak: '' }]);
  };
  const handleRemoveIA01Row = (index: number) => {
    if (ia01Rows.length <= 1) return;
    setIa01Rows((prev) => prev.filter((_, i) => i !== index));
  };
  const handleIA01RowChange = (index: number, field: keyof IA01Row, value: string) => {
    setIa01Rows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // =========================================================================
  // STATE KHUSUS IA-02: Tabel 2 Kolom (Pasangan Organisme, Jenis Interaksi)
  // =========================================================================
  const parseIA02Data = (savedText?: string): IA02Row[] => {
    const defaultRows: IA02Row[] = [
      { organisme: '', jenisInteraksi: '' },
      { organisme: '', jenisInteraksi: '' },
      { organisme: '', jenisInteraksi: '' },
      { organisme: '', jenisInteraksi: '' },
    ];
    if (!savedText) return defaultRows;

    const rows: IA02Row[] = [];
    const lines = savedText.split('\n');
    for (const line of lines) {
      const match = line.match(
        /^\d+\.\s*Pasangan Organisme:\s*(.*?)\s*\|\s*Jenis Interaksi:\s*(.*?)$/i
      );
      if (match) {
        rows.push({
          organisme: match[1] === '-' ? '' : match[1],
          jenisInteraksi: match[2] === '-' ? '' : match[2],
        });
      }
    }
    return rows.length > 0 ? rows : defaultRows;
  };

  const initialIA02 = parseIA02Data(existingRecord?.answer);
  const [ia02Rows, setIa02Rows] = useState<IA02Row[]>(initialIA02);

  const handleAddIA02Row = () => {
    setIa02Rows((prev) => [...prev, { organisme: '', jenisInteraksi: '' }]);
  };
  const handleRemoveIA02Row = (index: number) => {
    if (ia02Rows.length <= 1) return;
    setIa02Rows((prev) => prev.filter((_, i) => i !== index));
  };
  const handleIA02RowChange = (index: number, field: keyof IA02Row, value: string) => {
    setIa02Rows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // =========================================================================
  // STATE KHUSUS AE-01: Jawaban Ketik + Upload Foto
  // =========================================================================
  const parseAE01Data = (savedText?: string) => {
    if (!savedText) return { text: '', photo: null };
    const photoMatch = savedText.match(/\[Foto Bukti Lapangan\]:\s*([\s\S]+)$/);
    if (photoMatch) {
      const textPart = savedText.replace(/\[Foto Bukti Lapangan\]:\s*[\s\S]+$/, '').trim();
      return { text: textPart, photo: photoMatch[1].trim() };
    }
    return { text: savedText, photo: null };
  };

  const initialAE01 = parseAE01Data(existingRecord?.answer);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialAE01.photo);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // =========================================================================
  // STATE KHUSUS AE-02: Tampilan Panah Rantai Makanan + Jawaban Ketik
  // =========================================================================
  const parseAE02Data = (savedText?: string) => {
    const defaultNodes = ['Rumput', 'Belalang', 'Burung Pipit'];
    if (!savedText) return { nodes: defaultNodes, text: '' };

    const chainMatch = savedText.match(/\[Bagan Rantai Makanan\]:\s*(.*?)(?:\n\n\[Uraian Analisis\]:|\n\n|$)/s);
    if (chainMatch) {
      const nodes = chainMatch[1]
        .split('→')
        .map((s) => s.trim())
        .filter(Boolean);
      const textMatch = savedText.match(/\[Uraian Analisis\]:\s*([\s\S]*)$/);
      return {
        nodes: nodes.length > 0 ? nodes : defaultNodes,
        text: textMatch ? textMatch[1].trim() : '',
      };
    }
    return { nodes: defaultNodes, text: savedText };
  };

  const initialAE02 = parseAE02Data(existingRecord?.answer);
  const [chainNodes, setChainNodes] = useState<string[]>(initialAE02.nodes);

  const handleAddChainNode = () => {
    setChainNodes((prev) => [...prev, '']);
  };
  const handleRemoveChainNode = (index: number) => {
    if (chainNodes.length <= 2) return;
    setChainNodes((prev) => prev.filter((_, i) => i !== index));
  };
  const handleChainNodeChange = (index: number, value: string) => {
    setChainNodes((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  // =========================================================================
  // STATE KHUSUS JE-01: Tabel 3 Kolom (Ekosistem, Ciri-ciri, Jenis)
  // =========================================================================
  const parseJE01Data = (savedText?: string): JE01Row[] => {
    const defaultRows: JE01Row[] = [
      { ekosistem: '', ciriCiri: '', jenis: '' },
      { ekosistem: '', ciriCiri: '', jenis: '' },
      { ekosistem: '', ciriCiri: '', jenis: '' },
    ];
    if (!savedText) return defaultRows;

    const rows: JE01Row[] = [];
    const lines = savedText.split('\n');
    for (const line of lines) {
      const match = line.match(
        /^\d+\.\s*Ekosistem:\s*(.*?)\s*\|\s*Ciri-ciri:\s*(.*?)\s*\|\s*Jenis:\s*(.*?)$/i
      );
      if (match) {
        rows.push({
          ekosistem: match[1] === '-' ? '' : match[1],
          ciriCiri: match[2] === '-' ? '' : match[2],
          jenis: match[3] === '-' ? '' : match[3],
        });
      }
    }
    return rows.length > 0 ? rows : defaultRows;
  };

  const initialJE01 = parseJE01Data(existingRecord?.answer);
  const [je01Rows, setJe01Rows] = useState<JE01Row[]>(initialJE01);

  const handleAddJE01Row = () => {
    setJe01Rows((prev) => [...prev, { ekosistem: '', ciriCiri: '', jenis: '' }]);
  };
  const handleRemoveJE01Row = (index: number) => {
    if (je01Rows.length <= 1) return;
    setJe01Rows((prev) => prev.filter((_, i) => i !== index));
  };
  const handleJE01RowChange = (index: number, field: keyof JE01Row, value: string) => {
    setJe01Rows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Answer state untuk aktivitas umum & AE-01/AE-02
  const [answer, setAnswer] = useState<string>(() => {
    if (isAE01) return initialAE01.text;
    if (isAE02) return initialAE02.text;
    return existingRecord?.answer || '';
  });

  // Helper mencari aktivitas sebelumnya dalam 1 zona (KE-06: KE-01..05, IA-06: IA-01..05, AE-06: AE-01..05)
  const getPreviousActivityCodes = (code: string) => {
    const prefix = code.split('-')[0];
    const num = parseInt(code.split('-')[1] || '0', 10);
    const codes: string[] = [];
    for (let i = 1; i < num; i++) {
      codes.push(`${prefix}-0${i}`);
    }
    return codes;
  };
  const previousActivityCodes = getPreviousActivityCodes(activity.code);

  const handleSubmit = () => {
    if (isBadgeTile) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }

    if (isKE01) {
      const rowsText = tableRows
        .map((r, i) => `${i + 1}. Biotik: ${r.biotik.trim() || '-'} | Abiotik: ${r.abiotik.trim() || '-'}`)
        .join('\n');
      const finalAnswer = `[Tabel Komponen Ekosistem]\n${rowsText}\n\n[Penjelasan Perbedaan]:\n${explanation.trim()}`;
      onSubmit(finalAnswer, undefined);
    } else if (isIA01) {
      const rowsText = ia01Rows
        .map(
          (r, i) =>
            `${i + 1}. Pasangan Organisme: ${r.organisme.trim() || '-'} | Interaksi: ${r.interaksi.trim() || '-'} | Dampak: ${r.dampak.trim() || '-'}`
        )
        .join('\n');
      const finalAnswer = `[Tabel Pengamatan Interaksi Antarmakhluk Hidup]\n${rowsText}`;
      onSubmit(finalAnswer, undefined);
    } else if (isIA02) {
      const rowsText = ia02Rows
        .map(
          (r, i) =>
            `${i + 1}. Pasangan Organisme: ${r.organisme.trim() || '-'} | Jenis Interaksi: ${r.jenisInteraksi.trim() || '-'}`
        )
        .join('\n');
      const finalAnswer = `[Tabel Analisis Jenis Interaksi]\n${rowsText}`;
      onSubmit(finalAnswer, undefined);
    } else if (isAE01) {
      const finalAnswer = photoPreview
        ? `${answer.trim()}\n\n[Foto Bukti Lapangan]:\n${photoPreview}`
        : answer.trim();
      onSubmit(finalAnswer, undefined);
    } else if (isAE02) {
      const chainText = chainNodes.filter((n) => n.trim()).join(' → ');
      const finalAnswer = chainText
        ? `[Bagan Rantai Makanan]: ${chainText}\n\n[Uraian Analisis]:\n${answer.trim()}`
        : answer.trim();
      onSubmit(finalAnswer, undefined);
    } else if (isJE01) {
      const rowsText = je01Rows
        .map(
          (r, i) =>
            `${i + 1}. Ekosistem: ${r.ekosistem.trim() || '-'} | Ciri-ciri: ${r.ciriCiri.trim() || '-'} | Jenis: ${r.jenis.trim() || '-'}`
        )
        .join('\n');
      const finalAnswer = `[Tabel Pengamatan Jenis Ekosistem]\n${rowsText}`;
      onSubmit(finalAnswer, undefined);
    } else if (isSelfRegulationFocus) {
      // Pada aktivitas Regulasi Diri (KE-06, IA-06, AE-06, JE-06), refleksi merupakan jawaban utama
      onSubmit(reflection, reflection);
    } else {
      onSubmit(answer, undefined);
    }
  };

  const isChallenge = activity.cardType === 'Challenge';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 md:p-6 border-b flex-shrink-0 ${
            isChallenge
              ? 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
              : 'bg-sky-50/70 border-sky-100 text-sky-950'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider ${
                  isChallenge
                    ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-200'
                    : 'bg-sky-100/90 text-sky-800 border border-sky-200'
                }`}
              >
                {activity.cardType === 'Challenge' ? '🌿 Tantangan Lapangan' : '🐉 Riddle Analisis'}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-bold bg-white text-stone-700 border border-stone-200 px-2.5 sm:px-3 py-1 rounded-full shadow-sm">
                Petak #{activity.tileNumber}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-black/5 text-stone-500 hover:text-stone-800 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-snug">
            {['KE-06', 'IA-06', 'AE-06', 'JE-06'].includes(activity.code)
              ? `Tantangan Lencana - Petak #${activity.tileNumber}`
              : activity.cardType === 'Challenge'
              ? `Tantangan Lapangan - Petak #${activity.tileNumber}`
              : `Teka-Teki Analisis - Petak #${activity.tileNumber}`}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Sub-materi: <span className="font-semibold text-slate-800">{activity.zoneName}</span>
          </p>

          {isBadgeTile && (
            <div className="mt-2.5 sm:mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl text-amber-800 text-xs sm:text-sm font-semibold">
              <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Petak Lencana! Kelompok tercepat akan memperoleh bonus poin lencana!</span>
            </div>
          )}

          {isTeacher && (
            <div className="mt-2.5 sm:mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-900 text-xs sm:text-sm font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span>Mode Monitoring Guru (Hanya Baca): Anda sedang meninjau aktivitas tim {team.name}. Lembar ini dikerjakan mandiri oleh siswa.</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-100 bg-stone-50/50 px-2.5 sm:px-4 pt-1 gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('stimulus')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 transition ${
              activeTab === 'stimulus'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            1. Soal & Petunjuk
          </button>

          {/* Tab LKPD biasa: Dihilangkan khusus aktivitas Regulasi Diri (KE-06, IA-06, AE-06) */}
          {!isSelfRegulationFocus && (
            <button
              onClick={() => setActiveTab('lkpd')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 transition ${
                activeTab === 'lkpd'
                  ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              2. Lembar LKPD
            </button>
          )}

          {/* Tab Regulasi Diri: Khusus aktivitas akhir (KE-06, IA-06, AE-06, JE-06) */}
          {isSelfRegulationFocus && (
            <button
              onClick={() => setActiveTab('selfReg')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 transition ${
                activeTab === 'selfReg'
                  ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                  : 'border-transparent text-stone-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              2. Regulasi Diri & Refleksi
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-3.5 sm:space-y-4">
          {/* TAB 1: SOAL & PETUNJUK */}
          {activeTab === 'stimulus' && (
            <div className="space-y-3.5 sm:space-y-4">
              <div className="bg-stone-50/80 border border-stone-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  Instruksi Aktivitas
                </h4>
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                  {activity.instruction}
                </p>
              </div>

              {/* Tautan Bantuan Observasi Khusus IA-01 */}
              {isIA01 && (
                <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderUp className="w-4 h-4 text-emerald-700" />
                    Folder Bantuan Observasi Lapangan
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    Jika kelompok tidak menemukan interaksi langsung selama observasi di lapangan, silakan akses data bantuan melalui folder Google Drive di bawah:
                  </p>
                  <a
                    href="https://drive.google.com/drive/folders/1gjWHJ_srFJXooz0GUNowzd6h0OWKJjj4?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Folder Bantuan Observasi (Google Drive) ↗</span>
                  </a>
                </div>
              )}

              {/* Tautan Bantuan Observasi Khusus AE-01 */}
              {isAE01 && (
                <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderUp className="w-4 h-4 text-emerald-700" />
                    Folder Bantuan Observasi Lapangan
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    Jika kelompok tidak menemukan objek observasi hubungan makan-memakan secara langsung, silakan akses materi bantuan melalui folder Google Drive di bawah:
                  </p>
                  <a
                    href="https://drive.google.com/drive/folders/13ezailo9K8JRdOMcwhGW5LhhZoC4dnol?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Folder Bantuan Observasi (Google Drive) ↗</span>
                  </a>
                </div>
              )}

              {/* Tautan Bantuan Observasi Khusus JE-01 */}
              {isJE01 && (
                <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FolderUp className="w-4 h-4 text-emerald-700" />
                    Folder Bantuan Observasi Ekosistem
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                    Jika saat observasi kelompok tidak menemukan objek ekosistem yang sesuai di lingkungan sekitar, silakan akses data bantuan melalui folder Google Drive di bawah:
                  </p>
                  <a
                    href="https://drive.google.com/drive/folders/101cBzYK2R8Jb4ITPkUc_YlgNAQ6Q9MFn?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka Folder Bantuan Observasi (Google Drive) ↗</span>
                  </a>
                </div>
              )}

              {/* Tautan Khusus Pengumpulan Video (KE-05, IA-05, AE-05) */}
              {videoSubmissionLinks[cleanCode] && (
                <div className="bg-sky-50 border border-sky-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-sky-600" />
                    {videoSubmissionLinks[cleanCode].title}
                  </div>
                  <p className="text-xs sm:text-sm text-sky-900 leading-relaxed">
                    Unggah rekaman video presentasi kelompokmu ke folder Google Drive resmi berikut:
                  </p>
                  <a
                    href={videoSubmissionLinks[cleanCode].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>Buka Google Drive Pengumpulan Video ↗</span>
                  </a>
                </div>
              )}

              {/* Tautan Khusus Dokumen Rujukan Regulasi Diri (KE-06, IA-06, AE-06) */}
              {referenceLinks[cleanCode] && (
                <div className="bg-amber-50/80 border border-amber-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                  <div className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    {referenceLinks[cleanCode].title}
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    Akses dokumen rujukan biologi resmi untuk memvalidasi dan merefleksikan jawaban kelompokmu:
                  </p>
                  <a
                    href={referenceLinks[cleanCode].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>{referenceLinks[cleanCode].label}</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LKPD FORM (Untuk aktivitas biasa / bukan Regulasi Diri) */}
          {!isSelfRegulationFocus && activeTab === 'lkpd' && (
            <div className="space-y-3 sm:space-y-4">
              {/* KHUSUS KE-01: Format Tabel 2 Kolom (Biotik & Abiotik) */}
              {isKE01 ? (
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                        Tabel Pengamatan
                      </label>
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-stone-100 text-stone-700 uppercase font-extrabold text-xs tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            <th className="py-2.5 px-3">Komponen Biotik</th>
                            <th className="py-2.5 px-3">Komponen Abiotik</th>
                            {tableRows.length > 4 && (
                              <th className="py-2.5 px-2 w-10 text-center">Hapus</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {tableRows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 text-center font-bold text-stone-400 text-xs sm:text-sm">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.biotik}
                                  onChange={(e) => handleRowChange(idx, 'biotik', e.target.value)}
                                  placeholder="Contoh: Rumput, Semut..."
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.abiotik}
                                  onChange={(e) => handleRowChange(idx, 'abiotik', e.target.value)}
                                  placeholder="Contoh: Tanah, Air, Batu..."
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              {tableRows.length > 4 && (
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRow(idx)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                                    title="Hapus baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Kolom Jawaban Ketik di Bawah Tabel: Penjelasan Perbedaan Biotik & Abiotik */}
                  <div className="bg-stone-50/80 border border-stone-200 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                      <span>Kolom Jawaban: Penjelasan Perbedaan Biotik dan Abiotik</span>
                    </label>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Berdasarkan data temuan kelompokmu pada tabel pengamatan di atas, jelaskan apa perbedaan mendasar antara komponen biotik dan abiotik:
                    </p>
                    <textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Tuliskan penjelasan perbedaan antara komponen biotik dan abiotik di sini secara lengkap dan runtut..."
                      rows={4}
                      className="w-full bg-white border border-stone-300 rounded-xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition leading-relaxed"
                    />
                  </div>
                </div>
              ) : isIA01 ? (
                /* KHUSUS IA-01: Format Tabel 3 Kolom (Pasangan Organisme, Interaksi, Dampak) 5 Baris */
                <div className="space-y-3 sm:space-y-4">
                  {/* Banner Tautan Google Drive Observasi */}
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl space-y-2">
                    <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderUp className="w-4 h-4 text-emerald-700" />
                      Folder Bantuan Observasi Lapangan
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                      Jika kelompokmu tidak menemukan interaksi langsung saat observasi di lapangan, silakan buka file bantuan melalui tautan berikut:
                    </p>
                    <a
                      href="https://drive.google.com/drive/folders/1gjWHJ_srFJXooz0GUNowzd6h0OWKJjj4?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Folder Bantuan Observasi (Google Drive) ↗</span>
                    </a>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                        Tabel Pengamatan Interaksi
                      </label>
                      <button
                        type="button"
                        onClick={handleAddIA01Row}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-stone-100 text-stone-700 uppercase font-extrabold text-xs tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            <th className="py-2.5 px-3">Pasangan Organisme</th>
                            <th className="py-2.5 px-3">Interaksi</th>
                            <th className="py-2.5 px-3">Dampak bagi Organisme</th>
                            {ia01Rows.length > 5 && (
                              <th className="py-2.5 px-2 w-10 text-center">Hapus</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {ia01Rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 text-center font-bold text-stone-400 text-xs sm:text-sm">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.organisme}
                                  onChange={(e) => handleIA01RowChange(idx, 'organisme', e.target.value)}
                                  placeholder="Contoh: Lebah & Bunga"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.interaksi}
                                  onChange={(e) => handleIA01RowChange(idx, 'interaksi', e.target.value)}
                                  placeholder="Contoh: Mengisap nektar"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.dampak}
                                  onChange={(e) => handleIA01RowChange(idx, 'dampak', e.target.value)}
                                  placeholder="Contoh: Lebah kenyang, bunga terbantu serbuk"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              {ia01Rows.length > 5 && (
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIA01Row(idx)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                                    title="Hapus baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : isIA02 ? (
                /* KHUSUS IA-02: Format Tabel 2 Kolom (Pasangan Organisme, Jenis Interaksi) */
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                        Tabel Analisis Interaksi
                      </label>
                      <button
                        type="button"
                        onClick={handleAddIA02Row}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-stone-100 text-stone-700 uppercase font-extrabold text-xs tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            <th className="py-2.5 px-3">Pasangan Organisme</th>
                            <th className="py-2.5 px-3">Jenis Interaksi (Mutualisme, Predasi, dll.)</th>
                            {ia02Rows.length > 2 && (
                              <th className="py-2.5 px-2 w-10 text-center">Hapus</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {ia02Rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 text-center font-bold text-stone-400 text-xs sm:text-sm">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.organisme}
                                  onChange={(e) => handleIA02RowChange(idx, 'organisme', e.target.value)}
                                  placeholder="Contoh: Lebah dan Bunga"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.jenisInteraksi}
                                  onChange={(e) => handleIA02RowChange(idx, 'jenisInteraksi', e.target.value)}
                                  placeholder="Contoh: Simbiosis Mutualisme (+ / +)"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              {ia02Rows.length > 2 && (
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveIA02Row(idx)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                                    title="Hapus baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : isAE01 ? (
                /* KHUSUS AE-01: Jawaban Ketik + Upload Foto */
                <div className="space-y-3 sm:space-y-4">
                  {/* Banner Tautan Google Drive Observasi */}
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl space-y-2">
                    <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderUp className="w-4 h-4 text-emerald-700" />
                      Folder Bantuan Observasi Lapangan
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                      Jika kelompok tidak menemukan objek observasi hubungan makan-memakan di lapangan, silakan buka materi bantuan melalui tautan berikut:
                    </p>
                    <a
                      href="https://drive.google.com/drive/folders/13ezailo9K8JRdOMcwhGW5LhhZoC4dnol?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Folder Bantuan Observasi (Google Drive) ↗</span>
                    </a>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Jawaban / Hasil Pengamatan Hubungan Makan-Memakan:
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Catat minimal 3 organisme: apa yang dimakan, siapa yang memakan, dan bukti yang ditemukan beserta perannya (produsen/konsumen)..."
                      rows={5}
                      className="w-full bg-white border border-stone-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition leading-relaxed"
                    />
                  </div>

                  {/* Upload Foto Bukti Pengamatan */}
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                      Foto Bukti Lapangan:
                    </label>

                    <div className="bg-stone-50/70 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center transition">
                      <input
                        type="file"
                        id="photo-upload-ae01"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />

                      {photoPreview ? (
                        <div className="relative inline-block">
                          <img
                            src={photoPreview}
                            alt="Bukti Foto Pengamatan"
                            className="max-h-52 rounded-xl border border-stone-300 object-cover shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-700 text-white p-1.5 rounded-full text-xs shadow-md transition"
                            title="Hapus foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="photo-upload-ae01"
                          className="flex flex-col items-center justify-center cursor-pointer p-2 hover:text-emerald-700 transition"
                        >
                          <Camera className="w-8 h-8 text-stone-400 mb-2" />
                          <span className="text-sm sm:text-base font-bold text-slate-700">
                            Ambil Foto / Unggah Bukti Hubungan Makan-Memakan
                          </span>
                          <span className="text-xs sm:text-sm text-stone-500 mt-1">
                            (Gunakan kamera smartphone atau pilih file foto dari galeri)
                          </span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ) : isAE02 ? (
                /* KHUSUS AE-02: Tampilan Panah Rantai Makanan + Jawaban Ketik */
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-emerald-50/60 border border-emerald-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        <span>Bagan Rantai Makanan (Aliran Energi):</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddChainNode}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition shadow-2xs"
                      >
                        <Plus className="w-4 h-4 text-emerald-700" />
                        <span>Tambah Tingkat Panah</span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
                      Tanda panah (→) menunjukkan arah aliran energi dari organisme yang dimakan menuju pemakan.
                    </p>

                    <div className="flex flex-wrap items-center gap-2 p-2.5 sm:p-3 bg-white rounded-xl border border-emerald-200/80 shadow-2xs">
                      {chainNodes.map((node, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <div className="flex items-center text-emerald-600 font-extrabold px-0.5">
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-lg p-1.5 shadow-2xs">
                            <span className="text-xs font-bold text-emerald-800 px-2 py-0.5 rounded bg-emerald-100/90 whitespace-nowrap">
                              {i === 0 ? 'Produsen' : `Konsumen ${i}`}
                            </span>
                            <input
                              type="text"
                              value={node}
                              onChange={(e) => handleChainNodeChange(i, e.target.value)}
                              placeholder={i === 0 ? 'Rumput' : i === 1 ? 'Belalang' : 'Burung'}
                              className="w-28 sm:w-36 bg-white border border-stone-200 rounded px-2.5 py-1.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600"
                            />
                            {chainNodes.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveChainNode(i)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition"
                                title="Hapus tingkat ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                        Uraian Analisis & Penjelasan Tingkat Trofik:
                      </label>
                      <button
                        type="button"
                        onClick={() => setAnswer((prev) => (prev ? prev + ' → ' : '→ '))}
                        className="text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition"
                        title="Sisipkan tanda panah ke teks"
                      >
                        + Sisipkan Panah (→)
                      </button>
                    </div>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Jelaskan peran masing-masing organisme dan arah perpindahan energi pada rantai makanan di atas..."
                      rows={5}
                      className="w-full bg-white border border-stone-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition leading-relaxed"
                    />
                  </div>
                </div>
              ) : isJE01 ? (
                /* KHUSUS JE-01: Format Tabel 3 Kolom (Ekosistem, Ciri-ciri, Jenis) */
                <div className="space-y-3 sm:space-y-4">
                  {/* Banner Tautan Google Drive Observasi */}
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl space-y-2">
                    <div className="text-xs sm:text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderUp className="w-4 h-4 text-emerald-700" />
                      Folder Bantuan Observasi Ekosistem
                    </div>
                    <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                      Jika saat observasi kelompok tidak menemukan objek ekosistem yang sesuai di lingkungan sekitar, silakan buka file bantuan melalui tautan berikut:
                    </p>
                    <a
                      href="https://drive.google.com/drive/folders/101cBzYK2R8Jb4ITPkUc_YlgNAQ6Q9MFn?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition active:scale-95"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Folder Bantuan Observasi (Google Drive) ↗</span>
                    </a>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider">
                        Tabel Pengamatan Ekosistem
                      </label>
                      <button
                        type="button"
                        onClick={handleAddJE01Row}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Baris</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-stone-200 shadow-2xs">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-stone-100 text-stone-700 uppercase font-extrabold text-xs tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">No</th>
                            <th className="py-2.5 px-3">Ekosistem</th>
                            <th className="py-2.5 px-3">Ciri-ciri</th>
                            <th className="py-2.5 px-3">Jenis</th>
                            {je01Rows.length > 2 && (
                              <th className="py-2.5 px-2 w-10 text-center">Hapus</th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 bg-white">
                          {je01Rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50">
                              <td className="py-2 px-3 text-center font-bold text-stone-400 text-xs sm:text-sm">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.ekosistem}
                                  onChange={(e) => handleJE01RowChange(idx, 'ekosistem', e.target.value)}
                                  placeholder="Contoh: Hutan Hujan Tropis / Kolam Ikan"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.ciriCiri}
                                  onChange={(e) => handleJE01RowChange(idx, 'ciriCiri', e.target.value)}
                                  placeholder="Suhu, curah hujan, vegetasi, fauna khas..."
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              <td className="py-2 px-2 sm:px-3">
                                <input
                                  type="text"
                                  value={row.jenis}
                                  onChange={(e) => handleJE01RowChange(idx, 'jenis', e.target.value)}
                                  placeholder="Alami / Buatan"
                                  className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                                />
                              </td>
                              {je01Rows.length > 2 && (
                                <td className="py-2 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveJE01Row(idx)}
                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                                    title="Hapus baris"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : videoSubmissionLinks[cleanCode] ? (
                /* KHUSUS PENGUMPULAN VIDEO DRIVE (KE-05, IA-05, AE-05, JE-05) */
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-sky-50 border border-sky-200 p-3.5 sm:p-4 rounded-xl space-y-2">
                    <div className="text-xs sm:text-sm font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-sky-600" />
                      Tautan Pengumpulan Video Google Drive
                    </div>
                    <p className="text-xs sm:text-sm text-sky-950 leading-relaxed">
                      Unggah file video presentasi kelompok ke tautan Google Drive resmi di bawah ini:
                    </p>
                    <a
                      href={videoSubmissionLinks[cleanCode].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
                    >
                      <FolderUp className="w-4 h-4" />
                      <span>{videoSubmissionLinks[cleanCode].title} ↗</span>
                    </a>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Konfirmasi Pengumpulan Video & Catatan Presentasi:
                    </label>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Contoh: 'Video presentasi kelompok telah diunggah dengan nama file: Video_Kelompok 1.mp4'. Tuliskan juga ringkasan temuan dan poin presentasi kalian di sini..."
                      rows={5}
                      className="w-full bg-white border border-stone-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                /* KE-02..04, IA-03..04, AE-03..04, JE-02..04: Jawaban Ketik Standar */
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Jawaban / Hasil Analisis Kelompok:
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Tuliskan temuan kelompokmu di sini secara lengkap dan runtut..."
                    rows={6}
                    className="w-full bg-white border border-stone-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition leading-relaxed"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGULASI DIRI & REFLEKSI (Khusus KE-06, IA-06, AE-06, JE-06) */}
          {isSelfRegulationFocus && activeTab === 'selfReg' && (
            <div className="space-y-3 sm:space-y-4">
              {/* 1. Kunci Rujukan & Validasi Konsep */}
              <div className="bg-amber-50/70 border border-amber-200/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl space-y-2.5">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Kunci Rujukan & Validasi Konsep
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                    Buka dokumen rujukan di bawah untuk memvalidasi dan membandingkan jawaban kelompokmu secara mandiri:
                  </p>
                </div>

                {referenceLinks[cleanCode] && (
                  <a
                    href={referenceLinks[cleanCode].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 sm:py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <FolderUp className="w-4 h-4" />
                    <span>{referenceLinks[cleanCode].label}</span>
                  </a>
                )}
              </div>

              {/* 2. Riwayat Jawaban Kelompok dari Aktivitas Sebelumnya */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-stone-500" />
                    Riwayat Jawaban Kelompok ({previousActivityCodes[0]} s/d {previousActivityCodes[previousActivityCodes.length - 1]}):
                  </h5>
                  <span className="text-xs text-stone-500 font-medium">Bandingkan dengan rujukan</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {previousActivityCodes.map((code) => {
                    const act = ACTIVITIES[code];
                    const prevData = previousAnswers[code];
                    return (
                      <div key={code} className="p-3 rounded-xl border border-stone-200/90 bg-white shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="font-bold text-slate-800">
                            Petak #{act?.tileNumber || '?'}: {act ? (act.cardType === 'Challenge' ? 'Tantangan Lapangan' : 'Teka-Teki Analisis') : code}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              prevData?.answer
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border border-stone-200'
                            }`}
                          >
                            {prevData?.answer ? '✓ Ada Jawaban' : 'Belum Dikerjakan'}
                          </span>
                        </div>
                        {prevData?.answer ? (
                          <div className="text-xs sm:text-sm text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-100 leading-relaxed">
                            <p className="whitespace-pre-line">
                              {prevData.answer.replace(/\[Foto Bukti Lapangan\]:\s*data:image\/[^\s]+/g, '[Foto Bukti Lapangan Terlampir]').trim()}
                            </p>
                            {prevData.answer.includes('[Foto Bukti Lapangan]:') && (
                              <span className="inline-block mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                📷 Ada Bukti Foto
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-stone-400 italic py-0.5">
                            Kelompok belum menyimpan jawaban untuk aktivitas ini.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Satu Kolom Jawaban Ketik: Refleksi & Perbaikan Jawaban */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Refleksi & Perbaikan Jawaban Kelompok:
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Periksa kembali jawaban kelompokmu di atas dengan membandingkannya terhadap dokumen rujukan. Tuliskan jika ada bagian yang diperbaiki atau alasan mempertahankan jawaban..."
                  rows={4}
                  className="w-full bg-white border border-stone-300 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base text-slate-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 transition leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 md:p-5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between flex-shrink-0">
          <div className="text-xs sm:text-sm text-stone-600">
            Tim: <span className="font-bold text-slate-800">{team.name}</span>
            {isTeacher && <span className="ml-2 text-emerald-700 font-bold">(Monitoring)</span>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-stone-600 hover:text-slate-800 hover:bg-stone-200/60 transition"
            >
              Tutup
            </button>
            {!isTeacher && (
              <button
                onClick={handleSubmit}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 sm:gap-2 shadow-sm transition active:scale-95"
              >
                <span>Kirim Jawaban</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
