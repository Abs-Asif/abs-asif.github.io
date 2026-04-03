import { Section } from "./Section";
import { Code2, Database, Layout, Lightbulb, Stethoscope, Terminal } from "lucide-react";

const skills = [
  {
    category: "Frontend Development",
    icon: Layout,
    items: ["React", "TypeScript", "Tailwind CSS", "Vite", "Next.js"]
  },
  {
    category: "Backend & Database",
    icon: Database,
    items: ["Node.js", "Supabase", "Firebase", "PostgreSQL", "REST APIs"]
  },
  {
    category: "Mobile & Tools",
    icon: Terminal,
    items: ["Capacitor", "Git/GitHub", "Vercel", "npm/bun", "Postman"]
  },
  {
    category: "Medical Informatics",
    icon: Stethoscope,
    items: ["Health Data Systems", "Medical Terminology", "Clinical Workflow", "EMR Integration"]
  }
];

export const SkillsSection = () => {
  return (
    <Section id="skills" title="Technical Arsenal" index="01">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skills.map((skill, index) => (
          <div
            key={skill.category}
            className="p-6 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/50 transition-all group"
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-surface-1 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <skill.icon size={20} className="text-primary" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-4 font-mono">{skill.category}</h4>
            <ul className="space-y-2">
              {skill.items.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1 h-1 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};
