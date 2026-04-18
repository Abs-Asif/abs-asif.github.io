import { useEffect, useRef } from 'react';

const Nikah = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We want to load the cloned site into this page.
    // Since it's a full HTML page, an iframe is the cleanest way to embed it
    // without clashing with the existing React app's styles and scripts.
    // However, the user wants it at path "/nikah", so we should ideally
    // make it look like part of the site or just serve it directly if possible.
    // Given the constraints of a SPA, an iframe or a manual injection is possible.
  }, []);

  return (
    <div className="w-full h-screen border-none overflow-hidden">
      <iframe
        src="/nikah_site/index.html"
        className="w-full h-full border-none"
        title="NikahGuard"
      />
    </div>
  );
};

export default Nikah;
