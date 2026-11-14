// Centre d'aide du back-office événementiel : la documentation de chaque
// module, rédigée ici (aucun appel réseau). Une rubrique par module, des
// articles courts. À tenir à jour quand une fonctionnalité change : ce texte
// est lu par les organisateurs avant d'écrire au support.

export type HelpBlock =
  | { type: "p"; text: string }
  | { type: "steps"; items: string[] }
  | { type: "list"; items: string[] }
  | { type: "note"; text: string };

export type HelpArticle = {
  id: string;
  title: string;
  summary: string;
  blocks: HelpBlock[];
  // Raccourci vers l'écran concerné.
  link?: { label: string; href: string };
};

export type HelpSection = {
  id: string;
  title: string;
  description: string;
  // Tracé 24 × 24 (trait 1.75), comme le reste du cadre.
  icon: string;
  articles: HelpArticle[];
};

const BASE = "/admin/event";
const p = (text: string): HelpBlock => ({ type: "p", text });
const steps = (...items: string[]): HelpBlock => ({ type: "steps", items });
const list = (...items: string[]): HelpBlock => ({ type: "list", items });
const note = (text: string): HelpBlock => ({ type: "note", text });

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "premiers-pas",
    title: "Premiers pas",
    description: "Créer son compte, préparer son organisation et publier un premier événement.",
    icon: "M5 12h14M13 6l6 6-6 6",
    articles: [
      {
        id: "demarrer",
        title: "Démarrer en quatre étapes",
        summary: "Le chemin le plus court entre l'inscription et la première vente.",
        blocks: [
          steps(
            "Complétez votre organisation : logo, description, téléphone et adresse (Paramètres › Général).",
            "Ajoutez un compte de versement Mobile Money (Paramètres › Paiements) pour recevoir vos recettes.",
            "Créez votre événement et ses formules, puis publiez-le.",
            "Partagez le lien de votre site : vos participants achètent et reçoivent leur billet par e-mail."
          ),
          note("Le bandeau « Configuration » en haut du tableau de bord rappelle les étapes qui restent à faire."),
        ],
        link: { label: "Ouvrir les paramètres", href: `${BASE}/settings` },
      },
      {
        id: "tableau-de-bord",
        title: "Lire le tableau de bord",
        summary: "Ventes, entrées et événements à venir, en un coup d'œil.",
        blocks: [
          p("Le tableau de bord résume l'activité de votre organisation : billets vendus, recettes, entrées scannées et prochains événements."),
          list(
            "La barre de recherche ouvre n'importe quelle page ou événement.",
            "La cloche affiche vos dernières ventes, cotisations et versements.",
            "La boussole relance la visite guidée à tout moment."
          ),
        ],
        link: { label: "Voir le tableau de bord", href: BASE },
      },
    ],
  },
  {
    id: "evenements",
    title: "Événements",
    description: "Créer, publier et suivre un événement, de l'affiche jusqu'au jour J.",
    icon: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
    articles: [
      {
        id: "creer",
        title: "Créer un événement",
        summary: "Un éditeur en quatre étapes : informations, billets, questionnaire, certificat.",
        blocks: [
          steps(
            "Informations : titre, type, affiche, dates, lieu, description, programme et intervenants.",
            "Billets & pass : vos formules, leurs prix et le modèle du billet.",
            "Questionnaire : les questions posées à l'inscription (facultatif).",
            "Certificat & publication : l'attestation de participation, puis la mise en vente."
          ),
          p("Vous pouvez enregistrer en brouillon à chaque étape et revenir plus tard."),
        ],
        link: { label: "Mes événements", href: `${BASE}/events` },
      },
      {
        id: "dates-lieu",
        title: "Dates et lieu",
        summary: "Événement d'un soir ou de plusieurs jours, adresse et point sur la carte.",
        blocks: [
          p("Indiquez une date de début et, si besoin, une date de fin. Pour un événement sur plusieurs jours, la période complète s'affiche partout : site, billets, e-mails et attestations."),
          p("Le sélecteur de lieu recherche une adresse et place le point sur la carte. Le nom du lieu trouvé remplit le champ « Lieu », que vous pouvez corriger à la main."),
          note("Les heures sont celles de Libreville."),
        ],
      },
      {
        id: "statuts",
        title: "Brouillon, en vente, terminé",
        summary: "Ce que voit le public selon le statut de l'événement.",
        blocks: [
          list(
            "Brouillon : visible de votre équipe seulement.",
            "En vente : visible sur votre site, les billets peuvent être achetés.",
            "En cours : l'événement a commencé, les entrées sont scannées.",
            "Terminé : la vente est close ; l'album photo peut être publié.",
            "Annulé : l'événement n'apparaît plus sur le site."
          ),
        ],
      },
      {
        id: "detail",
        title: "La page d'un événement",
        summary: "Cinq onglets : Aperçu, Participants, Certifications, Statistiques, Album.",
        blocks: [
          list(
            "Aperçu : affiche, ventes, revenus de l'événement, lien et QR code à partager.",
            "Participants : billets émis, entrées, remboursements, export.",
            "Certifications : envoi des attestations de participation.",
            "Statistiques : ventes dans le temps, formules, réponses au questionnaire.",
            "Album : les photos de l'événement."
          ),
        ],
      },
    ],
  },
  {
    id: "billets",
    title: "Billets et formules",
    description: "Tarifs, cotisations, couleurs et modèles de billets, cartons de mariage compris.",
    icon: "M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 1 0-6V6H3zM14 6v12",
    articles: [
      {
        id: "formules",
        title: "Créer des formules",
        summary: "Standard, VIP, étudiant, invitation : autant de tarifs que nécessaire.",
        blocks: [
          p("Chaque formule a un nom, un prix, un nombre de places et, si vous le souhaitez, une description des avantages inclus."),
          list(
            "Prix à 0 : inscription gratuite, sans paiement.",
            "Fin des ventes : idéal pour un tarif « early bird ».",
            "Max. par commande : limite le nombre de billets par achat.",
            "Visible sur la vitrine : décochez pour une formule réservée aux invitations."
          ),
          note("Une formule dont des billets ont été vendus ne peut plus être supprimée, et sa quantité ne peut pas descendre sous le nombre de billets vendus."),
        ],
      },
      {
        id: "cotisation",
        title: "La formule Cotisation",
        summary: "Pour les mariages et fêtes privées : chacun donne ce qu'il veut, à partir d'un minimum.",
        blocks: [
          p("Choisissez « Cotisation libre » comme type de formule, puis indiquez un montant suggéré et un minimum. Sur votre site, l'invité choisit un montant proposé ou saisit le sien."),
          p("Le billet d'une cotisation porte la mention « J'ai cotisé pour la réussite de… » avec le montant. Il sert aussi de billet d'entrée et se scanne comme les autres."),
          note("Le minimum d'une cotisation est de 150 F, le plus petit paiement Mobile Money accepté."),
        ],
      },
      {
        id: "couleurs-modeles",
        title: "Couleurs et modèles de billet",
        summary: "Une couleur par formule pour les reconnaître à l'entrée, et un modèle par événement.",
        blocks: [
          p("Dans l'édition d'une formule, « Couleur du billet » lui donne une couleur d'accent. À l'entrée, votre équipe distingue ainsi un VIP d'un standard au premier regard."),
          p("Le « Modèle du billet » s'applique à toutes les formules : billet à talon, badge, bracelet ou carton d'invitation. L'aperçu se met à jour à chaque choix."),
        ],
      },
      {
        id: "cartons-mariage",
        title: "Cartons d'invitation de mariage",
        summary: "Cinq modèles, avec la photo du couple et vos propres textes.",
        blocks: [
          p("La catégorie « Mariage » propose trois cartons en portrait et deux cartons « Save the date » en paysage."),
          list(
            "Photo du couple : importez-la, elle remplace l'illustration (alliances et cœurs) affichée par défaut.",
            "Textes : en-tête, phrase d'accroche, prénoms des mariés, mot libre et libellé de l'invité sont modifiables. Un champ laissé vide garde le texte du modèle.",
            "Chaque carton porte le nom de l'invité et son QR code d'entrée."
          ),
        ],
      },
    ],
  },
  {
    id: "ventes",
    title: "Ventes et paiements",
    description: "Comment vos participants achètent, paient et reçoivent leurs billets.",
    icon: "M2 7h20v10H2zM2 11h20M6 15h3",
    articles: [
      {
        id: "parcours-achat",
        title: "Le parcours d'achat",
        summary: "Choix des billets, coordonnées, paiement, billets à l'écran et par e-mail.",
        blocks: [
          steps(
            "Le participant choisit ses billets sur la page de l'événement (10 au plus par commande).",
            "Il indique son nom, son téléphone et son e-mail, et répond au questionnaire s'il y en a un.",
            "Il paie par Mobile Money ou par carte.",
            "Ses billets s'affichent aussitôt, avec le QR code, et partent par e-mail avec la facture."
          ),
          note("Les places sont réservées pendant le paiement. Un paiement non terminé libère les places automatiquement."),
        ],
      },
      {
        id: "moyens-paiement",
        title: "Mobile Money et carte bancaire",
        summary: "Airtel Money, Moov Money et carte, encaissés par notre prestataire de paiement.",
        blocks: [
          p("Mobile Money : le participant valide le paiement sur son téléphone. Montant accepté par paiement : à partir de 150 F."),
          p("Carte bancaire : une fenêtre sécurisée s'ouvre par-dessus votre site. Dès le paiement validé, elle se ferme et les billets s'affichent."),
          note("Si la fenêtre de paiement est masquée, le bouton « Afficher la fenêtre de paiement » la ramène au premier plan."),
        ],
      },
      {
        id: "remboursement",
        title: "Rembourser une commande",
        summary: "Depuis l'onglet Participants, pour le propriétaire et les managers.",
        blocks: [
          p("Ouvrez l'onglet Participants de l'événement, puis remboursez la commande concernée. Les billets sont annulés et les places remises en vente."),
          note("Une vente déjà reversée ne peut être remboursée que si vos recettes à venir couvrent le montant. Sinon, écrivez au support."),
        ],
      },
    ],
  },
  {
    id: "controle-acces",
    title: "Contrôle d'accès",
    description: "Scanner les billets à l'entrée, y compris sans connexion.",
    icon: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10",
    articles: [
      {
        id: "scanner",
        title: "Scanner les billets",
        summary: "Le téléphone suffit : ouvrez le scanner et visez le QR code.",
        blocks: [
          steps("Ouvrez « Contrôle d'accès ».", "Choisissez l'événement.", "Visez le QR code du billet : le résultat s'affiche en moins d'une seconde."),
          list("Vert : billet valide, l'entrée est enregistrée.", "Orange : billet déjà scanné, avec l'heure du premier passage.", "Rouge : billet inconnu, annulé ou remboursé."),
        ],
        link: { label: "Ouvrir le scanner", href: "/scan" },
      },
      {
        id: "hors-connexion",
        title: "Scanner sans connexion",
        summary: "Le scanner continue de fonctionner quand le réseau tombe.",
        blocks: [
          p("Chaque billet porte une signature numérique que le scanner sait vérifier sans réseau. Les entrées enregistrées hors connexion sont envoyées dès que la connexion revient."),
          note("Ouvrez le scanner une première fois avec du réseau, avant l'arrivée du public, pour qu'il se prépare."),
        ],
      },
    ],
  },
  {
    id: "participants",
    title: "Participants et attestations",
    description: "La liste des inscrits, le questionnaire et les certificats de participation.",
    icon: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
    articles: [
      {
        id: "liste",
        title: "Suivre les participants",
        summary: "Qui a acheté, qui est entré, qui a été remboursé.",
        blocks: [
          p("L'onglet Participants liste chaque billet avec son titulaire, sa formule et son état. Filtrez par « Entrés », « En attente » ou « Remboursés », et exportez la liste en CSV."),
          p("Vous pouvez aussi valider une entrée à la main, pour un participant dont le téléphone est déchargé."),
        ],
      },
      {
        id: "questionnaire",
        title: "Questionnaire d'inscription",
        summary: "Posez vos questions au moment de l'achat et lisez les réponses en graphiques.",
        blocks: [
          p("À l'étape Questionnaire de l'éditeur, ajoutez vos questions (choix unique, choix multiple, texte, note…) et marquez celles qui sont obligatoires."),
          p("Les réponses apparaissent dans l'onglet Statistiques de l'événement."),
        ],
      },
      {
        id: "attestations",
        title: "Attestations de participation",
        summary: "Un certificat PDF au nom de chaque participant, vérifiable en ligne.",
        blocks: [
          p("Activez le certificat à la dernière étape de l'éditeur : modèle, titre, organisme et signataires. Il peut partir automatiquement le lendemain de l'événement ou à votre demande, aux présents seulement ou à tous les inscrits."),
          p("L'onglet Certifications montre qui a reçu, ouvert ou vérifié son attestation."),
        ],
      },
    ],
  },
  {
    id: "album",
    title: "Album photo",
    description: "Les photos de l'événement, publiées dans la rubrique Souvenirs de votre site.",
    icon: "M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M15 9h.01",
    articles: [
      {
        id: "importer",
        title: "Importer et gérer les photos",
        summary: "Glissez vos photos, masquez celles que vous ne voulez pas montrer.",
        blocks: [
          steps("Ouvrez l'onglet Album de l'événement.", "Glissez vos photos ou cliquez sur « Importer des photos ».", "Cochez des photos pour les masquer sur le site ou les supprimer (Maj + clic pour une série)."),
          list("Jusqu'à 300 photos par événement, en PNG, JPG ou WEBP.", "Chaque photo est allégée avant l'envoi : l'import reste rapide, même sur mobile.", "Les photos visibles sont publiées une fois l'événement terminé."),
        ],
      },
    ],
  },
  {
    id: "site",
    title: "Mon site web",
    description: "Votre vitrine publique : apparence, contenu et adresse.",
    icon: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3z",
    articles: [
      {
        id: "personnaliser",
        title: "Personnaliser son site",
        summary: "Modèle, couleurs, textes et rubriques affichées.",
        blocks: [
          p("« Mon site web » ouvre l'éditeur de votre vitrine. Choisissez un modèle, vos couleurs et les rubriques à afficher : événements à venir, à propos, souvenirs, contact."),
          p("Vos événements en vente y apparaissent automatiquement, avec leur page de réservation."),
        ],
        link: { label: "Ouvrir mon site web", href: `${BASE}/showcase` },
      },
      {
        id: "adresse",
        title: "L'adresse de votre site",
        summary: "Un lien à votre nom, à partager partout.",
        blocks: [
          p("Votre site a sa propre adresse, formée à partir du nom de votre organisation. Le bouton « Voir mon site » en haut de l'écran l'ouvre ; l'aperçu d'un événement propose aussi son lien direct et un QR code à imprimer."),
        ],
      },
    ],
  },
  {
    id: "revenus",
    title: "Revenus",
    description: "Ce que vos ventes rapportent, la commission et les reversements.",
    icon: "M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2zM16.5 14h.01",
    articles: [
      {
        id: "solde",
        title: "Comprendre son solde",
        summary: "À venir, versement en cours, déjà reversé.",
        blocks: [
          list(
            "À venir : le net de vos ventes qui partira dans votre prochain versement.",
            "Versement en cours : un versement préparé ou en cours d'envoi.",
            "Déjà reversé : ce que vous avez reçu sur votre Mobile Money."
          ),
          p("Le net d'une vente est son montant moins la commission GiyaX, qui comprend les frais de paiement. Les billets gratuits ne coûtent rien."),
          note("Le module Revenus est réservé au propriétaire du compte."),
        ],
        link: { label: "Ouvrir Revenus", href: `${BASE}/revenue` },
      },
      {
        id: "releve",
        title: "Relevé et reversements",
        summary: "Chaque vente ligne par ligne, par événement, avec export.",
        blocks: [
          p("L'onglet Relevé liste chaque vente et chaque remboursement : montant brut, commission, net et état. Filtrez par événement et exportez le tout en CSV."),
          p("Un clic sur un versement montre sa répartition par événement. Depuis l'aperçu d'un événement, l'encart Revenus mène au relevé déjà filtré."),
        ],
      },
      {
        id: "compte-versement",
        title: "Compte de versement",
        summary: "Le numéro Mobile Money qui reçoit vos recettes.",
        blocks: [
          p("Ajoutez votre compte Airtel Money ou Moov Money dans Paramètres › Paiements, et choisissez la fréquence : après chaque événement ou chaque semaine."),
          note("Pour votre sécurité, un numéro modifié n'est utilisable qu'après 48 heures."),
        ],
        link: { label: "Régler mes paiements", href: `${BASE}/settings?rubrique=paiements` },
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Être prévenu de chaque vente, même GiyaX fermé.",
    icon: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0",
    articles: [
      {
        id: "activer",
        title: "Activer les notifications",
        summary: "Sur chaque appareil, en un clic depuis la cloche.",
        blocks: [
          steps("Cliquez sur la cloche en haut de l'écran.", "Choisissez « Activer » et autorisez les notifications dans votre navigateur.", "Envoyez un essai depuis Paramètres › Notifications pour vérifier."),
          p("Chaque membre de l'équipe active les notifications sur ses propres appareils. Le propriétaire et les managers sont prévenus à chaque vente, inscription ou cotisation."),
          note("Sur iPhone et iPad, ajoutez d'abord GiyaX à l'écran d'accueil (Partager › Sur l'écran d'accueil), puis activez les notifications depuis l'application installée."),
        ],
        link: { label: "Régler mes notifications", href: `${BASE}/settings?rubrique=notifications` },
      },
    ],
  },
  {
    id: "equipe",
    title: "Équipe et rôles",
    description: "Inviter des collaborateurs et choisir ce qu'ils peuvent faire.",
    icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
    articles: [
      {
        id: "roles",
        title: "Les trois rôles",
        summary: "Propriétaire, manager, scanner.",
        blocks: [
          list(
            "Propriétaire : tout, y compris les revenus, les comptes de versement et le journal d'audit.",
            "Manager : événements, participants, remboursements, attestations et site web.",
            "Scanner : le contrôle d'accès uniquement, sur un écran de scan simplifié."
          ),
          p("Un scanner peut être limité à certains événements : il ne verra et ne scannera que ceux-là."),
        ],
        link: { label: "Gérer mon équipe", href: `${BASE}/users` },
      },
    ],
  },
  {
    id: "parametres",
    title: "Paramètres et sécurité",
    description: "Organisation, e-mails, données, mot de passe et journal d'audit.",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
    articles: [
      {
        id: "organisation",
        title: "Régler son organisation",
        summary: "Logo, coordonnées, identité légale et messages envoyés aux participants.",
        blocks: [
          list(
            "Général : nom, logo, description, téléphone et adresse, repris sur le site, les billets et les attestations.",
            "Identité légale : les mentions de vos factures (facultatif).",
            "E-mails et messages : le texte des e-mails envoyés à vos participants."
          ),
        ],
        link: { label: "Ouvrir les paramètres", href: `${BASE}/settings` },
      },
      {
        id: "securite",
        title: "Sécurité du compte et des billets",
        summary: "Mot de passe, QR codes signés et journal d'audit.",
        blocks: [
          p("Changez votre mot de passe depuis le menu de votre compte, « Sécurité et mot de passe ». Vous pouvez aussi vous connecter avec Google."),
          p("Chaque billet porte un QR code signé, unique : un QR recopié ou inventé est refusé à l'entrée, et un billet ne passe qu'une fois."),
          p("Le journal d'audit (propriétaire) garde la trace des actions sensibles : paiements, remboursements, changements d'équipe."),
        ],
      },
      {
        id: "donnees",
        title: "Vos données",
        summary: "Export et suppression, à votre demande.",
        blocks: [p("La rubrique « Mes données » des paramètres explique quelles données sont conservées, pendant combien de temps, et comment en demander l'export ou la suppression.")],
        link: { label: "Mes données", href: `${BASE}/settings?rubrique=donnees` },
      },
    ],
  },
];

// Texte d'un article, pour la recherche.
export function helpText(a: HelpArticle): string {
  const blocks = a.blocks.map((b) => ("items" in b ? b.items.join(" ") : b.text)).join(" ");
  return `${a.title} ${a.summary} ${blocks}`;
}
