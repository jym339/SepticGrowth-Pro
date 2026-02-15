
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  MessageSquare, 
  Calendar,
  Menu,
  X, 
  CheckCircle2, 
  ArrowRight, 
  Droplets, 
  Truck, 
  Zap, 
  Locate, 
  Globe,
  Star,
  Layout,
  Cpu,
  Smartphone,
  BarChart3,
  Bell,
  Layers,
  MousePointerClick,
  MailCheck,
  ZapOff,
  UserCheck
} from 'lucide-react';

// Global constants
const BOOKING_URL = "https://calendly.com/booknow12/consulation-septicgrowth";

// --- Localization Content ---

const content = {
  en: {
    nav: { home: "Home", features: "Features", how: "Process", pricing: "Pricing", results: "Results", about: "About", book: "Book a Call" },
    hero: {
      tag: "AI-Powered Growth for Septic & Well Services",
      title: "Scale your fleet",
      titleAccent: "with AI automation.",
      desc: "Stop chasing leads and start closing jobs. We build high-converting systems, AI chatbots, and automated workflows designed specifically for the field service industry.",
      bullets: ["AI Chatbots for 24/7 engagement", "Automated CRM & Lead Management", "Conversion-focused modern design"],
      ctaPrimary: "Sign Up Now",
      ctaSecondary: "View Features"
    },
    features: {
      title: "The All-In-One Growth Engine",
      subtitle: "Everything you need to dominate your local market, automated and optimized.",
      sections: [
        {
          id: "conversion",
          category: "Conversion & Design",
          items: [
            { icon: <MousePointerClick />, title: "Optimized Forms & Pages", desc: "High-converting designs that encourage visitors to take action immediately." },
            { icon: <Layout />, title: "Modern UI/UX", desc: "Beautifully designed interfaces that enhance user experience and trust." },
            { icon: <Zap />, title: "Fast & Responsive", desc: "Optimized for speed and flawless performance across all mobile devices." },
            { icon: <UserCheck />, title: "Custom Branding", desc: "Tailored design that reflects your specific brand identity and vision." }
          ]
        },
        {
          id: "automation",
          category: "AI & Intelligence",
          items: [
            { icon: <MessageSquare />, title: "AI-Powered Chatbots", desc: "Engage visitors 24/7, collect customer info, and guide them through the journey." },
            { icon: <Cpu />, title: "AI Personalization", desc: "Tailored website experiences based on specific user behavior and location." },
            { icon: <MailCheck />, title: "Automated Follow-Ups", desc: "Nurture leads with scheduled email sequences and personalized messaging." },
            { icon: <Layers />, title: "CRM Workflows", desc: "Automate lead scoring, customer segmentation, and service follow-ups." }
          ]
        },
        {
          id: "control",
          category: "Management & Control",
          items: [
            { icon: <Smartphone />, title: "One-Touch CRM Access", desc: "Manage leads and customer interactions directly from your mobile device." },
            { icon: <BarChart3 />, title: "Live Analytics & Reports", desc: "Monitor traffic, lead generation, and performance right from your phone." },
            { icon: <Bell />, title: "Instant Lead Notifications", desc: "Get alerts the second someone interacts with your forms or chatbot." },
            { icon: <ZapOff />, title: "Real-Time Updates", desc: "Easily update content, add pages, and make changes on the fly." }
          ]
        }
      ]
    },
    pricing: {
      title: "Simple, Transparent Pricing",
      subtitle: "Choose the plan that fits your business stage. No hidden fees, just growth.",
      setup: "Setup",
      month: "Month",
      mostPopular: "Most Popular",
      cta: "Sign Up Now",
      tiers: [
        {
          name: "Starter",
          subtitle: "For Small Businesses & Startups",
          setupPrice: "$1,000",
          monthlyPrice: "$97",
          desc: "Get started with a sleek, mobile-friendly website designed to capture leads and improve your online presence.",
          features: [
            "3-Page Responsive Website",
            "On-Page SEO Optimization",
            "AI-Powered Chat Widget",
            "Contact Form Automation",
            "SMS & Email Notifications",
            "1 Website Edit Per Month"
          ]
        },
        {
          name: "Growth",
          subtitle: "For Scaling Businesses & Entrepreneurs",
          setupPrice: "$2,000",
          monthlyPrice: "$297",
          desc: "Scale your business with advanced SEO, full CRM automation, and lead management tools to maximize conversions.",
          features: [
            "5-Page Premium Website",
            "Full CRM Workflow Integration",
            "AI Personalization Features",
            "Calendar Booking System",
            "Automated Google Review Widget",
            "3 Website Edits Per Month"
          ]
        }
      ]
    },
    footer: {
      desc: "The only marketing partner dedicated exclusively to helping septic and well water service companies scale through technology.",
      rights: "© 2026 SepticGrowth Pro. Specialized Lead Systems for Field Service Pros."
    },
    ctaFinal: {
      title: "Ready to automate your growth?",
      desc: "Stop losing jobs to the competition. Let us handle the tech while you handle the trucks."
    }
  },
  fr: {
    nav: { home: "Accueil", features: "Fonctions", how: "Processus", pricing: "Tarifs", results: "Résultats", about: "À Propos", book: "Réserver un appel" },
    hero: {
      tag: "Croissance par IA pour les Services Septiques",
      title: "Développez votre flotte",
      titleAccent: "avec l'IA.",
      desc: "Arrêtez de courir après les leads. Nous construisons des systèmes à haute conversion, des chatbots IA et des flux automatisés conçus pour le terrain.",
      bullets: ["Chatbots IA actifs 24/7", "CRM et gestion automatisée", "Design moderne axé conversion"],
      ctaPrimary: "S'inscrire Maintenant",
      ctaSecondary: "Voir Fonctions"
    },
    features: {
      title: "Le Moteur de Croissance Complet",
      subtitle: "Tout ce dont vous avez besoin pour dominer votre marché local, automatisé et optimisé.",
      sections: [
        {
          id: "conversion",
          category: "Conversion & Design",
          items: [
            { icon: <MousePointerClick />, title: "Formulaires Optimisés", desc: "Designs à haute conversion encourageant l'action immédiate des visiteurs." },
            { icon: <Layout />, title: "UI/UX Moderne", desc: "Interfaces magnifiques qui renforcent l'expérience utilisateur et la confiance." },
            { icon: <Zap />, title: "Rapide & Réactif", desc: "Optimisé pour la vitesse et une performance parfaite sur tous les mobiles." },
            { icon: <UserCheck />, title: "Branding Personnalisé", desc: "Design sur mesure reflétant l'identité et la vision de votre marque." }
          ]
        },
        {
          id: "automation",
          category: "IA & Intelligence",
          items: [
            { icon: <MessageSquare />, title: "Chatbots IA", desc: "Engagez les visiteurs 24/7, collectez les infos et guidez-les dans leur parcours." },
            { icon: <Cpu />, title: "Personnalisation IA", desc: "Expériences web sur mesure basées sur le comportement et la localisation." },
            { icon: <MailCheck />, title: "Suivis Automatisés", desc: "Nourrissez les prospects avec des séquences emails et messages personnalisés." },
            { icon: <Layers />, title: "Flux de Travail CRM", desc: "Automatisez le scoring des leads, la segmentation et les suivis de service." }
          ]
        },
        {
          id: "control",
          category: "Gestion & Contrôle",
          items: [
            { icon: <Smartphone />, title: "Accès CRM Mobile", desc: "Gérez vos leads et interactions clients directement depuis votre téléphone." },
            { icon: <BarChart3 />, title: "Analyses en Direct", desc: "Surveillez le trafic, les leads et la performance en temps réel sur mobile." },
            { icon: <Bell />, title: "Notifications Instantanées", desc: "Soyez alerté dès qu'un prospect interagit avec vos formulaires ou chatbot." },
            { icon: <ZapOff />, title: "Mises à Jour Directes", desc: "Mettez à jour le contenu et ajoutez des pages facilement et instantanément." }
          ]
        }
      ]
    },
    pricing: {
      title: "Tarifs Simples et Transparents",
      subtitle: "Choisissez le plan qui correspond à l'étape de votre entreprise. Pas de frais cachés.",
      setup: "Installation",
      month: "Mois",
      mostPopular: "Plus Populaire",
      cta: "S'inscrire Maintenant",
      tiers: [
        {
          name: "Starter",
          subtitle: "Pour Petites Entreprises",
          setupPrice: "1 000 $",
          monthlyPrice: "97 $",
          desc: "Démarrez avec un site web élégant et optimisé pour mobile, conçu pour capturer des prospects.",
          features: [
            "Site Web Réactif 3 Pages",
            "Optimisation SEO sur site",
            "Widget de Chat IA",
            "Automatisation de Formulaire",
            "Notifications SMS & Email",
            "1 Modification par Mois"
          ]
        },
        {
          name: "Growth",
          subtitle: "Pour Entreprises en Croissance",
          setupPrice: "2 000 $",
          monthlyPrice: "297 $",
          desc: "Développez votre entreprise avec un SEO avancé, une automatisation CRM complète et des outils de gestion.",
          features: [
            "Site Web Premium 5 Pages",
            "Intégration Flux CRM",
            "Fonctions Personnalisation IA",
            "Système de Réservation",
            "Widget d'Avis Automatisé",
            "3 Modifications par Mois"
          ]
        }
      ]
    },
    footer: {
      desc: "Le seul partenaire marketing dédié exclusivement à la croissance technologique des services septiques.",
      rights: "© 2026 SepticGrowth Pro. Systèmes de leads spécialisés pour les pros du terrain."
    },
    ctaFinal: {
      title: "Prêt à automatiser votre croissance ?",
      desc: "Arrêtez de perdre des contrats. Laissez-nous gérér la technologie pendant que vous gérez les camions."
    }
  }
};

const handleGlobalNavClick = (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLDivElement>, id: string) => {
  e.preventDefault();
  const element = document.getElementById(id);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  } else if (id === 'top') {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const LanguageToggle = ({ lang, setLang }: { lang: 'en' | 'fr', setLang: (l: 'en' | 'fr') => void }) => (
  <button 
    onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-navy px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-slate-200"
  >
    <Globe size={14} />
    {lang === 'en' ? 'FRANÇAIS' : 'ENGLISH'}
  </button>
);

const Navbar = ({ lang, setLang }: { lang: 'en' | 'fr', setLang: (l: 'en' | 'fr') => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = content[lang].nav;

  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setIsOpen(false);
    handleGlobalNavClick(e, id);
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={(e: any) => handleGlobalNavClick(e, 'top')}>
            <div className="bg-navy p-2 rounded-lg">
              <Truck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-extrabold text-navy tracking-tight uppercase">SEPTIC<span className="text-field-green">GROWTH</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" onClick={(e) => onNavClick(e, 'features')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.features}</a>
            <a href="#pricing" onClick={(e) => onNavClick(e, 'pricing')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.pricing}</a>
            <a href="#results" onClick={(e) => onNavClick(e, 'results')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.results}</a>
            <a href="#about" onClick={(e) => onNavClick(e, 'about')} className="text-sm font-semibold text-slate-600 hover:text-navy transition-colors">{t.about}</a>
            <LanguageToggle lang={lang} setLang={setLang} />
            <a 
              href={BOOKING_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-navy text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-navy/20"
            >
              {t.book}
            </a>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <LanguageToggle lang={lang} setLang={setLang} />
            <button onClick={() => setIsOpen(!isOpen)} className="text-navy">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-2">
          <a href="#features" onClick={(e) => onNavClick(e, 'features')} className="block px-3 py-4 text-base font-semibold text-slate-700 border-b border-slate-50">{t.features}</a>
          <a href="#pricing" onClick={(e) => onNavClick(e, 'pricing')} className="block px-3 py-4 text-base font-semibold text-slate-700 border-b border-slate-50">{t.pricing}</a>
          <div className="pt-4 px-3">
            <a 
              href={BOOKING_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-center w-full bg-navy text-white py-4 rounded-xl font-bold"
            >
              {t.book}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

const FeatureSection = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].features;
  return (
    <section id="features" className="py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl lg:text-5xl font-black text-navy mb-6">{t.title}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">{t.subtitle}</p>
        </div>
        
        {t.sections.map((section) => (
          <div key={section.id} className="mb-20 last:mb-0">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px bg-slate-200 flex-1"></div>
              <h3 className="text-xs uppercase font-black text-slate-400 tracking-[0.2em]">{section.category}</h3>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {section.items.map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-navy shadow-sm mb-6 group-hover:bg-field-green group-hover:text-white transition-colors">
                    {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <h4 className="text-lg font-bold text-navy mb-3">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const PricingSection = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].pricing;
  return (
    <section id="pricing" className="py-20 lg:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-navy mb-4">{t.title}</h2>
          <p className="text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {t.tiers.map((tier, i) => (
            <div 
              key={i} 
              className={`relative bg-white p-8 lg:p-10 rounded-3xl border transition-all duration-300 flex flex-col ${
                i === 1 
                ? 'border-field-green shadow-[0_20px_50px_-20px_rgba(22,163,74,0.2)] ring-1 ring-field-green/10' 
                : 'border-slate-100 shadow-sm hover:shadow-md'
              }`}
            >
              {i === 1 && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-field-green text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <Star size={14} />
                  {t.mostPopular}
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-black text-navy mb-2">{tier.name}</h3>
                <p className="text-slate-500 text-sm font-medium">{tier.subtitle}</p>
              </div>

              <div className="mb-8 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-black text-navy">{tier.setupPrice}</span>
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">{t.setup} +</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-black text-field-green">{tier.monthlyPrice}</span>
                  <span className="text-slate-400 font-bold uppercase text-xs tracking-wider">/ {t.month}</span>
                </div>
              </div>

              <p className="text-slate-600 text-sm mb-8 leading-relaxed font-medium">
                {tier.desc}
              </p>

              <div className="flex-1 space-y-4 mb-10">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className={`${i === 1 ? 'text-field-green' : 'text-navy'} shrink-0 mt-0.5`} />
                    <span className={`text-sm ${idx === 1 && i === 1 ? 'font-bold text-navy' : 'text-slate-700'}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <a 
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-4 px-6 rounded-2xl font-black text-center transition-all flex items-center justify-center gap-2 ${
                  i === 1 
                  ? 'bg-field-green text-white hover:bg-green-700 shadow-lg shadow-field-green/20 active:scale-95' 
                  : 'bg-navy text-white hover:bg-slate-800 shadow-lg shadow-navy/10 active:scale-95'
                }`}
              >
                {t.cta} <ArrowRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ lang }: { lang: 'en' | 'fr' }) => {
  const t = content[lang].footer;
  const nav = content[lang].nav;
  return (
    <footer className="bg-navy pt-16 pb-10 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={(e: any) => handleGlobalNavClick(e, 'top')}>
              <div className="bg-field-green p-2 rounded-lg">
                <Truck className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight uppercase">SEPTIC<span className="text-field-green">GROWTH</span></span>
            </div>
            <p className="max-w-sm mb-6 text-sm leading-relaxed">{t.desc}</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-[10px]">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><a href="#top" onClick={(e) => handleGlobalNavClick(e, 'top')} className="hover:text-field-green transition-colors">{nav.home}</a></li>
              <li><a href="#features" onClick={(e) => handleGlobalNavClick(e, 'features')} className="hover:text-field-green transition-colors">{nav.features}</a></li>
              <li><a href="#pricing" onClick={(e) => handleGlobalNavClick(e, 'pricing')} className="hover:text-field-green transition-colors">{nav.pricing}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-[10px]">Contact</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li>info@septicgrowth.net</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-[10px]">
          <p>{t.rights}</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const t = content[lang];

  return (
    <div id="top" className="antialiased selection:bg-field-green selection:text-white bg-white min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-field-green/10 text-field-green px-4 py-2 rounded-full text-xs lg:text-sm font-bold mb-6">
              <ShieldCheck size={16} />
              <span>{t.hero.tag}</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-extrabold text-navy leading-[1.1] mb-6">
              {t.hero.title} <span className="text-field-green">{t.hero.titleAccent}</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              {t.hero.desc}
            </p>
            
            <ul className="space-y-3 lg:space-y-4 mb-10">
              {t.hero.bullets.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-base lg:text-lg font-medium text-slate-700">
                  <CheckCircle2 className="text-field-green shrink-0" size={22} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={BOOKING_URL} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-navy text-white px-8 py-4 lg:py-5 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-navy/20 flex items-center justify-center gap-2 group"
              >
                {t.hero.ctaPrimary} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button 
                onClick={(e: any) => handleGlobalNavClick(e, 'features')}
                className="bg-white text-navy border-2 border-slate-200 px-8 py-4 lg:py-5 rounded-xl font-bold text-lg hover:border-navy transition-all flex items-center justify-center gap-2"
              >
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-2/5 h-full hidden lg:block -z-10">
            <img 
              src="https://images.unsplash.com/photo-1590231940426-621617a94464?auto=format&fit=crop&q=80&w=1200" 
              alt="Technology" 
              className="w-full h-full object-cover rounded-l-[100px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
        </div>
      </section>

      {/* Feature Section (New Consolidated View) */}
      <FeatureSection lang={lang} />

      {/* Results Section */}
      <section id="results" className="py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-navy mb-4">{lang === 'en' ? "The Impact of Better Systems" : "L'impact de meilleurs systèmes"}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-slate-50 p-6 lg:p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4 mb-4 text-field-green"><Zap size={24} /><h4 className="font-bold text-navy text-lg lg:text-xl">{lang === 'en' ? "Instant Engagement" : "Engagement Instantané"}</h4></div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {lang === 'en' 
                  ? "Most septic companies lose 60% of their leads because they can't answer while servicing a tank. Our AI chatbots ensure you are the first professional they talk to, 24/7."
                  : "La plupart des entreprises perdent 60% de leurs leads car elles ne peuvent pas répondre. Nos chatbots IA assurent que vous soyez le premier contact, 24/7."}
              </p>
            </div>
            <div className="bg-slate-50 p-6 lg:p-8 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-4 mb-4 text-navy"><TrendingUp size={24} /><h4 className="font-bold text-navy text-lg lg:text-xl">{lang === 'en' ? "Market Dominance" : "Dominance du Marché"}</h4></div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {lang === 'en'
                  ? "We help local owners out-position regional franchises with data-driven workflows and real-time lead tracking right from their phones."
                  : "Nous aidons les propriétaires locaux à surclasser les franchises grâce à des flux de données et un suivi des leads en temps réel sur mobile."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection lang={lang} />

      {/* About Section */}
      <section id="about" className="py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-navy mb-6">{lang === 'en' ? "Built Specifically for Septic & Well Pros" : "Conçu spécifiquement pour les pros du septique"}</h2>
            <p className="text-base lg:text-lg text-slate-600 mb-8 leading-relaxed">
              {lang === 'en' 
                ? "Most agencies serve dentists and lawyers. We realized the septic industry was being overcharged for generic services that don't fit field-service reality. Our system is built for trucks, tanks, and territory." 
                : "La plupart des agences servent des dentistes. Nous avons réalisé que l'industrie du septique était surfacturée pour des services génériques inadaptés. Notre système est conçu pour le terrain."}
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6">
              <div className="flex items-center gap-2 font-bold text-navy text-sm lg:text-base">
                <CheckCircle2 className="text-field-green" size={18} /> {lang === 'en' ? "AI-Integrated" : "Intégré IA"}
              </div>
              <div className="flex items-center gap-2 font-bold text-navy text-sm lg:text-base">
                <CheckCircle2 className="text-field-green" size={18} /> {lang === 'en' ? "Mobile-First CRM" : "CRM Mobile"}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 lg:py-24 bg-navy text-white text-center relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-black mb-6">{t.ctaFinal.title}</h2>
          <p className="text-lg lg:text-xl text-slate-400 mb-10">{t.ctaFinal.desc}</p>
          <a 
            href={BOOKING_URL} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex bg-field-green text-white px-8 py-5 lg:px-10 lg:py-6 rounded-2xl font-black text-lg lg:text-xl hover:bg-green-700 transition-all shadow-2xl items-center justify-center gap-3 mx-auto active:scale-95"
          >
            {t.nav.book} <ArrowRight />
          </a>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}
