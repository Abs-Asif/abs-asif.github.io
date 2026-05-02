const Info = () => {
  const infoData = [
    { label: "Name", labelBn: "নাম", value: "Md. Abdullah Bari", valueBn: "মোঃ আব্দুল্লাহ বারী" },
    { label: "Father's name", labelBn: "পিতার নাম", value: "Mahfuzur Rahman", valueBn: "মাহফুজুর রহমান" },
    { label: "Mother's name", labelBn: "মাতার নাম", value: "Afruza Begum", valueBn: "আফরোজা বেগম" },
    { label: "Date of birth", labelBn: "জন্ম তারিখ", value: "28 August 2005", valueBn: "২৮ আগস্ট ২০০৫" },
    { label: "Birth Registration number", labelBn: "জন্ম নিবন্ধন নম্বর", value: "20054917784135923", valueBn: "২০০৫৪৯১৭৭৮৪১৩৫৯২৩", selectable: true },
    { label: "NID number", labelBn: "এনআইডি নম্বর", value: "1049939315", valueBn: "১০৪৯৯৩৯৩১৫", selectable: true },
  ];

  const address = {
    en: [
      "Village: Panthapara,",
      "Post: Forkerhat - 5601",
      "Ward: 8, Omar Majid,",
      "Upazila: Rajarhat,",
      "District: Kurigram,",
      "Division: Rangpur.",
    ],
    bn: [
      "গ্রাম: পান্থাপাড়া,",
      "ডাকঘর: ফরকেরহাট - ৫৬০১,",
      "ওয়ার্ড: ৮, ওমর মজিদ,",
      "উপজেলা: রাজারহাট,",
      "জেলা: কুড়িগ্রাম,",
      "বিভাগ: রংপুর।",
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center items-start font-sans">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200">
        <div className="bg-slate-800 text-white py-6 px-8">
          <h1 className="text-2xl font-bold tracking-tight">Identity Information / পরিচয় তথ্য</h1>
        </div>

        <div className="p-0">
          <table className="w-full border-collapse">
            <tbody>
              {infoData.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 bg-slate-50/50 w-1/3 align-top">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{item.label}</div>
                    <div className="text-sm font-bangla text-slate-400 mt-1">{item.labelBn}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`text-base font-semibold text-slate-800 ${item.selectable ? 'select-text' : ''}`}>{item.value}</div>
                    <div className={`text-base font-bangla text-slate-600 mt-1 ${item.selectable ? 'select-text' : ''}`}>{item.valueBn}</div>
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-4 px-6 bg-slate-50/50 w-1/3 align-top">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permanent Address</div>
                  <div className="text-sm font-bangla text-slate-400 mt-1">স্থায়ী ঠিকানা</div>
                </td>
                <td className="py-4 px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      {address.en.map((line, i) => (
                        <p key={i} className="text-sm text-slate-700">{line}</p>
                      ))}
                    </div>
                    <div className="space-y-1 font-bangla border-l md:pl-6 border-slate-100">
                      {address.bn.map((line, i) => (
                        <p key={i} className="text-sm text-slate-600">{line}</p>
                      ))}
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 py-4 px-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-[0.2em]">Official Identification Record</p>
        </div>
      </div>
    </div>
  );
};

export default Info;
