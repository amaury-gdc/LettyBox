export const mockDigest = {
  globalSummary:
    "Vous avez 6 emails non lus dont 2 urgents. Deux clients clés — Dubois Industries et Marta Kovač — attendent des retours urgents sur des propositions commerciales. Les autres messages concernent une invitation conférence, un rapport mensuel, et des mises à jour produit non critiques.",
  urgentCount: 2,
  generatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min ago
}

export const mockEmails = [
  {
    id: 'email_001',
    from: { name: 'Laurent Dubois', email: 'l.dubois@dubois-industries.fr' },
    subject: 'URGENT — Validation devis avant vendredi',
    snippet:
      'Bonjour, suite à notre échange de la semaine dernière, il est impératif que nous ayons votre validation sur le devis D-2024-089 avant vendredi 18h. Notre équipe de production doit démarrer lundi...',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    isRead: false,
    isUrgent: true,
    claudeSummary:
      'Laurent Dubois demande la validation urgente du devis D-2024-089 avant vendredi 18h pour démarrer la production lundi.',
    threadId: 'thread_001',
  },
  {
    id: 'email_002',
    from: { name: 'Marta Kovač', email: 'mkovac@techvision-eu.com' },
    subject: 'Re: Proposition partenariat Q1 2025',
    snippet:
      "Chère équipe, j'ai bien reçu votre proposition de partenariat. Après examen préliminaire avec notre direction, nous souhaitons organiser un appel la semaine prochaine pour discuter des modalités...",
    date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
    isRead: false,
    isUrgent: true,
    claudeSummary:
      'Marta Kovač est intéressée par la proposition de partenariat et souhaite organiser un appel la semaine prochaine pour en discuter.',
    threadId: 'thread_002',
  },
  {
    id: 'email_003',
    from: { name: 'Sophie Renard', email: 's.renard@agencecreative.io' },
    subject: 'Invitation — Forum Innovation Paris 2025',
    snippet:
      'Nous avons le plaisir de vous inviter au Forum Innovation Paris 2025 qui se tiendra les 14 et 15 mars. En tant que partenaire privilégié, vous bénéficiez d\'une accréditation VIP incluant...',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8h ago
    isRead: false,
    isUrgent: false,
    claudeSummary:
      'Invitation au Forum Innovation Paris 2025 (14-15 mars) avec accréditation VIP partenaire. Pas d\'action urgente requise.',
    threadId: 'thread_003',
  },
  {
    id: 'email_004',
    from: { name: 'Thomas Petit', email: 't.petit@groupe-apex.com' },
    subject: 'Rapport mensuel — Novembre 2024',
    snippet:
      'Veuillez trouver ci-joint le rapport mensuel d\'activité pour novembre 2024. Points saillants : CA +12% vs N-1, 3 nouveaux contrats signés, pipeline commercial en hausse de 23%...',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18h ago
    isRead: false,
    isUrgent: false,
    claudeSummary:
      'Rapport mensuel novembre 2024 positif : CA +12% vs N-1, 3 nouveaux contrats, pipeline +23%. Lecture informative, pas d\'action requise.',
    threadId: 'thread_004',
  },
  {
    id: 'email_005',
    from: { name: 'Slack Notifications', email: 'notifications@slack.com' },
    subject: 'Nouveau message dans #général',
    snippet:
      '@here — La réunion d\'équipe de demain est reportée à 15h. Merci de confirmer votre présence dans le canal...',
    date: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), // 22h ago
    isRead: false,
    isUrgent: false,
    claudeSummary:
      'Notification Slack : réunion d\'équipe reportée à 15h demain, confirmation de présence demandée.',
    threadId: 'thread_005',
  },
  {
    id: 'email_006',
    from: { name: 'Product Updates', email: 'noreply@figma.com' },
    subject: 'Figma — Nouvelles fonctionnalités décembre 2024',
    snippet:
      'Découvrez les dernières améliorations apportées à Figma ce mois-ci : variables avancées, nouvelle interface de prototypage, amélioration des performances...',
    date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // 26h ago
    isRead: false,
    isUrgent: false,
    claudeSummary:
      'Newsletter Figma décembre 2024 : nouvelles fonctionnalités (variables avancées, prototypage). Informatif, aucune action requise.',
    threadId: 'thread_006',
  },
]
