export const censorText = (text: string, enabled: boolean = true) => {
  if (!text || !enabled) return text;
  let censored = text;
  const mappings: Record<string, string> = {
    'Fuck': 'F*uck',
    'Fucks': 'f*ucks',
    'Fucling': 'F*ucking',
    'Fucked': 'F*ucked',
    'Kill': 'k*ill',
    'Killing': 'ki*lling',
    'Killer': 'ki*ller',
    'Killed': 'ki*lled',
    'Suicide': 'Su*icide',
    'Gaza': 'Ga*za',
    'Murder': 'Mu*rder',
    'Murdered': 'Mu*rdered',
    'Murderer': 'Mu*rderer',
    'Israel': 'Isr*ael',
    'Israeli': 'Isr*aeli',
    'Rape': 'ra*pe',
    'Rapist': 'Ra*pist',
    'Raped': 'Ra*ped',
    // Bangla Sanitization
    'হত্যা': 'হ*ত্যা',
    'হত্যাকারী': 'হ*ত্যাকারী',
    'হত্যার': 'হ*ত্যার',
    'হত্যাযজ্ঞ': 'হ*ত্যাযজ্ঞ',
    'হত্যাকাণ্ড': 'হ*ত্যাকান্ড',
    'হত্যাকাণ্ডে': 'হ*ত্যাকাণ্ডে',
    'হত্যাকাণ্ডের': 'হ*ত্যাকাণ্ডের',
    'হত্যাকাণ্ডকে': 'হ*ত্যাকাণ্ডকে',
    'খুন': 'খু*ন',
    'খুনি': 'খু*নি',
    'খুনিরা': 'খু*নিরা',
    'খুনিদের': 'খু*নিদের',
    'খুনিদেরকে': 'খু*নিদেরকে',
    'খুনের': 'খু*নের',
    'ধর্ষণ': 'ধ*র্ষণ',
    'ধর্ষণের': 'ধ*র্ষণের',
    'ধর্ষক': 'ধ*র্ষক',
    'ধর্ষণকারী': 'ধ*র্ষণকারী',
    'ধর্ষিত': 'ধ*র্ষিত',
    'ধর্ষিতা': 'ধ*র্ষিতা',
    'ধর্ষণকৃত': 'ধ*র্ষণকৃত',
    'ইসরাইল': 'ইস*রাইল',
  };

  const sortedUnsafe = Object.keys(mappings).sort((a, b) => b.length - a.length);

  sortedUnsafe.forEach((unsafe) => {
    const regex = new RegExp(unsafe, 'gi');
    censored = censored.replace(regex, (match) => {
      const mapping = mappings[match] || mappings[match.toLowerCase()] || mappings[match.charAt(0).toUpperCase() + match.slice(1).toLowerCase()];
      return mapping || match;
    });
  });
  return censored;
};
