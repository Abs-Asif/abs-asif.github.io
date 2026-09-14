import { useState } from "react";
import { User, ArrowLeft } from "lucide-react";

interface InfoItem {
  label: string;
  labelBn: string;
  value: string | null;
  valueBn: string | null;
  selectable?: boolean;
}

interface AddressData {
  en: string[];
  bn: string[];
}

interface DecryptedData {
  infoData: InfoItem[];
  address: AddressData;
}

const TILES = [
  { id: 1, name: "Md. Abdullah Bari" },
  { id: 2, name: "Miss Musbihatul Jannat" },
  { id: 3, name: "Md. Abdullah Bari" },
  { id: 4, name: "Md. Abdullah Bari" },
];

const DEFAULT_DATA: DecryptedData = {
  infoData: [
    {
      label: "Name",
      labelBn: "নাম",
      value: "Md. Abdullah Bari",
      valueBn: "মোঃ আব্দুল্লাহ বারি",
      selectable: true,
    },
    {
      label: "Designation",
      labelBn: "পদবী",
      value: "Software Engineer",
      valueBn: "সফটওয়্যার ইঞ্জিনিয়ার",
    },
  ],
  address: {
    en: ["Dhaka, Bangladesh"],
    bn: ["ঢাকা, বাংলাদেশ"],
  },
};

const TILE_2_DATA: DecryptedData = {
  infoData: [
    {
      label: "Name",
      labelBn: "নাম",
      value: "Miss Musbihatul Jannat",
      valueBn: "মোছা: মুসবিহাতুল জান্নাত",
      selectable: true,
    },
    {
      label: "Father's Name",
      labelBn: "পিতার নাম",
      value: "Shah Sufi Md Shahidulla Kutial",
      valueBn: "শাহ সুফি মোঃ শহিদুল্লাহ কুটিয়াল",
    },
    {
      label: "Mother's Name",
      labelBn: "মাতার নাম",
      value: "Arjina Begum",
      valueBn: "আরজিনা বেগম",
    },
    {
      label: "Date of Birth",
      labelBn: "জন্ম তারিখ",
      value: "05 July 2008",
      valueBn: "০৫ জুলাই ২০০৮",
    },
  ],
  address: {
    en: [
      "Village: Koikuri, Balakandi.",
      "Post office: Forkerhat,",
      "Ward: 6, Omar Majid,",
      "Upazila: Rajarhat,",
      "District: Kurigram,",
      "Division: Rangpur.",
    ],
    bn: [
      "গ্রাম: কৈকুড়ী, বালাকান্দি,",
      "ডাকঘর: ফরকেরহাট,",
      "ওয়ার্ড: ৬, ওমর মজিদ,",
      "উপজেলা: রাজারহাট,",
      "জেলা: কুড়িগ্রাম,",
      "বিভাগ: রংপুর।",
    ],
  },
};

const Info = () => {
  const [selectedTile, setSelectedTile] = useState<number | null>(null);

  const activeData = selectedTile === 2 ? TILE_2_DATA : DEFAULT_DATA;
  const { infoData, address } = activeData;

  // Show 4 square buttons/tiles if no tile is selected
  if (selectedTile === null) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-between items-center px-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Profiles
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {TILES.map((tile) => (
              <button
                key={tile.id}
                onClick={() => setSelectedTile(tile.id)}
                className="aspect-square flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 transition duration-200 group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-200">
                  <User className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {tile.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Detail view when a tile is selected
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 flex justify-center items-start font-sans">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-slate-800 dark:bg-slate-950 text-white py-6 px-8 flex justify-between items-center border-b border-slate-700 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedTile(null)}
              className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 transition flex items-center justify-center"
              title="Back to Profiles"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white dark:text-slate-100">
              Identity Information / পরিচয় তথ্য
            </h1>
          </div>
        </div>

        <div className="p-0">
          <table className="w-full border-collapse">
            <tbody>
              {infoData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-6 bg-slate-50/50 dark:bg-slate-800/30 w-1/3 align-top border-r border-slate-100 dark:border-slate-800/40">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-sm font-bangla text-slate-400 dark:text-slate-500 mt-1">
                      {item.labelBn}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div
                      className={`text-base font-semibold text-slate-800 dark:text-slate-100 ${
                        item.selectable ? "select-text" : ""
                      }`}
                    >
                      {item.value ?? "—"}
                    </div>
                    {item.valueBn && (
                      <div
                        className={`text-base font-bangla text-slate-600 dark:text-slate-300 mt-1 ${
                          item.selectable ? "select-text" : ""
                        }`}
                      >
                        {item.valueBn}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="py-4 px-6 bg-slate-50/50 dark:bg-slate-800/30 w-1/3 align-top border-r border-slate-100 dark:border-slate-800/40">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Permanent Address
                  </div>
                  <div className="text-sm font-bangla text-slate-400 dark:text-slate-500 mt-1">
                    স্থায়ী ঠিকানা
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      {address.en.map((line, i) => (
                        <p key={i} className="text-sm text-slate-700 dark:text-slate-200">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className="space-y-1 font-bangla border-l md:pl-6 border-slate-100 dark:border-slate-800">
                      {address.bn.map((line, i) => (
                        <p key={i} className="text-sm text-slate-600 dark:text-slate-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 py-4 px-8 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center uppercase tracking-[0.2em]">
            Official Identification Record
          </p>
        </div>
      </div>
    </div>
  );
};

export default Info;
