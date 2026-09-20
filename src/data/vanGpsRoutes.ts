export interface RouteWaypoint {
  name: string;
  nameSi?: string;
  lat: number;
  lng: number;
  studentId?: string;
  studentName?: string;
  isSchool?: boolean;
  isOrigin?: boolean;
}

export interface VanRouteConfig {
  vanNumber: string;
  vanName: string;
  driverName: string;
  driverPhone: string;
  plateNumber: string;
  schoolDestination: string;
  destinationLat: number;
  destinationLng: number;
  color: string;
  stops: RouteWaypoint[];
  // Detailed street road path for smooth PickMe-like animation
  path: [number, number][];
}

export const VAN_GPS_ROUTES: Record<string, VanRouteConfig> = {
  'Van 01 (WP ND-4215)': {
    vanNumber: 'Van 01 (WP ND-4215)',
    vanName: 'Van 01',
    driverName: 'Mr.Sunil (සුනිල් මහතා )',
    driverPhone: '077 452 1890',
    plateNumber: 'WP ND-4215',
    schoolDestination: 'Mahamevnawa buddhist college Zone',
    destinationLat: 6.9916,
    destinationLng: 80.0411,
    color: '#0b1cf5', // Blue
    stops: [
      { name: 'Pugoda', nameSi: 'පුගොඩ', lat: 6.9763, lng: 80.1208, isOrigin: true },
      { name: 'Dompe-medalanda', nameSi: 'දොම්පේ-මැදලන්ද', lat: 6.9498, lng:  80.0597, studentId: 'sl-1', studentName: 'Anuththra' },
      { name: 'Dekatana', nameSi: 'දෙකටන', lat: 6.9699, lng: 80.0429, studentId: 'sl-2', studentName: 'Dinithi Silva' },
      { name: 'Mahamevnawa buddhist college Keragala', nameSi: 'මහමෙව්නාව බෞද්ධ විද්‍යාලය', lat: 6.9916, lng: 80.0411, isSchool: true }
    ],
    path: [
      [6.9687, 80.1143],
      [6.9648, 80.1089],
      [6.9608, 80.1071],
      [6.9558, 80.1030],
      [6.9510, 80.0961],
      [6.9477, 80.0938],
      [6.9476, 80.0910],
      [6.9464, 80.0843],
      [6.9449, 80.0744],
      [6.9460, 80.0709],
      [6.9477, 80.0643],
      [6.9491, 80.0577],
      [6.9496, 80.0551],
      [6.9555, 80.0516],
      [6.9702, 80.0426],
      [6.9711, 80.0417],
      [6.9733, 80.0390],
      [6.9746, 80.0363],
      [6.9755, 80.0352],
      [6.9757, 80.0348],
      [6.9780, 80.0366],
      [6.9782, 80.0414],
      [6.9856, 80.0439],
      [6.9918, 80.0444],
      [6.9909, 80.0411],
      [6.9914, 80.0405]

    ]
  },
  'Van 02 (WP PA-8830)': {
    vanNumber: 'Van 02 (WP PA-8830)',
    vanName: 'Van 02',
    driverName: 'Bandara Uncle (බණ්ඩාර අංකල්)',
    driverPhone: '071 883 4512',
    plateNumber: 'WP PA-8830',
    schoolDestination: 'Borella / Maradana School Complex (Ananda / Nalanda / Devi Balika)',
    destinationLat: 6.9147,
    destinationLng: 79.8775,
    color: '#06b6d4', // Cyan
    stops: [
      { name: 'Kaduwela Clock Tower', nameSi: 'කඩුවෙල ඔරලෝසු කණුව', lat: 6.9328, lng: 79.9820, isOrigin: true },
      { name: 'Malabe Clock Tower', nameSi: 'මාලඹේ ඔරලෝසු කණුව', lat: 6.9042, lng: 79.9548, studentId: 'sl-4', studentName: 'Senuk Rajapakse' },
      { name: 'Thalahena Junction', nameSi: 'තලහේන හන්දිය', lat: 6.9060, lng: 79.9390 },
      { name: 'Battaramulla Junction', nameSi: 'බත්තරමුල්ල හන්දිය', lat: 6.9012, lng: 79.9212, studentId: 'sl-5', studentName: 'Akeel Mohamed' },
      { name: 'Rajagiriya Flyover', nameSi: 'රාජගිරිය ගුවන් පාලම', lat: 6.9095, lng: 79.8968 },
      { name: 'Borella Junction / School Gate', nameSi: 'බොරැල්ල පාසල', lat: 6.9147, lng: 79.8775, isSchool: true }
    ],
    path: [
      [6.9328, 79.9820], // Kaduwela
      [6.9240, 79.9740], // Koratota
      [6.9150, 79.9650], // Pittugala
      [6.9080, 79.9580], // SLIIT / Malabe approach
      [6.9042, 79.9548], // Malabe Clock Tower (Stop 1)
      [6.9050, 79.9470], // New Kandy Rd
      [6.9060, 79.9390], // Thalahena (Stop 2)
      [6.9040, 79.9300], // Koswatte
      [6.9012, 79.9212], // Battaramulla (Stop 3)
      [6.9035, 79.9130], // Pelawatte turn
      [6.9070, 79.9050], // Welikada
      [6.9095, 79.8968], // Rajagiriya (Stop 4)
      [6.9120, 79.8870], // Ayurveda Junction
      [6.9147, 79.8775]  // Borella School Complex (Destination)
    ]
  },
  'Van 03 (WP NB-1142)': {
    vanNumber: 'Van 03 (WP NB-1142)',
    vanName: 'Van 03',
    driverName: 'Gamini Uncle (ගාමිණී අංකල්)',
    driverPhone: '076 991 2304',
    plateNumber: 'WP NB-1142',
    schoolDestination: 'Wellawatte / Kollupitiya Schools (Hindu College / St. Lawrence / Musaeus)',
    destinationLat: 6.8735,
    destinationLng: 79.8610,
    color: '#8b5cf6', // Purple
    stops: [
      { name: 'Panadura Bus Stand', nameSi: 'පානදුර බස් නැවතුම', lat: 6.7130, lng: 79.9074, isOrigin: true },
      { name: 'Moratuwa Cross Junction', nameSi: 'මොරටුව හන්දිය', lat: 6.7745, lng: 79.8828 },
      { name: 'Ratmalana Airport Road', nameSi: 'රත්මලාන ගුවන් තොටුපළ පාර', lat: 6.8185, lng: 79.8732, studentId: 'sl-6', studentName: 'Oshadi Jayasuriya' },
      { name: 'Mount Lavinia Supermarket', nameSi: 'ගල්කිස්ස', lat: 6.8378, lng: 79.8650 },
      { name: 'Dehiwala Flyover', nameSi: 'දෙහිවල ගුවන් පාලම', lat: 6.8510, lng: 79.8655 },
      { name: 'Wellawatte Station / School Gate', nameSi: 'වැල්ලවත්ත පාසල', lat: 6.8735, lng: 79.8610, isSchool: true }
    ],
    path: [
      [6.7130, 79.9074], // Panadura
      [6.7350, 79.8990], // Egoda Uyana
      [6.7550, 79.8910], // Koralawella
      [6.7745, 79.8828], // Moratuwa (Stop 1)
      [6.7950, 79.8780], // Rawatawatta
      [6.8080, 79.8750], // Katubedda
      [6.8185, 79.8732], // Ratmalana Airport Road (Stop 2)
      [6.8290, 79.8690], // Maliban Junction
      [6.8378, 79.8650], // Mount Lavinia (Stop 3)
      [6.8510, 79.8655], // Dehiwala Flyover (Stop 4)
      [6.8620, 79.8630], // William Grinding Mills / Marine Dr
      [6.8735, 79.8610]  // Wellawatte (Destination)
    ]
  }
};

// Helper to calculate approximate distance in kilometers between two lat/lng points
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing/heading angle in degrees
export function calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const y = Math.sin(dLon) * Math.cos(lat2 * (Math.PI / 180));
  const x =
    Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
    Math.sin(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.cos(dLon);
  let brng = Math.atan2(y, x) * (180 / Math.PI);
  return (brng + 360) % 360;
}
