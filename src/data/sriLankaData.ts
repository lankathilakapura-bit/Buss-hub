export interface SriLankaStudent {
  id: string;
  name: string;
  nameSi?: string;
  grade: string;
  vanNumber: string;
  vanRoute: string;
  pickupLocation: string;
  parentName: string;
  parentPhone: string; // e.g. "0771234567"
  morningStatus: 'InVan' | 'Absent' | 'WithParent' | 'Pending';
  morningTime?: string;
  schoolStatus: 'Present' | 'Absent' | 'Pending';
  eveningStatus: 'InVan' | 'ParentPickup' | 'DroppedHome' | 'Absent' | 'Pending';
  eveningTime?: string;
  monthlyRate?: number; // Each child's specific estimated monthly fee in LKR (e.g. 6500, 7500, 8500)
}

export interface SriLankaVan {
  vanNumber: string;
  driverName: string;
  driverPhone: string;
  routeTitle: string;
  routeTowns: string;
}

export const SRI_LANKA_VANS: SriLankaVan[] = [
  {
    vanNumber: 'Van 01 (WP ND-4215)',
    driverName: 'Sunil Uncle (සුනිල් අංකල්)',
    driverPhone: '077 452 1890',
    routeTitle: 'Maharagama ⇄ Nugegoda ⇄ Bambalapitiya',
    routeTowns: 'Maharagama, Delkanda, Nugegoda, Kirulapone, Havelock, Bambalapitiya'
  },
  {
    vanNumber: 'Van 02 (WP PA-8830)',
    driverName: 'Bandara Uncle (බණ්ඩාර අංකල්)',
    driverPhone: '071 883 4512',
    routeTitle: 'Kaduwela ⇄ Malabe ⇄ Battaramulla ⇄ Borella',
    routeTowns: 'Kaduwela, Malabe, Thalahena, Battaramulla, Rajagiriya, Borella'
  },
  {
    vanNumber: 'Van 03 (WP NB-1142)',
    driverName: 'Gamini Uncle (ගාමිණී අංකල්)',
    driverPhone: '076 991 2304',
    routeTitle: 'Moratuwa ⇄ Panadura ⇄ Mount Lavinia ⇄ Wellawatte',
    routeTowns: 'Panadura, Moratuwa, Ratmalana, Mount Lavinia, Dehiwala, Wellawatte'
  }
];

export const INITIAL_SRI_LANKA_STUDENTS: SriLankaStudent[] = [
  {
    id: 'sl-1',
    name: 'Kaveesha Perera',
    nameSi: 'කවීෂා පෙරේරා',
    grade: 'Grade 5 - A',
    vanNumber: 'Van 01 (WP ND-4215)',
    vanRoute: 'Maharagama ⇄ Bambalapitiya',
    pickupLocation: 'Delkanda Junction (දෙල්කන්ද හන්දිය)',
    parentName: 'Nirosha Perera (Mother)',
    parentPhone: '0771234567',
    morningStatus: 'Pending',
    morningTime: undefined,
    schoolStatus: 'Pending',
    eveningStatus: 'Pending',
    monthlyRate: 7500
  },
  {
    id: 'sl-2',
    name: 'Dinuka Fernando',
    nameSi: 'දිනුක ප්‍රනාන්දු',
    grade: 'Grade 7 - C',
    vanNumber: 'Van 01 (WP ND-4215)',
    vanRoute: 'Maharagama ⇄ Bambalapitiya',
    pickupLocation: 'Nugegoda Supermarket (නුගේගොඩ)',
    parentName: 'Sanath Fernando (Father)',
    parentPhone: '0714567890',
    morningStatus: 'Pending',
    morningTime: undefined,
    schoolStatus: 'Pending',
    eveningStatus: 'Pending',
    monthlyRate: 7000
  },
  {
    id: 'sl-3',
    name: 'Shenaya Silva',
    nameSi: 'ශෙනායා සිල්වා',
    grade: 'Grade 3 - B',
    vanNumber: 'Van 01 (WP ND-4215)',
    vanRoute: 'Maharagama ⇄ Bambalapitiya',
    pickupLocation: 'Kirulapone Post Office (කිරුලපන)',
    parentName: 'Malkanthi Silva (Mother)',
    parentPhone: '0767891234',
    morningStatus: 'Pending',
    morningTime: undefined,
    schoolStatus: 'Pending',
    eveningStatus: 'Pending',
    monthlyRate: 8000
  },
  {
    id: 'sl-4',
    name: 'Thisal Rajapakse',
    nameSi: 'තිසල් රාජපක්ෂ',
    grade: 'Grade 6 - D',
    vanNumber: 'Van 02 (WP PA-8830)',
    vanRoute: 'Kaduwela ⇄ Borella',
    pickupLocation: 'Malabe Clock Tower (මාලඹේ ඔරලෝසු කණුව)',
    parentName: 'Pradeep Rajapakse (Father)',
    parentPhone: '0773344556',
    morningStatus: 'Pending',
    morningTime: undefined,
    schoolStatus: 'Pending',
    eveningStatus: 'Pending',
    monthlyRate: 6500
  },
  {
    id: 'sl-5',
    name: 'Fathima Rihana',
    nameSi: 'ෆාතිමා රිහානා',
    grade: 'Grade 4 - A',
    vanNumber: 'Van 02 (WP PA-8830)',
    vanRoute: 'Kaduwela ⇄ Borella',
    pickupLocation: 'Battaramulla Junction (බත්තරමුල්ල)',
    parentName: 'Mohammed Riaz (Father)',
    parentPhone: '0752233445',
    morningStatus: 'Pending',
    morningTime: undefined,
    schoolStatus: 'Pending',
    eveningStatus: 'Pending',
    monthlyRate: 7200
  },
  {
    id: 'sl-6',
    name: 'Nimesh Jayasuriya',
    nameSi: 'නිමේෂ් ජයසූරිය',
    grade: 'Grade 8 - B',
    vanNumber: 'Van 03 (WP NB-1142)',
    vanRoute: 'Moratuwa ⇄ Wellawatte',
    pickupLocation: 'Ratmalana Airport Road (රත්මලාන)',
    parentName: 'Chandani Jayasuriya (Mother)',
    parentPhone: '0701122334',
    morningStatus: 'Pending',
    morningTime: undefined,
    schoolStatus: 'Pending',
    eveningStatus: 'Pending',
    monthlyRate: 8500
  }
];

export function generateWhatsAppLink(
  phone: string,
  studentName: string,
  statusType: 'boarded' | 'absent' | 'dropped' | 'alert',
  timeStr: string,
  lang: 'si' | 'en' | 'ta' = 'si'
): string {
  // Clean phone number for Sri Lanka (+94)
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('94')) {
    cleanPhone = '94' + cleanPhone;
  }

  let text = '';

  if (lang === 'si') {
    if (statusType === 'boarded') {
      text = `ආයුබෝවන්, ${studentName} අද උදෑසන ${timeStr} ට පාසල් වෑන් රථයට ආරක්ෂිතව නැග්ගා. ස්තූතියි - පාසල් වෑන් සේවය 🚌`;
    } else if (statusType === 'absent') {
      text = `ආයුබෝවන්, අද උදෑසන ${studentName} පාසල් වෑන් රථයට නොපැමිණි බව සටහන් විය. කරුණාකර තහවුරු කරන්න. ස්තූතියි.`;
    } else if (statusType === 'dropped') {
      text = `ආයුබෝවන්, ${studentName} අද සවස ${timeStr} ට නිවසට ආරක්ෂිතව බැස්සුවා. ස්තූතියි - පාසල් වෑන් සේවය 🏠`;
    } else {
      text = `⚠️ හදිසි පණිවිඩයක්: ${studentName} උදෑසන වෑන් රථයට නැගිය නමුත් පාසලේදී නොසිටින බවට වාර්තා වී ඇත. කරුණාකර වහාම අමතන්න!`;
    }
  } else if (lang === 'ta') {
    if (statusType === 'boarded') {
      text = `வணக்கம், ${studentName} இன்று காலை ${timeStr} மணிக்கு பள்ளி வாகனத்தில் பாதுகாப்பாக ஏறினார். நன்றி 🚌`;
    } else if (statusType === 'absent') {
      text = `வணக்கம், இன்று காலை ${studentName} பள்ளி வாகனத்திற்கு வரவில்லை என பதிவாகியுள்ளது. தயவுசெய்து உறுதிப்படுத்தவும்.`;
    } else if (statusType === 'dropped') {
      text = `வணக்கம், ${studentName} இன்று மாலை ${timeStr} மணிக்கு பாதுகாப்பாக வீட்டில் விடப்பட்டார். நன்றி 🏠`;
    } else {
      text = `⚠️ அவசர அறிவிப்பு: ${studentName} காலையில் வாகனத்தில் ஏறினார் ஆனால் பள்ளியில் இல்லை என தெரிவிக்கப்பட்டுள்ளது. தயவுசெய்து உடனே தொடர்பு கொள்ளவும்!`;
    }
  } else {
    // English
    if (statusType === 'boarded') {
      text = `Good morning, ${studentName} safely boarded the school van at ${timeStr}. Thank you - School Van Service 🚌`;
    } else if (statusType === 'absent') {
      text = `Good morning, ${studentName} was marked absent for the morning school van. Please confirm if this is correct. Thank you.`;
    } else if (statusType === 'dropped') {
      text = `Hello, ${studentName} has been safely dropped off home at ${timeStr}. Thank you - School Van Service 🏠`;
    } else {
      text = `⚠️ URGENT SAFETY ALERT: ${studentName} boarded the morning van but is marked absent at school. Please contact us immediately!`;
    }
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateParentToDriverWhatsAppLink(
  driverPhone: string,
  driverName: string,
  studentName: string,
  messageType: 'absent_today' | 'parent_pickup_pm' | 'where_is_bus',
  lang: 'si' | 'en' | 'ta' = 'si'
): string {
  let cleanPhone = driverPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('94')) {
    cleanPhone = '94' + cleanPhone;
  }

  let text = '';
  if (lang === 'si') {
    if (messageType === 'absent_today') {
      text = `ආයුබෝවන් ${driverName}, මගේ දරුවා ${studentName} අද පාසල් වෑන් රථයට එන්නේ නැත (නිවාඩු). කරුණාකර සටහන් කරගන්න. ස්තූතියි!`;
    } else if (messageType === 'parent_pickup_pm') {
      text = `ආයුබෝවන් ${driverName}, අද සවස ${studentName} වෑන් එකෙන් එන්නේ නැත. අපි පාසලට පැමිණ රැගෙන යන්නෙමු. ස්තූතියි!`;
    } else {
      text = `ආයුබෝවන් ${driverName}, ${studentName} ගේ නැවතුමට වෑන් එක පැමිණීමට තව විනාඩි කීයක් පමණ ගතවේද? ස්තූතියි!`;
    }
  } else if (lang === 'ta') {
    if (messageType === 'absent_today') {
      text = `வணக்கம் ${driverName}, எனது குழந்தை ${studentName} இன்று பள்ளி வாகனத்திற்கு வரமாட்டாள்/வரமாட்டான். நன்றி!`;
    } else if (messageType === 'parent_pickup_pm') {
      text = `வணக்கம் ${driverName}, இன்று மாலை ${studentName} வாகனத்தில் வரமாட்டாள்/வரமாட்டான். நாங்கள் பள்ளிக்கு வந்து அழைத்துக்கொள்வோம். நன்றி!`;
    } else {
      text = `வணக்கம் ${driverName}, வாகனத்தின் வருகை நேரம் என்ன? நன்றி!`;
    }
  } else {
    if (messageType === 'absent_today') {
      text = `Good morning ${driverName}, my child ${studentName} will be absent today and will NOT be taking the school van. Thank you!`;
    } else if (messageType === 'parent_pickup_pm') {
      text = `Good day ${driverName}, ${studentName} will NOT take the afternoon van today. We will pick up directly from school. Thank you!`;
    } else {
      text = `Hello ${driverName}, could you please let us know the estimated arrival time for ${studentName}'s stop? Thank you!`;
    }
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateFeeReminderWhatsAppLink(
  parentPhone: string,
  parentName: string,
  studentName: string,
  monthName: string,
  amount: number,
  vanNumber: string,
  driverName: string,
  lang: 'si' | 'en' | 'ta' = 'si'
): string {
  let cleanPhone = parentPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('94')) {
    cleanPhone = '94' + cleanPhone;
  }

  let text = '';
  if (lang === 'si') {
    text = `ආයුබෝවන් ${parentName.split('(')[0].trim()}, ${monthName} මාසය සඳහා ${studentName} ගේ පාසල් වෑන් ගාස්තුව රු. ${amount.toLocaleString()} ගෙවීමට නියමිතව ඇත. කරුණාකර මුදලින් හෝ බැංකු තැන්පතුවකින් පියවීමට කාරුණික වන්න. ස්තූතියි! - ${driverName} (${vanNumber})`;
  } else if (lang === 'ta') {
    text = `வணக்கம் ${parentName.split('(')[0].trim()}, ${monthName} மாதத்திற்கான ${studentName} பள்ளி வாகனக் கட்டணம் ரூ. ${amount.toLocaleString()} செலுத்தப்பட வேண்டும். நன்றி! - ${driverName} (${vanNumber})`;
  } else {
    text = `Dear ${parentName.split('(')[0].trim()}, this is a gentle reminder that the monthly school van fee for ${studentName} for ${monthName} (Rs. ${amount.toLocaleString()}) is due. Please settle via cash or bank deposit. Thank you! - ${driverName} (${vanNumber})`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateFeeReceiptWhatsAppLink(
  parentPhone: string,
  parentName: string,
  studentName: string,
  monthName: string,
  amount: number,
  paidDate: string,
  vanNumber: string,
  driverName: string,
  lang: 'si' | 'en' | 'ta' = 'si'
): string {
  let cleanPhone = parentPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('94')) {
    cleanPhone = '94' + cleanPhone;
  }

  let text = '';
  if (lang === 'si') {
    text = `✅ ගෙවීම් රිසිට්පත: ${monthName} මාසය සඳහා ${studentName} ගේ පාසල් වෑන් ගාස්තුව රු. ${amount.toLocaleString()} ${paidDate} දින සාර්ථකව ලැබී ඇත. ගෙවීමට ස්තූතියි! - ${driverName} (${vanNumber})`;
  } else if (lang === 'ta') {
    text = `✅ ரசீது: ${monthName} மாதத்திற்கான ${studentName} பள்ளி வாகனக் கட்டணம் ரூ. ${amount.toLocaleString()} பெறப்பட்டது. நன்றி! - ${driverName} (${vanNumber})`;
  } else {
    text = `✅ Payment Receipt: The school van fee of Rs. ${amount.toLocaleString()} for ${studentName} for ${monthName} was received on ${paidDate}. Thank you! - ${driverName} (${vanNumber})`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
