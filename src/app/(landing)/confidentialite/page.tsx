import type { Metadata } from "next";
import Link from "next/link";
import { Ext, H3, LegalPage, List, Mail, Note, Table, type LegalSection } from "@/components/legal/legal-page";
import { APDPVP, LEGAL, LEGAL_LINKS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité · GiyaX",
  description: "Quelles données GiyaX traite, pourquoi, combien de temps, avec qui, et comment exercer vos droits (dont l'accès aux données Google).",
  alternates: { canonical: LEGAL_LINKS.privacy },
};

// Politique de confidentialité : RGPD (UE), loi gabonaise n° 001/2011 modifiée
// par la loi n° 025/2023 (autorité : APDPVP), Google API Services User Data
// Policy (connexion Google, envoi par Gmail). À relire par un juriste avant
// une diffusion large ; tenir à jour avec la liste des prestataires.

const publisher = [LEGAL.publisher, LEGAL.address || `${LEGAL.city}, ${LEGAL.country}`, LEGAL.rccm && `RCCM ${LEGAL.rccm}`, LEGAL.nif && `NIF ${LEGAL.nif}`].filter(Boolean).join(" · ");

const sections: LegalSection[] = [
  {
    id: "responsable",
    title: "Qui sommes-nous",
    body: (
      <>
        <p>
          {LEGAL.brand} est une plateforme de gestion pour les organisateurs d&apos;événements, restaurants, commerces et hébergements : billetterie et contrôle d&apos;accès, commandes,
          réservations, paiements en ligne et sites publics. Elle est éditée par <strong>{publisher}</strong> (« {LEGAL.brand} », « nous »).
        </p>
        <p>
          Pour toute question sur vos données, écrivez à notre référent protection des données : <Mail to={LEGAL.privacyEmail} />. Nous répondons dans un délai
          d&apos;un mois au plus.
        </p>
        {LEGAL.apdpvpReference && <p>Nos traitements ont fait l&apos;objet des formalités prévues auprès de l&apos;APDPVP : {LEGAL.apdpvpReference}.</p>}
      </>
    ),
  },
  {
    id: "roles",
    title: "Qui est responsable de quelles données",
    body: (
      <>
        <p>Nous intervenons à deux titres, selon les personnes concernées :</p>
        <Table
          head={["Personnes concernées", "Rôle de GiyaX", "Ce que cela signifie"]}
          rows={[
            [
              "Clients professionnels (organisateurs, commerçants, hôtes) et leurs équipes ; visiteurs du site GiyaX",
              "Responsable du traitement",
              "Nous décidons pourquoi et comment ces données sont traitées, dans le cadre décrit ici.",
            ],
            [
              "Clients de nos clients : participants, acheteurs de billets, clients d'un restaurant ou d'une boutique, voyageurs",
              "Sous-traitant",
              "Chaque organisateur ou commerçant est responsable des données de ses clients. Nous les traitons pour son compte, uniquement sur ses instructions, pour fournir le service (billets, commandes, rappels, attestations).",
            ],
          ]}
        />
        <p>
          Si vous avez acheté un billet ou passé une commande, adressez d&apos;abord vos demandes à l&apos;organisateur ou au commerçant concerné (ses coordonnées figurent sur son site
          et dans vos e-mails). Vous pouvez aussi nous écrire : nous transmettrons votre demande et l&apos;aiderons à y répondre.
        </p>
      </>
    ),
  },
  {
    id: "donnees",
    title: "Les données que nous traitons",
    body: (
      <>
        <Table
          head={["Catégorie", "Exemples", "Origine"]}
          rows={[
            ["Compte", "Nom, e-mail, téléphone, mot de passe (stocké uniquement sous forme chiffrée irréversible), rôle, photo de profil Google le cas échéant", "Vous, ou votre administrateur lors d'une invitation"],
            ["Organisation", "Nom, logo, description, coordonnées, identité légale (raison sociale, NIF, RCCM), comptes de versement Mobile Money (opérateur, numéro, titulaire)", "Le propriétaire de l'espace"],
            ["Participants et clients", "Nom, e-mail, téléphone, billets et commandes, présence à l'entrée (scan), réservations, attestations, réponses aux questions d'inscription", "Les personnes elles-mêmes, via le site de l'organisateur ; l'organisateur"],
            ["Paiements", "Montant, référence et statut de la transaction, opérateur. Les numéros de carte et codes Mobile Money sont saisis chez le prestataire de paiement : nous ne les recevons jamais.", "Prestataire de paiement"],
            ["Données techniques et de sécurité", "Adresse IP, navigateur, dates de connexion, journal des actions sensibles (journal d'audit), tentatives de fraude au contrôle d'accès", "Votre appareil, nos serveurs"],
            ["Contenus", "Textes, images et affiches publiés sur les sites publics ; consignes données à l'assistant IA", "Vous"],
            ["Données Google", "Voir la section « Données Google » ci-dessous", "Google, avec votre accord"],
          ]}
        />
        <p>
          Nous ne collectons pas de données dites sensibles (santé, opinions, religion…). N&apos;en saisissez pas dans les champs libres, ni dans les questions posées aux
          participants.
        </p>
      </>
    ),
  },
  {
    id: "finalites",
    title: "Pourquoi nous les utilisons",
    body: (
      <>
        <Table
          head={["Finalité", "Base légale"]}
          rows={[
            ["Créer et sécuriser votre compte, vous connecter (e-mail et mot de passe, ou Google), réinitialiser un mot de passe oublié", "Exécution du contrat"],
            ["Fournir le service : vente et envoi des billets, contrôle d'accès, commandes, réservations, sites publics, attestations", "Exécution du contrat (pour le compte de l'organisateur)"],
            ["Encaisser les paiements et verser les recettes aux comptes vérifiés", "Exécution du contrat ; obligations légales"],
            ["Envoyer les e-mails liés au service (et, lorsqu'ils seront activés, les SMS) : billets, confirmations, rappels, codes de vérification, invitations d'équipe", "Exécution du contrat ; intérêt légitime de l'organisateur à informer ses participants"],
            ["Prévenir la fraude (billets falsifiés ou réutilisés), protéger la plateforme, tenir un journal d'audit", "Intérêt légitime ; obligations légales"],
            ["Tenir la comptabilité et répondre aux autorités", "Obligation légale"],
            ["Répondre à vos demandes de support", "Exécution du contrat ; intérêt légitime"],
            ["Améliorer le service à partir de statistiques agrégées (jamais individuelles)", "Intérêt légitime"],
            ["Vous informer des nouveautés de GiyaX", "Consentement, retirable à tout moment (lien de désinscription)"],
          ]}
        />
        <p>Nous ne vendons pas vos données, ne les louons pas et ne les utilisons pas pour de la publicité ciblée.</p>
      </>
    ),
  },
  {
    id: "google",
    title: "Données Google (connexion et envoi par Gmail)",
    body: (
      <>
        <p>Deux fonctions facultatives utilisent votre compte Google. Vous choisissez de les activer et pouvez les retirer à tout moment.</p>
        <H3>Se connecter avec Google</H3>
        <p>
          Nous recevons votre nom, votre adresse e-mail (vérifiée par Google) et votre photo de profil, pour créer votre compte ou vous identifier. Nous ne recevons pas votre mot de
          passe Google.
        </p>
        <H3>Envoyer vos e-mails depuis votre adresse Gmail</H3>
        <p>
          Dans Paramètres › E-mails et messages, un organisateur peut connecter son compte Gmail pour que les e-mails de son espace (billets, rappels, attestations, invitations
          d&apos;équipe) partent de sa propre adresse. Nous demandons alors uniquement :
        </p>
        <List
          items={[
            <>votre adresse e-mail Google (portées « openid » et « email »), pour savoir de quelle adresse partent les envois ;</>,
            <>
              l&apos;autorisation d&apos;<strong>envoyer</strong> des e-mails en votre nom (portée <code className="text-[13px]">gmail.send</code>).
            </>,
          ]}
        />
        <p>
          Cette autorisation ne permet <strong>ni de lire</strong> votre boîte de réception, <strong>ni d&apos;accéder</strong> à vos contacts, brouillons, libellés ou pièces jointes
          reçues. Nous ne consultons jamais vos e-mails.
        </p>
        <List
          items={[
            <>
              <strong>Utilisation</strong> : uniquement pour envoyer, à votre demande, les e-mails transactionnels de votre espace à vos participants et à votre équipe.
            </>,
            <>
              <strong>Conservation</strong> : le jeton d&apos;autorisation est chiffré (AES-256-GCM) et conservé jusqu&apos;à la déconnexion ; le jeton d&apos;accès temporaire, chiffré
              lui aussi, expire au bout d&apos;une heure. Nous ne gardons pas de copie des e-mails envoyés par votre Gmail : seul Gmail les range dans vos « Messages envoyés ».
            </>,
            <>
              <strong>Partage</strong> : ces données ne sont transmises à personne, sauf à Google pour exécuter l&apos;envoi, ou si la loi l&apos;exige.
            </>,
            <>
              <strong>Interdits</strong> : aucune utilisation pour de la publicité, aucune revente, aucun transfert à des courtiers en données, aucune utilisation pour entraîner des
              modèles d&apos;intelligence artificielle. Aucun membre de notre équipe ne lit ces données, sauf avec votre accord explicite, pour des raisons de sécurité (enquête
              sur un abus), pour respecter la loi, ou sous forme agrégée et anonymisée pour le fonctionnement interne.
            </>,
            <>
              <strong>Retrait</strong> : bouton « Déconnecter » dans Paramètres › E-mails et messages (le jeton est révoqué chez Google et supprimé de nos serveurs), ou depuis{" "}
              <Ext href="https://myaccount.google.com/permissions">la page Autorisations de votre compte Google</Ext>.
            </>,
          ]}
        />
        <Note>
          <p className="font-semibold">Limited Use disclosure</p>
          <p className="mt-1" lang="en">
            {LEGAL.brand}&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
            <Ext href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</Ext>, including the Limited Use requirements.
          </p>
          <p className="mt-2">
            L&apos;utilisation et le transfert vers toute autre application des informations reçues des API Google par {LEGAL.brand} respectent les règles d&apos;utilisation des
            données des utilisateurs des services API de Google, y compris les exigences d&apos;utilisation limitée.
          </p>
        </Note>
      </>
    ),
  },
  {
    id: "destinataires",
    title: "Qui peut y accéder",
    body: (
      <>
        <List
          items={[
            <>
              <strong>Notre équipe</strong>, dans la limite de ses missions (support, sécurité, facturation), avec des accès nominatifs, protégés par double authentification
              pour la console d&apos;administration, et journalisés.
            </>,
            <>
              <strong>Les organisateurs et commerçants</strong>, pour les données de leurs propres clients uniquement. Chaque espace est cloisonné : une organisation ne peut
              jamais voir les données d&apos;une autre.
            </>,
            <>
              <strong>Nos prestataires techniques</strong> (sous-traitants), tenus contractuellement à la confidentialité et à la sécurité, qui n&apos;utilisent les données que
              pour nous rendre le service :
            </>,
          ]}
        />
        <Table
          head={["Prestataire", "Service", "Localisation des traitements"]}
          rows={[
            ["Render", "Hébergement de l'API", "Union européenne (Francfort, Allemagne)"],
            ["Supabase", "Base de données et stockage des sauvegardes chiffrées", "Selon la région du projet"],
            ["GitHub (Microsoft)", "Exécution automatique des sauvegardes : l'archive est chiffrée avant d'être stockée", "États-Unis"],
            ["Sentry", "Détection des erreurs techniques ; numéros, e-mails, cookies et contenus des formulaires retirés avant l'envoi", "Union européenne (Allemagne)"],
            ["Upstash", "Cache et files techniques (sessions, codes, quotas)", "Selon la région du service"],
            ["Vercel", "Hébergement des pages web", "Réseau mondial (États-Unis, UE)"],
            ["PVit (BakoAI)", "Paiements en ligne (Mobile Money, carte) et vérification du numéro payeur", "Gabon ; hébergement OVHcloud et AWS"],
            ["Google", "Connexion avec Google, envoi des e-mails (API Gmail)", "États-Unis et monde"],
            ["Prestataire SMS (pas encore activé)", "Codes de vérification et notifications par SMS", "Selon le prestataire retenu"],
            ["Groq", "Assistant IA (rédaction de textes)", "États-Unis — les consignes ne contiennent pas de données personnelles"],
            ["Cloudflare", "Assistant IA (images d'affiche)", "Réseau mondial — les consignes ne contiennent pas de données personnelles"],
            ["Google Maps", "Carte du lieu sur la page publique d'un événement", "États-Unis et monde"],
            ["OpenStreetMap (fondation OSMF)", "Fond de carte et recherche d'adresse dans l'éditeur d'événement", "Royaume-Uni et Union européenne"],
          ]}
        />
        <p>
          <strong>Les autorités</strong> administratives ou judiciaires, uniquement lorsque la loi nous y oblige. En cas de cession ou de fusion de l&apos;activité, les données
          seraient transférées au repreneur, qui resterait tenu par la présente politique ; vous en seriez informé au préalable.
        </p>
      </>
    ),
  },
  {
    id: "transferts",
    title: "Transferts hors du Gabon et de l'Union européenne",
    body: (
      <>
        <p>
          Plusieurs de nos prestataires hébergent ou traitent des données hors du Gabon (Union européenne et États-Unis, voir le tableau ci-dessus). La loi gabonaise
          n&apos;autorise un transfert vers un autre État que s&apos;il assure un niveau de protection suffisant, ou avec l&apos;autorisation de l&apos;APDPVP : nous accomplissons
          les formalités prévues auprès de l&apos;APDPVP pour ces transferts.
        </p>
        <p>
          Ces transferts sont en outre encadrés par les garanties proposées par nos prestataires (clauses contractuelles types de la Commission européenne, décisions
          d&apos;adéquation ou mécanismes équivalents), et les données sont chiffrées pendant leur transport. Vous pouvez nous demander une copie des garanties applicables.
        </p>
      </>
    ),
  },
  {
    id: "conservation",
    title: "Combien de temps nous les gardons",
    body: (
      <>
        <Table
          head={["Données", "Durée"]}
          rows={[
            ["Compte et espace de l'organisation", "Tant que le compte est actif, puis 30 jours après la clôture (le temps d'exporter vos données), sauf obligation légale"],
            ["Billets, commandes, réservations et attestations des participants (nom, e-mail, téléphone, adresse, réponses)", "Au plus 3 ans après la commande ou le séjour, puis anonymisation automatique ; les montants restent pour la comptabilité"],
            ["Numéro Mobile Money ayant servi au paiement", "3 ans, puis effacement automatique"],
            ["Fiche client d'un commerçant", "3 ans après la dernière activité, puis suppression automatique"],
            ["Pièces comptables et factures", "10 ans (obligation légale, droit comptable OHADA)"],
            ["Journaux de sécurité et d'audit", "12 mois, puis suppression automatique"],
            ["Sauvegardes chiffrées de la base", "30 jours"],
            ["Codes de vérification (mot de passe oublié, versements)", "15 minutes au plus"],
            ["Liens d'invitation d'équipe", "7 jours"],
            ["Session de connexion (cookie)", "7 jours, renouvelée à chaque visite"],
            ["Autorisation Gmail", "Jusqu'à la déconnexion ; supprimée immédiatement ensuite"],
            ["Consignes et réponses de l'assistant IA", "12 mois, pour la sécurité et le suivi des coûts, puis suppression automatique"],
            ["Historique de vos conversations avec GiyaX AI", "Jusqu'à ce que vous les supprimiez, ou la clôture du compte"],
            ["Avis et suggestions", "3 ans, pour suivre l'évolution du produit, puis suppression automatique"],
          ]}
        />
      </>
    ),
  },
  {
    id: "securite",
    title: "Comment nous protégeons vos données",
    body: (
      <>
        <List
          items={[
            "Chiffrement des échanges (HTTPS/TLS) et des secrets sensibles au repos (jetons Google, secrets de double authentification).",
            "Mots de passe stockés uniquement sous forme hachée (bcrypt) : personne, chez nous, ne peut les lire.",
            "Cloisonnement de chaque organisation jusque dans la base de données (sécurité au niveau des lignes).",
            "Billets signés électroniquement (Ed25519) pour empêcher les faux et les copies.",
            "Accès par rôles (propriétaire, manager, contrôleur…), journal d'audit des actions sensibles, limitation des tentatives de connexion.",
            "Confirmation, avec l'organisateur, du compte qui reçoit les versements avant le premier virement.",
            "Sauvegarde chiffrée (AES-256) de la base chaque nuit, restaurée automatiquement pour test, conservée 30 jours.",
            "Surveillance continue de la plateforme et détection des erreurs, avec retrait des données personnelles avant tout envoi à l'outil de détection.",
            "Protection des données dès la conception : seules les données utiles au service sont demandées, et chaque formulaire public indique à quoi elles servent.",
          ]}
        />
        <p>
          En cas de violation de données présentant un risque pour vous, nous prévenons l&apos;autorité compétente et, si nécessaire, les personnes concernées dans les meilleurs
          délais (sous 72 heures lorsque la loi l&apos;exige). Si nous agissons comme sous-traitant, nous prévenons l&apos;organisateur concerné sans retard injustifié.
        </p>
      </>
    ),
  },
  {
    id: "droits",
    title: "Vos droits",
    body: (
      <>
        <p>Où que vous soyez, vous disposez des droits suivants sur vos données :</p>
        <List
          items={[
            <>
              <strong>Accès</strong> : savoir quelles données nous avons sur vous et en obtenir une copie.
            </>,
            <>
              <strong>Rectification</strong> : corriger des données inexactes (la plupart se modifient directement dans votre compte).
            </>,
            <>
              <strong>Effacement</strong> : demander la suppression de vos données, sous réserve de nos obligations légales.
            </>,
            <>
              <strong>Limitation</strong> et <strong>opposition</strong> : demander que l&apos;on cesse ou suspende certains traitements.
            </>,
            <>
              <strong>Portabilité</strong> : recevoir vos données dans un format courant et lisible par machine.
            </>,
            <>
              <strong>Retrait du consentement</strong>, à tout moment, pour les traitements qui en dépendent.
            </>,
            <>
              <strong>Directives</strong> sur le sort de vos données après votre décès, lorsque la loi applicable le prévoit.
            </>,
          ]}
        />
        <p>
          Écrivez-nous à <Mail to={LEGAL.privacyEmail} />. Nous pouvons vous demander de justifier de votre identité. Réponse sous un mois (prolongeable de deux mois pour les demandes
          complexes, en vous prévenant).
        </p>
        <p>
          Vous pouvez aussi saisir l&apos;autorité de protection des données. Au Gabon : <strong>{APDPVP.name}</strong>, {APDPVP.address} ; {APDPVP.phone} ;{" "}
          <Mail to={APDPVP.email} /> ; <Ext href={APDPVP.url}>apdpvp.ga</Ext> (accueil {APDPVP.hours}). Dans l&apos;Union européenne : l&apos;autorité de votre pays (en
          France, la <Ext href="https://www.cnil.fr">CNIL</Ext>).
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies et stockage sur votre appareil",
    body: (
      <>
        <p>Nous n&apos;utilisons que ce qui est strictement nécessaire au fonctionnement du service. Aucun cookie publicitaire, aucun traceur tiers de mesure d&apos;audience.</p>
        <Table
          head={["Élément", "Rôle", "Durée"]}
          rows={[
            ["Cookie de session (sécurisé, inaccessible aux scripts)", "Vous garder connecté de façon sûre", "7 jours"],
            ["Stockage local du navigateur", "Panier, préférences d'affichage (thème, menu replié), brouillons, indicateur de session sans jeton", "Jusqu'à effacement par vous"],
            ["Stockage local de l'application de contrôle", "Liste des billets de l'événement en cours, pour scanner même sans réseau", "Jusqu'à la fin du contrôle ou effacement"],
            ["Stockage de session du navigateur", "Conversation avec GiyaX AI, pour la retrouver en changeant de page", "Jusqu'à la fermeture de l'onglet"],
          ]}
        />
        <p>Les polices de caractères sont servies par nos propres serveurs : aucune requête n&apos;est envoyée à un service tiers pour les afficher.</p>
        <p>
          <strong>Cartes.</strong> Lorsque l&apos;organisateur a placé le lieu sur une carte, la page de l&apos;événement affiche une carte Google Maps : votre navigateur contacte
          alors Google, qui reçoit votre adresse IP et peut déposer ses propres cookies, selon{" "}
          <Ext href="https://policies.google.com/privacy">les règles de confidentialité de Google</Ext>. Dans l&apos;éditeur, le fond de carte et la recherche d&apos;adresse sont
          fournis par OpenStreetMap, qui reçoit votre adresse IP et le texte recherché (<Ext href="https://osmfoundation.org/wiki/Privacy_Policy">politique de
          l&apos;OSMF</Ext>).
        </p>
      </>
    ),
  },
  {
    id: "ia",
    title: "Assistant IA et décisions automatisées",
    body: (
      <>
        <p>
          L&apos;assistant IA (rédaction de descriptions, de textes de site, traductions, images d&apos;affiche) ne fonctionne qu&apos;à votre demande. Les consignes envoyées aux
          fournisseurs d&apos;IA contiennent les informations de l&apos;événement, du texte à réécrire ou de l&apos;ambiance souhaitée, jamais les données de vos participants ou clients. Elles ne servent pas à entraîner des modèles.
          Les propositions sont des suggestions : vous les relisez et décidez de les publier.
        </p>
        <H3>GiyaX AI, l&apos;assistant conversationnel</H3>
        <p>
          Sur notre site et dans les espaces de gestion, GiyaX AI répond aux questions sur l&apos;application et peut conseiller les responsables. Vos messages sont transmis au
          fournisseur d&apos;IA (Groq) pour produire la réponse, sans servir à entraîner des modèles. Pour les visiteurs non connectés, l&apos;historique des conversations
          reste dans leur navigateur : nous ne le conservons pas sur nos serveurs. Pour les membres connectés, les conversations sont gardées dans leur historique, visible
          d&apos;eux seuls et supprimable à tout moment, et chaque échange est journalisé 12 mois (sécurité, suivi des coûts). N&apos;y indiquez pas de données sensibles ni
          de données de vos clients. GiyaX AI n&apos;a pas accès aux données de votre compte et peut se tromper : vérifiez les informations importantes.
        </p>
        <H3>Vos avis</H3>
        <p>
          Quand vous répondez à « Aidez-nous à améliorer votre expérience », vos réponses et vos idées sont enregistrées avec votre organisation, votre rôle et la page
          d&apos;où vous écrivez, pour que notre équipe les lise et améliore GiyaX. Elles ne sont jamais publiées ni revendues.
        </p>
        <p>
          Nous ne prenons aucune décision produisant des effets juridiques à votre égard sur le seul fondement d&apos;un traitement automatisé. Le contrôle d&apos;accès vérifie la
          validité d&apos;un billet (signature, usage unique) ; un contrôleur humain reste présent à l&apos;entrée.
        </p>
      </>
    ),
  },
  {
    id: "mineurs",
    title: "Mineurs",
    body: (
      <p>
        Les espaces professionnels sont réservés aux personnes majeures. L&apos;achat de billets par un mineur doit se faire avec l&apos;accord de ses représentants légaux. Nous ne
        collectons pas sciemment de données de mineurs de moins de 16 ans sans cet accord ; si vous pensez que c&apos;est le cas, écrivez-nous et nous les supprimerons.
      </p>
    ),
  },
  {
    id: "modifications",
    title: "Modifications de cette politique",
    body: (
      <p>
        Nous pouvons faire évoluer cette politique (nouveau service, nouveau prestataire, évolution de la loi). La date et la version en tête de page indiquent la version en
        vigueur. En cas de changement important, nous vous prévenons par e-mail ou dans l&apos;application au moins 30 jours à l&apos;avance.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Nous contacter",
    body: (
      <>
        <p>
          {publisher}
          <br />
          Données personnelles : <Mail to={LEGAL.privacyEmail} />
          <br />
          Téléphone : <a href={`tel:${LEGAL.phone.replace(/\s/g, "")}`}>{LEGAL.phone}</a>
        </p>
        <p>
          Voir aussi nos <Link href={LEGAL_LINKS.terms} className="font-medium text-primary underline underline-offset-4">conditions d&apos;utilisation</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      kind="privacy"
      title="Politique de confidentialité"
      intro={
        <>
          <p>
            Cette politique explique quelles données personnelles {LEGAL.brand} traite, pourquoi, pendant combien de temps, avec qui elles sont partagées et comment exercer vos
            droits. Elle s&apos;applique au site {LEGAL.brand}, aux espaces de gestion, aux sites publics des organisateurs et aux applications de contrôle d&apos;accès.
          </p>
          <p>
            Elle suit la loi gabonaise n° 001/2011 du 25 septembre 2011 relative à la protection des données à caractère personnel, modifiée par la loi n° 025/2023 du
            12 juillet 2023, le Règlement général sur la protection des données de l&apos;Union européenne (RGPD), et les règles de Google pour l&apos;accès aux données de ses
            utilisateurs.
          </p>
        </>
      }
      summary={[
        "Nous traitons les données nécessaires au service : comptes, billets, commandes, paiements, sécurité. Rien de plus.",
        "Pour les données de vos participants et clients, l'organisateur ou le commerçant est responsable ; nous agissons pour son compte.",
        "Aucune vente de données, aucune publicité ciblée, aucun traceur publicitaire.",
        "L'envoi par Gmail ne demande que l'autorisation d'envoyer : votre boîte n'est jamais lue, et vous pouvez retirer l'accès à tout moment.",
        <>
          Vos droits (accès, rectification, effacement, portabilité, opposition) s&apos;exercent en écrivant à <Mail to={LEGAL.privacyEmail} />.
        </>,
      ]}
      sections={sections}
    />
  );
}
