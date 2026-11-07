export interface LocalLevel {
  name: string;
  type: 'Metropolitan City' | 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';
  wards: number;
}

export interface District {
  name: string;
  localLevels: LocalLevel[];
}

export interface Province {
  id: number;
  name: string;
  nameNepali: string;
  capital: string;
  districts: District[];
}

export const NEPAL_LOCATION_DATA: Province[] = [
  {
    id: 1,
    name: 'Koshi Province',
    nameNepali: 'कोशी प्रदेश',
    capital: 'Biratnagar',
    districts: [
      {
        name: 'Morang',
        localLevels: [
          { name: 'Biratnagar Metropolitan City', type: 'Metropolitan City', wards: 19 },
          { name: 'SundarHaraicha Municipality', type: 'Municipality', wards: 12 },
          { name: 'Belbari Municipality', type: 'Municipality', wards: 11 },
          { name: 'Pathari Sanischare Municipality', type: 'Municipality', wards: 10 },
          { name: 'Ratuwamai Municipality', type: 'Municipality', wards: 10 },
          { name: 'Uralabari Municipality', type: 'Municipality', wards: 9 },
          { name: 'Kanepokhari Rural Municipality', type: 'Rural Municipality', wards: 7 },
          { name: 'Gramthan Rural Municipality', type: 'Rural Municipality', wards: 7 },
        ],
      },
      {
        name: 'Jhapa',
        localLevels: [
          { name: 'Bhadrapur Municipality', type: 'Municipality', wards: 10 },
          { name: 'Birtamod Municipality', type: 'Municipality', wards: 10 },
          { name: 'Damak Municipality', type: 'Municipality', wards: 10 },
          { name: 'Mechinagar Municipality', type: 'Municipality', wards: 15 },
          { name: 'Arjundhara Municipality', type: 'Municipality', wards: 11 },
          { name: 'Shivasatakshi Municipality', type: 'Municipality', wards: 11 },
          { name: 'Kankai Municipality', type: 'Municipality', wards: 9 },
          { name: 'Gauradaha Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Sunsari',
        localLevels: [
          { name: 'Dharan Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 20 },
          { name: 'Itahari Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 20 },
          { name: 'Inaruwa Municipality', type: 'Municipality', wards: 10 },
          { name: 'Duhabi Municipality', type: 'Municipality', wards: 12 },
          { name: 'Ramdhuni Municipality', type: 'Municipality', wards: 9 },
          { name: 'Barahachhetra Municipality', type: 'Municipality', wards: 11 },
        ],
      },
      {
        name: 'Ilam',
        localLevels: [
          { name: 'Ilam Municipality', type: 'Municipality', wards: 12 },
          { name: 'Deumai Municipality', type: 'Municipality', wards: 9 },
          { name: 'Mai Municipality', type: 'Municipality', wards: 10 },
          { name: 'Suryodaya Municipality', type: 'Municipality', wards: 14 },
        ],
      },
      {
        name: 'Udayapur',
        localLevels: [
          { name: 'Triyuga Municipality', type: 'Municipality', wards: 16 },
          { name: 'Katari Municipality', type: 'Municipality', wards: 14 },
          { name: 'Chaudandigadhi Municipality', type: 'Municipality', wards: 10 },
          { name: 'Belaka Municipality', type: 'Municipality', wards: 9 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Madhesh Province',
    nameNepali: 'मधेश प्रदेश',
    capital: 'Janakpur',
    districts: [
      {
        name: 'Dhanusha',
        localLevels: [
          { name: 'Janakpurdham Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 25 },
          { name: 'Mithila Municipality', type: 'Municipality', wards: 11 },
          { name: 'Shahidnagar Municipality', type: 'Municipality', wards: 9 },
          { name: 'Sabaila Municipality', type: 'Municipality', wards: 13 },
          { name: 'Dhanusadham Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Parsa',
        localLevels: [
          { name: 'Birgunj Metropolitan City', type: 'Metropolitan City', wards: 32 },
          { name: 'Pokhariya Municipality', type: 'Municipality', wards: 10 },
          { name: 'Bahudaramai Municipality', type: 'Municipality', wards: 9 },
          { name: 'Parsagadhi Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Mahottari',
        localLevels: [
          { name: 'Jaleshwor Municipality', type: 'Municipality', wards: 12 },
          { name: 'Bardibas Municipality', type: 'Municipality', wards: 14 },
          { name: 'Gaushala Municipality', type: 'Municipality', wards: 12 },
          { name: 'Bhangaha Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Sarlahi',
        localLevels: [
          { name: 'Malangwa Municipality', type: 'Municipality', wards: 12 },
          { name: 'Harion Municipality', type: 'Municipality', wards: 11 },
          { name: 'Lalbandi Municipality', type: 'Municipality', wards: 17 },
          { name: 'Barahathawa Municipality', type: 'Municipality', wards: 18 },
        ],
      },
      {
        name: 'Siraha',
        localLevels: [
          { name: 'Siraha Municipality', type: 'Municipality', wards: 22 },
          { name: 'Lahan Municipality', type: 'Municipality', wards: 24 },
          { name: 'Golbazar Municipality', type: 'Municipality', wards: 13 },
          { name: 'Mirchaiya Municipality', type: 'Municipality', wards: 12 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Bagmati Province',
    nameNepali: 'बागमती प्रदेश',
    capital: 'Hetauda',
    districts: [
      {
        name: 'Kathmandu',
        localLevels: [
          { name: 'Kathmandu Metropolitan City', type: 'Metropolitan City', wards: 32 },
          { name: 'Kirtipur Municipality', type: 'Municipality', wards: 10 },
          { name: 'Budhanilkantha Municipality', type: 'Municipality', wards: 13 },
          { name: 'Chandragiri Municipality', type: 'Municipality', wards: 15 },
          { name: 'Tokha Municipality', type: 'Municipality', wards: 11 },
          { name: 'Tarakeshwar Municipality', type: 'Municipality', wards: 11 },
          { name: 'Nagarjun Municipality', type: 'Municipality', wards: 10 },
          { name: 'Gokarneshwar Municipality', type: 'Municipality', wards: 9 },
          { name: 'Kageshwari-Manohara Municipality', type: 'Municipality', wards: 9 },
          { name: 'Shankharapur Municipality', type: 'Municipality', wards: 9 },
          { name: 'Dakshinkali Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Lalitpur',
        localLevels: [
          { name: 'Lalitpur Metropolitan City', type: 'Metropolitan City', wards: 29 },
          { name: 'Mahalaxmi Municipality', type: 'Municipality', wards: 10 },
          { name: 'Godawari Municipality', type: 'Municipality', wards: 14 },
          { name: 'Konjyosom Rural Municipality', type: 'Rural Municipality', wards: 5 },
          { name: 'Bagmati Rural Municipality', type: 'Rural Municipality', wards: 7 },
          { name: 'Mahankal Rural Municipality', type: 'Rural Municipality', wards: 6 },
        ],
      },
      {
        name: 'Bhaktapur',
        localLevels: [
          { name: 'Bhaktapur Municipality', type: 'Municipality', wards: 10 },
          { name: 'Madhyapur Thimi Municipality', type: 'Municipality', wards: 9 },
          { name: 'Suryabinayak Municipality', type: 'Municipality', wards: 10 },
          { name: 'Changunarayan Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Chitwan',
        localLevels: [
          { name: 'Bharatpur Metropolitan City', type: 'Metropolitan City', wards: 29 },
          { name: 'Ratnanagar Municipality', type: 'Municipality', wards: 16 },
          { name: 'Khairahani Municipality', type: 'Municipality', wards: 13 },
          { name: 'Rapti Municipality', type: 'Municipality', wards: 13 },
          { name: 'Kalika Municipality', type: 'Municipality', wards: 11 },
          { name: 'Madi Municipality', type: 'Municipality', wards: 9 },
          { name: 'Ichhyakamana Rural Municipality', type: 'Rural Municipality', wards: 7 },
        ],
      },
      {
        name: 'Makwanpur',
        localLevels: [
          { name: 'Hetauda Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 19 },
          { name: 'Thaha Municipality', type: 'Municipality', wards: 12 },
          { name: 'Bhimphenedi Rural Municipality', type: 'Rural Municipality', wards: 9 },
          { name: 'Manahari Rural Municipality', type: 'Rural Municipality', wards: 9 },
        ],
      },
      {
        name: 'Kavrepalanchok',
        localLevels: [
          { name: 'Dhulikhel Municipality', type: 'Municipality', wards: 12 },
          { name: 'Banepa Municipality', type: 'Municipality', wards: 14 },
          { name: 'Panauti Municipality', type: 'Municipality', wards: 12 },
          { name: 'Panchkhal Municipality', type: 'Municipality', wards: 13 },
          { name: 'Namobuddha Municipality', type: 'Municipality', wards: 11 },
          { name: 'Mandandeupur Municipality', type: 'Municipality', wards: 12 },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Gandaki Province',
    nameNepali: 'गण्डकी प्रदेश',
    capital: 'Pokhara',
    districts: [
      {
        name: 'Kaski',
        localLevels: [
          { name: 'Pokhara Metropolitan City', type: 'Metropolitan City', wards: 33 },
          { name: 'Annapurna Rural Municipality', type: 'Rural Municipality', wards: 11 },
          { name: 'Machhapuchhre Rural Municipality', type: 'Rural Municipality', wards: 9 },
          { name: 'Madi Rural Municipality', type: 'Rural Municipality', wards: 12 },
          { name: 'Rupa Rural Municipality', type: 'Rural Municipality', wards: 7 },
        ],
      },
      {
        name: 'Tanahun',
        localLevels: [
          { name: 'Byas Municipality', type: 'Municipality', wards: 14 },
          { name: 'Shuklagandaki Municipality', type: 'Municipality', wards: 12 },
          { name: 'Bhimad Municipality', type: 'Municipality', wards: 9 },
          { name: 'Bhanu Municipality', type: 'Municipality', wards: 13 },
        ],
      },
      {
        name: 'Syangja',
        localLevels: [
          { name: 'Putalibazar Municipality', type: 'Municipality', wards: 14 },
          { name: 'Waling Municipality', type: 'Municipality', wards: 14 },
          { name: 'Galyang Municipality', type: 'Municipality', wards: 11 },
          { name: 'Chapakot Municipality', type: 'Municipality', wards: 10 },
        ],
      },
      {
        name: 'Gorkha',
        localLevels: [
          { name: 'Gorkha Municipality', type: 'Municipality', wards: 14 },
          { name: 'Palungtar Municipality', type: 'Municipality', wards: 10 },
        ],
      },
      {
        name: 'Baglung',
        localLevels: [
          { name: 'Baglung Municipality', type: 'Municipality', wards: 14 },
          { name: 'Galkot Municipality', type: 'Municipality', wards: 11 },
          { name: 'Jaimini Municipality', type: 'Municipality', wards: 10 },
          { name: 'Dhorpatan Municipality', type: 'Municipality', wards: 9 },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Lumbini Province',
    nameNepali: 'लुम्बिनी प्रदेश',
    capital: 'Deukhuri (Dang)',
    districts: [
      {
        name: 'Banke',
        localLevels: [
          { name: 'Nepalgunj Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 23 },
          { name: 'Kohalpur Municipality', type: 'Municipality', wards: 15 },
          { name: 'Khajura Rural Municipality', type: 'Rural Municipality', wards: 8 },
          { name: 'Janki Rural Municipality', type: 'Rural Municipality', wards: 6 },
          { name: 'Baijanath Rural Municipality', type: 'Rural Municipality', wards: 8 },
          { name: 'Rapti Sonari Rural Municipality', type: 'Rural Municipality', wards: 9 },
          { name: 'Duduwa Rural Municipality', type: 'Rural Municipality', wards: 6 },
          { name: 'Narainapur Rural Municipality', type: 'Rural Municipality', wards: 6 },
        ],
      },
      {
        name: 'Rupandehi',
        localLevels: [
          { name: 'Butwal Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 19 },
          { name: 'Siddharthanagar Municipality', type: 'Municipality', wards: 13 },
          { name: 'Tilottama Municipality', type: 'Municipality', wards: 17 },
          { name: 'Sainamaina Municipality', type: 'Municipality', wards: 11 },
          { name: 'Devdaha Municipality', type: 'Municipality', wards: 12 },
          { name: 'Lumbini Sanskritik Municipality', type: 'Municipality', wards: 13 },
        ],
      },
      {
        name: 'Dang',
        localLevels: [
          { name: 'Ghorahi Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 19 },
          { name: 'Tulsipur Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 19 },
          { name: 'Lamahi Municipality', type: 'Municipality', wards: 9 },
          { name: 'Rapti Rural Municipality', type: 'Rural Municipality', wards: 9 },
        ],
      },
      {
        name: 'Bardiya',
        localLevels: [
          { name: 'Gulariya Municipality', type: 'Municipality', wards: 12 },
          { name: 'Rajapur Municipality', type: 'Municipality', wards: 10 },
          { name: 'Madhuwan Municipality', type: 'Municipality', wards: 9 },
          { name: 'Thakurbaba Municipality', type: 'Municipality', wards: 9 },
          { name: 'Bansgadhi Municipality', type: 'Municipality', wards: 9 },
          { name: 'Barbardiya Municipality', type: 'Municipality', wards: 11 },
        ],
      },
      {
        name: 'Kapilvastu',
        localLevels: [
          { name: 'Kapilvastu Municipality', type: 'Municipality', wards: 12 },
          { name: 'Banganga Municipality', type: 'Municipality', wards: 11 },
          { name: 'Buddhabhumi Municipality', type: 'Municipality', wards: 10 },
          { name: 'Shivaraj Municipality', type: 'Municipality', wards: 11 },
          { name: 'Krishnanagar Municipality', type: 'Municipality', wards: 12 },
          { name: 'Maharajgunj Municipality', type: 'Municipality', wards: 11 },
        ],
      },
      {
        name: 'Palpa',
        localLevels: [
          { name: 'Tansen Municipality', type: 'Municipality', wards: 14 },
          { name: 'Rampur Municipality', type: 'Municipality', wards: 10 },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Karnali Province',
    nameNepali: 'कर्णाली प्रदेश',
    capital: 'Birendranagar (Surkhet)',
    districts: [
      {
        name: 'Surkhet',
        localLevels: [
          { name: 'Birendranagar Municipality', type: 'Municipality', wards: 16 },
          { name: 'Bheriganga Municipality', type: 'Municipality', wards: 13 },
          { name: 'Gurbhakot Municipality', type: 'Municipality', wards: 14 },
          { name: 'Panchapuri Municipality', type: 'Municipality', wards: 11 },
          { name: 'Lekbeshi Municipality', type: 'Municipality', wards: 10 },
        ],
      },
      {
        name: 'Dailekh',
        localLevels: [
          { name: 'Narayan Municipality', type: 'Municipality', wards: 11 },
          { name: 'Dullu Municipality', type: 'Municipality', wards: 13 },
          { name: 'Chamunda Bindrasaini Municipality', type: 'Municipality', wards: 9 },
          { name: 'Aathbis Municipality', type: 'Municipality', wards: 9 },
        ],
      },
      {
        name: 'Jumla',
        localLevels: [
          { name: 'Chandannath Municipality', type: 'Municipality', wards: 10 },
          { name: 'Tatopani Rural Municipality', type: 'Rural Municipality', wards: 8 },
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Sudurpashchim Province',
    nameNepali: 'सुदूरपश्चिम प्रदेश',
    capital: 'Godawari (Kailali)',
    districts: [
      {
        name: 'Kailali',
        localLevels: [
          { name: 'Dhangadhi Sub-Metropolitan City', type: 'Sub-Metropolitan City', wards: 19 },
          { name: 'Tikapur Municipality', type: 'Municipality', wards: 9 },
          { name: 'Ghodaghodi Municipality', type: 'Municipality', wards: 12 },
          { name: 'Lamki Chuha Municipality', type: 'Municipality', wards: 10 },
          { name: 'Godawari Municipality', type: 'Municipality', wards: 12 },
          { name: 'Bhajani Municipality', type: 'Municipality', wards: 9 },
          { name: 'Gauriganga Municipality', type: 'Municipality', wards: 11 },
        ],
      },
      {
        name: 'Kanchanpur',
        localLevels: [
          { name: 'Bhimdatta Municipality', type: 'Municipality', wards: 19 },
          { name: 'Bedkot Municipality', type: 'Municipality', wards: 10 },
          { name: 'Shuklaphanta Municipality', type: 'Municipality', wards: 12 },
          { name: 'Mahakali Municipality', type: 'Municipality', wards: 10 },
          { name: 'Krishnapur Municipality', type: 'Municipality', wards: 9 },
          { name: 'Punarbas Municipality', type: 'Municipality', wards: 11 },
          { name: 'Belauri Municipality', type: 'Municipality', wards: 10 },
        ],
      },
      {
        name: 'Dadeldhura',
        localLevels: [
          { name: 'Amargadhi Municipality', type: 'Municipality', wards: 11 },
          { name: 'Parashuram Municipality', type: 'Municipality', wards: 12 },
        ],
      },
      {
        name: 'Doti',
        localLevels: [
          { name: 'Dipayal Silgadhi Municipality', type: 'Municipality', wards: 9 },
          { name: 'Shikhar Municipality', type: 'Municipality', wards: 11 },
        ],
      },
    ],
  },
];

export class NepalLocationHelper {
  static getProvinces(): string[] {
    return NEPAL_LOCATION_DATA.map((p) => p.name);
  }

  static getDistricts(provinceName: string): string[] {
    const province = NEPAL_LOCATION_DATA.find((p) => p.name.toLowerCase() === provinceName.toLowerCase());
    return province ? province.districts.map((d) => d.name) : [];
  }

  static getLocalLevels(districtName: string): string[] {
    for (const p of NEPAL_LOCATION_DATA) {
      const dist = p.districts.find((d) => d.name.toLowerCase() === districtName.toLowerCase());
      if (dist) return dist.localLevels.map((l) => l.name);
    }
    return [];
  }

  static getWardCount(localLevelName: string): number {
    for (const p of NEPAL_LOCATION_DATA) {
      for (const d of p.districts) {
        const ll = d.localLevels.find((l) => l.name.toLowerCase() === localLevelName.toLowerCase());
        if (ll) return ll.wards;
      }
    }
    return 15; // default fallback
  }

  static validateLocation(province: string, district: string, localLevel: string): boolean {
    const prov = NEPAL_LOCATION_DATA.find((p) => p.name.toLowerCase() === province.toLowerCase());
    if (!prov) return false;
    const dist = prov.districts.find((d) => d.name.toLowerCase() === district.toLowerCase());
    if (!dist) return false;
    const ll = dist.localLevels.find((l) => l.name.toLowerCase() === localLevel.toLowerCase());
    return !!ll;
  }
}
