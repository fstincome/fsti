import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'sw', 'rn'],
    interpolation: { escapeValue: false },
  // Extrait des ressources pour i18n.ts
resources: {
    fr: {
      translation: {
        hero_subtitle: "Transformer les compétences locales en revenus durables",
        view_talents: "Voir les Talents",
        impact_trained: "Jeunes Formés",
        impact_inclusion: "Inclusion Handicap",
        impact_services: "Micro-services",
        problem_title: "Pourquoi Gitega ?",
        innovation_title: "Une approche unique.",
        budget_title: "Budget & Phases",
        cta_title: "Prêt à investir ?",
        cta_button: "Rejoindre le Pilote FSTI"
      }
    },
    en: {
      translation: {
        hero_subtitle: "Transforming local skills into sustainable income",
        view_talents: "View Talents",
        impact_trained: "Youth Trained",
        impact_inclusion: "Disability Inclusion",
        impact_services: "Micro-services",
        problem_title: "Why Gitega?",
        innovation_title: "A Unique Approach.",
        budget_title: "Budget & Phases",
        cta_title: "Ready to Invest?",
        cta_button: "Join the FSTI Pilot"
      }
    },
    sw: {
      translation: {
        hero_subtitle: "Kubadilisha ujuzi wa ndani kuwa mapato endelevu",
        view_talents: "Angalia Vipaji",
        impact_trained: "Vijana Waliofunzwa",
        impact_inclusion: "Ujumuishi wa Walemavu",
        impact_services: "Huduma Ndogo",
        problem_title: "Kwa nini Gitega?",
        innovation_title: "Njia ya Kipekee.",
        budget_title: "Bajeti na Awamu",
        cta_title: "Uko tayari kuwekeza?",
        cta_button: "Jiunge na Jaribio la FSTI"
      }
    },
    rn: {
      translation: {
        hero_subtitle: "Guhindura ubuhinga bw'iwacu mu mitahe irama",
        view_talents: "Raba utugenegene",
        impact_trained: "Urwaruka rwashidikiwe",
        impact_inclusion: "Gushiramwo abamugaye",
        impact_services: "Udusubiryo duto duto",
        problem_title: "Kuki i Gitega?",
        innovation_title: "Uburyo budasanzwe.",
        budget_title: "Ingengo y'imari n'intambwe",
        cta_title: "Witeguye gushiraho umutahe?",
        cta_button: "Injira mu mugambi FSTI"
      }
    }
  }
  });

export default i18n;