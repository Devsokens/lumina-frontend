// Identité de l'éditeur, reprise par la politique de confidentialité et les
// conditions d'utilisation. Les champs vides ne sont pas affichés : les
// compléter dès que l'entreprise les a (RCCM, NIF, adresse, domaine).

export const LEGAL = {
  brand: "GiyaX",
  publisher: "SOKEN'S DIGITAL",
  publisherUrl: "https://www.sokensdigital.com",
  city: "Libreville",
  country: "Gabon",
  // Adresse postale complète (quartier, BP).
  address: "",
  rccm: "",
  nif: "",
  email: "supportsokensdigital@gmail.com",
  // Demandes sur les données personnelles (à remplacer par privacy@<domaine>).
  privacyEmail: "supportsokensdigital@gmail.com",
  phone: "+241 60 00 13 33",
  // Version en vigueur des deux documents.
  effectiveDate: "11 novembre 2026",
  version: "1.3",
  // Récépissé de déclaration / autorisation de l'APDPVP, affiché dans la
  // politique de confidentialité dès qu'il est obtenu (vide = masqué).
  apdpvpReference: "",
} as const;

// Autorité gabonaise de protection des données (ex-CNPDCP), relevé sur
// apdpvp.ga le 2026-11-11.
export const APDPVP = {
  name: "Autorité pour la Protection des Données Personnelles et de la Vie Privée (APDPVP)",
  address: "Haut de Gué-Gué, en face de l'entrée de service de l'hôtel Radisson Blu, Libreville",
  phone: "+241 01 44 31 34",
  email: "contact@apdpvp.ga",
  url: "https://www.apdpvp.ga",
  hours: "du lundi au vendredi, de 7 h 30 à 15 h 30",
} as const;

export const LEGAL_LINKS = {
  privacy: "/confidentialite",
  terms: "/conditions",
} as const;
