import { useState } from "react";
import { Mail, Phone, MessageCircle } from "lucide-react";

const contactLinks = [
  {
    icon: Phone,
    label: "Primary Contact",
    value: "01738745285",
    href: "tel:01738745285",
    style: "m3-secondary-tonal",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp / Call",
    value: "01538310838",
    href: "https://wa.me/8801538310838",
    style: "m3-secondary-tonal",
  },
  {
    icon: Phone,
    label: "IP Call (Backup)",
    value: "09638250306",
    href: "tel:09638250306",
    style: "m3-secondary-tonal",
  },
];

const emailLink = {
  icon: Mail,
  label: "Email Me",
  value: "contact@abdullah.ami.bd",
  href: "mailto:contact@abdullah.ami.bd",
  style: "m3-tonal",
};

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const ContactSection = () => {
  const [emailRevealed, setEmailRevealed] = useState(false);

  return (
    <section id="contact" className="pb-24 px-4">
      <div className="max-w-md mx-auto space-y-4">
        {contactLinks.map((link, index) => (
          <div
            key={link.value}
            className="animate-fade-in-up opacity-0"
            style={{ animationDelay: `${(index + 3) * 100}ms`, animationFillMode: 'forwards' }}
          >
            <a
              href={link.href}
              className={`linktree-button ${link.style}`}
            >
              <link.icon size={20} />
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-wider opacity-70 leading-none">{link.label}</span>
                <span className="text-sm font-semibold">{link.value}</span>
              </div>
            </a>
          </div>
        ))}

        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "600ms", animationFillMode: 'forwards' }}
        >
          <a
            href="https://www.facebook.com/abdullahbariasif"
            target="_blank"
            rel="noopener noreferrer"
            className="linktree-button m3-tertiary-tonal"
          >
            <FacebookIcon size={20} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase tracking-wider opacity-70 leading-none">Facebook</span>
              <span className="text-sm font-semibold">Personal Profile</span>
            </div>
          </a>
        </div>

        <div
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: "700ms", animationFillMode: 'forwards' }}
        >
          <a
            href={!emailRevealed ? "#" : emailLink.href}
            onClick={(e) => {
              if (!emailRevealed) {
                e.preventDefault();
                setEmailRevealed(true);
              }
            }}
            className={`linktree-button ${emailLink.style}`}
          >
            <emailLink.icon size={20} />
            <div className="flex flex-col items-start">
              <span className="text-[10px] uppercase tracking-wider opacity-70 leading-none">{emailLink.label}</span>
              <span className="text-sm font-semibold">
                {!emailRevealed ? "Click to reveal address" : emailLink.value}
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
