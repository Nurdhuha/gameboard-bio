export interface TableRow {
  name: string;
  description: string | string[];
  examples: string;
  badge?: string;
}

export interface EnergyTrophicLevel {
  level: string;
  title: string;
  description: string;
  role: string;
  icon: string;
}

export interface EcosystemItem {
  name: string;
  features: string[];
  examples: string;
  category: 'akuatik' | 'terestrial' | 'buatan';
  badgeColor: string;
  icon: string;
}

export interface MaterialSection {
  id: string;
  letter: string;
  title: string;
  subtitle: string;
  icon: string;
}

export const MATERIAL_SECTIONS: MaterialSection[] = [
  { id: 'pengertian', letter: 'A', title: 'Pengertian Ekosistem', subtitle: 'Konsep dasar, interaksi biotik-abiotik, dan keseimbangan alam', icon: 'Leaf' },
  { id: 'komponen', letter: 'B', title: 'Komponen Makhluk Hidup', subtitle: 'Produsen, Konsumen, Pengurai, dan Faktor Abiotik', icon: 'Layers' },
  { id: 'interaksi', letter: 'C', title: 'Interaksi Antar Makhluk Hidup', subtitle: 'Mutualisme, Parasitisme, Komensalisme, Predasi, Kompetisi, Netralisme', icon: 'Users' },
  { id: 'aliran-energi', letter: 'D', title: 'Aliran Energi', subtitle: 'Rantai Makanan, Jaring-Jaring Makanan, dan Tingkat Trofik', icon: 'Zap' },
  { id: 'jenis-ekosistem', letter: 'E', title: 'Jenis-jenis Ekosistem', subtitle: 'Ekosistem Alami (Akuatik & Terestrial) serta Ekosistem Buatan', icon: 'Globe' },
];

export const SECTION_A_DATA = {
  title: 'A. Pengertian',
  paragraphs: [
    'Ekosistem merupakan suatu sistem ekologi yang terbentuk dari hubungan timbal balik yang tak terpisahkan antara makhluk hidup (biotik) dengan lingkungan fisiknya (abiotik).',
    'Ekosistem tersusun atas komponen biotik, seperti manusia, hewan, tumbuhan, dan mikroorganisme, serta komponen abiotik, seperti air, tanah, udara, cahaya, dan suhu, yang saling berinteraksi secara dinamis dalam membentuk keseimbangan lingkungan.',
    'Interaksi antarkomponen tersebut mencakup aliran energi, proses rantai makanan, serta siklus materi yang berperan dalam menunjang keberlangsungan kehidupan di dalam ekosistem (Ginting et al., 2026).',
  ],
  keyTakeaways: [
    { title: 'Sistem Ekologi Nyata', desc: 'Hubungan timbal balik tak terpisahkan antara makhluk hidup dan alam fisiknya.', icon: '🌱' },
    { title: 'Dua Pilar Utama', desc: 'Komponen Biotik (hidup) dan Abiotik (tak hidup) yang saling memengaruhi.', icon: '⚖️' },
    { title: 'Dinamika Keseimbangan', desc: 'Aliran energi, rantai makanan, dan siklus biogeokimia menopang kehidupan.', icon: '🔄' },
  ],
};

export const SECTION_B_DATA = {
  title: 'B. Komponen Makhluk Hidup',
  intro:
    'Komponen biotik adalah seluruh makhluk hidup dalam ekosistem, sedangkan komponen abiotik merupakan faktor fisik dan kimia yang memengaruhi kehidupan organisme. Kedua komponen saling berhubungan dan menentukan kondisi suatu ekosistem.',
  table: [
    {
      name: 'Produsen (biotik)',
      role: 'Organisme autotrof yang membentuk bahan organik dari bahan anorganik.',
      examples: 'Tumbuhan hijau, alga, fitoplankton',
      badge: 'Biotik - Autotrof',
      color: 'emerald',
      icon: '🌿',
    },
    {
      name: 'Konsumen (biotik)',
      role: 'Organisme heterotrof yang memperoleh energi dengan memakan organisme lain.',
      examples: 'Belalang, tikus, katak, ular',
      badge: 'Biotik - Heterotrof',
      color: 'amber',
      icon: '🦗',
    },
    {
      name: 'Pengurai (biotik)',
      role: 'Organisme yang menguraikan bahan organik dan mendukung daur materi.',
      examples: 'Bakteri dan jamur',
      badge: 'Biotik - Dekomposer',
      color: 'purple',
      icon: '🍄',
    },
    {
      name: 'Abiotik',
      role: 'Faktor tidak hidup yang memengaruhi pertumbuhan, persebaran, dan aktivitas organisme.',
      examples: 'Intensitas cahaya, suhu, kelembapan, dan pH.',
      badge: 'Faktor Fisik & Kimia',
      color: 'sky',
      icon: '☀️',
    },
  ],
};

export const SECTION_C_DATA = {
  title: 'C. Interaksi Antar Makhluk Hidup',
  intro:
    'Interaksi makhluk hidup adalah hubungan timbal balik atau saling ketergantungan antara satu organisme dengan organisme lainnya, maupun dengan lingkungan sekitarnya (komponen biotik dan abiotik).',
  interactions: [
    {
      name: 'Mutualisme',
      symbol: '+ / +',
      definition: 'Kedua organisme diuntungkan.',
      examples: 'Lebah memperoleh nektar; bunga terbantu penyerbukannya.',
      color: 'emerald',
      badge: 'Saling Menguntungkan',
      icon: '🤝',
    },
    {
      name: 'Parasitisme',
      symbol: '+ / -',
      definition: 'Salah satu organisme diuntungkan dan lainnya dirugikan.',
      examples: 'Benalu mengambil air dan mineral dari pohon inang.',
      color: 'rose',
      badge: 'Satu Rugi',
      icon: '🦟',
    },
    {
      name: 'Komensalisme',
      symbol: '+ / 0',
      definition: 'Salah satu organisme diuntungkan dan lainnya tidak diuntungkan maupun dirugikan.',
      examples: 'Anggrek epifit menempel pada batang pohon.',
      color: 'sky',
      badge: 'Satu Untung, Satu Netral',
      icon: '🌸',
    },
    {
      name: 'Predasi',
      symbol: 'Mangsa / Pemangsa',
      definition: 'Hubungan organisme yang memangsa dan dimangsa.',
      examples: 'Ular memangsa tikus di sawah.',
      color: 'amber',
      badge: 'Makan & Dimangsa',
      icon: '🐍',
    },
    {
      name: 'Kompetisi',
      symbol: '- / -',
      definition: 'Persaingan antarorganisme dalam memperebutkan sumber daya yang terbatas.',
      examples: 'Padi dan gulma bersaing memperoleh air, cahaya, dan hara.',
      color: 'orange',
      badge: 'Persaingan Sumber Daya',
      icon: '🌾',
    },
    {
      name: 'Netralisme',
      symbol: '0 / 0',
      definition: 'Hubungan antara organisme yang tidak saling memengaruhi secara langsung.',
      examples: 'Kupu-kupu dan cacing tanah di kebun, sebagai ilustrasi sederhana.',
      color: 'slate',
      badge: 'Tidak Saling Ganggu',
      icon: '🦋',
    },
  ],
};

export const SECTION_D_DATA = {
  title: 'D. Aliran Energi',
  intro:
    'Aliran energi merupakan proses penting dalam ekosistem yang menggambarkan perpindahan energi dari satu komponen ekosistem ke komponen lainnya dan berperan dalam mempertahankan struktur, fungsi, serta keberlangsungan kehidupan di dalam ekosistem (Bai, 2016). Berikut merupakan bentuk dari aliran energi:',
  sections: [
    {
      id: 'rantai-makanan',
      title: 'Rantai Makanan',
      image: '/materi/rantai-makanan.jpg',
      imageAlt: 'Diagram Rantai Makanan',
      imageCaption: 'Gambar 1: Rantai Makanan — Alur makan dan dimakan berurutan di dalam ekosistem',
      text: 'Rantai makanan adalah proses perpindahan energi melalui peristiwa makan dan dimakan secara berurutan antar-makhluk hidup di dalam suatu ekosistem. Komponen utama dalam rantai makanan yaitu produsen, konsumen, dan dekomposer.',
    },
    {
      id: 'jaring-makanan',
      title: 'Jaring-jaring Makanan',
      image: '/materi/jaring-makanan.jpg',
      imageAlt: 'Diagram Jaring-jaring Makanan',
      imageCaption: 'Gambar 2: Jaring-jaring Makanan — Hubungan kompleks saling terkait antarberbagai rantai makanan',
      text: 'Makhluk hidup membutuhkan energi untuk hidup dari makanan yang mereka makan (Sinaga, 2023). Jaring makanan memiliki implikasi pada tingkat populasi, komunitas, ekosistem, dan evolusi (Layman et al., 2015). Proses makan dan dimakan antorganisme untuk memperoleh energi dalam ekosistem merupakan bagian dari aliran energi yang berlangsung melalui rantai makanan dan jaring-jaring makanan (Priyanto, 2020). Perubahan satu populasi dapat memengaruhi beberapa jalur makan, tetapi besarnya dampak bergantung pada kondisi ekosistem.',
    },
    {
      id: 'perpindahan-energi',
      title: 'Perpindahan Energi',
      image: '/materi/piramida-trofik.jpg',
      imageAlt: 'Diagram Aliran Energi dan Tingkat Trofik',
      imageCaption: 'Gambar 3: Perpindahan Energi — Aliran energi satu arah bermula dari matahari melintasi tingkat trofik',
      text: 'Perpindahan energi (aliran energi) dalam ekosistem adalah proses berpindahnya energi dari satu makhluk hidup ke makhluk hidup lain secara satu arah, yang bermula dari matahari. Urutan tingkat trofik aliran energi dibagi sebagai berikut:',
      trophicLevels: [
        {
          level: 'Tingkat Trofik 1',
          name: 'Produsen',
          desc: 'Tumbuhan hijau, alga, atau fitoplankton menangkap energi cahaya matahari dan mengubahnya menjadi energi kimia lewat proses fotosintesis.',
          badge: 'Trofik 1 (Autotrof)',
          icon: '☀️🌿',
          color: 'emerald',
        },
        {
          level: 'Tingkat Trofik 2',
          name: 'Konsumen Primer',
          desc: 'Hewan pemakan tumbuhan (herbivora) yang memakan produsen.',
          badge: 'Trofik 2 (Herbivora)',
          icon: '🦗🐇',
          color: 'teal',
        },
        {
          level: 'Tingkat Trofik 3',
          name: 'Konsumen Sekunder',
          desc: 'Hewan karnivora atau omnivora yang memakan konsumen primer.',
          badge: 'Trofik 3 (Karnivora/Omnivora)',
          icon: '🐸🐦',
          color: 'amber',
        },
        {
          level: 'Tingkat Trofik 4',
          name: 'Konsumen Tersier',
          desc: 'Karnivora puncak yang memakan konsumen di bawahnya.',
          badge: 'Trofik 4 (Karnivora Puncak)',
          icon: '🦅🐅',
          color: 'rose',
        },
        {
          level: 'Pengurai Nutrisi',
          name: 'Dekomposer (Pengurai)',
          desc: 'Jamur dan bakteri yang menguraikan sisa-sisa organisme mati dan mengembalikan nutrisi ke dalam tanah.',
          badge: 'Daur Ulang Materi',
          icon: '🍄🦠',
          color: 'purple',
        },
      ],
    },
  ],
};

export const SECTION_E_DATA = {
  title: 'E. Jenis-jenis Ekosistem',
  naturalIntro:
    'Ekosistem alami terbentuk melalui proses alam tanpa harus dibangun manusia. Ekosistem alami dibagi menjadi 2 jenis yaitu sebagai berikut:',
  aquatic: {
    title: 'Akuatik (Perairan)',
    intro:
      'Ekosistem akuatik merupakan ekosistem yang lingkungan utamanya berupa perairan. Ekosistem ini memiliki karakteristik yang dipengaruhi oleh salinitas (kadar garam), suhu, kedalaman air, intensitas cahaya matahari, arus, serta kadar oksigen terlarut. Contoh ekosistem akuatik sebagai berikut:',
    items: [
      {
        name: 'Ekosistem Air Tawar',
        features: [
          'Memiliki kadar garam rendah, umumnya kurang dari 0,5‰.',
          'Suhu dan intensitas cahaya dipengaruhi kondisi lingkungan.',
          'Dapat berupa perairan mengalir maupun tergenang.',
          'Dihuni organisme seperti ikan air tawar, katak, tumbuhan air, dan plankton.',
        ],
        examples: 'Sungai, danau, rawa air tawar, dan mata air.',
        salinity: '< 0,5‰ (Sangat Rendah)',
        color: 'sky',
        icon: '💧',
      },
      {
        name: 'Ekosistem Air Payau',
        features: [
          'Wilayah percampuran air tawar dan air laut.',
          'Memiliki kadar garam yang berubah-ubah akibat pasang surut dan aliran sungai.',
          'Umumnya kaya nutrien dan memiliki produktivitas biologis tinggi.',
          'Menjadi habitat atau tempat pembesaran berbagai jenis ikan, udang, kepiting, dan organisme lainnya.',
        ],
        examples: 'Muara sungai dan hutan mangrove di kawasan estuari.',
        salinity: 'Dinamis (Pasang Surut)',
        color: 'teal',
        icon: '🦀',
      },
      {
        name: 'Ekosistem Air Laut',
        features: [
          'Kadar garam tinggi, rata-rata sekitar 35‰.',
          'Dipengaruhi oleh arus, gelombang, pasang surut, dan kedalaman.',
          'Intensitas cahaya dan tekanan air berbeda menurut kedalaman.',
          'Dihuni organisme seperti ikan laut, terumbu karang, fitoplankton, lamun, dan berbagai invertebrata.',
        ],
        examples: 'Laut terbuka, terumbu karang, padang lamun, dan perairan pesisir.',
        salinity: '± 35‰ (Tinggi)',
        color: 'blue',
        icon: '🌊',
      },
    ],
  },
  terrestrial: {
    title: 'Terestrial (Daratan)',
    intro:
      'Ekosistem terestrial merupakan ekosistem yang terdapat di daratan dengan karakteristik yang dipengaruhi oleh suhu, curah hujan, kelembapan, intensitas cahaya matahari, dan kondisi tanah.',
    items: [
      {
        name: 'Ekosistem Hutan Hujan Tropis',
        features: [
          'Memiliki curah hujan tinggi sepanjang tahun.',
          'Suhu relatif hangat dan kelembapan tinggi.',
          'Vegetasi lebat dengan pepohonan tinggi dan bertingkat.',
          'Memiliki keanekaragaman hayati yang tinggi.',
        ],
        examples: 'Hutan hujan tropis di Kalimantan, Sumatra, dan Papua.',
        climate: 'Hangat & Sangat Lembap',
        color: 'emerald',
        icon: '🌳',
      },
      {
        name: 'Ekosistem Hutan Gugur',
        features: [
          'Umumnya terdapat di wilayah beriklim sedang dengan empat musim.',
          'Curah hujan relatif merata sepanjang tahun.',
          'Sebagian besar pohon menggugurkan daun pada musim gugur.',
          'Dihuni organisme seperti rusa, rubah, tupai, dan berbagai jenis burung.',
        ],
        examples: 'Hutan gugur di Amerika Utara, Eropa, dan Asia Timur.',
        climate: 'Iklim Sedang (4 Musim)',
        color: 'amber',
        icon: '🍂',
      },
      {
        name: 'Ekosistem Taiga',
        features: [
          'Memiliki musim dingin panjang dan suhu rendah.',
          'Didominasi pohon berdaun jarum seperti pinus, cemara, dan spruce.',
          'Musim panas relatif singkat.',
          'Dihuni organisme seperti serigala, beruang, rusa besar, dan lynx.',
        ],
        examples: 'Hutan Taiga di Kanada dan Rusia.',
        climate: 'Musim Dingin Panjang & Dingin',
        color: 'cyan',
        icon: '🌲',
      },
      {
        name: 'Ekosistem Tundra',
        features: [
          'Memiliki suhu sangat rendah dan musim tumbuh yang pendek.',
          'Umumnya tidak ditumbuhi pohon besar.',
          'Vegetasi didominasi lumut, liken, rumput, dan semak rendah.',
          'Tundra Arktik umumnya memiliki lapisan tanah beku permanen (permafrost).',
        ],
        examples: 'Tundra di Alaska, Greenland, dan Siberia.',
        climate: 'Sangat Dingin (Tanah Beku)',
        color: 'slate',
        icon: '❄️',
      },
      {
        name: 'Ekosistem Padang Rumput',
        features: [
          'Didominasi vegetasi rerumputan.',
          'Memiliki curah hujan sedang hingga relatif rendah.',
          'Pepohonan sedikit karena kondisi iklim dan gangguan seperti kebakaran atau penggembalaan.',
          'Menjadi habitat berbagai hewan pemakan rumput dan predator.',
        ],
        examples: 'Sabana di Taman Nasional Baluran Jawa Timur dan Sabana di Afrika.',
        climate: 'Curah Hujan Sedang-Rendah',
        color: 'yellow',
        icon: '🌾',
      },
      {
        name: 'Ekosistem Gurun',
        features: [
          'Memiliki curah hujan sangat rendah, umumnya kurang dari 250 mm per tahun.',
          'Ketersediaan air menjadi faktor pembatas utama.',
          'Vegetasi jarang dan memiliki adaptasi untuk mengurangi kehilangan air.',
          'Dihuni organisme yang mampu beradaptasi terhadap kondisi kering.',
        ],
        examples: 'Gurun Sahara di Afrika.',
        climate: 'Sangat Kering (< 250 mm/th)',
        color: 'orange',
        icon: '🏜️',
      },
    ],
  },
  artificial: {
    title: 'Ekosistem Buatan',
    intro:
      'Ekosistem buatan merupakan ekosistem yang dibentuk atau dimodifikasi oleh manusia untuk memenuhi kebutuhan tertentu, seperti pertanian, perikanan, penyediaan air, dan penghijauan.',
    items: [
      {
        name: 'Ekosistem Sawah dan Kebun',
        features: [
          'Didominasi tanaman yang dibudidayakan untuk tujuan produksi.',
          'Umumnya memiliki jenis tanaman utama yang relatif seragam.',
          'Pertumbuhan tanaman dipengaruhi kondisi tanah, air, suhu, dan cahaya matahari.',
          'Memerlukan pengelolaan seperti pemangkasan, pemupukan, dan pengendalian organisme pengganggu.',
        ],
        examples: 'Sawah, perkebunan teh, perkebunan sawit, dan perkebunan kopi.',
        function: 'Produksi Pangan & Pertanian',
        color: 'lime',
        icon: '🚜',
      },
      {
        name: 'Ekosistem Tambak',
        features: [
          'Dibuat untuk membudidayakan organisme perairan, terutama ikan atau udang.',
          'Umumnya menggunakan air payau atau air laut.',
          'Memiliki salinitas dan kualitas air yang perlu dikendalikan.',
          'Memerlukan pengelolaan pakan, sirkulasi air, dan limbah budidaya.',
        ],
        examples: 'Tambak udang, ikan, lele.',
        function: 'Budidaya Perikanan',
        color: 'blue',
        icon: '🦐',
      },
      {
        name: 'Ekosistem Waduk',
        features: [
          'Pembendungan atau penampungan air oleh manusia.',
          'Memiliki organisme seperti ikan air tawar, fitoplankton, zooplankton, dan tumbuhan air.',
          'Kondisi ekosistem dipengaruhi kedalaman, ketersediaan oksigen, cahaya, dan kualitas air.',
          'Dapat dimanfaatkan untuk irigasi, pembangkit listrik, perikanan, dan penyediaan air.',
        ],
        examples: 'Waduk.',
        function: 'Irigasi, PLTA, & Air Baku',
        color: 'teal',
        icon: '🌊',
      },
    ],
  },
};
