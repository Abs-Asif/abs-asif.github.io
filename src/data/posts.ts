export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string; // YYYY-MM-DD
  coverImage: string;
  author: string;
}

export const posts: BlogPost[] = [
  {
    id: "1",
    title: "গবেষণার গুরুত্ব ও ইসলামের দৃষ্টিভঙ্গি (The Importance of Research in Islam)",
    summary: "ইসলামে জ্ঞান অর্জন ও গবেষণার গুরুত্ব অপরিসীম। এই ব্লগে আমরা কোরআন ও সুন্নাহর আলোকে গবেষণার প্রয়োজনীয়তা নিয়ে আলোচনা করব।",
    content: `
      <p>ইসলাম একটি গবেষণালব্ধ জীবনব্যবস্থা। পবিত্র কোরআনের প্রথম শব্দই ছিল <strong>'ইকরা' (اقرأ)</strong> যার অর্থ হলো 'পাঠ করো'।</p>

      <p>In the name of Allah, the Most Gracious, the Most Merciful. Research (গবেষণা) is not just a secular pursuit but a spiritual one when done with the right intention. আবদুল্লাহ বারী আসিফ (Abdullah Bari Asif) believes that every Muslim should be a seeker of truth.</p>

      <p>আল্লাহ তাআলা বলেন:
      <br />
      <span class="text-2xl block my-4 text-center">أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ</span>
      "তবে কি তারা কুরআন নিয়ে গবেষণা করে না?" (সূরা আন-নিসা: ৮২)
      </p>

      <p>Modern science and Islamic principles often intersect in fascinating ways. As a researcher, it is my goal to explore these connections and share them with the world. জ্ঞান যেখানেই থাকুক না কেন, তা মুমিনের হারানো সম্পদ।</p>
    `,
    date: "2026-04-25",
    coverImage: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000",
    author: "Abdullah Bari Asif"
  }
];
