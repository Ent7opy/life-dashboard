"use client";

import { useState, useEffect } from "react";
import { NowSection }      from "@/components/sections/NowSection";
import { LearningSection } from "@/components/sections/LearningSection";
import { SkillsSection }   from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import BookList    from "@/components/BookList";
import WeeklyReview from "@/components/WeeklyReview";

export default function Home() {
  // Guard against Zustand persist / localStorage hydration mismatches on SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="min-h-screen flex justify-center py-20">
      <div className="w-full max-w-[780px] px-8">
        <NowSection />
        <LearningSection />
        <SkillsSection />
        <ProjectsSection />

        <section id="reading" className="mb-16 scroll-mt-20">
          <BookList />
        </section>

        <section id="review" className="pb-32 scroll-mt-20">
          <WeeklyReview />
        </section>
      </div>
    </div>
  );
}
