import profileTransparent from "@/assets/profile-transparent.png";

export const HeroSection = () => {
  return (
    <section className="pt-20 pb-10 flex flex-col items-center justify-center text-center px-4 relative">
      <div className="w-64 h-64 mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
        <img
          src={profileTransparent}
          alt="Md. Abdullah Bari"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      <div className="max-w-2xl animate-fade-in-up opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Md. Abdullah Bari
        </h1>
      </div>
    </section>
  );
};
