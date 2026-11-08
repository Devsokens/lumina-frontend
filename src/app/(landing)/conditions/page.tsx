import type { Metadata } from "next";
import Link from "next/link";
import { Ext, H3, LegalPage, List, Mail, Note, type LegalSection } from "@/components/legal/legal-page";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions d'utilisation · GiyaX",
  description: "Règles d'utilisation de GiyaX pour les organisateurs, commerçants et participants : comptes, billetterie, paiements, données, responsabilités.",
  alternates: { canonical: LEGAL_LINKS.terms },
};

// Conditions générales d'utilisation (professionnels et participants), avec
// l'accord de traitement des données (art. 28 RGPD) pour les données des
// participants. Droit gabonais / OHADA. À relire par un juriste avant une
// diffusion large ; les tarifs eux-mêmes sont sur la page Tarifs.

const publisher = [LEGAL.publisher, LEGAL.address || `${LEGAL.city}, ${LEGAL.country}`, LEGAL.rccm && `RCCM ${LEGAL.rccm}`, LEGAL.nif && `NIF ${LEGAL.nif}`].filter(Boolean).join(" · ");
const privacyLink = (
  <Link href={LEGAL_LINKS.privacy} className="font-medium text-primary underline underline-offset-4">
    politique de confidentialité
  </Link>
);

const sections: LegalSection[] = [
  {
    id: "objet",
    title: "Objet et acceptation",
    body: (
      <>
        <p>
          Ces conditions encadrent l&apos;utilisation de {LEGAL.brand}, éditée par {publisher}. Elles s&apos;appliquent aux <strong>clients professionnels</strong> (organisateurs
          d&apos;événements, restaurants, commerces, hébergements et leurs équipes) et aux <strong>participants</strong> (acheteurs de billets, clients, voyageurs) qui utilisent les
          sites publics créés avec {LEGAL.brand}.
        </p>
        <p>
          En créant un compte, en cochant la case prévue à l&apos;inscription ou en achetant un billet, vous acceptez ces conditions et notre {privacyLink}. Si vous agissez pour une
          organisation, vous confirmez avoir le pouvoir de l&apos;engager.
        </p>
      </>
    ),
  },
  {
    id: "definitions",
    title: "Définitions",
    body: (
      <List
        items={[
          <>
            <strong>Plateforme</strong> : le site, les espaces de gestion, les sites publics, l&apos;application de contrôle d&apos;accès et l&apos;API de {LEGAL.brand}.
          </>,
          <>
            <strong>Client professionnel</strong> ou <strong>Organisateur</strong> : la personne ou l&apos;entreprise qui ouvre un espace pour vendre des billets, des produits ou
            des séjours.
          </>,
          <>
            <strong>Participant</strong> : la personne qui achète ou reçoit un billet, passe une commande ou réserve un séjour auprès d&apos;un Organisateur.
          </>,
          <>
            <strong>Espace</strong> : l&apos;environnement de gestion d&apos;une organisation, avec ses membres, ses données et son site public.
          </>,
          <>
            <strong>Billet</strong> : le titre d&apos;accès électronique, signé et à usage unique, émis pour un événement.
          </>,
          <>
            <strong>Formule</strong> : l&apos;abonnement choisi (Gratuite, Standard, Pro, Business), dont le contenu et le prix figurent sur la page Tarifs.
          </>,
        ]}
      />
    ),
  },
  {
    id: "compte",
    title: "Compte et accès",
    body: (
      <>
        <List
          items={[
            "Les espaces professionnels sont réservés aux personnes majeures et capables de contracter.",
            "Vous fournissez des informations exactes et les tenez à jour (identité, coordonnées, identité légale de l'organisation).",
            "Vous gardez vos identifiants confidentiels et nous prévenez sans délai de toute utilisation non autorisée. Les actions faites depuis votre compte sont réputées faites par vous.",
            "Le propriétaire de l'Espace invite ses membres et leur attribue un rôle (manager, contrôleur…). Il reste responsable de leurs actions et retire les accès devenus inutiles.",
          ]}
        />
      </>
    ),
  },
  {
    id: "services",
    title: "Les services",
    body: (
      <>
        <p>Selon la Formule, {LEGAL.brand} permet notamment :</p>
        <List
          items={[
            "de créer et publier des événements, de vendre des billets et de contrôler les entrées (y compris sans réseau) ;",
            "de gérer des menus, commandes, stocks, réservations et séjours ;",
            "de publier un site public à l'image de l'organisation ;",
            "d'encaisser des paiements en ligne et de recevoir les recettes sur un compte de versement vérifié ;",
            "d'envoyer automatiquement billets, confirmations, rappels et attestations ;",
            "d'utiliser un assistant IA pour rédiger des textes.",
          ]}
        />
        <p>
          Nous faisons évoluer la Plateforme en continu. Nous pouvons ajouter, modifier ou retirer une fonction ; si un retrait réduit de façon importante un service payant, nous
          vous prévenons au moins 30 jours à l&apos;avance.
        </p>
      </>
    ),
  },
  {
    id: "tarifs",
    title: "Formules, prix et facturation",
    body: (
      <>
        <List
          items={[
            "Les prix des Formules et les éventuels frais par transaction sont indiqués sur la page Tarifs, en francs CFA, toutes taxes précisées.",
            "Les abonnements sont payables d'avance, pour la période choisie, et se renouvellent jusqu'à résiliation.",
            "Toute hausse de prix vous est annoncée au moins 30 jours avant de s'appliquer ; vous pouvez résilier avant son entrée en vigueur.",
            "Sauf disposition légale contraire, une période commencée n'est pas remboursée. Une montée en gamme s'applique immédiatement, au prorata.",
            "En cas d'impayé, après relance restée sans effet pendant 15 jours, l'Espace peut être limité aux fonctions de la Formule Gratuite.",
          ]}
        />
      </>
    ),
  },
  {
    id: "paiements",
    title: "Paiements et versements",
    body: (
      <>
        <List
          items={[
            "Les paiements des Participants (carte, Mobile Money) sont traités par notre prestataire de paiement agréé. GiyaX n'est ni une banque ni un établissement de paiement et ne conserve aucune donnée de carte.",
            "Les recettes, déduction faite des frais applicables, sont versées sur le compte Mobile Money de l'Organisateur, confirmé avec lui avant le premier versement, selon la fréquence choisie (après l'événement ou chaque semaine).",
            "En cas de soupçon de fraude, de contestation de paiement ou de violation de ces conditions, nous pouvons suspendre un versement le temps de la vérification, en vous en informant.",
            "L'Organisateur reste seul responsable de ses obligations fiscales et sociales liées à ses ventes.",
          ]}
        />
      </>
    ),
  },
  {
    id: "billetterie",
    title: "Billets et ventes entre Organisateurs et Participants",
    body: (
      <>
        <p>
          La vente d&apos;un billet, d&apos;une commande ou d&apos;un séjour est un contrat entre l&apos;<strong>Organisateur</strong> et le <strong>Participant</strong>.{" "}
          {LEGAL.brand} fournit l&apos;outil technique : nous ne sommes ni l&apos;organisateur de l&apos;événement, ni le vendeur.
        </p>
        <H3>L&apos;Organisateur s&apos;engage à</H3>
        <List
          items={[
            "publier des informations exactes (date, lieu, prix, conditions d'accès, âge minimum) ;",
            "disposer des autorisations, assurances et droits nécessaires à son événement (lieu, sécurité, musique, images) ;",
            "afficher ses conditions d'annulation et de remboursement, et les respecter ;",
            "accueillir les Participants munis d'un billet valide dans les conditions annoncées.",
          ]}
        />
        <H3>Le Participant s&apos;engage à</H3>
        <List
          items={[
            "fournir une adresse e-mail ou un numéro valide pour recevoir ses billets ;",
            "présenter son billet (QR code) à l'entrée : chaque billet n'est valable qu'une seule fois, une copie est refusée ;",
            "ne pas revendre ni céder son billet si l'Organisateur l'interdit.",
          ]}
        />
      </>
    ),
  },
  {
    id: "annulation",
    title: "Annulation, report et remboursement",
    body: (
      <>
        <p>
          Les conditions de remboursement sont celles de l&apos;Organisateur. Si un événement est <strong>annulé</strong>, l&apos;Organisateur rembourse les Participants du prix des
          billets ; {LEGAL.brand} met à sa disposition les outils de remboursement via le prestataire de paiement. En cas de <strong>report</strong>, les billets restent
          valables pour la nouvelle date, sauf si l&apos;Organisateur propose un remboursement.
        </p>
        <p>
          Les frais de service éventuellement facturés au Participant peuvent ne pas être remboursables, si cela a été clairement indiqué avant l&apos;achat. Pour toute demande,
          contactez d&apos;abord l&apos;Organisateur ; si vous n&apos;obtenez pas de réponse, écrivez-nous à <Mail to={LEGAL.email} />.
        </p>
      </>
    ),
  },
  {
    id: "usage",
    title: "Usage acceptable",
    body: (
      <>
        <p>Il est interdit d&apos;utiliser la Plateforme pour :</p>
        <List
          items={[
            "proposer des événements, produits ou contenus illicites, trompeurs, haineux, violents, contrefaisants ou portant atteinte aux droits d'autrui ;",
            "vendre des billets fictifs, gonfler artificiellement les ventes, blanchir de l'argent ou contourner les frais ;",
            "envoyer des messages non sollicités : les envois servent uniquement aux Participants et aux membres concernés par votre activité ;",
            "collecter des données d'autres utilisateurs, aspirer le site, contourner les limites techniques ou de sécurité, tester des failles sans autorisation écrite ;",
            "copier, décompiler ou revendre la Plateforme, ou l'utiliser pour créer un service concurrent.",
          ]}
        />
        <p>
          Vous pouvez nous signaler un contenu ou un événement illicite à <Mail to={LEGAL.email} /> ; nous l&apos;examinons rapidement et pouvons le retirer.
        </p>
      </>
    ),
  },
  {
    id: "donnees",
    title: "Données personnelles et accord de traitement",
    body: (
      <>
        <p>
          Notre {privacyLink} décrit nos traitements. Pour les données des Participants, l&apos;Organisateur est <strong>responsable du traitement</strong> et {LEGAL.brand}{" "}
          <strong>sous-traitant</strong>. Le présent article tient lieu d&apos;accord de traitement des données. {LEGAL.brand} s&apos;engage à :
        </p>
        <List
          items={[
            "ne traiter ces données que pour fournir le service et sur les instructions documentées de l'Organisateur (ses réglages et actions dans la Plateforme valent instructions) ;",
            "garantir la confidentialité des personnes qui y ont accès et mettre en œuvre les mesures de sécurité décrites dans la politique de confidentialité ;",
            "ne recourir qu'aux sous-traitants listés dans la politique de confidentialité, tenus aux mêmes obligations, et informer l'Organisateur de tout changement ;",
            "aider l'Organisateur à répondre aux demandes d'exercice des droits et à remplir ses obligations (sécurité, analyses d'impact) ;",
            "notifier l'Organisateur sans retard injustifié de toute violation de données le concernant ;",
            "à la fin du contrat, lui permettre d'exporter ses données puis les supprimer, sauf obligation légale de conservation ;",
            "mettre à sa disposition les informations nécessaires pour démontrer le respect de ces obligations.",
          ]}
        />
        <p>
          L&apos;Organisateur garantit disposer d&apos;une base légale pour les données qu&apos;il collecte (y compris par les questions posées à l&apos;inscription) et informe ses
          Participants.
        </p>
      </>
    ),
  },
  {
    id: "gmail",
    title: "Envoi des e-mails depuis votre adresse Gmail",
    body: (
      <p>
        Cette fonction est facultative. En connectant votre compte Gmail, vous autorisez {LEGAL.brand} à envoyer en votre nom les e-mails de votre Espace, et uniquement ceux-là ;
        votre boîte n&apos;est jamais lue. Les envois restent soumis aux{" "}
        <Ext href="https://policies.google.com/terms">conditions de Google</Ext> et à ses limites quotidiennes : au-delà, ou si l&apos;autorisation est retirée, les e-mails partent
        de l&apos;adresse {LEGAL.brand}. Vous pouvez déconnecter Gmail à tout moment. Nous ne sommes pas responsables d&apos;une suspension de votre compte Google décidée par Google.
      </p>
    ),
  },
  {
    id: "ia",
    title: "Assistant IA",
    body: (
      <p>
        Les textes proposés par l&apos;assistant IA sont générés automatiquement et peuvent contenir des erreurs. Relisez-les avant de les publier : vous restez responsable des
        contenus publiés. N&apos;indiquez pas de données personnelles de tiers dans vos consignes. Les consignes et propositions ne servent pas à entraîner des modèles d&apos;IA.
      </p>
    ),
  },
  {
    id: "propriete",
    title: "Contenus et propriété intellectuelle",
    body: (
      <>
        <p>
          La Plateforme, sa marque, ses logiciels, modèles de sites et éléments graphiques appartiennent à {LEGAL.publisher}. Vous bénéficiez d&apos;un droit d&apos;utilisation
          personnel, non exclusif et non cessible, pour la durée de votre abonnement.
        </p>
        <p>
          Vous restez propriétaire de vos contenus (textes, logos, photos, affiches). Vous nous accordez le droit de les héberger, reproduire et afficher dans le seul but de
          fournir le service, pour la durée de leur publication. Vous garantissez détenir les droits nécessaires sur ces contenus.
        </p>
      </>
    ),
  },
  {
    id: "disponibilite",
    title: "Disponibilité et support",
    body: (
      <p>
        Nous mettons tout en œuvre pour que la Plateforme soit disponible et sûre, sans pouvoir garantir une disponibilité ininterrompue (maintenance, incident chez un
        prestataire, réseau). Les maintenances planifiées sont annoncées à l&apos;avance lorsque c&apos;est possible. L&apos;application de contrôle d&apos;accès peut fonctionner sans
        réseau pendant un événement. Le support répond à <Mail to={LEGAL.email} /> et au {LEGAL.phone}.
      </p>
    ),
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    body: (
      <>
        <List
          items={[
            "Nous sommes responsables des dommages directs causés par un manquement prouvé à nos obligations.",
            "Nous ne répondons pas des dommages indirects (perte de chiffre d'affaires, d'image, de données non sauvegardées), ni du déroulement des événements, des produits vendus ou des relations entre Organisateurs et Participants.",
            "Pour les clients professionnels, notre responsabilité totale est limitée aux sommes payées pour la Plateforme au cours des 12 mois précédant le fait générateur.",
            "Ces limites ne s'appliquent pas en cas de faute lourde ou intentionnelle, de dommage corporel, ni lorsque la loi l'interdit, notamment à l'égard des consommateurs.",
            "Aucune partie n'est responsable d'un manquement dû à un cas de force majeure.",
          ]}
        />
      </>
    ),
  },
  {
    id: "resiliation",
    title: "Durée, suspension et résiliation",
    body: (
      <>
        <List
          items={[
            "Vous pouvez fermer votre Espace à tout moment ; vos données restent exportables 30 jours, puis sont supprimées, sauf obligation légale de conservation.",
            "Nous pouvons suspendre ou fermer un Espace en cas de manquement grave à ces conditions (fraude, contenu illicite, impayé persistant, atteinte à la sécurité), après mise en demeure restée sans effet pendant 15 jours, ou immédiatement en cas d'urgence ou d'obligation légale.",
            "Les billets déjà vendus pour des événements à venir restent sous la responsabilité de l'Organisateur, qui doit honorer ou rembourser les Participants.",
          ]}
        />
      </>
    ),
  },
  {
    id: "modifications",
    title: "Modification des conditions",
    body: (
      <p>
        Nous pouvons modifier ces conditions. Les changements importants vous sont annoncés au moins 30 jours avant leur entrée en vigueur, par e-mail ou dans l&apos;application.
        Si vous les refusez, vous pouvez résilier avant cette date ; continuer à utiliser la Plateforme ensuite vaut acceptation.
      </p>
    ),
  },
  {
    id: "droit",
    title: "Droit applicable et litiges",
    body: (
      <>
        <p>
          Ces conditions sont régies par le droit gabonais et les actes uniformes de l&apos;OHADA. En cas de litige, les parties cherchent d&apos;abord une solution amiable pendant
          30 jours à compter de la réclamation écrite. À défaut, les tribunaux compétents de {LEGAL.city} sont saisis.
        </p>
        <p>
          Si vous êtes un consommateur, vous conservez la protection des règles impératives de votre pays de résidence et la possibilité de saisir les juridictions qu&apos;elles
          désignent.
        </p>
      </>
    ),
  },
  {
    id: "divers",
    title: "Dispositions générales",
    body: (
      <List
        items={[
          "Si une clause est jugée invalide, les autres restent applicables.",
          "Ne pas exercer un droit à un moment donné ne vaut pas renonciation à ce droit.",
          "Ces conditions, la politique de confidentialité et la page Tarifs forment l'intégralité de l'accord entre vous et nous pour la Plateforme.",
          "La version française fait foi.",
        ]}
      />
    ),
  },
  {
    id: "editeur",
    title: "Éditeur et hébergement",
    body: (
      <>
        <p>
          <strong>Éditeur</strong> : {publisher}
          <br />
          Contact : <Mail to={LEGAL.email} /> · {LEGAL.phone}
          <br />
          Site : <Ext href={LEGAL.publisherUrl}>{LEGAL.publisherUrl.replace(/^https?:\/\//, "")}</Ext>
        </p>
        <p>
          <strong>Hébergement</strong> : Render Services, Inc. (API, serveurs à Francfort, Allemagne) ; Vercel Inc. (pages web) ; Supabase, Inc. (base de données).
        </p>
        <Note>
          Une question sur ces conditions ? Écrivez-nous à <Mail to={LEGAL.email} />.
        </Note>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      kind="terms"
      title="Conditions d'utilisation"
      intro={
        <p>
          Ces conditions fixent les règles entre {LEGAL.brand}, les organisateurs et commerçants qui l&apos;utilisent, et les participants qui achètent sur leurs sites. Nous les avons
          voulues claires : l&apos;essentiel tient en quelques lignes ci-dessous, le détail suit.
        </p>
      }
      summary={[
        "GiyaX fournit l'outil ; la vente d'un billet ou d'une commande est un contrat entre l'organisateur et le participant.",
        "L'organisateur est responsable de son événement, de ses informations et de ses remboursements.",
        "Les paiements passent par un prestataire agréé ; les recettes sont versées sur un compte Mobile Money vérifié.",
        "Pour les données des participants, GiyaX agit comme sous-traitant de l'organisateur (accord de traitement à l'article 10).",
        "Vous pouvez fermer votre espace à tout moment et exporter vos données pendant 30 jours.",
      ]}
      sections={sections}
    />
  );
}
