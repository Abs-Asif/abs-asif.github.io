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
  category: "আলিঙ্গন" | "গভীর ঘনিষ্ঠতা" | "আনন্দদায়ক" | "সংবেদনশীল" | "অ্যাক্রোবেটিক";
  spiciness: number; // ১ থেকে ৫
  description: string;
  howTo: string;
  benefits: string;
  tip: string;
  illustration: React.ReactNode;
}

// বাস্তব যৌনভঙ্গির ন্যূনতম এবং চমৎকার লাইন-আর্ট ইলাস্ট্রেশন (Rose & Cyan)
const PosesData: Pose[] = [
  {
    id: "missionary",
    name: "ক্লাসিক মিশনারি (Classic Missionary)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 3,
    description: "সবচেয়ে জনপ্রিয় এবং সনাতন আসন। এটি গভীর চোখের যোগাযোগ, চুম্বন এবং পারস্পরিক নৈকট্য নিশ্চিত করে সম্পর্ককে আরও দৃঢ় করে।",
    howTo: "একজন সঙ্গী বিছানায় পিঠ ঠেকিয়ে সোজা হয়ে শুয়ে থাকবেন এবং অপর সঙ্গী তাঁর ওপরে থাকবেন। দুই জনের মুখ মুখোমুখি থাকবে এবং ওপরের সঙ্গী হাতের কনুইয়ের ওপর ভর দিয়ে ভারসাম্য রাখবেন।",
    benefits: "নিরাপত্তা ও গভীর মানসিক বন্ধন তৈরি করে, দীর্ঘস্থায়ী চোখের যোগাযোগ ও রোমান্টিক কথোপকথন বজায় রাখা সহজ হয়।",
    tip: "নিচের সঙ্গীর কোমরের নিচে একটি নরম পাতলা বালিশ দিলে আরাম ও কোণ (angle) অনেক উন্নত হয় এবং অনুভূতি আরও তীব্র হয়।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff758c" />
            <stop offset="100%" stopColor="#ff7eb3" />
          </linearGradient>
          <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>
          <filter id="glow-p" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Lying Partner (Rose) */}
        <path d="M 30 140 C 60 140, 110 140, 130 140 C 145 120, 155 105, 165 140" stroke="url(#grad-rose)" strokeWidth="5" strokeLinecap="round" filter="url(#glow-p)" />
        <circle cx="35" cy="120" r="8" fill="#ff758c" />
        {/* Top Partner (Cyan) */}
        <path d="M 45 110 C 70 105, 120 120, 150 135" stroke="url(#grad-cyan)" strokeWidth="5" strokeLinecap="round" />
        <path d="M 60 110 L 70 140" stroke="url(#grad-cyan)" strokeWidth="4" strokeLinecap="round" /> {/* Supporting Arm */}
        <circle cx="50" cy="92" r="8" fill="#00b4d8" />
        {/* Romantic Glow sparkles */}
        <circle cx="100" cy="80" r="3" fill="#ff7eb3" className="animate-pulse" />
        <circle cx="130" cy="90" r="2" fill="#00b4d8" />
      </svg>
    )
  },
  {
    id: "doggy_style",
    name: "ডগি স্টাইল (Doggy Style)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "একটি অত্যন্ত আকর্ষণীয় ও রোমাঞ্চকর আসন, যা গভীর শারীরিক সংযোগ এবং গতির স্বাধীনতা দেয়।",
    howTo: "একজন সঙ্গী হাত ও হাঁটুর ওপর ভর দিয়ে হামাগুড়ি দেওয়ার ভঙ্গিতে থাকবেন। অপর সঙ্গী পেছন থেকে হাঁটু গেড়ে বসার অবস্থানে থাকবেন এবং সামনের সঙ্গীর কোমর স্পর্শ করে ছন্দে সাহায্য করবেন।",
    benefits: "কোমর ধরে নিয়ন্ত্রণ করার চমৎকার সুযোগ দেয়, শারীরিক উত্তেজনা দ্রুত বৃদ্ধি করে এবং গভীর সংযোগে সহায়তা করে।",
    tip: "গতি ধীর রেখে হালকা স্পর্শ এবং গভীর নিশ্বাসের সমন্বয় করলে এটি আরও বেশি সংবেদনশীল ও দীর্ঘস্থায়ী হয়ে ওঠে।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-rose2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff758c" />
            <stop offset="100%" stopColor="#ff7eb3" />
          </linearGradient>
          <linearGradient id="grad-cyan2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>
        </defs>
        {/* Kneeling Partner A (Rose) */}
        <path d="M 60 145 L 85 145 L 95 110 C 115 95, 145 95, 160 105 L 170 145" stroke="url(#grad-rose2)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="170" cy="90" r="8" fill="#ff758c" />
        {/* Entering Partner B (Cyan) */}
        <path d="M 25 145 L 50 145 L 60 105 C 75 85, 100 85, 115 90" stroke="url(#grad-cyan2)" strokeWidth="5" strokeLinecap="round" />
        <path d="M 85 90 L 105 105" stroke="url(#grad-cyan2)" strokeWidth="4" strokeLinecap="round" /> {/* Arm reaching waist */}
        <circle cx="70" cy="70" r="8" fill="#00b4d8" />
      </svg>
    )
  },
  {
    id: "cowgirl",
    name: "ক্লাসিক কাউগার্ল (Classic Cowgirl)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "এই ভঙ্গিতে ওপরের সঙ্গী সম্পূর্ণ নিয়ন্ত্রণে থাকেন এবং নিজের ছন্দ, গভীরতা ও কোণ নিজেই পরিচালনা করতে পারেন।",
    howTo: "নিচের সঙ্গী পিঠের ওপর সোজা হয়ে শুয়ে থাকবেন। ওপরের সঙ্গী তাঁর ওপর মুখোমুখি বসে হাঁটু গেড়ে বসার অবস্থানে থাকবেন এবং নিজের পছন্দমতো ছন্দে কোমর নড়াচড়া করবেন।",
    benefits: "নিয়ন্ত্রণ নেওয়ার অনুভূতি আত্মবিশ্বাস বাড়ায় এবং শারীরিক ক্লান্তি দূর করে গভীর তৃপ্তি দেয়।",
    tip: "নিচের সঙ্গী শুয়ে থেকে কোমরের আলতো নড়াচড়া ও পিঠ স্পর্শ করার মাধ্যমে ছন্দে সাহায্য করতে পারেন।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-rose3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff758c" />
            <stop offset="100%" stopColor="#ff7eb3" />
          </linearGradient>
          <linearGradient id="grad-cyan3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="100%" stopColor="#0077b6" />
          </linearGradient>
        </defs>
        {/* Lying Partner A (Cyan) */}
        <path d="M 30 140 L 120 140 C 130 115, 140 100, 160 140" stroke="url(#grad-cyan3)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="35" cy="120" r="8" fill="#00b4d8" />
        {/* Sitting Partner B (Rose) */}
        <path d="M 115 140 L 130 105 L 120 60" stroke="url(#grad-rose3)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="120" cy="45" r="8" fill="#ff758c" />
      </svg>
    )
  },
  {
    id: "reverse_cowgirl",
    name: "বিপরীত কাউগার্ল (Reverse Cowgirl)",
    category: "আনন্দদায়ক",
    spiciness: 5,
    description: "কাউগার্ল আসনের একটি রোমাঞ্চকর রূপ, যেখানে ওপরের সঙ্গী উল্টো দিকে মুখ করে বসেন, যা নতুন এক অনুভূতি ও আকর্ষণীয় কোণ দেয়।",
    howTo: "নিচের সঙ্গী বিছানায় সোজা শুয়ে থাকবেন। অপর সঙ্গী তাঁর ওপর এমনভাবে উল্টো করে বসবেন যেন তাঁর পিঠ নিচের সঙ্গীর মুখের দিকে থাকে এবং হাঁটু গেড়ে নড়াচড়া করবেন।",
    benefits: "চমৎকার দৃশ্যমান অনুভূতি এবং সম্পূর্ণ ভিন্ন কোণ থেকে গভীর শারীরিক সংযোগ তৈরি করে।",
    tip: "পেছনের দিকে সামান্য ঝুঁকে নিচের সঙ্গীর পা বা হাঁটু স্পর্শ করলে ভারসাম্য বজায় রাখা এবং ছন্দ নিয়ন্ত্রণ করা সহজ হয়।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Lying Partner A (Cyan) */}
        <path d="M 30 140 L 120 140 C 135 115, 145 105, 160 140" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="35" cy="120" r="8" fill="#00b4d8" />
        {/* Reverse Sitting Partner B (Rose) */}
        <path d="M 125 140 L 110 105 L 130 65" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="140" cy="55" r="8" fill="#ff758c" />
      </svg>
    )
  },
  {
    id: "cozy_spooning",
    name: "কোজি স্পুনিং (Cozy Spooning)",
    category: "আলিঙ্গন",
    spiciness: 2,
    description: "আরামদায়ক ও ধীরগতির চমৎকার একটি অলস সকাল বা ক্লান্ত রাতের জন্য উপযুক্ত ভঙ্গি, যা স্বস্তি দেয়।",
    howTo: "উভয় সঙ্গী একই দিকে মুখ করে একপাশে কাত হয়ে শোবেন। পেছনের সঙ্গী সামনের সঙ্গীকে আলতো করে জড়িয়ে ধরে পিঠ স্পর্শ করে শোবেন।",
    benefits: "অহেতুক ক্লান্তি ছাড়াই দীর্ঘ সময় কাটানো যায় এবং শরীরের সর্বোচ্চ স্পর্শের মাধ্যমে নিরাপত্তা বৃদ্ধি পায়।",
    tip: "উভয়ের শ্বাস-প্রশ্বাসের গতি এক করুন—একসাথে শ্বাস নেওয়া এবং ছাড়া গভীর আত্মিক একাত্মতা তৈরি করে।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Under Partner (Rose) */}
        <path d="M 60 140 C 35 110, 35 70, 75 50 C 95 40, 115 50, 120 70" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        {/* Outer Partner (Cyan) */}
        <path d="M 80 155 C 55 120, 55 80, 95 60 C 115 50, 135 60, 140 80" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "tantric_lotus",
    name: "তান্ত্রিক লোটাস (Tantric Lotus)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 3,
    description: "প্রাচীন তান্ত্রিক আসন, যা দ্রুত নড়াচড়ার চেয়ে গভীর চোখের যোগাযোগ, আলিঙ্গন এবং আধ্যাত্মিক সংযোগকে প্রাধান্য দেয়।",
    howTo: "একজন সঙ্গী বাবু হয়ে বা পা গুটিয়ে সোজা হয়ে বসবেন। অপর সঙ্গী তাঁর কোলে উঠে পা দুটি প্রথম সঙ্গীর কোমরের চারপাশে জড়িয়ে দিয়ে মুখোমুখি বসবেন।",
    benefits: "অত্যন্ত গভীর মানসিক ও আত্মিক সংযোগ তৈরি করে এবং একে অপরের হৃদস্পন্দন সরাসরি অনুভব করা যায়।",
    tip: "কমপক্ষে ২ মিনিট একদম স্থির থেকে শুধু চোখে চোখ রেখে গভীর শ্বাস নিন। চারপাশের কোলাহল হারিয়ে যাবে।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Seated Partner A (Cyan) */}
        <path d="M 60 150 C 60 120, 90 110, 90 150 M 65 150 L 65 100" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="65" cy="85" r="8" fill="#00b4d8" />
        {/* Seated Partner B (Rose) */}
        <path d="M 125 150 C 120 120, 95 110, 95 150 M 115 150 L 110 100" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="110" cy="85" r="8" fill="#ff758c" />
      </svg>
    )
  },
  {
    id: "standing_embrace",
    name: "দাঁড়ানো কোলাকুলি (Standing Embrace)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 5,
    description: "একটি অত্যন্ত রোমাঞ্চকর ও উদ্দীপনামূলক আসন, যা প্রচুর শারীরিক শক্তি এবং সামর্থ্যের দাবি রাখে।",
    howTo: "একজন সঙ্গী সোজা হয়ে দাঁড়িয়ে থাকবেন এবং অপর সঙ্গীকে কোলে তুলে নেবেন। কোলে থাকা সঙ্গী পা দিয়ে প্রথম সঙ্গীর কোমর জড়িয়ে রাখবেন এবং পিঠ দেয়ালে ঠেকিয়ে ভারসাম্য রাখবেন।",
    benefits: "মুহূর্তের মধ্যে শরীরে রোমাঞ্চ ও অ্যাড্রেনালিন বাড়িয়ে তোলে এবং শক্তি সঞ্চার করে।",
    tip: "উচ্চতার সামঞ্জস্য এবং ভারসাম্য আনতে দাঁড়িয়ে থাকা সঙ্গী একটি শক্ত দেয়ালের সাহায্য নিতে পারেন।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Standing Partner A (Cyan) */}
        <path d="M 80 170 L 80 80" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="80" cy="65" r="8" fill="#00b4d8" />
        {/* Wrapped Partner B (Rose) */}
        <path d="M 80 110 C 100 110, 115 95, 120 85 M 80 110 C 65 110, 55 125, 60 145" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="110" cy="70" r="8" fill="#ff758c" />
      </svg>
    )
  },
  {
    id: "scissors",
    name: "কাঁচি ভঙ্গি (The Scissors)",
    category: "সংবেদনশীল",
    spiciness: 3,
    description: "একটি চমৎকার শান্ত ও আরামদায়ক ভঙ্গি, যেখানে পা দুটি কাঁচির মতো কোণ করে থাকে এবং ধীর গতির ঘর্ষণ দেয়।",
    howTo: "উভয় সঙ্গী সামনাসামনি শুয়ে থাকবেন, তবে তাদের শরীর একে অপরের সাথে একটি ৪৫ ডিগ্রি কোণ তৈরি করবে এবং পাগুলো আড়াআড়ি থাকবে।",
    benefits: "ধীরগতির শারীরিক সুখ উপভোগ এবং দীর্ঘ সময় নিয়ে নিবিড় প্রেমালাপ করার জন্য উপযুক্ত।",
    tip: "শরীরের ভারসাম্যকে আরামদায়ক করতে হালকা পাতলা কুশন কোমরের নিচে বা পায়ের মাঝে ব্যবহার করতে পারেন।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Intersecting line curves representing legs & hips */}
        <path d="M 30 130 L 170 100" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        <path d="M 30 110 L 170 140" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "bridge_pose",
    name: "ধনুক ভঙ্গি / ব্রিজ (The Bridge Pose)",
    category: "অ্যাক্রোবেটিক",
    spiciness: 4,
    description: "সঙ্গীর শরীরকে সেতুর মতো বাঁকিয়ে তোলা হয়, যা চমৎকার শারীরিক নমনীয়তা দেয় এবং ভিন্ন কোণ তৈরি করে।",
    howTo: "নিচের সঙ্গী শুয়ে হাঁটু ভাঁজ করে কোমর ওপরের দিকে উঠিয়ে সেতুর মতো ভঙ্গি করবেন। অপর সঙ্গী ওপর থেকে মুখোমুখি সংযোগ স্থাপন করবেন।",
    benefits: "কোমরের পেশী মজবুত করে এবং গভীর ও নিবিড় শারীরিক কোণ তৈরি করে আনন্দ দেয়।",
    tip: "কোমর সোজা ও স্থির রাখতে হিপসের নিচে শক্ত কুশন ব্যবহার করলে কষ্ট কম হয় এবং অনেকক্ষণ থাকা যায়।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* High Arched Line (Rose) */}
        <path d="M 30 150 C 30 70, 170 70, 170 150" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        {/* Kneeling Partner B (Cyan) */}
        <path d="M 70 150 L 95 120 C 110 110, 120 110, 130 120" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "velvet_kiss",
    name: "ভেলভেট কিস (The Velvet Kiss)",
    category: "সংবেদনশীল",
    spiciness: 3,
    description: "ঠোঁট, স্পর্শ এবং উষ্ণ নিশ্বাসের পারস্পরিক খেলা। এটি ব্যাকুলতা এবং স্পর্শের সংবেদনশীলতা বহুগুণ বাড়িয়ে দেয়।",
    howTo: "একজন সঙ্গী সম্পূর্ণ শিথিল হয়ে চোখ বন্ধ করে শুয়ে থাকবেন। অপর সঙ্গী তাঁর ঘাড়, কাঁধ, বুক এবং সমস্ত সংবেদনশীল স্থানে অতি ধীরলয়ে ঠোঁটের ছোঁয়া দেবেন।",
    benefits: "ত্বকের স্পর্শানুভূতি জাগিয়ে তোলে এবং মূল মিলনের আগে চমৎকার ব্যাকুলতা সৃষ্টি করে।",
    tip: "চুম্বনের ঠিক আগে সামান্য ঠান্ডা জল বা মৃদু উষ্ণ চা পান করে ঠোঁটের তাপমাত্রা বদলে দিয়ে সঙ্গীকে চমকে দিন!",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Curved Neck Line (Cyan) */}
        <path d="M 30 150 C 60 130, 90 90, 140 80" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        {/* Plump lips kissing (Rose) */}
        <path d="M 120 85 C 115 75, 100 75, 95 85 C 100 95, 115 95, 120 85 Z" fill="#ff758c" />
      </svg>
    )
  },
  {
    id: "intimacy_loop",
    name: "৬৯ লুপ (The 69 Loop)",
    category: "গভীর ঘনিষ্ঠতা",
    spiciness: 5,
    description: "পারস্পরিক আনন্দের এক অতুলনীয় ভঙ্গি। এখানে উভয় সঙ্গী সমানভাবে একে অপরকে সুখ দিতে এবং উপভোগ করতে পারেন।",
    howTo: "উভয় সঙ্গী বিপরীত মুখী হয়ে একজন আরেকজনের ওপরে বা পাশে শুয়ে মুখোমুখি ঘনিষ্ঠ অবস্থানে মুখ ও সংবেদনশীল স্থান মেলাবেন।",
    benefits: "পারস্পরিক সমান অধিকার ও অংশীদারিত্ব নিশ্চিত করে এবং শারীরিক সুখের এক চরম সীমায় নিয়ে যায়।",
    tip: "ছন্দ ধীর রাখুন, যখন একজন সক্রিয়ভাবে উপভোগ করছেন, অন্যজন তখন নিজের শরীর শিথিল রাখুন।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Two Interlocking Curved Yin-Yang Style Shapes */}
        <path d="M 70 110 C 70 80, 110 80, 110 110 C 110 130, 90 145, 70 145 C 50 145, 40 130, 40 110" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <path d="M 130 90 C 130 120, 90 120, 90 90 C 90 70, 110 55, 130 55 C 150 55, 160 70, 160 90" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "lap_chair",
    name: "ল্যাপ চেয়ার (The Lap Chair)",
    category: "সংবেদনশীল",
    spiciness: 3,
    description: "একটি অত্যন্ত আরামদায়ক এবং মুখোমুখি বসার আসন, যেখানে নিবিড়ভাবে জড়িয়ে ধরে রাখা ও চুম্বন করা যায়।",
    howTo: "একজন সঙ্গী খাটের বা চেয়ারের প্রান্তে সোজা হয়ে বসবেন। অপর সঙ্গী তাঁর কোলে মুখোমুখি বসে হাত এবং পা দিয়ে জড়িয়ে ধরবেন।",
    benefits: "দুই জনের হাত সম্পূর্ণ মুক্ত থাকে একে অপরের পিঠ, কোমর বা চুল ম্যাসাজ এবং আদর করার জন্য।",
    tip: "একে অপরের কানে প্রেমের ফিসফিসানি বা রোমান্টিক প্রশংসা এই ভঙ্গির গভীরতা ও আত্মিক সুখ বহুগুণ বাড়িয়ে দেয়।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Seated Partner A (Cyan) */}
        <path d="M 60 150 L 100 150 L 100 110 L 70 110 L 70 60" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="70" cy="45" r="8" fill="#00b4d8" />
        {/* Wrapped Partner B (Rose) */}
        <path d="M 100 110 L 90 110 L 90 70" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="90" cy="55" r="8" fill="#ff758c" />
      </svg>
    )
  },
  {
    id: "melting_huddle",
    name: "মেল্টিং হাডল (Melting Huddle)",
    category: "আলিঙ্গন",
    spiciness: 1,
    description: "পারস্পরিক পরম শান্তির গভীর আলিঙ্গন, যেখানে দুটি ভালোবাসার শরীর একসাথে মিশে এক হয়ে যায়।",
    howTo: "একে অপরকে অত্যন্ত শক্ত করে জড়িয়ে ধরে কাত হয়ে শোবেন, পাগুলো আলতোভাবে একে অপরের ওপর জড়ানো থাকবে এবং মাথা থাকবে সঙ্গীর বুকে।",
    benefits: "পারস্পরিক গভীর নিরাপত্তাবোধ এবং দুশ্চিন্তা ও ক্লান্তি দূর করতে এটি চমৎকার মহৌষধ হিসেবে কাজ করে।",
    tip: "মৃদু আলো এবং নরম সুরের মাঝে চোখ বন্ধ করে শুধু একে অপরের হৃদস্পন্দনের শব্দ শুনুন।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Nested Waves representing extreme cozy closeness */}
        <path d="M 50 110 Q 100 130 150 110" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <path d="M 45 120 Q 100 140 155 120" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: "standing_lean",
    name: "ঝুঁকে থাকা ভঙ্গি (The Standing Lean)",
    category: "আনন্দদায়ক",
    spiciness: 4,
    description: "বিছানার কোণে বা কোনো টেবিলের ওপর ঝুঁকে থেকে করা একটি উদ্দীপক আসন যা চমৎকার শারীরিক নিয়ন্ত্রণ দেয়।",
    howTo: "একজন সঙ্গী বিছানা বা টেবিলের প্রান্তে শরীর সামান্য ঝুঁকিয়ে দুই হাত দিয়ে ভর দেবেন। অপর সঙ্গী তাঁর পেছনে দাঁড়িয়ে কোমর ধরে সংযোগ করবেন।",
    benefits: "অত্যন্ত সহজ অথচ গভীর শারীরিক সংযোগ ও চমৎকার নিয়ন্ত্রণ দেয় এবং দ্রুত সম্পন্ন করার জন্য দারুণ।",
    tip: "ভর দেওয়ার জায়গায় নরম তোয়ালে বা কুশন ব্যবহার করলে কনুই বা হাত ব্যথা হওয়া থেকে রক্ষা পাওয়া যায়।",
    illustration: (
      <svg viewBox="0 0 200 200" className="w-full h-full max-h-[220px]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaning Partner A (Rose) */}
        <path d="M 50 150 L 90 150 L 110 110 L 140 110" stroke="#ff758c" strokeWidth="5" strokeLinecap="round" />
        <circle cx="145" cy="95" r="8" fill="#ff758c" />
        {/* Behind Partner B (Cyan) */}
        <path d="M 60 155 L 80 155 L 90 115 L 75 80" stroke="#00b4d8" strokeWidth="5" strokeLinecap="round" />
        <circle cx="70" cy="65" r="8" fill="#00b4d8" />
      </svg>
    )
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
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
                  কিউপিড রুলেট (Cupid's Roulette)
                </h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider hidden sm:block">
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
              className={`p-2.5 rounded-2xl transition-all ${
                soundEnabled
                  ? "bg-pink-50 dark:bg-pink-950/40 text-pink-500"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
              title={soundEnabled ? "শব্দ বন্ধ করুন" : "শব্দ চালু করুন"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* মূল কন্টেন্ট */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* বাম পাশ - রুলেট */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* ফিল্টার সমূহ */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                উষ্ণতার মাত্রা (Spiciness)
              </span>
              <div className="flex gap-1.5">
                {["All", 1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setSpicinessFilter(level as any);
                      getAudioContext();
                    }}
                    className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all ${
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
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                আসন বা ভঙ্গির ধরণ (Category)
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  getAudioContext();
                }}
                className="bg-slate-50 dark:bg-slate-700 border-none outline-none rounded-xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer min-w-[140px]"
              >
                <option value="All">🌌 সব ক্যাটাগরি</option>
                <option value="আলিঙ্গন">🧸 আলিঙ্গন (Cuddling)</option>
                <option value="গভীর ঘনিষ্ঠতা">💖 গভীর ঘনিষ্ঠতা (Intimate)</option>
                <option value="আনন্দদায়ক">⚡ আনন্দদায়ক (Playful)</option>
                <option value="সংবেদনশীল">🌸 সংবেদনশীল (Sensation)</option>
                <option value="অ্যাক্রোবেটিক">🤸 অ্যাক্রোবেটিক (Acrobatic)</option>
              </select>
            </div>
          </div>

          {/* রুলেট ডিসপ্লে */}
          <div className="relative bg-gradient-to-br from-slate-900 to-slate-950 rounded-[40px] p-6 md:p-8 shadow-2xl border-4 border-pink-500/30 flex flex-col items-center justify-between min-h-[440px] overflow-hidden group">
            {/* ব্যাকগ্রাউন্ড গ্রিড */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-pink-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* টাইটেল রিবন */}
            <div className="relative z-10 bg-slate-800/80 backdrop-blur-md py-1.5 px-4 rounded-full border border-slate-700 text-[11px] font-bold text-pink-400 uppercase tracking-widest shadow-inner mb-4 flex items-center gap-1.5">
              <Sparkles size={12} className="animate-spin text-pink-400" />
              <span>ভঙ্গির দৈবচয়ন (ROULETTES)</span>
            </div>

            {/* ইলাস্ট্রেশন ফ্রেম */}
            <div className="w-full flex-1 flex flex-col items-center justify-center relative py-4">
              {isRolling ? (
                // রোটেটিং স্টেজ
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-24 h-24 rounded-full border-4 border-pink-500/40 border-t-pink-500 animate-spin"></div>
                  <p className="text-sm font-semibold tracking-wider text-pink-500 uppercase font-mono animate-bounce mt-2">
                    ভঙ্গি বাছাই করা হচ্ছে...
                  </p>
                </div>
              ) : filteredPoses.length === 0 ? (
                // নো পোজ স্টেজ
                <div className="text-center py-8 space-y-3">
                  <p className="text-slate-500 text-sm">এই ক্যাটাগরিতে কোনো ভঙ্গি খুঁজে পাওয়া যায়নি।</p>
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
                // আসল পোজ
                <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                  {/* ইলাস্ট্রেশন */}
                  <div className="w-full max-w-[260px] aspect-square flex items-center justify-center mb-4 relative drop-shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                    {selectedPose.illustration}
                  </div>

                  {/* বিস্তারিত */}
                  <div className="text-center space-y-2 max-w-lg relative z-10 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="bg-pink-500/15 text-pink-400 border border-pink-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {selectedPose.category}
                      </span>
                      <span className="text-amber-400 text-xs font-bold flex items-center gap-0.5">
                        <Flame size={12} fill="currentColor" />
                        {"🔥".repeat(selectedPose.spiciness)}
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {selectedPose.name}
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-md mx-auto italic">
                      "{selectedPose.description}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* রুলেট ঘোরানোর মূল বোতাম */}
            <div className="w-full relative z-10 pt-4 flex justify-center">
              <button
                onClick={() => {
                  getAudioContext();
                  rollRoulette();
                }}
                disabled={isRolling}
                className="w-full max-w-[320px] py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white text-md font-bold rounded-2xl shadow-xl shadow-pink-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 border border-white/20 disabled:opacity-50"
              >
                <Heart size={20} fill="currentColor" className={isRolling ? "animate-spin" : "animate-bounce"} />
                <span>{isRolling ? "বাছাই করা হচ্ছে..." : "রুলেট ঘোরান 💘"}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ডান পাশ - গাইডবুক ও ডাইস */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* গাইডবুক কার্ড */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <Compass size={18} className="text-pink-500" />
              <span>ভঙ্গি নির্দেশিকা (Pose Playbook)</span>
            </h2>

            <div className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-pink-500 dark:text-pink-400 uppercase tracking-widest block">
                  কীভাবে করবেন (How to Practice)
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPose.howTo}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                  সম্পর্কের উপকারিতা (Relationship Benefit)
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedPose.benefits}
                </p>
              </div>

              <div className="bg-pink-50/50 dark:bg-pink-950/20 border border-pink-100/50 dark:border-pink-900/40 rounded-2xl p-3.5 flex items-start gap-2.5">
                <Sparkles size={16} className="text-pink-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                    ঘনিষ্ঠতার টিপস (Intimacy Tip)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {selectedPose.tip}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* পরিস্থিতি নির্ধারণকারী ডাইস */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700/50 pb-2">
              <h2 className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Dices size={18} className="text-pink-500" />
                <span>পরিস্থিতি ডাইস (Scenario Dice)</span>
              </h2>
              <button
                onClick={() => {
                  getAudioContext();
                  rollDice();
                }}
                disabled={isRollingDice}
                className="text-xs text-pink-500 hover:text-pink-600 font-bold flex items-center gap-1 active:scale-95 transition-all"
              >
                <RotateCw size={12} className={isRollingDice ? "animate-spin" : ""} />
                ডাইস রোল করুন
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ভঙ্গিগুলোর সাথে একটু রোমাঞ্চ যোগ করতে ডাইস রোল করে এলোমেলো স্থান ও বিশেষ শর্ত বেছে নিন।
            </p>

            <div className="grid grid-cols-2 gap-4 pt-1">
              {/* ডাইস ১: স্থান */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  📍 স্থান (Location)
                </span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[36px] flex items-center justify-center">
                  {currentLocation}
                </p>
              </div>

              {/* ডাইস ২: বিশেষ শর্ত */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden group">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  🎲 বিশেষ শর্ত (Condition)
                </span>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 min-h-[36px] flex items-center justify-center">
                  {currentMood}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ফুটার নির্দেশিকা */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <HelpCircle size={14} />
          <span>ঘনিষ্ঠতা ও পারস্পরিক যোগাযোগের সাধারণ নিয়মাবলি</span>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-lg mx-auto">
          কিউপিড রুলেট সম্পর্কের মধুরতা এবং কৌতুকপূর্ণ অন্বেষণের জন্য তৈরি করা হয়েছে। পারস্পরিক সম্মতি, শারীরিক স্বাচ্ছন্দ্য এবং সরাসরি যোগাযোগ সবচেয়ে জরুরি। সবসময় ধীরলয়ে এগিয়ে যান, পেশীর সুরক্ষায় বালিশ বা কুশন ব্যবহার করুন এবং একে অপরের সান্নিধ্য উপভোগ করুন!
        </p>
      </footer>
    </div>
  );
}
