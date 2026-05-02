export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-border/50 bg-transparent relative overflow-hidden">
      <div className="container text-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          © {currentYear} Md. Abdullah Bari
        </p>
      </div>
    </footer>
  );
};
