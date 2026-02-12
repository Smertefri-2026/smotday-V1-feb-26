// /Users/oystein/nettsider/smotday-v1-feb-26/src/app/page.tsx
import Section1Hero from "@/app/(public)/sections/Section1Hero";
import Section2QuickTracker from "@/app/(public)/sections/Section2QuickTracker";
import Section3Coverage from "@/app/(public)/sections/Section3Coverage";
import Section4SmoodayMatch from "@/app/(public)/sections/Section4SmoodayMatch";
import Section5Coaching from "@/app/(public)/sections/Section5Coaching";
import Section6AppCTA from "@/app/(public)/sections/Section6AppCTA";
import Section7Contact from "@/app/(public)/sections/Section7Contact";

export default function HomePage() {
  return (
    <div className="hero-grad">
      <Section1Hero />
      <Section2QuickTracker />
      <Section3Coverage />
      <Section4SmoodayMatch />
      <Section5Coaching />
      <Section6AppCTA />
      <Section7Contact />
    </div>
  );
}