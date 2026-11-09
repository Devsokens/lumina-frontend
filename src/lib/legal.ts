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
  effectiveDate: "9 novembre 2026",
  version: "1.2",
} as const;

export const LEGAL_LINKS = {
  privacy: "/confidentialite",
  terms: "/conditions",
} as const;
