const Info = () => {
  return (
    <div className="min-h-screen bg-background p-8 font-bangla">
      <div className="max-w-2xl mx-auto space-y-6">
        <section>
          <p className="text-sm opacity-70 uppercase tracking-wider">Name / নাম</p>
          <p className="text-lg font-semibold">Md. Abdullah Bari</p>
          <p className="text-lg font-semibold">মোঃ আব্দুল্লাহ বারী</p>
        </section>

        <section>
          <p className="text-sm opacity-70 uppercase tracking-wider">Father's Name / পিতার নাম</p>
          <p className="text-lg font-semibold">Mahfuzur Rahman</p>
          <p className="text-lg font-semibold">মাহফুজুর রহমান</p>
        </section>

        <section>
          <p className="text-sm opacity-70 uppercase tracking-wider">Mother's Name / মাতার নাম</p>
          <p className="text-lg font-semibold">Afruza Begum</p>
          <p className="text-lg font-semibold">আফরোজা বেগম</p>
        </section>

        <section>
          <p className="text-sm opacity-70 uppercase tracking-wider">Date of Birth</p>
          <p className="text-lg font-semibold">28 August 2005</p>
        </section>

        <section>
          <p className="text-sm opacity-70 uppercase tracking-wider">Birth Registration Number</p>
          <p className="text-lg font-semibold select-text">20054917784135923</p>
        </section>

        <section>
          <p className="text-sm opacity-70 uppercase tracking-wider">NID Number</p>
          <p className="text-lg font-semibold select-text">1049939315</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm opacity-70 uppercase tracking-wider mb-2">Permanent Address</p>
            <div className="space-y-1 text-base">
              <p>Village: Panthapara,</p>
              <p>Post: Forkerhat - 5601</p>
              <p>Ward: 8, Omar Majid,</p>
              <p>Upazila: Rajarhat,</p>
              <p>District: Kurigram,</p>
              <p>Division: Rangpur.</p>
            </div>
          </div>
          <div>
            <p className="text-sm opacity-70 uppercase tracking-wider mb-2">স্থায়ী ঠিকানা</p>
            <div className="space-y-1 text-base">
              <p>গ্রাম: পান্থাপাড়া,</p>
              <p>ডাকঘর: ফরকেরহাট - ৫৬০১,</p>
              <p>ওয়ার্ড: ৮, ওমর মজিদ,</p>
              <p>উপজেলা: রাজারহাট,</p>
              <p>জেলা: কুড়িগ্রাম,</p>
              <p>বিভাগ: রংপুর।</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Info;
