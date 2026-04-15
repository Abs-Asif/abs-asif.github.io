
export const toBanglaNumber = (num: number | string): string => {
  const banglaNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/[0-9]/.test(digit) ? banglaNumbers[parseInt(digit)] : digit))
    .join("");
};

export const toBanglaDate = (date: Date): string => {
  const months = [
    "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
    "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
  ];

  const day = toBanglaNumber(date.getDate());
  const month = months[date.getMonth()];
  const year = toBanglaNumber(date.getFullYear());

  return `${day} ${month} ${year}`;
};
