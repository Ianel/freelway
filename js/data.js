/* ==========================================================================
   DATA — Tout le contenu pédagogique du jeu (étapes, personnages, dialogues).
   Modifier ce fichier suffit pour changer l'histoire sans toucher au moteur.
   ========================================================================== */

const DATA = {
    progression: { totalSteps: 15 },

    /* --- Palette couleurs --- */
    PAL: {
        ink: '#2b2136',
        cream: '#fff6e3',
        paper: '#f6e3bf',
        wood: '#8b5a2b',
        woodDark: '#5e3a17',
        grass: '#7bc043',
        grassDark: '#5aa02f',
        grassLight: '#a6e06a',
        path: '#e0c088',
        pathDark: '#c9a76a',
        water: '#4fb6e8',
        waterDark: '#2f8fc4',
        stone: '#b9b3a8',
        gold: '#f7c948',
        goldDark: '#d99e17',
        red: '#e74c3c',
        green: '#3fa34d',
        blue: '#2f6fd0',
        night: '#3a2c4a',
        pink: '#e05d8b',
        purple: '#7d5fff',
        teal: '#16a085',
        orange: '#e67e22'
    },

    /* --- 15 personnages malgaches --- */
    CHARACTERS: [
        { id: 'hery',      name: 'Hery',      gender: 'm', skin: '#8d5524', shirt: '#2f6fd0', hair: '#1c1c1c', hat: '#d98e04', title: 'Mentor du départ',        personality: 'Chaleureux et encourageant' },
        { id: 'fanja',     name: 'Fanja',     gender: 'f', skin: '#c68642', shirt: '#e05d8b', hair: '#3b2314', hat: null,      title: 'Coach clavier',         personality: 'Rapide et précise' },
        { id: 'toky',      name: 'Toky',      gender: 'm', skin: '#a0673b', shirt: '#3fa34d', hair: '#241a12', hat: null,      title: 'Prof de tableur',       personality: 'Méthodique et patient' },
        { id: 'miora',     name: 'Miora',     gender: 'f', skin: '#ffdbac', shirt: '#8e44ad', hair: '#2b2b2b', hat: null,      title: 'Experte saisie',        personality: 'Attentionnée au détail' },
        { id: 'njaka',     name: 'Njaka',     gender: 'm', skin: '#7a4a21', shirt: '#e67e22', hair: '#1a1a1a', hat: '#2c3e50', title: 'Graphiste créatif',     personality: 'Créatif et enthousiaste' },
        { id: 'voahirana', name: 'Voahirana', gender: 'f', skin: '#d9a066', shirt: '#16a085', hair: '#3c2415', hat: null,      title: 'Monteuse vidéo',        personality: 'Rythmée et visuelle' },
        { id: 'andry',     name: 'Andry',     gender: 'm', skin: '#9c6b3f', shirt: '#c0392b', hair: '#141414', hat: null,      title: 'Consultant relation client', personality: 'À l’écoute' },
        { id: 'hanitra',   name: 'Hanitra',   gender: 'f', skin: '#b97a56', shirt: '#29529b', hair: '#40291a', hat: null,      title: 'Community manager',     personality: 'Sociable et stratégique' },
        { id: 'rija',      name: 'Rija',      gender: 'm', skin: '#8d5524', shirt: '#7d5fff', hair: '#1f1f1f', hat: '#555',   title: 'Curateur de portfolio', personality: 'Structuré' },
        { id: 'manitra',   name: 'Manitra',   gender: 'f', skin: '#ffd3a8', shirt: '#e84393', hair: '#5a3825', hat: null,      title: 'Stratège réseaux sociaux', personality: 'Vif et pertinent' },
        { id: 'marky',     name: 'Marky',     gender: 'm', skin: '#a0693f', shirt: '#0984e3', hair: '#2a1d14', hat: null,      title: 'Pro des plateformes',   personality: 'Pragmatique' },
        { id: 'tahina',    name: 'Tahina',    gender: 'f', skin: '#d19a6a', shirt: '#00b894', hair: '#2e1e13', hat: null,      title: 'Prospecteuse email',    personality: 'Directe et efficace' },
        { id: 'feno',      name: 'Feno',      gender: 'm', skin: '#7a4a21', shirt: '#d63031', hair: '#1a1a1a', hat: null,      title: 'Chasseur de communautés', personality: 'Observateur' },
        { id: 'mamy',      name: 'Mamy',      gender: 'm', skin: '#8d5524', shirt: '#636e72', hair: '#bfbfbf', hat: '#2d3436', title: 'Le professeur final',   personality: 'Bienveillant et exigeant' },
        { id: 'voahangy',  name: 'Voahangy',  gender: 'f', skin: '#e8b98a', shirt: '#8b1e3f', hair: '#3a2317', hat: null,      title: 'Le premier client',     personality: 'Exigeante mais juste' }
    ],

    /* --- 15 étapes du parcours --- */
    STEPS: [
        // 1
        {
            id: 1, character: 'hery', name: 'Dactylographie', icon: '⌨️',
            objective: 'Taper rapidement et sans fautes (85% précision)',
            intro: "Bienvenue sur la route du freelance ! Je suis Hery. Avant tout, un freelance tape beaucoup. Apprenons à taper vite et bien. Reproduis ce texte :",
            text: "Bonjour le monde, je suis un futur freelance.",
            congrats: "Ta frappe est précise et rapide. Un bon rythme pour la suite !",
            reward: 'Ruban de frappe',
            challenge: 'typing'
        },
        // 2
        {
            id: 2, character: 'fanja', name: 'Raccourcis clavier', icon: '🔑',
            objective: 'Maîtriser les raccourcis indispensables (80%)',
            intro: "Moi c’est Fanja. Copier, coller, couper, annuler… Ces raccourcis te feront gagner un temps fou chaque jour. Choisis le bon raccourci pour chaque action :",
            congrats: "Les raccourcis n’ont plus de secret pour toi !",
            reward: 'Badge productivité',
            challenge: 'shortcuts'
        },
        // 3
        {
            id: 3, character: 'toky', name: 'Google Sheets (Tableau)', icon: '📊',
            objective: 'Dompter les tableurs',
            intro: "Toky, pour vous servir. Un tableau bien tenu, c’est la base du suivi de tes clients et de tes revenus. Retrouve les bonnes informations dans ce tableau fictif :",
            congrats: "Le tableau est parfait. On dirait un pro !",
            reward: 'Fiche de calcul réussie',
            challenge: 'sheets'
        },
        // 4
        {
            id: 4, character: 'miora', name: 'Saisie de données', icon: '📝',
            objective: 'Saisir avec précision (90%)',
            intro: "Je suis Miora. La saisie de données exige de la rigueur. Recopie fidèlement les informations, sans erreur, champ par champ :",
            congrats: "Impeccable, aucune erreur !",
            reward: 'Stylo d’or',
            challenge: 'datainput'
        },
        // 5
        {
            id: 5, character: 'njaka', name: 'Graphisme (Canva)', icon: '🎨',
            objective: 'Créer une affiche cohérente',
            intro: "Salut ! Njaka, graphiste. Un bon visuel transmet un message en un regard. Choisis les couleurs les plus lisibles pour une affiche professionnelle :",
            congrats: "Cette affiche est claire et harmonieuse !",
            reward: 'Pinceau coloré',
            challenge: 'graphism'
        },
        // 6
        {
            id: 6, character: 'voahirana', name: 'Montage vidéo', icon: '🎬',
            objective: 'Remonter une vidéo logique',
            intro: "Voahirana ici ! Un montage, c’est une histoire dans le bon ordre. Remets les clips dans la bonne séquence : Intro, Interview, Conclusion :",
            congrats: "Le montage est fluide et cohérent !",
            reward: 'Bobine de film',
            challenge: 'video'
        },
        // 7
        {
            id: 7, character: 'andry', name: 'Question-réponse', icon: '💬',
            objective: 'Comprendre le besoin d’un client',
            intro: "Andry, consultant. Avant de promettre quoi que ce soit, il faut poser les bonnes questions. Écoute bien ce client et sélectionne les informations essentielles : budget, délais, livrables, objectifs et attentes :",
            congrats: "Tu as cerné le vrai besoin du client !",
            reward: 'Oreille attentive',
            challenge: 'clientqa'
        },
        // 8
        {
            id: 8, character: 'hanitra', name: 'Page Facebook freelance', icon: '📘',
            objective: 'Créer une page professionnelle',
            intro: "Hanitra ! Une page Facebook pro, c’est ta vitrine. Un nom clair, une description nette et un visuel soigné inspirent confiance aux clients :",
            congrats: "Ta page inspire confiance !",
            reward: 'Étoile de visibilité',
            challenge: 'fbpage'
        },
        // 9
        {
            id: 9, character: 'rija', name: 'Créer son portfolio', icon: '📋',
            objective: 'Montrer ses réalisations',
            intro: "Rija. Un portfolio, c’est ta preuve de compétence. Sélectionne les trois projets fictifs et observe les compétences qu’ils mettent en valeur :",
            congrats: "Ton portfolio met en valeur tes talents !",
            reward: 'Trophée portfolio',
            challenge: 'portfolio'
        },
        // 10
        {
            id: 10, character: 'manitra', name: 'Interaction réseaux sociaux', icon: '🤝',
            objective: 'Interagir intelligemment avec les prospects',
            intro: "Manitra. Sur les réseaux, la pertinence bat le volume. Choisis les commentaires appropriés et réponds professionnellement sans spam :",
            congrats: "Tes réponses sont professionnelles et utiles !",
            reward: 'Badge influence',
            challenge: 'social'
        },
        // 11
        {
            id: 11, character: 'marky', name: 'ComeUp / Upwork', icon: '💻',
            objective: 'Créer un profil freelance qui inspire confiance',
            intro: "Marky ! Les plateformes de freelancing ouvrent des portes. Un titre clair, une catégorie adaptée et un tarif cohérent inspirent confiance. Crée ton profil :",
            congrats: "Ton profil est convaincant !",
            reward: 'Profil vérifié',
            challenge: 'platform'
        },
        // 12
        {
            id: 12, character: 'tahina', name: 'Prospecter par email', icon: '✉️',
            objective: 'Rédiger un email de prospection',
            intro: "Tahina. Un bon email va droit au but sans être agressif. Identifie un prospect, choisis un objet, rédige un message court, présente tes services et ajoute un appel à l'action :",
            congrats: "Cet email mérite une réponse !",
            reward: 'Plume de prospection',
            challenge: 'email'
        },
        // 13
        {
            id: 13, character: 'feno', name: 'Prospecter dans les groupes', icon: '👥',
            objective: 'Dénicher des clients dans les communautés',
            intro: "Feno. Dans les groupes, les clients se cachent parmi les discussions. Repère le bon besoin et choisis la meilleure approche :",
            congrats: "Tu as repéré la bonne opportunité !",
            reward: 'Radar à prospects',
            challenge: 'groups'
        },
        // 14
        {
            id: 14, character: 'mamy', name: 'Dernier cours', icon: '📖',
            objective: 'Consolider toutes les compétences (80%)',
            intro: "Mamy, ton professeur. Un dernier quiz général sur tout ce que tu as appris : relation client, gestion des délais, organisation du travail, tarifs, livraison et satisfaction client :",
            congrats: "Tu maîtrises les bases du freelancing ! Tu es prêt à travailler avec un vrai client.",
            reward: 'Diplôme du freelancing',
            challenge: 'quiz'
        },
        // 15
        {
            id: 15, character: 'voahangy', name: 'Décrocher son premier client', icon: '🏆',
            objective: 'Convaincre un vrai client',
            intro: "Bonjour, je suis Voahangy. J’ai un restaurant et je veux un site web. Analyse mon besoin, rédige une proposition, choisis un tarif et définis un délai de livraison. Convaincs-moi !",
            congrats: "CONTRAT SIGNÉ ! Tu as décroché ton premier client !",
            reward: 'PREMIER CLIENT',
            challenge: 'final'
        }
    ]
};