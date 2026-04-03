import { Section } from "./Section";
import { GraduationCap, Briefcase, Calendar, ChevronRight } from "lucide-react";

const experience = [
  {
    type: "Project Lead",
    title: "Founder & Lead Developer",
    organization: "গ্রামরক্তি (GramRokti)",
    period: "2023 - Present",
    description: "Spearheading the development of a blood donation platform aimed at rural accessibility and impact.",
    icon: Briefcase,
  },
];

export const ExperienceSection = () => {
  return (
    <Section id="experience" title="Professional Path" index="03">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          {experience.map((item, index) => (
            <div
              key={item.title}
              className="relative pl-8 border-l-2 border-border/50 hover:border-primary/50 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${(index + 1) * 150}ms` }}
            >
              {/* Dot decoration */}
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-secondary text-primary text-[10px] font-mono mb-2 uppercase tracking-widest">
                    <item.icon size={12} />
                    {item.type}
                  </div>
                  <h4 className="text-xl font-bold text-foreground font-mono">{item.title}</h4>
                </div>
                <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground whitespace-nowrap">
                  <Calendar size={14} className="text-primary/70" />
                  {item.period}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-accent font-mono mb-2">{item.organization}</p>
                <p className="text-muted-foreground leading-relaxed max-w-2xl">{item.description}</p>
              </div>

              <div className="flex items-center gap-4 text-[10px] font-mono text-primary/70 uppercase tracking-widest group cursor-default">
                <span>View project case study</span>
                <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};
