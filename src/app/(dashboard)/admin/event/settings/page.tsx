"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mail,
  Smartphone,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Send,
  HelpCircle,
  Sparkles,
  Lock,
  Phone,
  Check,
  RefreshCw,
  Sliders,
  ExternalLink,
  ChevronRight,
  Navigation,
  Bold,
  Italic,
  List,
  Heading,
  Eye,
  Edit3,
  Ticket,
  GraduationCap,
  Bell,
  FileQuestion,
  QrCode,
  Calendar,
  MapPin,
  RemoveFormatting,
  Upload,
  Trash2,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useOrganizationSettings, COLOR_PRESETS } from "@/hooks/useOrganizationSettings";

type EmailTemplateKey = "TICKET" | "CERTIFICATE" | "REMINDER" | "SURVEY";

interface EmailTemplate {
  key: EmailTemplateKey;
  label: string;
  badge: string;
  icon: typeof Mail;
  subject: string;
  htmlContent: string; // Stocke du HTML visuel propre (sans étoiles ni dièses)
  ctaText: string;
}

const DEFAULT_TEMPLATES: Record<EmailTemplateKey, EmailTemplate> = {
  TICKET: {
    key: "TICKET",
    label: "Billet & Pass QR",
    badge: "Immédiat",
    icon: Ticket,
    subject: "Votre Pass officiel pour l'événement 🎟️",
    htmlContent: `<p>Votre réservation est <strong>bien confirmée</strong> ! Nous avons hâte de vous compter parmi nous.</p><p>Veuillez présenter votre QR Code ci-dessous sur votre smartphone ou télécharger votre pass sécurisé avant votre arrivée au contrôle d'accès.</p>`,
    ctaText: "Accéder à mon Pass & QR Code",
  },
  CERTIFICATE: {
    key: "CERTIFICATE",
    label: "Certificat Officiel",
    badge: "Post-Scan",
    icon: GraduationCap,
    subject: "Félicitations ! Votre Certificat de Présence 🎓",
    htmlContent: `<p>Nous vous remercions chaleureusement pour votre participation active et votre présence.</p><p>Votre présence a été validée avec succès lors du contrôle d'accès. Vous pouvez dès maintenant télécharger votre <strong>Certificat d'Accomplissement officiel sécurisé</strong>.</p>`,
    ctaText: "Télécharger mon Certificat (PDF)",
  },
  REMINDER: {
    key: "REMINDER",
    label: "Rappel J-1 & Horaires",
    badge: "J-1 Avant",
    icon: Bell,
    subject: "Rappel : Rendez-vous demain pour l'événement ⏰",
    htmlContent: `<p>L'événement a lieu très bientôt !</p><p>Pensez à arriver 30 minutes avant l'heure d'ouverture pour fluidifier le contrôle d'accès. N'oubliez pas d'avoir votre pass QR Code à portée de main sur votre téléphone.</p>`,
    ctaText: "Afficher mon Billet & Plan d'accès",
  },
  SURVEY: {
    key: "SURVEY",
    label: "Questionnaire & Avis",
    badge: "Post-Event",
    icon: FileQuestion,
    subject: "Votre avis compte : donnez votre retour d'expérience ⭐",
    htmlContent: `<p>Vous avez récemment assisté à notre événement.</p><p>Afin de nous aider à nous améliorer pour nos prochaines éditions, pourriez-vous prendre <strong>2 minutes</strong> pour répondre à notre questionnaire d'évaluation rapide ?</p>`,
    ctaText: "Remplir le questionnaire",
  },
};

export default function EventSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("section-email");

  // Email General Config State
  const [senderEmail, setSenderEmail] = useState("billetterie@urban-festival.ga");
  const [senderName, setSenderName] = useState("Giya Billetterie • Festival Urban 2026");
  const [replyToEmail, setReplyToEmail] = useState("contact@urban-festival.ga");
  const [emailFooterText, setEmailFooterText] = useState(
    "Cet email contient votre billet officiel sécurisé ou votre attestation certifiée Giya. Présentez le QR code au contrôle d'accès le jour de l'événement."
  );

  // Email Templates State
  const [templates, setTemplates] = useState<Record<EmailTemplateKey, EmailTemplate>>(DEFAULT_TEMPLATES);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<EmailTemplateKey>("TICKET");
  const [previewMode, setPreviewMode] = useState<"EDIT" | "PREVIEW">("EDIT");

  // WYSIWYG Editable Ref
  const editorRef = useRef<HTMLDivElement>(null);

  // Mobile Money Accounts State (Obligatoire)
  const [airtelMoneyPhone, setAirtelMoneyPhone] = useState("+241 77 12 34 56");
  const [airtelAccountName, setAirtelAccountName] = useState("SOKENS DIGITAL EVENT SARL");
  const [moovMoneyPhone, setMoovMoneyPhone] = useState("+241 66 98 76 54");
  const [moovAccountName, setMoovAccountName] = useState("SOKENS DIGITAL EVENT SARL");

  // Organization & Theme Settings Hook
  const { settings: orgSettings, saveSettings: saveOrgSettings, activePreset } = useOrganizationSettings();

  // Organization Info State
  const [orgName, setOrgName] = useState(orgSettings.name || "SOKENS DIGITAL EVENT");
  const [orgLogo, setOrgLogo] = useState<string | null>(orgSettings.logo || null);
  const [selectedColorId, setSelectedColorId] = useState<string>(orgSettings.colorId || "emerald");
  const [orgNif, setOrgNif] = useState("GA-1092837-NIF");
  const [orgRccm, setOrgRccm] = useState("RCCM-LBV-2024-B-8902");
  const [supportPhone, setSupportPhone] = useState("+241 74 55 66 77");
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setOrgLogo(result);
        saveOrgSettings({ logo: result });
        toast.success("Logo de l'organisation mis à jour !");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveLogo() {
    setOrgLogo(null);
    saveOrgSettings({ logo: null });
    if (logoInputRef.current) logoInputRef.current.value = "";
    toast.success("Logo retiré.");
  }

  function handleColorChange(colorId: string) {
    setSelectedColorId(colorId);
    saveOrgSettings({ colorId });
    toast.success("Thème visuel de la barre latérale mis à jour !");
  }

  // Security Rules State
  const [antiFraudEnabled, setAntiFraudEnabled] = useState(true);
  const [singleScanStrict, setSingleScanStrict] = useState(true);

  // Completion calculation
  const isEmailComplete = Boolean(senderEmail.trim() && senderName.trim());
  const isMobileMoneyComplete = Boolean(airtelMoneyPhone.trim() && moovMoneyPhone.trim());
  const isOrgComplete = Boolean(orgName.trim() && supportPhone.trim());
  const isSecurityComplete = antiFraudEnabled;

  const completedStepsCount = [
    isEmailComplete,
    isMobileMoneyComplete,
    isOrgComplete,
    isSecurityComplete,
  ].filter(Boolean).length;

  const completionPercentage = Math.round((completedStepsCount / 4) * 100);

  // Keep editor content in sync when changing template
  useEffect(() => {
    if (editorRef.current && previewMode === "EDIT") {
      editorRef.current.innerHTML = templates[selectedTemplateKey].htmlContent;
    }
  }, [selectedTemplateKey, previewMode, templates]);

  // Scroll-Spy logic to track which section is currently in view
  useEffect(() => {
    const sections = ["section-email", "section-templates", "section-momo", "section-org", "section-security"];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToSection(id: string) {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  // Template Editing helpers
  const currentTemplate = templates[selectedTemplateKey];

  function updateCurrentTemplate(field: keyof EmailTemplate, value: string) {
    setTemplates((prev) => ({
      ...prev,
      [selectedTemplateKey]: {
        ...prev[selectedTemplateKey],
        [field]: value,
      },
    }));
  }

  // WYSIWYG Visual Formatting Handlers (Pure visual formatting, 0 stars/hashes)
  function applyFormatting(command: string, value: string | undefined = undefined) {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      updateCurrentTemplate("htmlContent", editorRef.current.innerHTML);
    }
  }

  function handleEditorInput() {
    if (editorRef.current) {
      updateCurrentTemplate("htmlContent", editorRef.current.innerHTML);
    }
  }

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();

    if (!isMobileMoneyComplete) {
      toast.error(
        "Obligatoire : Vous devez renseigner vos numéros de compte Airtel Money et Moov Money pour percevoir les paiements."
      );
      return;
    }

    if (!isEmailComplete) {
      toast.error(
        "Obligatoire : L'email expéditeur est requis pour l'envoi des billets et des diplômes."
      );
      return;
    }

    saveOrgSettings({
      name: orgName,
      logo: orgLogo,
      colorId: selectedColorId,
    });

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Paramètres et identité de l'organisation enregistrés avec succès !");
    }, 700);
  }

  function handleTestEmail() {
    setTestingEmail(true);
    setTimeout(() => {
      setTestingEmail(false);
      toast.success(`Email de test (${currentTemplate.label}) envoyé avec succès à ${senderEmail} !`);
    }, 1000);
  }

  const NAV_ITEMS = [
    {
      id: "section-email",
      label: "1. Expéditeur Email",
      desc: "Adresse officielle & nom",
      icon: Mail,
      isComplete: isEmailComplete,
      isRequired: true,
    },
    {
      id: "section-templates",
      label: "2. Modèles des Messages",
      desc: "Pass, Diplômes, Rappels",
      icon: Edit3,
      isComplete: true,
      isRequired: false,
    },
    {
      id: "section-momo",
      label: "3. Mobile Money",
      desc: "Airtel & Moov Money Gabon",
      icon: Smartphone,
      isComplete: isMobileMoneyComplete,
      isRequired: true,
    },
    {
      id: "section-org",
      label: "4. Identité Légale",
      desc: "Raison sociale, NIF & RCCM",
      icon: Building,
      isComplete: isOrgComplete,
      isRequired: false,
    },
    {
      id: "section-security",
      label: "5. Sécurité Anti-Fraude",
      desc: "Scan unique & cryptage QR",
      icon: ShieldCheck,
      isComplete: isSecurityComplete,
      isRequired: false,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Paramètres & Configurations Événementielles
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Configurez l&apos;email d&apos;envoi, la rédaction visuelle des messages, vos comptes Mobile Money et l&apos;identité légale.
        </p>
      </div>

      {/* Main Grid: Form on Left (8 cols) + Dynamic Navigation Sidebar on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CONFIGURATION FORM (8 Cols) */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-8 space-y-6">
          {/* SECTION 1: EMAIL EXPÉDITEUR & NOTIFICATIONS (OBLIGATOIRE) */}
          <div
            id="section-email"
            className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 scroll-mt-24 transition-all"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    1. Expéditeur Officiel des Billets & Certifications
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Adresse et nom affiché lors de l&apos;envoi automatique des pass et des diplômes officiels.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                Obligatoire
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Email d&apos;expédition officiel <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="billetterie@votre-domaine.ga"
                  className="h-10 rounded-xl text-xs"
                  required
                />
                <span className="text-[10px] text-muted-foreground block">
                  Cet email expédie les pass QR Code et les attestations signées.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Nom d&apos;expéditeur affiché <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ex: Giya Billetterie • Festival Urban"
                  className="h-10 rounded-xl text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Email de réponse (Reply-To)
                </Label>
                <Input
                  type="email"
                  value={replyToEmail}
                  onChange={(e) => setReplyToEmail(e.target.value)}
                  placeholder="contact@votre-domaine.ga"
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !senderEmail}
                  className="h-10 w-full rounded-xl text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Send className="size-3.5" />
                  <span>{testingEmail ? "Envoi du test en cours..." : "Tester l'envoi d'un email"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-bold text-foreground">
                Pied de page des emails (Mentions légales & consignes)
              </Label>
              <Textarea
                rows={2}
                value={emailFooterText}
                onChange={(e) => setEmailFooterText(e.target.value)}
                className="rounded-xl text-xs resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: RÉDACTION VISUELLE (WYSIWYG SANS SYMBOLES NI ÉTOILES) */}
          <div
            id="section-templates"
            className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 scroll-mt-24 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Edit3 className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    2. Modèles & Rédaction des Messages Automatiques
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Éditeur visuel direct (comme Word / Google Docs) sans étoiles ni symboles.
                  </p>
                </div>
              </div>

              {/* Mode Switch (Edit vs Live Preview) */}
              <div className="flex items-center rounded-xl bg-muted/40 p-1 border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewMode("EDIT")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    previewMode === "EDIT"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Edit3 className="size-3" />
                  <span>Éditeur Visuel</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("PREVIEW")}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    previewMode === "PREVIEW"
                      ? "bg-primary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="size-3" />
                  <span>Aperçu Réel</span>
                </button>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(DEFAULT_TEMPLATES) as EmailTemplateKey[]).map((key) => {
                const t = templates[key];
                const Icon = t.icon;
                const isSelected = selectedTemplateKey === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTemplateKey(key)}
                    className={`flex flex-col items-start gap-1 p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Icon className={`size-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-background/80 text-muted-foreground">
                        {t.badge}
                      </span>
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {previewMode === "EDIT" ? (
              /* PURE VISUAL WYSIWYG EDITOR (NO STARS, NO HASHES) */
              <div className="space-y-4 pt-1">
                {/* Subject Line */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Objet de l&apos;email ({currentTemplate.label})
                  </Label>
                  <Input
                    value={currentTemplate.subject}
                    onChange={(e) => updateCurrentTemplate("subject", e.target.value)}
                    placeholder="Objet de l'email..."
                    className="h-10 rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Visual Editor Toolbar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">
                      Votre Message Personnalisé
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      Sélectionnez votre texte et cliquez sur un bouton pour le mettre en forme directement
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                    {/* Visual Toolbar Header */}
                    <div className="flex items-center gap-2 p-2 bg-muted/40 border-b border-border text-xs">
                      <button
                        type="button"
                        onClick={() => applyFormatting("bold")}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-muted-foreground hover:bg-card hover:text-foreground transition-colors border border-border/50"
                        title="Mettre en gras (rendu visuel direct)"
                      >
                        <Bold className="size-3.5" /> Gras
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("italic")}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs italic text-muted-foreground hover:bg-card hover:text-foreground transition-colors border border-border/50"
                        title="Mettre en italique (rendu visuel direct)"
                      >
                        <Italic className="size-3.5" /> Italique
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("insertUnorderedList")}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:bg-card hover:text-foreground transition-colors border border-border/50"
                        title="Insérer une liste à puces"
                      >
                        <List className="size-3.5" /> Liste
                      </button>
                      <button
                        type="button"
                        onClick={() => applyFormatting("removeFormat")}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-card hover:text-foreground transition-colors border border-border/50 ml-auto"
                        title="Effacer la mise en forme du texte sélectionné"
                      >
                        <RemoveFormatting className="size-3" /> Normal
                      </button>
                    </div>

                    {/* ContentEditable Visual Area (No stars, No hashes) */}
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      onBlur={handleEditorInput}
                      className="min-h-[140px] p-4 text-xs leading-relaxed focus:outline-none bg-transparent prose prose-sm max-w-none text-foreground"
                    />
                  </div>
                </div>

                {/* Call-to-action Button Config */}
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold text-foreground">
                    Texte du Bouton d&apos;Action Principal (CTA)
                  </Label>
                  <Input
                    value={currentTemplate.ctaText}
                    onChange={(e) => updateCurrentTemplate("ctaText", e.target.value)}
                    placeholder="Ex: Télécharger mon Pass..."
                    className="h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            ) : (
              /* LIVE PREVIEW MODE WITH AUTOMATIC FORMATTING */
              <div className="space-y-4 pt-1">
                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-4 shadow-inner max-w-xl mx-auto">
                  {/* Mock Email Header */}
                  <div className="border-b border-border pb-3 space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-semibold w-16">De :</span>
                      <span className="font-bold text-foreground">
                        {senderName} &lt;{senderEmail}&gt;
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-semibold w-16">Objet :</span>
                      <span className="font-bold text-primary font-display">
                        {currentTemplate.subject}
                      </span>
                    </div>
                  </div>

                  {/* Mock Email Body Card */}
                  <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4 text-xs">
                    {/* Brand Banner */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="font-display font-extrabold text-sm tracking-tight text-primary">
                        GIYA • BILLETTERIE & CERTIFICATS
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Libreville, Gabon
                      </span>
                    </div>

                    {/* Automatic Greeting */}
                    <p className="font-bold text-foreground text-xs">
                      Bonjour Marc Ondimba,
                    </p>

                    {/* Custom User Message (Rendered as clean HTML without stars/hashes) */}
                    <div
                      className="text-foreground text-xs leading-relaxed space-y-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentTemplate.htmlContent }}
                    />

                    {/* Automatic Event Summary Card Generated by Giya */}
                    <div className="rounded-2xl border border-border bg-muted/30 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs">
                          Festival Urban Afro Libreville 2026
                        </span>
                        <span className="font-bold text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Pass VIP (Carré Or)
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-primary" />
                          <span>Samedi 5 Septembre • 19h00</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3 text-primary" />
                          <span>Palais des Sports, Libreville</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                        <span className="font-mono text-muted-foreground">N° Billet : GA-EVT-9081</span>
                        <span className="font-mono font-bold text-primary">QR Code Vérifié ✓</span>
                      </div>
                    </div>

                    {/* Main CTA Button */}
                    {currentTemplate.ctaText && (
                      <div className="pt-2 pb-1 text-center">
                        <span className="inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20">
                          {currentTemplate.ctaText}
                        </span>
                      </div>
                    )}

                    {/* Footer Mentions */}
                    <div className="border-t border-border pt-4 text-[10px] text-muted-foreground text-center leading-relaxed">
                      {emailFooterText}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: COMPTES MOBILE MONEY AIRTEL & MOOV (OBLIGATOIRE) */}
          <div
            id="section-momo"
            className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 scroll-mt-24 transition-all"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Smartphone className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    3. Comptes d&apos;Encaissement Mobile Money
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Numéros marchands Airtel Money et Moov Money pour recevoir 100% des recettes des billets.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                Obligatoire
              </span>
            </div>

            {/* Airtel Money Gabon */}
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-extrabold">
                    A
                  </span>
                  Compte Marchand Airtel Money Gabon
                </span>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="size-2.5" /> Compte Vérifié
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Numéro Airtel Money</Label>
                  <Input
                    value={airtelMoneyPhone}
                    onChange={(e) => setAirtelMoneyPhone(e.target.value)}
                    placeholder="+241 77 XX XX XX"
                    className="h-9 rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Nom du Titulaire / Société</Label>
                  <Input
                    value={airtelAccountName}
                    onChange={(e) => setAirtelAccountName(e.target.value)}
                    placeholder="Nom du titulaire Airtel"
                    className="h-9 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Moov Money Gabon */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                    M
                  </span>
                  Compte Marchand Moov Money Gabon
                </span>
                <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="size-2.5" /> Compte Vérifié
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Numéro Moov Money</Label>
                  <Input
                    value={moovMoneyPhone}
                    onChange={(e) => setMoovMoneyPhone(e.target.value)}
                    placeholder="+241 66 XX XX XX"
                    className="h-9 rounded-xl text-xs font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Nom du Titulaire / Société</Label>
                  <Input
                    value={moovAccountName}
                    onChange={(e) => setMoovAccountName(e.target.value)}
                    placeholder="Nom du titulaire Moov"
                    className="h-9 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: IDENTITÉ DE L'ORGANISATEUR & MARQUE VISUELLE */}
          <div
            id="section-org"
            className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-5 scroll-mt-24 transition-all"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <Building className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    4. Identité de l&apos;Organisation & Thème de Marque
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Personnalisez votre logo, le nom de l&apos;organisation et la couleur de la barre latérale.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Synchronisé avec la Sidebar
              </span>
            </div>

            {/* Logo de l'organisation */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-primary" />
                <span>Logo de l&apos;Organisation</span>
              </Label>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />

              {orgLogo ? (
                <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-border bg-muted/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={orgLogo}
                    alt="Logo organisation"
                    className="size-16 rounded-xl object-contain bg-white dark:bg-zinc-900 border border-border p-1 shadow-xs"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Logo Officiel Téléversé</p>
                    <p className="text-[11px] text-muted-foreground">
                      Ce logo apparaît sur la barre latérale gauche, vos billets et attestations.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => logoInputRef.current?.click()}
                        className="h-7 text-xs rounded-xl gap-1"
                      >
                        <RefreshCw className="size-3" />
                        Remplacer
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="h-7 text-xs rounded-xl gap-1"
                      >
                        <Trash2 className="size-3" />
                        Retirer
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-4.5 text-center cursor-pointer transition-all bg-muted/20 hover:bg-muted/40 group"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="size-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    Cliquez pour téléverser le logo de l&apos;organisation
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    PNG, SVG, JPG haute résolution (apparaît sous &quot;Giya&quot; sur la sidebar)
                  </p>
                </div>
              )}
            </div>

            {/* Couleur de Marque & Thème Sidebar */}
            <div className="space-y-2.5 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Palette className="size-3.5 text-primary" />
                  <span>Couleur de Thème & Barre Latérale</span>
                </Label>
                <span className="text-[11px] font-mono font-bold text-primary">
                  {activePreset.name}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Choisissez l&apos;ambiance chromatique qui habille instantanément votre barre latérale et l&apos;interface.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {COLOR_PRESETS.map((preset) => {
                  const isActive = selectedColorId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleColorChange(preset.id)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all relative ${
                        isActive
                          ? "border-primary bg-primary/10 ring-2 ring-primary shadow-xs font-bold"
                          : "border-border bg-muted/20 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className="size-6 rounded-xl border border-white/20 shadow-xs shrink-0 flex items-center justify-center text-white"
                        style={{
                          background: `linear-gradient(135deg, ${preset.sidebarFrom}, ${preset.primaryLight})`,
                        }}
                      >
                        {isActive && <Check className="size-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate leading-tight">
                          {preset.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Raison Sociale & Support */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Raison Sociale / Nom de l&apos;Organisation <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      saveOrgSettings({ name: e.target.value });
                    }}
                    placeholder="Ex: SOKENS DIGITAL EVENT SARL"
                    className="h-10 rounded-xl text-xs font-semibold"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Ce nom s&apos;affiche directement sous le logo Giya sur la barre latérale.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Téléphone Support Client (WhatsApp)
                  </Label>
                  <Input
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+241 74 XX XX XX"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Contact d&apos;assistance présent sur les reçus et e-mails de confirmation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">N° NIF (Numéro d&apos;Identification Fiscale)</Label>
                  <Input
                    value={orgNif}
                    onChange={(e) => setOrgNif(e.target.value)}
                    placeholder="Ex: GA-1092837-NIF"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">N° RCCM (Registre du Commerce)</Label>
                  <Input
                    value={orgRccm}
                    onChange={(e) => setOrgRccm(e.target.value)}
                    placeholder="Ex: RCCM-LBV-2024-B-8902"
                    className="h-10 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: SÉCURITÉ DES BILLETS & ANTI-FRAUDE */}
          <div
            id="section-security"
            className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4 scroll-mt-24 transition-all"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">
                    5. Sécurité des Pass & Contrôle Anti-Fraude
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Chiffrement des QR codes et règles strictes de vérification à l&apos;entrée.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60">
                <div>
                  <p className="font-bold text-xs text-foreground">
                    Scan Unique & Blocage des Doublons (Anti-Pass-Back)
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Dès qu&apos;un billet est scanné, il est immédiatement invalidé pour empêcher toute réutilisation.
                  </p>
                </div>
                <Switch checked={singleScanStrict} onCheckedChange={setSingleScanStrict} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60">
                <div>
                  <p className="font-bold text-xs text-foreground">
                    Cryptage Cryptographique HMAC-SHA256 des Pass
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Garantit que les billets ne peuvent pas être falsifiés ou générés en dehors de Giya.
                  </p>
                </div>
                <Switch checked={antiFraudEnabled} onCheckedChange={setAntiFraudEnabled} />
              </div>
            </div>
          </div>

          {/* Save Button Bar */}
          <div className="sticky bottom-0 bg-card/95 backdrop-blur-md p-4 rounded-3xl border border-border shadow-lg flex items-center justify-between gap-4 z-20">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Toutes les modifications sont appliquées instantanément sur vos billetteries.
            </span>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-primary text-white font-bold text-xs sm:text-sm px-6 py-5 shadow-md shadow-primary/20 gap-2 ml-auto"
            >
              <Save className="size-4" />
              <span>{saving ? "Enregistrement en cours..." : "Enregistrer les paramètres"}</span>
            </Button>
          </div>
        </form>

        {/* RIGHT COLUMN: DYNAMIC SCROLL-SPY NAVIGATION SIDEBAR (4 Cols - Sticky) */}
        <aside className="lg:col-span-4 sticky top-6 space-y-4 pt-1 pl-0 lg:pl-3">
          {/* Mandatory Compliance Banner positioned at top of sidebar */}
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-4 shadow-xs space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display font-bold text-xs sm:text-sm text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary shrink-0" />
                  Conformité Obligatoire & Ventes
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Ces paramètres sont obligatoires pour activer la billetterie et délivrer les certifications.
                </p>
              </div>

              <span className="font-mono text-xs font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/30 shrink-0">
                {completionPercentage}% Complété
              </span>
            </div>

            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Navigation className="size-3.5 text-primary" />
                Navigation Paramètres
              </span>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {completedStepsCount}/5 Prêts
              </span>
            </div>

            {/* Interactive Dynamic Scroll Navigation Links */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center justify-between gap-2.5 rounded-2xl p-3 text-left transition-all group ${
                      isActive
                        ? "bg-primary text-white shadow-sm ring-1 ring-primary"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`flex size-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-muted text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-foreground"}`}>
                          {item.label}
                        </p>
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isActive ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {item.isComplete ? (
                        <span
                          className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-white text-primary"
                              : "bg-emerald-500/15 text-emerald-500"
                          }`}
                          title="Configuration valide"
                        >
                          <Check className="size-3" />
                        </span>
                      ) : item.isRequired ? (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            isActive
                              ? "bg-white text-destructive font-extrabold"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          Requis
                        </span>
                      ) : null}

                      <ChevronRight
                        className={`size-3.5 transition-transform ${
                          isActive ? "text-white translate-x-0.5" : "text-muted-foreground opacity-40 group-hover:opacity-100"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Compliance Reminder Box */}
          <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-1.5 text-xs text-muted-foreground">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-primary" /> Règle de Continuité
            </span>
            <p className="text-[11px] leading-relaxed">
              La complétion des comptes Mobile Money et de l&apos;email expéditeur est <strong>obligatoire</strong> pour débloquer l&apos;encaissement des fonds et l&apos;expédition automatique des pass par WhatsApp et Email.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
