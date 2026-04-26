export const Footer = () => {
  return (
    <footer className="w-full border-t border-border py-8 mt-auto">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Abdullah Bari Asif. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Seeking truth through research and reflection.
        </p>
      </div>
    </footer>
  );
};
