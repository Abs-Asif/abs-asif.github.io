import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  ArrowLeft,
  Dices,
  HelpCircle,
  Compass,
  RotateCw
} from "lucide-react";

// ভঙ্গির ইন্টারফেস
interface Pose {
  id: string;
  name: string;
  category: "আরামদায়ক" | "গভীর ঘনিষ্ঠতা" | "আনন্দদায়ক" | "সংবেদনশীল" | "অ্যাক্রোবেটিক";
  spiciness: number; // ১ থেকে ৫
  description: string;
  howTo: string;
  benefits: string;
  tip: string;
  imageUrl: string;
}

// বাস্তব যৌনভঙ্গির উইкиহাউ (wikiHow) ওয়াটারমার্কযুক্ত ইমেজ ও বাংলা অনুবাদকৃত ডাটা
const PosesData: Pose[] = [
  {
    id: "missionary",
    name: "ক্লাসিক মিশনারি (Missionary)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 3,
    description: "সবচেয়ে জনপ্রিয় এবং ঐতিহ্যবাহী যৌনভঙ্গি, যা চমৎকার মানসিক সান্নিধ্য ও চোখের যোগাযোগ বজায় রাখতে দেয়।",
    howTo: "গ্রহণকারী সঙ্গী পিঠ ঠেকিয়ে বিছানায় শুয়ে থাকবেন এবং প্রদানকারী সঙ্গী তাঁর ওপরে থাকবেন। দুই জনের শরীর মুখোমুখি স্পর্শে থাকবে এবং ওপরের সঙ্গী হাতের কনুইয়ের ওপর ভর দিয়ে ভারসাম্য রাখবেন।",
    benefits: "গভীর চোখের যোগাযোগ, সংবেদনশীল কথা এবং সহজ উপায়ে নিবিড় মিলন ও চমৎকার নিরাপত্তা অনুভূতি দেয়।",
    tip: "গ্রহণকারী সঙ্গীর কোমরের নিচে একটি পাতলা নরম বালিশ ব্যবহার করলে কোণ (angle) অনেক উন্নত হয় এবং অনুভূতি চমৎকার হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/c/ca/Sex-Positions-Step-1.jpg/v4-460px-Sex-Positions-Step-1.jpg"
  },
  {
    id: "doggy_style",
    name: "ডগি স্টাইল (Doggy Style)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "একটি অত্যন্ত আকর্ষণীয় ও উদ্দীপক ভঙ্গি যা প্রদানকারী সঙ্গীকে সম্পূর্ণ কোমর নিয়ন্ত্রণ ও গতির স্বাধীনতা দেয়।",
    howTo: "গ্রহণকারী সঙ্গী হাত ও হাঁটুর ওপর ভর দিয়ে হামাগুড়ি দেওয়ার অবস্থানে থাকবেন। প্রদানকারী সঙ্গী পেছন থেকে হাঁটু গেড়ে বসার অবস্থানে থেকে মিলন করবেন।",
    benefits: "জি-স্পট (G-spot) সহজে স্পর্শ করা যায় এবং গভীর শারীরিক উত্তেজনার চমৎকার ভারসাম্য তৈরি হয়।",
    tip: "উভয় সঙ্গী একে অপরের অন্য সংবেদনশীল অংশ স্পর্শ করতে হাত বা ভাইব্রেটর ব্যবহার করলে তীব্রতা বহুগুণ বেড়ে যায়।",
    imageUrl: "https://www.wikihow.com/images/thumb/8/8a/Sex-Positions-Step-2.jpg/v4-460px-Sex-Positions-Step-2.jpg"
  },
  {
    id: "flat_iron",
    name: "ফ্ল্যাট আয়রন (The Flat Iron)",
    category: "আরামদায়ক",
    spiciness: 3,
    description: "সহজ ও অত্যন্ত আরামদায়ক একটি ভঙ্গি, যা ধীর ও অন্তরঙ্গ মিলন নিশ্চিত করে।",
    howTo: "গ্রহণকারী সঙ্গী বিছানায় উপুড় হয়ে পেট ঠেকিয়ে শুয়ে থাকবেন এবং পা দুটি সোজা রাখবেন। প্রদানকারী সঙ্গী ওপর থেকে পেছন দিক দিয়ে মিলন করবেন।",
    benefits: "কম পরিশ্রমে সহজে আরামদায়ক গভীর মিলন এবং জি-স্পট উদ্দীপনায় অসাধারণ।",
    tip: "গ্রহণকারী সঙ্গীর তলপেট বা হিপসের নিচে বালিশ রাখলে কোণ অত্যন্ত আরামদায়ক হয় এবং সহজে প্রবেশ করা যায়।",
    imageUrl: "https://www.wikihow.com/images/thumb/8/86/Sex-Positions-Step-3.jpg/v4-460px-Sex-Positions-Step-3.jpg"
  },
  {
    id: "face_off",
    name: "ফেস-অফ (Face-Off)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 3,
    description: "হাত সম্পূর্ণ স্বাধীন রেখে একে অপরকে জড়িয়ে ধরার ও নিবিড় চুম্বনের চমৎকার মুখোমুখি ভঙ্গি।",
    howTo: "প্রদানকারী সঙ্গী বিছানা, সোফা বা চেয়ারের প্রান্তে সোজা হয়ে বসবেন। গ্রহণকারী সঙ্গী তাঁর কোলে তাঁর দিকে মুখ করে দুই পা দুদিকে ছড়িয়ে বসবেন।",
    benefits: "চুম্বন, গভীর চোখের যোগাযোগ এবং গ্রহণকারী সঙ্গীর জন্য গতি ও গভীরতার চমৎকার নিয়ন্ত্রণ।",
    tip: "উভয়ের হাত সম্পূর্ণ মুক্ত থাকায় একে অপরের শরীর স্পর্শ ও ম্যাসাজ করতে দারুণ সুবিধা পাওয়া যায়।",
    imageUrl: "https://www.wikihow.com/images/thumb/9/96/Sex-Positions-Step-4.jpg/v4-460px-Sex-Positions-Step-4.jpg"
  },
  {
    id: "cowgirl",
    name: "কাউগার্ল (Cowgirl)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "এই ভঙ্গিতে গ্রহণকারী সঙ্গী সম্পূর্ণ নিয়ন্ত্রণে থাকেন এবং নিজের ছন্দ ও গতির স্বাধীনতা উপভোগ করেন।",
    howTo: "প্রদানকারী সঙ্গী পিঠের ওপর সোজা হয়ে শুয়ে থাকবেন। গ্রহণকারী সঙ্গী তাঁর ওপর মুখোমুখি বসে নিজের ছন্দ অনুসারে কোমর নড়াচড়া করবেন বা বৃত্তাকারে ঘুরাবেন।",
    benefits: "জি-স্পট উদ্দীপনা এবং গ্রহণকারী সঙ্গীর শারীরিক স্বাচ্ছন্দ্য ও প্রবেশ গভীরতার সর্বোচ্চ নিয়ন্ত্রণ।",
    tip: "গ্রহণকারী সঙ্গী দুই পা আরও ছড়িয়ে দিয়ে বা কোণ পরিবর্তন করে স্পর্শ অনুভূতি আরও তীব্র করতে পারেন।",
    imageUrl: "https://www.wikihow.com/images/thumb/f/f2/Sex-Positions-Step-5.jpg/v4-460px-Sex-Positions-Step-5.jpg"
  },
  {
    id: "reverse_cowgirl",
    name: "বিপরীত কাউগার্ল (Reverse Cowgirl)",
    category: "আনন্দদায়ক",
    spiciness: 5,
    description: "কাউগার্ল ভঙ্গির একটি আকর্ষণীয় রূপ যেখানে গ্রহণকারী সঙ্গী বিপরীত দিকে মুখ করে বসেন, যা অনন্য এক অনুভূতি দেয়।",
    howTo: "প্রদানকারী সঙ্গী সোজা শুয়ে থাকবেন। গ্রহণকারী সঙ্গী তাঁর ওপর এমনভাবে উল্টো করে বসবেন যেন তাঁর পিঠ প্রদানকারী সঙ্গীর মুখের দিকে থাকে এবং কোমর দোলাবেন।",
    benefits: "অনন্য দৃশ্যমান অভিজ্ঞতা এবং ভিন্ন কোণ থেকে সহজে গভীর শারীরিক মিলনের চমৎকার সুযোগ দেয়।",
    tip: "পেছনের দিকে সামান্য ঝুঁকে প্রদানকারী সঙ্গীর পা বা হাঁটু স্পর্শ করলে কোমর ও গতি নিয়ন্ত্রণ করা অনেক সহজ হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/f/fc/Sex-Positions-Step-6.jpg/v4-460px-Sex-Positions-Step-6.jpg"
  },
  {
    id: "spooning",
    name: "স্পুনিং (Spooning)",
    category: "আরামদায়ক",
    spiciness: 2,
    description: "ধীরগতির অত্যন্ত স্বস্তিদায়ক অলস সকাল বা ক্লান্তি দূর করার চমৎকার একটি পাশ কাট হয়ে শোয়ার ভঙ্গি।",
    howTo: "উভয় সঙ্গী একই দিকে মুখ করে একপাশে কাত হয়ে শুয়ে থাকবেন। পেছনের সঙ্গী সামনের সঙ্গীকে জড়িয়ে ধরে পেছন থেকে প্রবেশ করবেন।",
    benefits: "অহেতুক শক্তি ক্ষয় না করে দীর্ঘ সময় কাটানো যায় এবং আলিঙ্গনের মাধ্যমে সর্বোচ্চ নিরাপত্তা অনুভূত হয়।",
    tip: "উষ্ণতা বাড়াতে প্রদানকারী সঙ্গী এক হাত দিয়ে সামনের সঙ্গীর ক্লিটোরিস বা অন্যান্য সংবেদনশীল অঙ্গ আদর করতে পারেন।",
    imageUrl: "https://www.wikihow.com/images/thumb/b/be/Sex-Positions-Step-7.jpg/v4-460px-Sex-Positions-Step-7.jpg"
  },
  {
    id: "coital_alignment_technique",
    name: "কোইটাল অ্যালাইনমেন্ট টেকনিক (CAT)",
    category: "সংবেদনশীল",
    spiciness: 3,
    description: "যৌন গবেষকদের দ্বারা প্রমাণিত একটি ক্লিনিক্যাল ভঙ্গি, যা গভীর স্পর্শ ও সরাসরি ক্লিটোরাল ঘর্ষণের মাধ্যমে চরম তৃপ্তি দেয়।",
    howTo: "মিশনারির মতোই, তবে প্রদানকারী সঙ্গী সামান্য ওপরে এবং একপাশে থাকবেন যেন তাঁর বুকের ছোঁয়া সঙ্গীর কাঁধের ওপরে থাকে। গ্রহণকারী সঙ্গী হাঁটু ভাঁজ করে কোমর ওপরের দিকে মেলাবেন যেন ক্লিটোরিস সরাসরি সঙ্গীর লিঙ্গে ঘর্ষিত হয়।",
    benefits: "সরাসরি ক্লিটোরাল ঘর্ষণ ও উদ্দীপনার মাধ্যমে গ্রহণকারী সঙ্গীর অতি সহজে ক্লাইম্যাক্স অর্জনে দারুণ কার্যকর।",
    tip: "প্রদানকারী সঙ্গী ধাক্কা দেওয়ার চেয়ে সামনে-পেছনে আলতো দোলানো বা গোল করে ঘোরানোর গতি ব্যবহার করলে অনুভূতি চমৎকার হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/1/1c/Sex-Positions-Step-8.jpg/v4-460px-Sex-Positions-Step-8.jpg"
  },
  {
    id: "stand_and_deliver",
    name: "স্ট্যান্ড অ্যান্ড ডেলিভার (Stand and Deliver)",
    category: "সংবেদনশীল",
    spiciness: 4,
    description: "বিছানার প্রান্তে সোজা দাঁড়িয়ে অত্যন্ত গভীর মিলন নিশ্চিত করার একটি চমৎকার ভঙ্গি।",
    howTo: "গ্রহণকারী সঙ্গী বিছানা বা টেবিলের প্রান্তে পিঠ ঠেকিয়ে পা বুকের দিকে বা প্রদানকারী সঙ্গীর কাঁধে তুলে শুয়ে থাকবেন। প্রদানকারী সঙ্গী দাঁড়িয়ে প্রবেশ করবেন।",
    benefits: "খুব গভীর প্রবেশ এবং প্রদানকারী সঙ্গীর জন্য চমৎকার শারীরিক দৃষ্টি ও মিলনের তীব্র নিয়ন্ত্রণ দেয়।",
    tip: "গ্রহণকারী সঙ্গী চাইলে হিপস আরও ওপরে তুলতে উরুর পেশী হালকা সংকুচিত বা শিথিল করতে পারেন বা পা দিয়ে সঙ্গীকে সাহায্য করতে পারেন।",
    imageUrl: "https://www.wikihow.com/images/thumb/e/ea/Sex-Positions-Step-9.jpg/v4-460px-Sex-Positions-Step-9.jpg"
  },
  {
    id: "seashell",
    name: "সী-শেল / শামুক ভঙ্গি (The Seashell)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 4,
    description: "নমনীয় শরীরের জন্য উপযুক্ত একটি উদ্দীপক ভঙ্গি, যা সর্বোচ্চ গভীরতা স্পর্শ করে ও ক্লিটোরিস উদ্দীপিত করে।",
    howTo: "গ্রহণকারী সঙ্গী পিঠ ঠেকিয়ে শুয়ে দুই পা মাথার কাছে তুলে ভাঁজ করবেন। প্রদানকারী সঙ্গী মিশনারি অবস্থানে থেকে প্রবেশ করবেন।",
    benefits: "অত্যন্ত গভীর প্রবেশ অনুভূতি এবং হিপসের ঘর্ষণে সরাসরি ক্লিটোরিস স্পর্শের রোমাঞ্চকর মিলন দেয়।",
    tip: "আরামদায়ক রাখতে এবং কোণ সুন্দর করতে গ্রহণকারী সঙ্গীর হিপসের নিচে একটি মাঝারি আকারের কুশন ব্যবহার করুন।",
    imageUrl: "https://www.wikihow.com/images/thumb/2/26/Sex-Positions-Step-10.jpg/v4-460px-Sex-Positions-Step-10.jpg"
  },
  {
    id: "lotus",
    name: "লোটাস / পদ্ম আসন (The Lotus)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 3,
    description: "তান্ত্রিক বা আধ্যাত্মিক ঘনিষ্ঠতার জন্য অত্যন্ত বিখ্যাত মুখোমুখি আলিঙ্গনের ভঙ্গি যা গভীর আত্মিক বন্ধন গড়ে তোলে।",
    howTo: "প্রদানকারী সঙ্গী বিছানা বা মেঝেতে বাবু হয়ে সোজা হয়ে বসবেন। গ্রহণকারী সঙ্গী তাঁর কোলে উঠে মুখোমুখি বসে পা দুটি প্রদানকারীর কোমরের চারপাশে জড়িয়ে ধরবেন ও আলিঙ্গন করবেন।",
    benefits: "অত্যন্ত গভীর মানসিক সংযোগ, একে অপরের নিশ্বাস ও হৃদস্পন্দন সরাসরি অনুভব করা এবং ধীরগতির মিলন সম্ভব করে।",
    tip: "নিবিড় আলিঙ্গন ও গভীর চুম্বন এই ভঙ্গির তীব্রতা এবং সম্পর্ককে অনেক আবেগঘন ও রোমান্টিক করে তোলে।",
    imageUrl: "https://www.wikihow.com/images/thumb/d/d4/Sex-Positions-Step-11.jpg/v4-460px-Sex-Positions-Step-11.jpg"
  },
  {
    id: "pearly_gates",
    name: "পার্লি গেটস (The Pearly Gates)",
    category: "সংবেদনশীল",
    spiciness: 3,
    description: "আরাম করে শুয়ে থাকার পাশাপাশি প্রদানকারী সঙ্গীকে সম্পূর্ণ আদর ও স্পর্শের স্বাধীনতা দেওয়ার চমৎকার ভঙ্গি।",
    howTo: "প্রদানকারী সঙ্গী সোজা শুয়ে থাকবেন। গ্রহণকারী সঙ্গী তাঁর বিপরীত হয়ে (পিঠ প্রদানকারীর বুকের দিকে রেখে) তাঁর ওপর শুয়ে মিলন করবেন এবং হাতের সাহায্যে কনুইয়ে ব্যালেন্স রাখবেন।",
    benefits: "জি-স্পট উদ্দীপনা এবং উভয় সঙ্গী শুয়ে থেকেই আরামদায়ক ও গভীর শারীরিক উত্তেজনা লাভ করতে পারে।",
    tip: "প্রদানকারী সঙ্গী হাতের সাহায্যে সঙ্গীর বুক ও ক্লিটোরিস আদর করার জন্য সম্পূর্ণ খালি হাত পাবেন, যা চরম সুখ দেয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/5/51/Sex-Positions-Step-12.jpg/v4-460px-Sex-Positions-Step-12.jpg"
  },
  {
    id: "happy_baby",
    name: "হ্যাপি বেবি / যোগাসন (Happy Baby)",
    category: "আরামদায়ক",
    spiciness: 3,
    description: "যোগব্যায়াম দ্বারা অনুপ্রাণিত এই ভঙ্গিটি গ্রহণকারী সঙ্গীর কোমর ও পিঠের ব্যথা উপশম করতে দারুণ কার্যকর।",
    howTo: "গ্রহণকারী সঙ্গী পিঠ ঠেকিয়ে শুয়ে দুই হাঁটু ভাঁজ করে বুকের কাছে আনবেন এবং হাত দিয়ে দুই পায়ের পাতার বাইরের অংশ ধরে সোজা মেলাবেন। প্রদানকারী সঙ্গী সামনে হাঁটু গেড়ে প্রবেশ করবেন।",
    benefits: "তলপেট ও কোমরের পেশীতে টান পড়ে না, কোমর ব্যথামুক্ত চমৎকার গভীর প্রবেশ এবং নিরাপত্তা অনুভব দেয়।",
    tip: "প্রদানকারী সঙ্গী সঙ্গীর পা দুটিকে একটু সাপোর্ট দিয়ে ধরে রাখলে ভারসাম্য ও প্রবেশের কোণ আরও নিখুঁত হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/7/70/Sex-Positions-Step-13.jpg/v4-460px-Sex-Positions-Step-13.jpg"
  },
  {
    id: "pretzel",
    name: "প্রেটজেল (The Pretzel)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 4,
    description: "ডগি স্টাইলের একটি চমৎকার মুখোমুখি রূপ, যা অনেক স্বাচ্ছন্দ্য ও গভীরতার সামঞ্জস্য দেয় ও পিঠ ব্যথা থেকে রক্ষা করে।",
    howTo: "গ্রহণকারী সঙ্গী একপাশে কাত হয়ে শুয়ে এক পা সোজা রাখবেন এবং ওপরের পা দিয়ে সঙ্গীকে জড়িয়ে ধরবেন। প্রদানকারী সঙ্গী তাঁর পায়ের মাঝে হাঁটু গেড়ে বসে প্রবেশ করবেন।",
    benefits: "চোখের যোগাযোগ বজায় রাখা সহজ এবং দীর্ঘ সময় ক্লান্তিহীনভাবে গভীর সংযোগ বজায় রাখার চমৎকার উপায়।",
    tip: "মিলনের সময় প্রদানকারী সঙ্গী এক হাত দিয়ে সঙ্গীর ক্লিটোরিস বা শরীর আলতো ম্যাসাজ করতে পারেন যা উষ্ণতা বাড়ায়।",
    imageUrl: "https://www.wikihow.com/images/thumb/2/23/Sex-Positions-Step-14.jpg/v4-460px-Sex-Positions-Step-14.jpg"
  },
  {
    id: "leapfrog",
    name: "লিপফ্রগ (Leapfrog)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "ডগি স্টাইলের একটি পরিবর্তিত রূপ, যেখানে গ্রহণকারী হিপস একটু উঁচুতে রেখে অসাধারণ গভীরতা ও জি-স্পট স্পর্শ পান।",
    howTo: "গ্রহণকারী সঙ্গী হাঁটু গেড়ে বসবেন এবং মাথা ও বুক বিছানায় সম্পূর্ণ ঠেকিয়ে হিপস উঁচুতে রাখবেন। প্রদানকারী পেছনে হাঁটু গেড়ে প্রবেশ করবেন।",
    benefits: "সহজ ও গভীরতম জি-স্পট উদ্দীপনা এবং মিলনের তীব্র শারীরিক শিহরণ প্রদান করে।",
    tip: "গ্রহণকারী সঙ্গীর তলপেটে নরম বালিশ রাখলে কোণ অত্যন্ত আরামদায়ক ও নিখুঁত হয়ে ওঠে এবং প্রবেশ সহজ হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/d/df/Sex-Positions-Step-15.jpg/v4-460px-Sex-Positions-Step-15.jpg"
  },
  {
    id: "ballet_dancer",
    name: "ব্যালে ড্যান্সার (Ballet Dancer)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 4,
    description: "দাঁড়িয়ে দ্রুত একটি রোমাঞ্চকর মিলন উপভোগের জন্য চমৎকার, কম জায়গার জন্য এবং চটজলদি করার উপযোগী ভঙ্গি।",
    howTo: "উভয় সঙ্গী সামনাসামনি দাঁড়িয়ে থাকবেন। গ্রহণকারী সঙ্গী এক পা প্রদানকারীর হিপস বা উরুর চারপাশে তুলে জড়িয়ে ধরবেন এবং দেয়ালে বা প্রদানকারীকে ভর দিয়ে ভারসাম্য রাখবেন।",
    benefits: "শাওয়ার বা বাথরুমে এবং বিছানা ছাড়া যেকোনো জায়গায় চটজলদি রোমাঞ্চকর মিলনের জন্য সেরা।",
    tip: "সহজ ভারসাম্য বজায় রাখতে প্রদানকারী সঙ্গী সঙ্গীর উরু ধরে উপরে তুলতে কিছুটা কুশন বা দেয়ালে পিঠ ঠেকানোর সাহায্য নিতে পারেন।",
    imageUrl: "https://www.wikihow.com/images/thumb/b/b4/Sex-Positions-Step-16.jpg/v4-460px-Sex-Positions-Step-16.jpg"
  },
  {
    id: "little_dipper",
    name: "লিটল ডিপার (Little Dipper)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "একটি অত্যন্ত অ্যাথলেটিক ও তীব্র গতিসম্পন্ন ভঙ্গি, যা গ্রহণকারীকে নিয়ন্ত্রণ এবং শরীরচর্চার আনন্দ দেয়।",
    howTo: "প্রদানকারী সঙ্গী সোজা শুয়ে থাকবেন। গ্রহণকারী সঙ্গী তাঁর ওপর সোজা বসে দুই হাত পেছনে রেখে নিজেকে ওপরে-নিচে তুলে মিলন নিয়ন্ত্রণ করবেন ও কোমর নড়াচড়া করবেন।",
    benefits: "ক্লিটোরাল স্পর্শের সর্বোচ্চ গভীরতা এবং চমৎকার কোণ পরিবর্তন করার ক্ষমতা লাভ করা যায়।",
    tip: "গ্রহণকারী সঙ্গী ক্লান্ত হলে প্রদানকারী সঙ্গী নিচ থেকে কোমর আলতো দুলিয়ে বা ঠেলে ছন্দ নিয়ন্ত্রণে সাহায্য করতে পারেন।",
    imageUrl: "https://www.wikihow.com/images/thumb/6/62/Sex-Positions-Step-17.jpg/v4-460px-Sex-Positions-Step-17.jpg"
  },
  {
    id: "standing_wheelbarrow",
    name: "হাত গাড়ি ভঙ্গি (Standing Wheelbarrow)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 5,
    description: "মিলনকে ব্যায়ামের মতো রোমাঞ্চকর ও চূড়ান্ত শরীরচর্চায় রূপ দেওয়ার একটি অত্যন্ত শক্তিশালী ও উদ্দীপক ভঙ্গি।",
    howTo: "গ্রহণকারী সঙ্গী মেঝের দিকে দুই হাত দিয়ে ভর দিয়ে থাকবেন। প্রদানকারী সঙ্গী তাঁর পা বা হিপস ধরে শূন্যে তুলে দাঁড়িয়ে পেছন দিক থেকে প্রবেশ করবেন।",
    benefits: "গভীরতম প্রবেশ, ক্যালোরি পোড়ানো এবং চূড়ান্ত রোমাঞ্চ ও আনন্দের এক অসাধারণ ভারসাম্য বজায় রাখা সম্ভব হয়।",
    tip: "হাত ক্লান্ত হয়ে গেলে গ্রহণকারী সঙ্গী বিছানা বা সোফার প্রান্তে হাত দিয়ে ভর রাখতে পারেন, যা অনেক সহজ হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/d/d3/Sex-Positions-Step-18.jpg/v4-460px-Sex-Positions-Step-18.jpg"
  },
  {
    id: "pinball_wizard",
    name: "পিনবল উইজার্ড (Pinball Wizard)",
    category: "সংবেদনশীল",
    spiciness: 4,
    description: "হিপস উপরে তুলে চমৎকার গভীর কোণ তৈরি করার একটি দারুণ সংবেদনশীল ভঙ্গি যা গভীর অনুভূতি জাগায়।",
    howTo: "গ্রহণকারী সঙ্গী মেঝে বা বিছানায় শুয়ে হিপস উঁচুতে তুলে ধরবেন (হিপ ব্রিজ ভঙ্গি)। প্রদানকারী সঙ্গী দুই উরুর নিচে হাত দিয়ে সঙ্গীকে নিজের দিকে টেনে হাঁটু গেড়ে মিলন করবেন।",
    benefits: "সহজে গভীর প্রবেশ নিশ্চিত করে এবং গ্রহণকারী সঙ্গীর হাত মুক্ত থাকায় নিজের স্পর্শ করতে দারুণ সহায়ক হয়।",
    tip: "গ্রহণকারী সঙ্গীর পিঠের নিচে একটি কোণাকৃতির কুশন বা বালিশ দিলে দীর্ঘ সময় ধরে কোমর সুন্দরভাবে ধরে রাখা সহজ হয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/c/c0/Sex-Positions-Step-19.jpg/v4-460px-Sex-Positions-Step-19.jpg"
  },
  {
    id: "waterfall",
    name: "জলপ্রপাত ভঙ্গি (Waterfall)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "মাথায় হালকা রক্তের প্রবাহের অনুভূতি ও রোমাঞ্চ যোগ করে মিলনকে অত্যন্ত তীব্র করার একটি অ্যাথলেটিক ভঙ্গি।",
    howTo: "প্রদানকারী সঙ্গী বিছানার প্রান্তে শুয়ে মাথা ও কাঁধ নিচের মেঝের দিকে ঝুলিয়ে দেবেন। গ্রহণকারী সঙ্গী ওপরে হাঁটু গেড়ে বসে মিলন নিয়ন্ত্রণ করবেন ও কোমর ঘোরাবেন।",
    benefits: "চমৎকার কোণ পরিবর্তন, গ্রহণকারী সঙ্গীর জন্য গতিশীল নিয়ন্ত্রণ এবং তীব্র ক্লাইম্যাক্সের সুযোগ করে দেয়।",
    tip: "আরাম পেতে প্রদানকারীর মাথার নিচে একটি নরম বালিশ বা তোয়ালে ভাজ করে রাখতে পারেন যা নিরাপত্তা বাড়াবে।",
    imageUrl: "https://www.wikihow.com/images/thumb/0/0c/Sex-Positions-Step-20.jpg/v4-460px-Sex-Positions-Step-20.jpg"
  },
  {
    id: "hot_seat",
    name: "হট সিট (Hot Seat)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "চেয়ার বা বিছানার প্রান্তে বসে ডমিন্যান্ট রোলে মিলন নিয়ন্ত্রণ করার চমৎকার একটি উপায় যা সঙ্গীকে নিয়ন্ত্রণ দেয়।",
    howTo: "প্রদানকারী সঙ্গী সোফা বা বিছানার প্রান্তে বসে পা মেঝেতে রাখবেন। গ্রহণকারী উল্টো মুখ করে তাঁর কোলে বসে নিজের গতিতে মিলন ও কোমর নিয়ন্ত্রণ করবেন।",
    benefits: "জি-স্পট উদ্দীপনা এবং গ্রহণকারী সঙ্গীর জন্য গতির দুর্দান্ত নিয়ন্ত্রণ ও মিলনে সক্রিয় ভূমিকা রাখার সুযোগ দেয়।",
    tip: "প্রদানকারী সঙ্গী হাত বাড়িয়ে সঙ্গীর বুক ও ক্লিটোরিস আদর করতে পারেন যা মিলনকে আরও মধুর করে তোলে।",
    imageUrl: "https://www.wikihow.com/images/thumb/f/f2/Sex-Positions-Step-21.jpg/v4-460px-Sex-Positions-Step-21.jpg"
  },
  {
    id: "stairway_to_heaven",
    name: "স্বর্গের সিঁড়ি (Stairway to Heaven)",
    category: "আরামদায়ক",
    spiciness: 3,
    description: "সিঁড়িতে আরামদায়ক সাপোর্ট নিয়ে রোমাঞ্চকর উপায়ে চমৎকার মিলন সম্পন্ন করার সহজ অথচ উদ্দীপক ভঙ্গি।",
    howTo: "প্রদানকারী সঙ্গী সিঁড়ির একটি ধাপে বসবেন। গ্রহণকারী সঙ্গী বিপরীত মুখ করে তাঁর ওপরে বসে সিঁড়ি ও রেলিংয়ের সাপোর্ট নিয়ে কোমর দোলাবেন ও মিলন করবেন।",
    benefits: "সিঁড়ি ও রেলিংয়ের চমৎকার অবলম্বন পাওয়া যায়, যা হাত দিয়ে ধরে কোমর নিয়ন্ত্রণ করতে সাহায্য করে ও বিছানার বাইরে রোমাঞ্চ দেয়।",
    tip: "সবসময় সিঁড়ির নিচের ধাপে এটি শুরু করুন যেন নিরাপত্তা বিঘ্নিত না হয় এবং গতি মৃদু ও ধীর রাখুন।",
    imageUrl: "https://www.wikihow.com/images/thumb/6/6d/Sex-Positions-Step-22.jpg/v4-460px-Sex-Positions-Step-22.jpg"
  },
  {
    id: "yourself_on_the_shelf",
    name: "শেল্ফ ভঙ্গি (Yourself on the Shelf)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 5,
    description: "বিছানার প্রান্তে সঙ্গীকে তুলে ধরে দাঁড়িয়ে তীব্রভাবে ক্লাইম্যাক্সে পৌঁছানোর জন্য সেরা ও শক্তিশালী একটি ভঙ্গি।",
    howTo: "গ্রহণকারী বিছানার প্রান্তে বসবেন এবং প্রদানকারী দাঁড়িয়ে তাঁকে শূন্যে তুলে কোমরে পা জড়িয়ে ধরতে বলবেন। প্রদানকারী তাঁকে পিঠে ও কোমরে ধরে মিলন করবেন।",
    benefits: "অত্যন্ত শক্তিশালী ও অ্যাথলেটিক অনুভূতি এবং চটজলদি চরম তৃপ্তি ও ক্লাইম্যাক্স লাভ করতে দারুণ সাহায্য করে।",
    tip: "এটি ধরে রাখা বেশ পরিশ্রমের, তাই মিলনের শেষ ১-২ মিনিটে চরম তৃপ্তি লাভ করার মুহূর্তে এটি ব্যবহার করুন।",
    imageUrl: "https://www.wikihow.com/images/thumb/f/f2/Sex-Positions-Step-23.jpg/v4-460px-Sex-Positions-Step-23.jpg"
  },
  {
    id: "butter_churner",
    name: "মাখন মন্থন ভঙ্গি (Butter Churner)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 5,
    description: "চ্যালেঞ্জিং এবং অত্যন্ত অনন্য একটি ভঙ্গি যা অভিনব কোণ থেকে চরম আনন্দের অনুভূতি ও তীব্র ক্লাইম্যাক্স দেয়।",
    howTo: "গ্রহণকারী সঙ্গী মেঝে বা বিছানায় শুয়ে দুই পা সোজা মাথার ওপর বা কাঁধের পাশে তুলে দেবেন। প্রদানকারী সঙ্গী ওপর থেকে স্কোয়াট করে প্রবেশ করবেন ও ভারসাম্য রাখবেন।",
    benefits: "অন্যতম গভীরতম প্রবেশ এবং সম্পূর্ণ ভিন্ন কোণ থেকে রোমাঞ্চকর অনুভূতি ও গভীর জি-স্পট স্পর্শ লাভ করা যায়।",
    tip: "ঘাড় বা পিঠে চোট এড়াতে প্রদানকারী সঙ্গী হালকা ও মৃদুভাবে ধাক্কা ও ছন্দের ব্যবহার করুন এবং জোর করবেন না।",
    imageUrl: "https://www.wikihow.com/images/thumb/0/0b/Sex-Positions-Step-24.jpg/v4-460px-Sex-Positions-Step-24.jpg"
  },
  {
    id: "mountain_climber",
    name: "মাউন্টেন ক্লাইম্বার (Mountain Climber)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 4,
    description: "পুশ-আপ অবস্থানে থেকে গ্রহণকারী সঙ্গীর ওপর ভর না দিয়ে নিবিড় মিলন করার রোমাঞ্চকর ও স্বস্তিদায়ক ভঙ্গি।",
    howTo: "গ্রহণকারী পিঠ ঠেকিয়ে শুয়ে থাকবেন। প্রদানকারী সঙ্গী তাঁর পায়ের মাঝে পুশ-আপ অবস্থানে হাত দিয়ে ভর রেখে ওপর থেকে প্রবেশ করবেন ও কোমর দোলাবেন।",
    benefits: "তীব্র চোখের যোগাযোগ, গ্রহণকারী সঙ্গীর সম্পূর্ণ আরাম ও স্বাচ্ছন্দ্য এবং প্রদানকারীর জন্য চমৎকার গতি নিয়ন্ত্রণ বজায় রাখা সম্ভব হয়।",
    tip: "প্রদানকারী সঙ্গী নিচে নেমে এসে মিষ্টি করে চুম্বন করতে পারেন যা স্পর্শানুভূতি এবং গভীর ভালবাসা বহুগুণ বাড়িয়ে দেয়।",
    imageUrl: "https://www.wikihow.com/images/thumb/5/59/Sex-Positions-Step-25.jpg/v4-460px-Sex-Positions-Step-25.jpg"
  }
];

// পরিস্থিতি নির্ধারণকারী ডাইসের জন্য স্থান ও শর্তাবলি
const Locations = [
  "আরামদায়ক বিছানা",
  "চাঁদের আলোয় বসার ঘর",
  "উষ্ণ শাওয়ার বা বাথটাব",
  "নরম কম্বলের তাবু",
  "মেঝেতে পাতা নরম কার্পেট",
  "রান্নাঘরের কাউন্টার",
  "আরামদায়ক নরম সোফা",
  "ব্যক্তিগত বারান্দা (নিরাপদ)",
  "ব্যক্তিগত গাড়ির ভেতর"
];

const Moods = [
  "চোখে নরম কাপড় বা পট্টি বাঁধুন",
  "শুধু মিষ্টি সুরে কানে কানে কথা বলুন",
  "মোমবাতির মৃদু আলো ও জ্যাজ মিউজিক বাজান",
  "ম্যাসাজ অয়েল বা লোশন ব্যবহার করুন",
  "শুধু ধীর ও অত্যন্ত গভীর শ্বাস নিন",
  "সারাক্ষণ আলতোভাবে চোখে চোখ রাখুন",
  "কথা না বলে শুধু স্পর্শ ও ইশারা ব্যবহার করুন",
  "একে অপরের হাত শক্ত করে ধরে রাখুন",
  "ঘন ঘন মিষ্টি ও ভালোবাসার চুম্বন করুন"
];

export default function Secret() {
  const [selectedPose, setSelectedPose] = useState<Pose>(PosesData[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [spicinessFilter, setSpicinessFilter] = useState<number | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<string | "All">("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);

  // ডাইসের স্টেট
  const [currentLocation, setCurrentLocation] = useState(Locations[0]);
  const [currentMood, setCurrentMood] = useState(Moods[0]);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // অডিও কনটেক্সট রেফ
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // শব্দের এফেক্ট
  const playSound = (type: "spin" | "land" | "dice") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "spin") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300 + Math.random() * 400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === "land") {
        const frequencies = [261.63, 329.63, 392.00, 523.25];
        frequencies.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = "triangle";
          o.frequency.setValueAtTime(freq, ctx.currentTime);
          g.gain.setValueAtTime(0, ctx.currentTime);
          g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05 + idx * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8 + idx * 0.1);
          o.start();
          o.stop(ctx.currentTime + 1.2);
        });
      } else if (type === "dice") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(120 + Math.random() * 80, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  };

  // ফিল্টার করা ভঙ্গির তালিকা
  const filteredPoses = PosesData.filter((pose) => {
    const matchSpiciness = spicinessFilter === "All" || pose.spiciness === spicinessFilter;
    const matchCategory = categoryFilter === "All" || pose.category === categoryFilter;
    return matchSpiciness && matchCategory;
  });

  // রুলেট ঘোরানোর ফাংশন
  const rollRoulette = () => {
    if (isRolling || filteredPoses.length === 0) return;
    setIsRolling(true);
    setImgLoading(true);

    let count = 0;
    const maxSpins = 12 + Math.floor(Math.random() * 8);
    const intervalTime = 120;

    const spin = () => {
      const randomIndex = Math.floor(Math.random() * filteredPoses.length);
      setSelectedPose(filteredPoses[randomIndex]);
      playSound("spin");

      count++;
      if (count < maxSpins) {
        setTimeout(spin, intervalTime + count * 15);
      } else {
        setIsRolling(false);
        playSound("land");
      }
    };

    spin();
  };

  // ডাইস রোলিং
  const rollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);

    let count = 0;
    const interval = setInterval(() => {
      setCurrentLocation(Locations[Math.floor(Math.random() * Locations.length)]);
      setCurrentMood(Moods[Math.floor(Math.random() * Moods.length)]);
      playSound("dice");
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsRollingDice(false);
      }
    }, 100);
  };

  // লোড হওয়ার পর যেকোনো একটি এলোমেলো ভঙ্গি সেট করা
  useEffect(() => {
    if (filteredPoses.length > 0 && selectedPose === PosesData[0]) {
      setSelectedPose(filteredPoses[Math.floor(Math.random() * filteredPoses.length)]);
    }
  }, []);

  // ফিল্টার পরিবর্তন হলে মানানসই ভঙ্গি স্বয়ংক্রিয়ভাবে নির্বাচন করা
  useEffect(() => {
    if (filteredPoses.length > 0) {
      const isMatch = filteredPoses.some((p) => p.id === selectedPose.id);
      if (!isMatch) {
        setSelectedPose(filteredPoses[0]);
        setImgLoading(true);
      }
    }
  }, [spicinessFilter, categoryFilter, filteredPoses, selectedPose.id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans pb-12 transition-colors duration-300">
      {/* চমৎকার গ্রেডিয়েন্ট বার */}
      <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 animate-gradient-xy"></div>

      {/* হেডার */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-3 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-500 dark:text-slate-400"
              title="হোমে ফিরে যান"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Heart size={18} fill="currentColor" className="animate-pulse" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                  কিউপিড রুলেট (Cupid's Roulette)
                </h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  সম্পর্ক ও ঘনিষ্ঠতা বৃদ্ধির খেলা
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* শব্দ বাটন */}
            <button
              onClick={() => {
                getAudioContext();
                setSoundEnabled(!soundEnabled);
              }}
              className={`p-2 rounded-xl sm:p-2.5 sm:rounded-2xl transition-all ${
                soundEnabled
                  ? "bg-pink-50 dark:bg-pink-950/40 text-pink-500"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
              title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট */}
      <main className="max-w-6xl mx-auto px-4 py-4 sm:py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* বাম পাশ - রুলেট */}
        <section className="lg:col-span-7 flex flex-col gap-5 sm:gap-6">
          {/* ফিল্টার সমূহ */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                উষ্ণতার মাত্রা (Spiciness)
              </span>
              <div className="flex gap-1">
                {["All", 1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSpicinessFilter(level as any);
                      getAudioContext();
                    }}
                    className={`flex-1 py-1 px-1.5 sm:py-1.5 sm:px-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                      spicinessFilter === level
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-500/20"
                        : "bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {level === "All" ? "সব" : "🔥".repeat(level as number)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                আসন বা ভঙ্গির ধরণ (Category)
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  getAudioContext();
                }}
                className="bg-slate-50 dark:bg-slate-700 border-none outline-none rounded-lg sm:rounded-xl py-1.5 px-2.5 sm:py-2 sm:px-3 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer min-w-[130px]"
              >
                <option value="All">🌌 সব ক্যাটাগরি</option>
                <option value="আরামদায়ক">🧸 আরামদায়ক (Comfortable)</option>
                <option value="গভীর ঘনিষ্ঠতা">💖 গভীর ঘনিষ্ঠতা (Intimate)</option>
                <option value="আনন্দদায়ক">⚡ আনন্দদায়ক (Playful)</option>
                <option value="সংবেদনশীল">🌸 সংবেদনশীল (Sensation)</option>
                <option value="অ্যাক্রোবেটিক">🤸 অ্যাক্রোবেটিক (Acrobatic)</option>
              </select>
            </div>
          </div>

          {/* রুলেট ডিসপ্লে */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-[28px] sm:rounded-[40px] p-4 sm:p-6 md:p-8 shadow-2xl border-4 border-pink-500/30 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[440px] overflow-hidden group">
            {/* ব্যাকগ্রাউন্ড গ্রিড */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* টাইটেল রিবন */}
            <div className="relative z-10 bg-slate-800/80 backdrop-blur-md py-1 px-3 sm:py-1.5 sm:px-4 rounded-full border border-slate-700 text-[10px] sm:text-[11px] font-bold text-pink-400 uppercase tracking-widest shadow-inner mb-3 sm:mb-4 flex items-center gap-1.5">
              <Sparkles size={11} className="animate-spin text-pink-400" />
              <span>ভঙ্গির দৈবচয়ন (ROULETTES)</span>
            </div>

            {/* ইমেজ ফ্রেম */}
            <div className="w-full flex-1 flex flex-col items-center justify-center relative py-2 sm:py-4">
              {isRolling ? (
                // রোটেटिंग স্টেজ
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 sm:w-20 sm:w-24 sm:h-24 rounded-full border-4 border-pink-500/40 border-t-pink-500 animate-spin"></div>
                  <p className="text-xs sm:text-sm font-semibold tracking-wider text-pink-500 uppercase font-mono animate-bounce mt-2">
                    ভঙ্গি বাছাই করা হচ্ছে...
                  </p>
                </div>
              ) : filteredPoses.length === 0 ? (
                // নো পোজ স্টেজ
                <div className="text-center py-6 space-y-3">
                  <p className="text-slate-500 text-xs sm:text-sm">এই ক্যাটাগরিতে কোনো ভঙ্গি খুঁজে পাওয়া যায়নি।</p>
                  <button
                    onClick={() => {
                      setSpicinessFilter("All");
                      setCategoryFilter("All");
                    }}
                    className="text-xs text-pink-500 hover:underline font-bold"
                  >
                    ফিল্টার রিসেট করুন
                  </button>
                </div>
              ) : (
                // উইকিহাউ রিয়েল পোজ
                <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                  {/* উইকিহাউ ইমেজ */}
                  <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-video sm:aspect-square flex items-center justify-center mb-3 sm:mb-4 relative rounded-2xl overflow-hidden border-2 border-pink-500/20 bg-slate-800 shadow-inner group">
                    {imgLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                        <div className="w-10 h-10 border-4 border-pink-500/40 border-t-pink-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={selectedPose.imageUrl}
                      alt={selectedPose.name}
                      onLoad={() => setImgLoading(false)}
                      onError={() => setImgLoading(false)}
                      className={`w-full h-full object-cover sm:object-contain transition-opacity duration-300 ${
                        imgLoading ? "opacity-0" : "opacity-100"
                      }`}
                    />
                  </div>

                  {/* বিস্তারিত */}
                  <div className="text-center space-y-1.5 sm:space-y-2 max-w-lg relative z-10 px-1 sm:px-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="bg-pink-500/15 text-pink-400 border border-pink-500/30 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedPose.category}
                      </span>
                      <span className="text-amber-400 text-[10px] sm:text-xs font-bold flex items-center gap-0.5">
                        <Flame size={11} fill="currentColor" />
                        {"🔥".repeat(selectedPose.spiciness)}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {selectedPose.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 leading-relaxed max-w-md mx-auto italic">
                      "{selectedPose.description}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* রুলেট ঘোরানোর মূল বোতাম */}
            <div className="w-full relative z-10 pt-3 sm:pt-4 flex justify-center">
              <button
                onClick={() => {
                  getAudioContext();
                  rollRoulette();
                }}
                disabled={isRolling}
                className="w-full max-w-[300px] sm:max-w-[320px] py-3 px-5 sm:py-4 sm:px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white text-sm sm:text-md font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20 disabled:opacity-50"
              >
                <Heart size={18} fill="currentColor" className={isRolling ? "animate-spin" : "animate-bounce"} />
                <span>{isRolling ? "বাছাই করা হচ্ছে..." : "রুলেট ঘোরান 💘"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ডান পাশ - গাইডবুক ও ডাইস */}
        <section className="lg:col-span-5 flex flex-col gap-5 sm:gap-6">
          {/* গাইডবুক কার্ড */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <Compass size={18} className="text-pink-500" />
              <span>ভঙ্গি নির্দেশিকা (Pose Playbook)</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-widest block">
                  কীভাবে করবেন (How to Practice)
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {selectedPose.howTo}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  সম্পর্কের উপকারিতা (Relationship Benefit)
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {selectedPose.benefits}
                </p>
              </div>

              <div className="bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/50 dark:border-pink-900/40 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5">
                <Sparkles size={16} className="text-pink-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] sm:text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                    ঘনিষ্ঠতার টিপস (Intimacy Tip)
                  </span>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {selectedPose.tip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* परिस्थिति নির্ধারণকারী ডাইস */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Dices size={18} className="text-pink-500" />
                <span>পরিস্থিতি ডাইস (Scenario Dice)</span>
              </h2>
              <button
                onClick={() => {
                  getAudioContext();
                  rollDice();
                }}
                disabled={isRollingDice}
                className="text-[11px] sm:text-xs text-pink-500 hover:text-pink-600 font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <RotateCw size={11} className={isRollingDice ? "animate-spin" : ""} />
                ডাইস রোল করুন
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ভঙ্গিগুলোর সাথে একটু রোমাঞ্চ যোগ করতে ডাইস রোল করে এলোমেলো স্থান ও বিশেষ শর্ত বেছে নিন।
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
              {/* ডাইস ১: স্থান */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 sm:mb-2">
                  📍 স্থান (Location)
                </span>
                <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[32px] sm:min-h-[36px] flex items-center justify-center">
                  {currentLocation}
                </p>
              </div>

              {/* ডাইস ২: বিশেষ শর্ত */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1.5 sm:mb-2">
                  🎲 বিশেষ শর্ত (Condition)
                </span>
                <p className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[32px] sm:min-h-[36px] flex items-center justify-center">
                  {currentMood}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ফুটার নির্দেশিকা */}
      <footer className="max-w-4xl mx-auto px-4 mt-8 sm:mt-12 text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <HelpCircle size={14} />
          <span>ঘনিষ্ঠতা ও পারস্পরিক যোগাযোগের সাধারণ নিয়মাবলি</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-lg mx-auto">
          কিউপিড রুলেট সম্পর্কের মধুরতা এবং কৌতুকপূর্ণ অন্বেষণের জন্য তৈরি করা হয়েছে। পারস্পরিক সম্মতি, শারীরিক স্বাচ্ছন্দ্য এবং সরাসরি যোগাযোগ সবচেয়ে জরুরি। সবসময় ধীরলয়ে এগিয়ে যান, পেশীর সুরক্ষায় বালিশ বা কুশন ব্যবহার করুন এবং একে অপরের সান্নিধ্য উপভোগ করুন!
        </p>
      </footer>
    </div>
  );
}
