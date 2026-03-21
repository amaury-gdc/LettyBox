export const mockClients = [
  {
    id: 'client_001',
    name: 'Laurent Dubois',
    company: 'Dubois Industries',
    email: 'l.dubois@dubois-industries.fr',
    phone: '+33 6 12 34 56 78',
    status: 'actif',
    priority: 'high',
    notes:
      'Client historique depuis 2019. Très exigeant sur les délais. Préfère les échanges par email au téléphone. Décideur principal pour les achats > 50k€.',
    exchanges: [
      {
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        subject: 'URGENT — Validation devis avant vendredi',
        summary: 'Demande validation urgente du devis D-2024-089 avant vendredi.',
        emailId: 'email_001',
      },
      {
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        subject: 'Devis D-2024-089 — Ligne de production B',
        summary: 'Envoi du devis pour la nouvelle ligne de production B, montant 87 000€.',
        emailId: null,
      },
      {
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        subject: 'Réunion bilan Q3 2024',
        summary: 'Bilan trimestriel positif, discussion roadmap Q4.',
        emailId: null,
      },
    ],
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client_002',
    name: 'Marta Kovač',
    company: 'TechVision EU',
    email: 'mkovac@techvision-eu.com',
    phone: '+386 1 234 5678',
    status: 'prospect',
    priority: 'high',
    notes:
      'Directrice partenariats chez TechVision EU. Contact issu du salon EuroTech 2024. Intéressée par un partenariat de distribution en Europe centrale.',
    exchanges: [
      {
        date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        subject: 'Re: Proposition partenariat Q1 2025',
        summary: 'Intéressée par le partenariat, souhaite un appel la semaine prochaine.',
        emailId: 'email_002',
      },
      {
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        subject: 'Proposition partenariat Q1 2025',
        summary: 'Envoi de la proposition de partenariat de distribution.',
        emailId: null,
      },
    ],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client_003',
    name: 'Thomas Petit',
    company: 'Groupe Apex',
    email: 't.petit@groupe-apex.com',
    phone: '+33 1 45 67 89 01',
    status: 'actif',
    priority: 'medium',
    notes:
      'Responsable achats. Contrat annuel reconduit automatiquement. Envoie des rapports mensuels régulièrement. Relation de confiance établie.',
    exchanges: [
      {
        date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        subject: 'Rapport mensuel — Novembre 2024',
        summary: 'Rapport mensuel positif : CA +12%, 3 nouveaux contrats.',
        emailId: 'email_004',
      },
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        subject: 'Rapport mensuel — Octobre 2024',
        summary: 'Rapport octobre : stabilité des indicateurs, légère hausse pipeline.',
        emailId: null,
      },
    ],
    createdAt: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client_004',
    name: 'Sophie Renard',
    company: 'Agence Creative',
    email: 's.renard@agencecreative.io',
    phone: '+33 6 98 76 54 32',
    status: 'prospect',
    priority: 'low',
    notes:
      'Rencontrée lors d\'un événement networking. Agence de design web, potentiel de collaboration sur des projets clients communs.',
    exchanges: [
      {
        date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        subject: 'Invitation — Forum Innovation Paris 2025',
        summary: 'Invitation au Forum Innovation Paris 2025 avec accréditation VIP.',
        emailId: 'email_003',
      },
    ],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client_005',
    name: 'Éric Fontaine',
    company: 'Fontaine & Associés',
    email: 'e.fontaine@fontaine-avocats.fr',
    phone: '+33 1 23 45 67 89',
    status: 'inactif',
    priority: 'low',
    notes:
      'Cabinet d\'avocats partenaire pour les aspects juridiques. Dernier contact il y a 6 mois pour un contrat de prestation.',
    exchanges: [
      {
        date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        subject: 'Contrat de prestation juridique 2024',
        summary: 'Signature du contrat de prestation annuel.',
        emailId: null,
      },
    ],
    createdAt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
]
