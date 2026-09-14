import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const WhatsAppButton = () => {
  const { settings } = useSettings();
  const whatsappNumber = settings.whatsapp || settings.phone || '9608782890';
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const message = encodeURIComponent(`Hi ${settings.businessName}, I would like to inquire about booking photography & videography services.`);

  return (
    <a
      href={`https://wa.me/91${cleanNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out px-0 group-hover:px-2 text-xs font-semibold uppercase tracking-wider">
        Chat with Us
      </span>
    </a>
  );
};

export default WhatsAppButton;
