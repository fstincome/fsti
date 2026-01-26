import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NEW_PROVINCES } from '../constants';

interface BlogPost {
  id: string;
  category: string;
  author: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  provinceTag: string;
}

const FSTI_BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    category: 'Analyse',
    author: 'Désiré M.',
    date: '26 Jan 2026',
    title: 'Skilled but Stranded : pourquoi les jeunes qualifiés de Gitega restent sans revenus',
    excerpt: 'À Gitega, posséder un diplôme ou une certification technique est devenu un paradoxe : on est qualifié, mais désespérément immobile.',
    content: `Gitega, capitale politique et carrefour de talents, cache une réalité sociale brutale : des centaines de jeunes techniciens et artisans certifiés arpentent les rues avec des compétences d'élite mais des poches vides. Le chômage n'est pas ici une question de paresse, mais un défaut systémique de connexion.\n\nMalgré une volonté de fer et des formations techniques rigoureuses, la jeunesse se heurte à un mur invisible. Le problème n'est plus "quoi faire", mais "pour qui le faire". Sans pont vers le marché, le talent s'étiole et finit par s'orienter vers des secteurs informels précaires.\n\nL'analyse du terrain révèle un phénomène de "stranding" (échouement). Un jeune formé en maintenance informatique, par exemple, possède le savoir-faire pour sauver les équipements des entreprises locales. Cependant, ces entreprises ignorent son existence, préférant faire venir des experts de Bujumbura à grands frais. Ce décalage crée une frustration profonde. Plus de 65% de ces jeunes finissent dans l'économie informelle, souvent dans des tâches qui n'exploitent pas 10% de leur potentiel. Le coût d'opportunité pour la région de Gitega est colossal. Le talent est là, les outils sont là, mais la visibilité est nulle. C'est ce silence du marché qui paralyse l'ascension économique de notre capitale.\n\nIl est urgent de comprendre que la formation seule est une promesse incomplète. Sans un écosystème qui garantit que le savoir-faire rencontre la demande, nous continuerons à produire des experts pour le vide. Le projet FSTI naît de ce constat : il ne s'agit plus de former pour former, mais de libérer le potentiel bloqué de Gitega.`,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    provinceTag: 'gitega'
  },
  {
    id: '2',
    category: 'Solution',
    author: 'Jean-Claude N.',
    date: '25 Jan 2026',
    title: 'From Skills to Income : transformer des compétences en revenus dignes',
    excerpt: 'La stratégie FSTI repose sur un pilier simple : transformer chaque ligne de compétence en un flux financier régulier.',
    content: `Avoir une compétence est un capital. Mais comme tout capital, s'il ne circule pas, il ne produit rien. Le passage du "savoir-faire" au "faire-savoir" est l'étape où la plupart des initiatives de jeunesse échouent au Burundi.\n\nNotre approche "From Skills to Income" n'est pas un slogan, c'est une ingénierie de marché. Nous avons conçu une méthodologie qui force la rencontre entre l'offre technique locale et la demande solvable.\n\nLe processus commence par la validation. Chaque jeune sur notre plateforme n'est pas seulement "formé", il est "certifié prêt à l'emploi". Nous travaillons sur trois axes : la normalisation des tarifs, la qualité du service client et la visibilité numérique. En structurant l'offre de Gitega dans une marketplace sécurisée, nous éliminons l'incertitude pour le client. Que ce soit pour une réparation électronique ou une création textile, le client sait qu'il engage un talent validé par le Hub. Ce système crée un cycle de confiance. Le revenu généré permet au jeune d'investir dans son propre matériel, augmentant sa productivité. Nous ne donnons pas de poisson, nous construisons le port pour que le pêcheur puisse vivre de son art.\n\nLa transformation digitale du Burundi passera par la monétisation du talent local. En connectant ces 50 premiers jeunes au marché, nous prouvons qu'une compétence réelle, lorsqu'elle est bien exposée, devient un moteur de croissance infaillible.`,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
    provinceTag: 'gitega'
  },
  {
    id: '3',
    category: 'Analyse',
    author: 'Ciper Consulting',
    date: '23 Jan 2026',
    title: 'Quand le talent ne suffit pas : le vrai problème, c’est l’accès au marché',
    excerpt: 'Le skills mismatch au Burundi n’est pas toujours un manque de savoir, mais un manque de chemin.',
    content: `On entend souvent que la jeunesse burundaise manque de compétences. C'est une erreur d'analyse. Le talent est abondant, mais il est géographiquement et numériquement enfermé.\n\nL'accès au marché est le chaînon manquant de l'économie de Gitega. Sans une interface qui traduit le talent en service accessible, le jeune reste un "expert invisible".\n\nLe véritable obstacle est transactionnel. Comment un entrepreneur à Gitega trouve-t-il un réparateur fiable ? Souvent par le bouche-à-oreille, un système limité. Notre plateforme brise ce plafond de verre. En centralisant les talents, nous offrons une alternative aux solutions coûteuses venant de l'extérieur. L'analyse des données montre que 70% des besoins techniques des PME de Gitega pourraient être satisfaits localement si l'information était disponible. Nous ne créons pas seulement une application, nous créons un pont de confiance numérique.\n\nLe talent sans marché est une tragédie sociale. En ouvrant les portes du marché numérique, nous redonnons au talent sa valeur marchande et sa dignité sociale par le travail.`,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', // Correction Image 3
    provinceTag: 'gitega'
  },
  {
    id: '4',
    category: 'Inclusion',
    author: 'FSTI Team',
    date: '22 Jan 2026',
    title: 'Une plateforme pensée pour tous : l’accessibilité crée de la valeur',
    excerpt: 'L’inclusion des personnes handicapées n’est pas une œuvre de charité, c’est une force économique inexploitée.',
    content: `Dans un pays où les personnes en situation de handicap sont souvent reléguées au second plan, le Hub FSTI de Gitega fait un pari audacieux : l'excellence par l'inclusion.\n\nConcevoir une plateforme accessible, c'est concevoir une plateforme meilleure pour tout le monde. En intégrant 20% de profils en situation de handicap dans notre pilote, nous changeons le narratif du "besoin" vers celui de la "capacité".\n\nLe design universel est au cœur de notre technologie. Nous avons formé des jeunes malvoyants et à mobilité réduite aux métiers du digital et de la gestion de données. Leur résilience dépasse souvent la moyenne. Une plateforme qui permet à une personne handicapée de vendre ses services de traduction ou de comptabilité à distance supprime les barrières physiques de l'emploi traditionnel. L'accessibilité crée de la valeur car elle diversifie l'offre. Le marché ne voit pas le fauteuil roulant, il voit la qualité du code et la rapidité du service.\n\nL'inclusion est le moteur de l'innovation de demain au Burundi. En ouvrant les portes de l'économie numérique à tous, nous augmentons le PIB de nos régions par la participation active de chaque citoyen.`,
    image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800',
    provinceTag: 'gitega'
  },
  {
    id: '5',
    category: 'Coaching',
    author: 'SkyNet Burundi',
    date: '21 Jan 2026',
    title: 'Experts et confiance : pourquoi l’accompagnement change tout',
    excerpt: 'Derrière chaque freelance à succès se cache un mentorat de fer et une vérification rigoureuse.',
    content: `Le freelancing est un terrain miné d'incertitudes. Pour le jeune de Gitega, la peur de l'échec est réelle. C'est ici que le rôle de SkyNet et Ciper Consulting devient vital.\n\nNous ne laissons pas les jeunes seuls face au marché. Le coaching est la colonne vertébrale qui transforme un technicien brut en un professionnel de confiance capable de gérer des contrats internationaux.\n\nLe mentorat au Hub FSTI couvre deux aspects : la technique et le "soft skill". Un expert peut être excellent en soudure, mais s'il ne sait pas communiquer ou facturer, il échouera. Nos sessions hebdomadaires apprennent aux jeunes à bâtir une réputation. La confiance est la monnaie de l'économie numérique. Grâce à la validation par des experts confirmés, les jeunes du Hub bénéficient d'un label de qualité. Ce sceau d'approbation réduit le risque pour le client et augmente la valeur de la prestation. C'est cet accompagnement qui garantit que le projet FSTI ne produit pas seulement des diplômés, mais des entrepreneurs durables.\n\nLe succès digital est une aventure collective. En entourant nos talents d'experts, nous sécurisons leur avenir et bâtissons une fondation solide pour l'économie de service au Burundi.`,
    image: 'https://images.unsplash.com/photo-1552664688-cf412bb27db2?w=800',
    provinceTag: 'bujumbura'
  },
  {
    id: '6',
    category: 'Vision',
    author: 'Free Tech Inst.',
    date: '20 Jan 2026',
    title: 'Gitega comme point de départ : un modèle pour un impact national',
    excerpt: 'Pourquoi Gitega est le laboratoire idéal pour la révolution numérique du Burundi.',
    content: `Gitega n'est pas seulement le centre géographique du Burundi ; c'est son futur centre de gravité technologique. Le pilote FSTI ici n'est que la première phase d'une vision nationale.\n\nSi nous réussissons à Gitega, nous réussissons partout. Ce modèle de Hub provincial est conçu pour être dupliqué dans chacune des 5 nouvelles provinces réformées du pays.\n\nGitega offre un mélange unique : une population jeune, une centralité logistique et un besoin criant de services modernisés. En installant notre premier noeud sécurisé ici, nous testons la résilience de notre infrastructure face aux réalités locales. Notre vision 2026 est claire : transformer Gitega en une "Digital Valley" burundaise où les talents locaux servent le pays entier via le cloud. Ce modèle décentralisé permet de freiner l'exode rural vers Bujumbura en créant de la richesse là où les gens vivent.\n\nL'impact national commence par une réussite locale exemplaire. Gitega est notre preuve de concept. Demain, c'est tout le Burundi qui sera synchronisé sur cette dynamique de croissance.`,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', // Correction Image 6
    provinceTag: 'gitega'
  }
];

export const NewsView: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Form State
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const updateScroll = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight) setScrollProgress((currentScroll / scrollHeight) * 100);
    };
    window.addEventListener('scroll', updateScroll);
    return () => window.removeEventListener('scroll', updateScroll);
  }, [selectedArticle]);

  const shareArticle = (platform: string) => {
    if (!selectedArticle) return;
    const url = window.location.href;
    const text = `Découvrez cet article sur FSTI Hub : ${selectedArticle.title}`;
    
    const links: any = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`
    };

    if (platform === 'link') {
      navigator.clipboard.writeText(url);
      alert('Lien copié !');
    } else {
      window.open(links[platform], '_blank');
    }
  };

  const filteredNews = FSTI_BLOG_POSTS.filter(post => 
    selectedProvince === 'all' || post.provinceTag === selectedProvince
  );

  if (selectedArticle) {
    return (
      <div className="animate-fadeIn max-w-4xl mx-auto pb-24 relative">
        <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-blue-600 transition-all duration-150" style={{ width: `${scrollProgress}%` }}></div>
        </div>

        <button 
          onClick={() => { setSelectedArticle(null); window.scrollTo(0,0); }}
          className="mb-8 flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest hover:-translate-x-2 transition-transform"
        >
          ← Retour au Journal
        </button>
        
        <img src={selectedArticle.image} className="w-full h-[450px] object-cover rounded-[60px] mb-12 shadow-2xl" alt="" />
        
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedArticle.category}</span>
            <span className="text-slate-400 dark:text-slate-500 text-xs font-bold italic">{selectedArticle.date} • Rédigé par {selectedArticle.author}</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] italic tracking-tighter">
            {selectedArticle.title}
          </h2>

          <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium space-y-6 whitespace-pre-line pl-0">
            {selectedArticle.content}
          </div>

          <div className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800 space-y-12">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Partager :</span>
              <button onClick={() => shareArticle('facebook')} className="bg-[#1877F2] text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all shadow-sm">Facebook</button>
              <button onClick={() => shareArticle('x')} className="bg-slate-900 dark:bg-white dark:text-black text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all shadow-sm">X (Twitter)</button>
              <button onClick={() => shareArticle('whatsapp')} className="bg-[#25D366] text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all shadow-sm">WhatsApp</button>
              <button onClick={() => shareArticle('link')} className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-white px-6 py-2 rounded-full text-[10px] font-black hover:opacity-80 transition-all shadow-sm">Copier le lien</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[40px] border-2 border-slate-200 dark:border-slate-800">
              <h4 className="text-2xl font-black italic mb-6 dark:text-white tracking-tighter">Espace Citoyen</h4>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    placeholder="Votre nom complet" 
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white transition-all shadow-sm" 
                  />
                  <input 
                    type="email" 
                    placeholder="Votre adresse email" 
                    value={commentForm.email}
                    onChange={(e) => setCommentForm({...commentForm, email: e.target.value})}
                    className="w-full bg-white dark:bg-slate-800 border-none p-5 rounded-2xl outline-none focus:ring-2 ring-blue-600 dark:text-white transition-all shadow-sm" 
                  />
                </div>
                <textarea 
                  placeholder="Votre commentaire..." 
                  rows={4} 
                  value={commentForm.message}
                  onChange={(e) => setCommentForm({...commentForm, message: e.target.value})}
                  className="w-full bg-white dark:bg-slate-800 border-none p-6 rounded-[30px] outline-none focus:ring-2 ring-blue-600 dark:text-white transition-all shadow-sm"
                ></textarea>
                <button className="bg-blue-600 text-white px-12 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white dark:hover:text-blue-600 transition-all">
                  Soumettre mon commentaire
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-12">
        <div>
          <h2 className="text-7xl font-black italic tracking-tighter text-slate-900 dark:text-white leading-none uppercase">Journal <span className="text-blue-600">Hub</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 italic max-w-lg">Le média officiel de la transformation numérique de Gitega.</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Filtre Régional</label>
          <select 
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 px-8 py-4 rounded-[25px] font-black text-xs uppercase dark:text-white outline-none focus:border-blue-600 shadow-xl"
          >
            <option value="all">Tout le pays</option>
            {NEW_PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredNews.map(post => (
          <article key={post.id} className="group bg-white dark:bg-slate-900 rounded-[60px] overflow-hidden border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all flex flex-col cursor-pointer" onClick={() => { setSelectedArticle(post); window.scrollTo(0,0); }}>
            <div className="h-72 relative overflow-hidden">
              <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              <div className="absolute top-8 left-8 bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                {post.category}
              </div>
            </div>

            <div className="p-12 flex flex-col flex-1 space-y-4">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <span>{post.date}</span>
                <span>{post.author}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight italic tracking-tighter group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 font-medium italic leading-relaxed">
                {post.excerpt}
              </p>
              <div className="pt-4 flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform">
                Continuer la lecture <span className="text-lg">→</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};