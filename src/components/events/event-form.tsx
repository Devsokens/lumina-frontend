"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar,
  MapPin,
  Sparkles,
  Upload,
  Music,
  GraduationCap,
  Wine,
  Building,
  Trophy,
  Theater,
  Award,
  Ticket,
  CheckCircle2,
  Image as ImageIcon,
  Check,
  Trash2,
  RefreshCw,
  QrCode,
  ShieldCheck,
  Plus,
  Edit2,
  Coins,
  Users,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  FileQuestion,
  ListPlus,
  CheckSquare,
  CircleDot,
  AlignLeft,
  Type,
  Star,
  ListFilter,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type {
  Event,
  EventType,
  CertificateTemplate,
  TicketTemplate,
  TicketType,
  QuestionnaireQuestion,
  QuestionType,
} from "@/types/api";
import { PricingUpgradeModal } from "@/components/shared/pricing-upgrade-modal";

interface EventFormProps {
  initialData?: Partial<Event>;
  onSuccess?: (event: Partial<Event>) => void;
  onCancel?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  eventType: EventType;
  hasCertificate: boolean;
  certificateTitle: string;
  issuerName: string;
  signatoryName: string;
  certificateTemplate: CertificateTemplate;
  ticketTemplate: TicketTemplate;
  imageUrl: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venueName: string;
  location: string;
  capacity: number;
}

const EVENT_TYPES: { id: EventType; label: string; icon: any; desc: string }[] = [
  { id: "CONCERT", label: "Concert & Festival", icon: Music, desc: "Musique live, DJs, plein air" },
  { id: "CONFERENCE", label: "Conférence & Formation", icon: GraduationCap, desc: "Séminaires, masterclass avec attestation" },
  { id: "NIGHTLIFE", label: "Soirée VIP & Club", icon: Wine, desc: "Rooftop, lounge, tables privées" },
  { id: "EXHIBITION", label: "Salon & Expo", icon: Building, desc: "Foires, stands et networking" },
  { id: "SPORTS", label: "Sport & Tournoi", icon: Trophy, desc: "Matchs, marathons, compétitions" },
  { id: "SHOW", label: "Spectacle & Théâtre", icon: Theater, desc: "Humour, stand-up, pièces" },
];

const DEFAULT_TICKET_FORMULAS: TicketType[] = [
  {
    id: "tf-1",
    eventId: "evt-new",
    name: "Pass Standard (Accès Général)",
    price: 1000000, // 10 000 FCFA
    quantity: 350,
    sold: 0,
    ticketTemplate: "FESTIVAL_WRISTBAND",
    description: "Accès à la fosse et scène principale.",
  },
  {
    id: "tf-2",
    eventId: "evt-new",
    name: "Pass VIP (Carré Or)",
    price: 2500000, // 25 000 FCFA
    quantity: 100,
    sold: 0,
    ticketTemplate: "GOLD_VIP",
    description: "Cocktail d'accueil offert, place assise réservée et vue plongeante.",
  },
];

const DEFAULT_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: "q-1",
    title: "Comment avez-vous découvert cet événement ?",
    type: "SINGLE_CHOICE",
    options: ["Réseaux Sociaux (Instagram / TikTok)", "WhatsApp / Recommandation", "Bouche à oreille", "Affichage public"],
    isRequired: true,
  },
  {
    id: "q-2",
    title: "Quels sont vos principaux centres d'intérêt pour cette session ?",
    type: "MULTIPLE_CHOICE",
    options: ["Networking & Affaires", "Acquisition de compétences", "Concert & Ambiance Live", "Dégustation VIP"],
    isRequired: false,
  },
  {
    id: "q-3",
    title: "Poste et Organisation / Entreprise (facultatif)",
    type: "SHORT_TEXT",
    isRequired: false,
  },
];

const QUESTION_TYPE_CONFIG: { type: QuestionType; label: string; icon: any; desc: string }[] = [
  { type: "SINGLE_CHOICE", label: "Choix unique", icon: CircleDot, desc: "Boutons radio (1 seule réponse possible)" },
  { type: "MULTIPLE_CHOICE", label: "Cases à cocher", icon: CheckSquare, desc: "Choix multiples (plusieurs réponses)" },
  { type: "SHORT_TEXT", label: "Texte court", icon: Type, desc: "Réponse en une ligne (Poste, Entreprise...)" },
  { type: "PARAGRAPH", label: "Paragraphe", icon: AlignLeft, desc: "Texte long (Attentes, Remarques...)" },
  { type: "RATING_SCALE", label: "Échelle d'évaluation", icon: Star, desc: "Note de 1 à 5 étoiles" },
  { type: "DROPDOWN", label: "Menu déroulant", icon: ListFilter, desc: "Liste déroulante d'options" },
];

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(
    initialData?.imageUrl ??
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop"
  );
  const [fileName, setFileName] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<EventType>(
    initialData?.eventType ?? "CONCERT"
  );
  const [hasCert, setHasCert] = useState<boolean>(
    initialData?.hasCertificate ?? (initialData?.eventType === "CONFERENCE")
  );
  const [selectedCertTemplate, setSelectedCertTemplate] = useState<CertificateTemplate>(
    initialData?.certificateTemplate ?? "ACADEMIC_GOLD"
  );
  const [selectedTicketTemplate, setSelectedTicketTemplate] = useState<TicketTemplate>(
    initialData?.ticketTemplate ?? "GOLD_VIP"
  );
  const [isAiPosterModalOpen, setIsAiPosterModalOpen] = useState(false);

  // Ticket Formulas State
  const [ticketFormulas, setTicketFormulas] = useState<TicketType[]>(
    initialData?.ticketTypes && initialData.ticketTypes.length > 0
      ? initialData.ticketTypes
      : DEFAULT_TICKET_FORMULAS
  );
  const [isAddingTicket, setIsAddingTicket] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [newFormulaName, setNewFormulaName] = useState("");
  const [newFormulaPrice, setNewFormulaPrice] = useState<number>(10000);
  const [newFormulaQuantity, setNewFormulaQuantity] = useState<number>(100);
  const [newFormulaDesc, setNewFormulaDesc] = useState("");
  const [newFormulaTemplate, setNewFormulaTemplate] = useState<TicketTemplate>("GOLD_VIP");

  // Questionnaire (Google Forms Style) State
  const [hasQuestionnaire, setHasQuestionnaire] = useState<boolean>(
    initialData?.questionnaireEnabled ?? true
  );
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>(
    initialData?.questionnaire && initialData.questionnaire.length > 0
      ? initialData.questionnaire
      : DEFAULT_QUESTIONS
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      title: initialData?.title ?? "Festival Urban Afro Libreville 2026",
      description: initialData?.description ?? "Le plus grand festival afro-urbain d'Afrique Centrale.",
      eventType: initialData?.eventType ?? "CONCERT",
      hasCertificate: initialData?.hasCertificate ?? false,
      certificateTitle: "Certificat d'Accomplissement & de Formation",
      issuerName: "Institut Supérieur de Management & Giya",
      signatoryName: "Dr. Paul Mba, Directeur Académique",
      certificateTemplate: initialData?.certificateTemplate ?? "ACADEMIC_GOLD",
      ticketTemplate: initialData?.ticketTemplate ?? "GOLD_VIP",
      imageUrl: initialData?.imageUrl ?? "",
      startDate: initialData?.startDate ? initialData.startDate.split("T")[0] : "2026-09-05",
      startTime: "19:00",
      endDate: initialData?.endDate ? initialData.endDate.split("T")[0] : "2026-09-06",
      endTime: "04:00",
      venueName: initialData?.venueName ?? "Palais des Sports & de la Culture",
      location: initialData?.location ?? "Libreville, Gabon",
      capacity: initialData?.capacity ?? 450,
    },
  });

  const titleValue = watch("title");
  const descValue = watch("description");
  const venueValue = watch("venueName");
  const dateValue = watch("startDate");
  const startTimeValue = watch("startTime");
  const issuerValue = watch("issuerName");
  const certTitleValue = watch("certificateTitle");
  const signatoryValue = watch("signatoryName");

  // Handle Real Image Upload
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).");
        return;
      }
      setFileName(`${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} Mo)`);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImage(result);
        setValue("imageUrl", result);
        toast.success("Affiche téléversée avec succès !");
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    setUploadedImage(null);
    setFileName(null);
    setValue("imageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleTypeChange(type: EventType) {
    setSelectedType(type);
    setValue("eventType", type);
    if (type === "CONFERENCE") {
      setHasCert(true);
      setValue("hasCertificate", true);
      setSelectedTicketTemplate("CONFERENCE_BADGE");
    } else if (type === "CONCERT") {
      setSelectedTicketTemplate("FESTIVAL_WRISTBAND");
    } else if (type === "NIGHTLIFE") {
      setSelectedTicketTemplate("GOLD_VIP");
    }
  }

  function handleGenerateAiDescription() {
    if (!titleValue) {
      toast.error("Veuillez d'abord saisir un titre pour l'événement");
      return;
    }
    setGeneratingAi(true);
    setTimeout(() => {
      setValue(
        "description",
        `Participez à ${titleValue} ! Une expérience inoubliable avec artistes et intervenants d'exception, networking de haut niveau, billetterie instantanée et contrôle d'accès sécurisé par QR code.`
      );
      setGeneratingAi(false);
      toast.success("Description générée par l'Assistant Giya !");
    }, 700);
  }

  // Ticket Formulas Actions
  function handleOpenAddFormula() {
    setNewFormulaName("");
    setNewFormulaPrice(15000);
    setNewFormulaQuantity(100);
    setNewFormulaDesc("");
    setNewFormulaTemplate(selectedTicketTemplate);
    setEditingTicketId(null);
    setIsAddingTicket(true);
  }

  function handleOpenEditFormula(formula: TicketType) {
    setNewFormulaName(formula.name);
    setNewFormulaPrice(formula.price / 100);
    setNewFormulaQuantity(formula.quantity);
    setNewFormulaDesc(formula.description ?? "");
    setNewFormulaTemplate(formula.ticketTemplate ?? "GOLD_VIP");
    setEditingTicketId(formula.id);
    setIsAddingTicket(true);
  }

  function handleSaveFormula() {
    if (!newFormulaName.trim()) {
      toast.error("Veuillez renseigner le nom de la formule (ex: Pass VIP)");
      return;
    }

    if (editingTicketId) {
      setTicketFormulas((prev) =>
        prev.map((f) =>
          f.id === editingTicketId
            ? {
                ...f,
                name: newFormulaName,
                price: newFormulaPrice * 100,
                quantity: newFormulaQuantity,
                description: newFormulaDesc,
                ticketTemplate: newFormulaTemplate,
              }
            : f
        )
      );
      toast.success("Formule de billet mise à jour");
    } else {
      const newFormula: TicketType = {
        id: `tf-${Date.now()}`,
        eventId: initialData?.id ?? "evt-new",
        name: newFormulaName,
        price: newFormulaPrice * 100,
        quantity: newFormulaQuantity,
        sold: 0,
        description: newFormulaDesc,
        ticketTemplate: newFormulaTemplate,
      };
      setTicketFormulas((prev) => [...prev, newFormula]);
      toast.success("Nouvelle formule de billet ajoutée");
    }

    const updatedFormulas = editingTicketId
      ? ticketFormulas.map((f) =>
          f.id === editingTicketId ? { ...f, quantity: newFormulaQuantity } : f
        )
      : [...ticketFormulas, { quantity: newFormulaQuantity } as TicketType];
    const totalCap = updatedFormulas.reduce((acc, f) => acc + (f.quantity || 0), 0);
    setValue("capacity", totalCap);

    setIsAddingTicket(false);
    setEditingTicketId(null);
  }

  function handleDeleteFormula(id: string) {
    if (ticketFormulas.length <= 1) {
      toast.error("Vous devez conserver au moins une formule de billet.");
      return;
    }
    const filtered = ticketFormulas.filter((f) => f.id !== id);
    setTicketFormulas(filtered);
    const totalCap = filtered.reduce((acc, f) => acc + (f.quantity || 0), 0);
    setValue("capacity", totalCap);
    toast.success("Formule retirée");
  }

  // Questionnaire Builder Actions
  function handleAddQuestion(type: QuestionType) {
    const newQ: QuestionnaireQuestion = {
      id: `q-${Date.now()}`,
      title: type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE" || type === "DROPDOWN" ? "Nouvelle question à choix" : "Nouvelle question",
      type,
      options: type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE" || type === "DROPDOWN" ? ["Option 1", "Option 2"] : undefined,
      isRequired: false,
    };
    setQuestions((prev) => [...prev, newQ]);
    toast.success("Question ajoutée au questionnaire");
  }

  function handleUpdateQuestionTitle(id: string, title: string) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, title } : q)));
  }

  function handleToggleQuestionRequired(id: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isRequired: !q.isRequired } : q))
    );
  }

  function handleDeleteQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast.success("Question supprimée");
  }

  function handleAddOption(questionId: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          const currentOpts = q.options ?? [];
          return { ...q, options: [...currentOpts, `Option ${currentOpts.length + 1}`] };
        }
        return q;
      })
    );
  }

  function handleUpdateOption(questionId: string, optIndex: number, val: string) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options) {
          const updatedOpts = [...q.options];
          updatedOpts[optIndex] = val;
          return { ...q, options: updatedOpts };
        }
        return q;
      })
    );
  }

  function handleDeleteOption(questionId: string, optIndex: number) {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId && q.options && q.options.length > 1) {
          return { ...q, options: q.options.filter((_, i) => i !== optIndex) };
        }
        return q;
      })
    );
  }

  const totalCalculatedCapacity = ticketFormulas.reduce((acc, f) => acc + (f.quantity || 0), 0);
  const totalPotentialRevenue = ticketFormulas.reduce(
    (acc, f) => acc + (f.quantity * f.price) / 100,
    0
  );

  // Stepper Navigation with Validation
  async function handleNextStep() {
    if (currentStep === 1) {
      const isValid = await trigger(["title", "startDate", "venueName"]);
      if (!isValid) {
        toast.error("Veuillez remplir les informations obligatoires de l'étape 1.");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (ticketFormulas.length === 0) {
        toast.error("Veuillez ajouter au moins une formule de billet.");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  }

  function handlePrevStep() {
    if (currentStep === 4) setCurrentStep(3);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  }

  async function onSubmit(values: EventFormData) {
    setSubmitting(true);
    try {
      const payload: Partial<Event> = {
        title: values.title,
        description: values.description,
        eventType: selectedType,
        hasCertificate: hasCert,
        certificateTemplate: hasCert ? selectedCertTemplate : undefined,
        ticketTemplate: selectedTicketTemplate,
        ticketTypes: ticketFormulas,
        questionnaireEnabled: hasQuestionnaire,
        questionnaire: hasQuestionnaire ? questions : [],
        imageUrl: uploadedImage,
        startDate: `${values.startDate}T${values.startTime}:00Z`,
        endDate: values.endDate ? `${values.endDate}T${values.endTime}:00Z` : null,
        venueName: values.venueName,
        location: values.location,
        capacity: totalCalculatedCapacity > 0 ? totalCalculatedCapacity : Number(values.capacity),
        status: "PUBLISHED",
      };

      toast.success(initialData?.id ? "Événement mis à jour" : "Événement créé avec succès !");
      onSuccess?.(payload);
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start relative">
      {/* 4-STEP LATERAL SIDEBAR STEPPER (Latérale compacte & sticky) */}
      <aside className="w-full md:w-40 lg:w-44 shrink-0 space-y-2.5 md:border-r border-border md:pr-3 md:sticky md:top-0 md:self-start z-10 bg-card">
        <div className="space-y-1">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`w-full flex items-start gap-2 rounded-xl p-2 text-left transition-all ${
              currentStep === 1
                ? "bg-primary text-white shadow-xs ring-1 ring-primary"
                : currentStep > 1
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/40 opacity-75"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                currentStep === 1
                  ? "bg-white text-primary"
                  : currentStep > 1
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 1 ? <Check className="size-3" /> : "1"}
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">
                Étape 1
              </p>
              <p className="text-[11px] font-bold truncate mt-0.5">Infos & Affiche</p>
              <p className="text-[9px] opacity-75 truncate">Dates, lieu</p>
            </div>
          </button>

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => {
              if (titleValue) setCurrentStep(2);
            }}
            className={`w-full flex items-start gap-2 rounded-xl p-2 text-left transition-all ${
              currentStep === 2
                ? "bg-primary text-white shadow-xs ring-1 ring-primary"
                : currentStep > 2
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/40 opacity-75"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                currentStep === 2
                  ? "bg-white text-primary"
                  : currentStep > 2
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 2 ? <Check className="size-3" /> : "2"}
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">
                Étape 2
              </p>
              <p className="text-[11px] font-bold truncate mt-0.5">Billets & Pass</p>
              <p className="text-[9px] opacity-75 truncate">Tarifs FCFA</p>
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => {
              if (titleValue) setCurrentStep(3);
            }}
            className={`w-full flex items-start gap-2 rounded-xl p-2 text-left transition-all ${
              currentStep === 3
                ? "bg-primary text-white shadow-xs ring-1 ring-primary"
                : currentStep > 3
                ? "bg-primary/10 text-primary hover:bg-primary/15"
                : "text-muted-foreground hover:bg-muted/40 opacity-75"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                currentStep === 3
                  ? "bg-white text-primary"
                  : currentStep > 3
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > 3 ? <Check className="size-3" /> : "3"}
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">
                Étape 3
              </p>
              <p className="text-[11px] font-bold truncate mt-0.5">Questionnaire</p>
              <p className="text-[9px] opacity-75 truncate">Google Forms</p>
            </div>
          </button>

          {/* Step 4 */}
          <button
            type="button"
            onClick={() => {
              if (titleValue) setCurrentStep(4);
            }}
            className={`w-full flex items-start gap-2 rounded-xl p-2 text-left transition-all ${
              currentStep === 4
                ? "bg-primary text-white shadow-xs ring-1 ring-primary"
                : "text-muted-foreground hover:bg-muted/40 opacity-75"
            }`}
          >
            <span
              className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5 ${
                currentStep === 4
                  ? "bg-white text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              4
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none">
                Étape 4
              </p>
              <p className="text-[11px] font-bold truncate mt-0.5">Certifs & Bilan</p>
              <p className="text-[9px] opacity-75 truncate">Diplômes</p>
            </div>
          </button>
        </div>

        {/* Lateral Progress Summary Box */}
        <div className="hidden md:block pt-2 border-t border-border/60">
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/50 space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
              <span>Étape {currentStep}/4</span>
              <span className="font-mono text-primary text-[10px]">{Math.round((currentStep / 4) * 100)}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT PANEL (FORM & ACTIONS) */}
      <div className="flex-1 min-w-0 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ========================================================================= */}
          {/* ÉTAPE 1 : INFORMATIONS GÉNÉRALES, PROGRAMME, AFFICHE, LIEU & HORAIRES */}
          {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground">
                  Type d&apos;événement <span className="text-destructive">*</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Sélectionnez le format</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EVENT_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTypeChange(t.id)}
                      className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all relative ${
                        active
                          ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                          : "border-border/80 bg-muted/20 hover:bg-muted/50"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-white">
                          <Check className="size-2.5" />
                        </span>
                      )}
                      <div
                        className={`flex size-7 items-center justify-center rounded-xl mb-1.5 ${
                          active ? "bg-primary text-white" : "bg-muted text-foreground"
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <p className="font-bold text-xs text-foreground leading-tight">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-bold text-foreground">
                  Titre de l&apos;événement <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Festival Urban Afro Libreville 2026, Soirée Blanche VIP..."
                  className="h-10 rounded-xl text-xs sm:text-sm font-medium"
                  {...register("title", { required: "Le titre est requis" })}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-xs font-bold text-foreground">
                    Description & Programme
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-primary hover:text-primary/80 gap-1 px-2"
                    onClick={handleGenerateAiDescription}
                    disabled={generatingAi}
                  >
                    <Sparkles className="size-3" />
                    {generatingAi ? "Rédaction IA..." : "Rédiger avec IA Giya"}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Détaillez le programme, les artistes, les intervenants et les accès..."
                  className="rounded-xl resize-none text-xs leading-relaxed"
                  {...register("description")}
                />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Affiche de l&apos;événement</span>
                </Label>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 gap-1.5 rounded-xl shadow-xs whitespace-nowrap"
                    onClick={() => setIsAiPosterModalOpen(true)}
                  >
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Générer avec Giya AI</span>
                    <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.2 rounded font-mono font-extrabold">PRO</span>
                  </Button>

                  {uploadedImage && (
                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 whitespace-nowrap">
                      <CheckCircle2 className="size-3" /> Chargée
                    </span>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="relative rounded-2xl border border-border overflow-hidden bg-black/40 group">
                  <div className="relative h-44 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Aperçu affiche"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-white/90 truncate max-w-[240px]">
                        {fileName ?? "Image personnalisée"}
                      </span>

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs rounded-xl bg-white/20 backdrop-blur-md text-white hover:bg-white/30"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <RefreshCw className="size-3 mr-1" />
                          Remplacer
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="h-7 text-xs rounded-xl"
                          onClick={handleRemoveImage}
                        >
                          <Trash2 className="size-3 mr-1" />
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-primary/40 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-all bg-primary/5 hover:bg-primary/10 group"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="size-6" />
                  </div>
                  <p className="text-xs font-bold text-foreground">
                    Cliquez pour téléverser votre affiche ou glissez votre fichier
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    PNG, JPG, WEBP haute résolution recommandés (jusqu&apos;à 10 Mo)
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-primary" />
                  Date et heure de début <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    className="h-10 rounded-xl flex-1 text-xs"
                    {...register("startDate", { required: "Date requise" })}
                  />
                  <Input
                    type="time"
                    className="h-10 rounded-xl w-24 text-xs font-mono"
                    {...register("startTime")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  Date et heure de fin
                </Label>
                <div className="flex gap-2">
                  <Input type="date" className="h-10 rounded-xl flex-1 text-xs" {...register("endDate")} />
                  <Input
                    type="time"
                    className="h-10 rounded-xl w-24 text-xs font-mono"
                    {...register("endTime")}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="venueName" className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                Lieu / Salle <span className="text-destructive">*</span>
              </Label>
              <Input
                id="venueName"
                placeholder="Ex: Palais des Sports, Radisson Blu Okoume, Rooftop Sablière"
                className="h-10 rounded-xl text-xs"
                {...register("venueName", { required: "Le lieu est requis" })}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 2 : BILLETTERIE, FORMULES DE BILLETS & MODÈLE VISUEL DE PASS */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            <div className="space-y-4 rounded-3xl border border-primary/30 bg-card p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                    <Ticket className="size-4.5 text-primary" />
                    <span>Formules de Billets & Tarifs ({ticketFormulas.length})</span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Créez vos différentes formules de pass (Standard, VIP, Early Bird, Tables privées).
                  </p>
                </div>

                {!isAddingTicket && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenAddFormula}
                    className="rounded-xl bg-primary text-white text-xs font-semibold gap-1.5 shadow-sm"
                  >
                    <Plus className="size-3.5" />
                    Ajouter une formule
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-2xl border border-border/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-medium block">
                      Jauge Totale Calculée
                    </span>
                    <span className="font-display text-sm font-bold text-foreground">
                      {totalCalculatedCapacity} places
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Coins className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-medium block">
                      Chiffre d&apos;Affaires Potentiel
                    </span>
                    <span className="font-display text-sm font-bold text-emerald-500">
                      {totalPotentialRevenue.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {isAddingTicket && (
                <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Ticket className="size-3.5 text-primary" />
                      {editingTicketId ? "Modifier la formule" : "Nouvelle formule de billet"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px]"
                      onClick={() => setIsAddingTicket(false)}
                    >
                      Fermer
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] font-semibold">Nom de la formule</Label>
                      <Input
                        value={newFormulaName}
                        onChange={(e) => setNewFormulaName(e.target.value)}
                        placeholder="Ex: Pass VIP Carré Or, Pass 2 Jours, Early Bird..."
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Prix de vente (FCFA)</Label>
                      <Input
                        type="number"
                        value={newFormulaPrice}
                        onChange={(e) => setNewFormulaPrice(Number(e.target.value))}
                        placeholder="15000"
                        className="h-9 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Quota (Places disponibles)</Label>
                      <Input
                        type="number"
                        value={newFormulaQuantity}
                        onChange={(e) => setNewFormulaQuantity(Number(e.target.value))}
                        placeholder="100"
                        className="h-9 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-[11px] font-semibold">Avantages & Description</Label>
                      <Input
                        value={newFormulaDesc}
                        onChange={(e) => setNewFormulaDesc(e.target.value)}
                        placeholder="Ex: Cocktail offert, entrée coupe-file, vue plongeante..."
                        className="h-9 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-xl text-xs"
                      onClick={() => setIsAddingTicket(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 rounded-xl bg-primary text-white text-xs font-semibold"
                      onClick={handleSaveFormula}
                    >
                      <Check className="size-3 mr-1" />
                      {editingTicketId ? "Enregistrer les modifications" : "Valider la formule"}
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                {ticketFormulas.map((formula, idx) => {
                  return (
                    <div
                      key={formula.id || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                          <Ticket className="size-4.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-foreground">
                              {formula.name}
                            </h4>
                            <span className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] font-bold text-primary font-mono">
                              {formula.quantity} places
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {formula.description || "Accès standard à l'événement"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-border/50 pt-2 sm:border-0 sm:pt-0">
                        <span className="font-display font-bold text-sm text-foreground font-mono">
                          {((formula.price ?? 0) / 100).toLocaleString("fr-FR")} FCFA
                        </span>

                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEditFormula(formula)}
                            title="Modifier la formule"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-lg text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteFormula(formula.id)}
                            title="Supprimer la formule"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Ticket className="size-4 text-primary" />
                  <span>Modèle Visuel de Billet / Pass QR (3 modèles au choix)</span>
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono">Design du Pass</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* VRAI BILLET 1: Pass VIP Golden */}
                <button
                  type="button"
                  onClick={() => setSelectedTicketTemplate("GOLD_VIP")}
                  className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all bg-[#0d0d0d] text-white ${
                    selectedTicketTemplate === "GOLD_VIP"
                      ? "border-amber-400 ring-2 ring-amber-400/50 shadow-xl"
                      : "border-zinc-800 hover:border-amber-400/60 opacity-85 hover:opacity-100"
                  }`}
                >
                  {selectedTicketTemplate === "GOLD_VIP" && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-amber-400 text-black z-20 shadow-md">
                      <Check className="size-2.5 font-bold" />
                    </span>
                  )}

                  <div className="relative rounded-xl border border-amber-500/40 bg-gradient-to-r from-zinc-950 via-[#1a1508] to-zinc-950 p-3 shadow-inner overflow-hidden">
                    <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                      <span className="font-display font-extrabold text-[9px] text-amber-400 tracking-wider">
                        ★ GIYA VIP PASS ★
                      </span>
                      <span className="rounded bg-amber-400/20 px-1 py-0.2 text-[7px] font-mono font-bold text-amber-300">
                        CARRÉ OR
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-2 items-center">
                      <div className="col-span-8 space-y-1">
                        <p className="font-display font-bold text-[10px] text-white truncate">
                          {titleValue || "Festival Afro 2026"}
                        </p>
                        <p className="text-[8px] text-amber-300/90 truncate flex items-center gap-1">
                          <MapPin className="size-2.5 shrink-0" />
                          {venueValue || "Palais des Sports"}
                        </p>
                        <p className="text-[8px] text-zinc-400 font-mono">
                          {dateValue || "05 Sept. 2026"} • {startTimeValue || "19:00"}
                        </p>
                      </div>

                      <div className="col-span-1 flex justify-center h-full">
                        <div className="border-r border-dashed border-amber-500/40 h-10" />
                      </div>

                      <div className="col-span-3 flex flex-col items-center justify-center">
                        <div className="bg-white p-0.5 rounded">
                          <QrCode className="size-6 text-black" />
                        </div>
                        <span className="text-[6px] font-mono text-amber-400/80 mt-0.5">#GA-9082</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-amber-500/20 flex justify-between items-center text-[7px] text-zinc-400 font-mono">
                      <span>PRIX: 35 000 FCFA</span>
                      <span>CONTRÔLE VIP</span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className="font-bold text-xs text-amber-400">Billet VIP Golden</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Dorures or, souche détachable et QR code crypté.
                    </p>
                  </div>
                </button>

                {/* VRAI BILLET 2: Festival Neon Pass */}
                <button
                  type="button"
                  onClick={() => setSelectedTicketTemplate("FESTIVAL_WRISTBAND")}
                  className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all bg-[#06140e] text-white ${
                    selectedTicketTemplate === "FESTIVAL_WRISTBAND"
                      ? "border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl"
                      : "border-zinc-800 hover:border-emerald-400/60 opacity-85 hover:opacity-100"
                  }`}
                >
                  {selectedTicketTemplate === "FESTIVAL_WRISTBAND" && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-emerald-400 text-black z-20 shadow-md">
                      <Check className="size-2.5 font-bold" />
                    </span>
                  )}

                  <div className="relative rounded-xl border border-emerald-500/40 bg-gradient-to-r from-zinc-950 via-[#071f15] to-zinc-950 p-3 shadow-inner overflow-hidden">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                      <span className="font-display font-extrabold text-[9px] text-emerald-400 tracking-wider">
                        FESTIVAL LIVE PASS
                      </span>
                      <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[7px] font-mono font-bold text-emerald-300">
                        ACCÈS TOTAL
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-2 items-center">
                      <div className="col-span-8 space-y-1">
                        <p className="font-display font-bold text-[10px] text-white truncate">
                          {titleValue || "Festival Afro 2026"}
                        </p>
                        <p className="text-[8px] text-emerald-300/90 truncate flex items-center gap-1">
                          <MapPin className="size-2.5 shrink-0" />
                          SCÈNE PRINCIPALE
                        </p>
                        <p className="text-[8px] text-zinc-400 font-mono">
                          PASS 2 JOURS • ILLIMITÉ
                        </p>
                      </div>

                      <div className="col-span-1 flex justify-center h-full">
                        <div className="border-r border-dashed border-emerald-500/40 h-10" />
                      </div>

                      <div className="col-span-3 flex flex-col items-center justify-center">
                        <div className="bg-white p-0.5 rounded">
                          <QrCode className="size-6 text-black" />
                        </div>
                        <span className="text-[6px] font-mono text-emerald-400/80 mt-0.5">SCAN NÉON</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-emerald-500/20 flex justify-between items-center text-[7px] text-zinc-400 font-mono">
                      <span>PRIX: 10 000 FCFA</span>
                      <span>PORTES OUVERTES</span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className="font-bold text-xs text-emerald-400">Festival Neon Pass</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Style concert avec scènes et scan rapide.
                    </p>
                  </div>
                </button>

                {/* VRAI BILLET 3: Badge Conférence Pro */}
                <button
                  type="button"
                  onClick={() => setSelectedTicketTemplate("CONFERENCE_BADGE")}
                  className={`group relative flex flex-col justify-between rounded-2xl border-2 p-3 text-left transition-all bg-[#081220] text-white ${
                    selectedTicketTemplate === "CONFERENCE_BADGE"
                      ? "border-blue-400 ring-2 ring-blue-400/50 shadow-xl"
                      : "border-zinc-800 hover:border-blue-400/60 opacity-85 hover:opacity-100"
                  }`}
                >
                  {selectedTicketTemplate === "CONFERENCE_BADGE" && (
                    <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-blue-400 text-black z-20 shadow-md">
                      <Check className="size-2.5 font-bold" />
                    </span>
                  )}

                  <div className="relative rounded-xl border border-blue-500/40 bg-gradient-to-r from-zinc-950 via-[#0a1b33] to-zinc-950 p-3 shadow-inner overflow-hidden">
                    <div className="flex items-center justify-between border-b border-blue-500/30 pb-1.5">
                      <span className="font-display font-extrabold text-[9px] text-blue-400 tracking-wider">
                        BADGE PRO B2B
                      </span>
                      <span className="rounded bg-blue-500/20 px-1 py-0.2 text-[7px] font-mono font-bold text-blue-300">
                        DÉLÉGUÉ
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-1 py-2 items-center">
                      <div className="col-span-8 space-y-1">
                        <p className="font-display font-bold text-[10px] text-white truncate">
                          {titleValue || "Executive Summit 2026"}
                        </p>
                        <p className="text-[8px] text-blue-300/90 truncate flex items-center gap-1">
                          <UserCheck className="size-2.5 shrink-0" />
                          ACCRÉDITATION PRO
                        </p>
                        <p className="text-[8px] text-zinc-400 font-mono">
                          ACCÈS PLÉNIÈRES & SALON
                        </p>
                      </div>

                      <div className="col-span-1 flex justify-center h-full">
                        <div className="border-r border-dashed border-blue-500/40 h-10" />
                      </div>

                      <div className="col-span-3 flex flex-col items-center justify-center">
                        <div className="bg-white p-0.5 rounded">
                          <QrCode className="size-6 text-black" />
                        </div>
                        <span className="text-[6px] font-mono text-blue-400/80 mt-0.5">PRO-ACCESS</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-blue-500/20 flex justify-between items-center text-[7px] text-zinc-400 font-mono">
                      <span>PRIX: 50 000 FCFA</span>
                      <span>NETWORKING VIP</span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className="font-bold text-xs text-blue-400">Badge Conférence Pro</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Format badge officiel tour de cou B2B.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 3 : QUESTIONNAIRE TYPE GOOGLE FORMS */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Header Switch for Questionnaire */}
            <div className="rounded-3xl border border-primary/30 bg-primary/5 p-5 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <FileQuestion className="size-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-foreground">
                    Activer un Questionnaire d&apos;Inscription (Style Google Forms)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Collectez les attentes, profils et informations des participants lors de l&apos;achat du pass.
                  </p>
                </div>
              </div>

              <Switch
                checked={hasQuestionnaire}
                onCheckedChange={setHasQuestionnaire}
              />
            </div>

            {hasQuestionnaire ? (
              <div className="space-y-4">
                {/* Questions List (Google Forms Style) */}
                <div className="space-y-3">
                  {questions.map((q, qIndex) => {
                    const typeConfig =
                      QUESTION_TYPE_CONFIG.find((c) => c.type === q.type) ??
                      QUESTION_TYPE_CONFIG[0];
                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={q.id}
                        className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-3 relative hover:border-primary/40 transition-colors"
                      >
                        {/* Question Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono">
                              {qIndex + 1}
                            </span>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                              <TypeIcon className="size-3" />
                              {typeConfig.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span className="text-[11px]">Obligatoire</span>
                              <Switch
                                checked={q.isRequired}
                                onCheckedChange={() => handleToggleQuestionRequired(q.id)}
                              />
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-7 rounded-lg text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteQuestion(q.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Question Title Input */}
                        <Input
                          value={q.title}
                          onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                          placeholder="Intitulé de votre question..."
                          className="h-10 rounded-xl text-xs sm:text-sm font-semibold"
                        />

                        {/* Options for Choice Questions */}
                        {(q.type === "SINGLE_CHOICE" ||
                          q.type === "MULTIPLE_CHOICE" ||
                          q.type === "DROPDOWN") && (
                          <div className="space-y-2 pt-1 pl-2 border-l-2 border-primary/20">
                            {q.options?.map((opt, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <div className="size-3 rounded-full border border-primary/50 flex items-center justify-center shrink-0">
                                  <div className="size-1.5 rounded-full bg-primary" />
                                </div>
                                <Input
                                  value={opt}
                                  onChange={(e) =>
                                    handleUpdateOption(q.id, optIndex, e.target.value)
                                  }
                                  className="h-8 rounded-lg text-xs flex-1"
                                />
                                {q.options && q.options.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteOption(q.id, optIndex)}
                                  >
                                    <Trash2 className="size-3" />
                                  </Button>
                                )}
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary hover:text-primary gap-1 pl-4"
                              onClick={() => handleAddOption(q.id)}
                            >
                              <Plus className="size-3" />
                              Ajouter une option
                            </Button>
                          </div>
                        )}

                        {/* Preview Placeholder for Text & Rating Questions */}
                        {q.type === "SHORT_TEXT" && (
                          <div className="p-2.5 rounded-xl bg-muted/30 border border-dashed border-border text-xs text-muted-foreground">
                            Champ texte court réservé à la réponse du participant
                          </div>
                        )}

                        {q.type === "PARAGRAPH" && (
                          <div className="p-3 rounded-xl bg-muted/30 border border-dashed border-border text-xs text-muted-foreground">
                            Zone de texte multi-lignes pour commentaires et attentes détaillées
                          </div>
                        )}

                        {q.type === "RATING_SCALE" && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/20">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className="flex size-7 items-center justify-center rounded-lg border border-border bg-card text-xs font-bold text-amber-500 shadow-xs"
                              >
                                {star} ★
                              </span>
                            ))}
                            <span className="text-[11px] text-muted-foreground ml-2">
                              Échelle de 1 (Faible) à 5 (Excellent)
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Add Question Toolbar (Positioned at the bottom) */}
                <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card p-4 space-y-2.5">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="size-3.5 text-primary" />
                    <span>Ajouter une nouvelle question au formulaire</span>
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    {QUESTION_TYPE_CONFIG.map((cfg) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={cfg.type}
                          type="button"
                          onClick={() => handleAddQuestion(cfg.type)}
                          className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-all text-center group"
                        >
                          <Icon className="size-4 text-primary group-hover:scale-110 transition-transform mb-1" />
                          <span className="text-[11px] font-bold text-foreground">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-muted/10 space-y-3">
                <FileQuestion className="size-10 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-bold text-sm text-foreground">
                    Aucun questionnaire configuré pour cet événement
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                    Les acheteurs n&apos;auront qu&apos;à saisir leurs coordonnées standards (Nom, Email, Téléphone) sans questions supplémentaires.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs"
                  onClick={() => setHasQuestionnaire(true)}
                >
                  Activer le questionnaire
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ÉTAPE 4 : CERTIFICATIONS & RÉCAPITULATIF GLOBAL */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* 4.1 Certification Section */}
            <div className="space-y-3 rounded-3xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-foreground">
                      Délivrer une Certification / Attestation officielle
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Génération automatique du diplôme nominatif avec QR Code de vérification
                    </p>
                  </div>
                </div>
                <Switch
                  checked={hasCert}
                  onCheckedChange={(v) => {
                    setHasCert(v);
                    setValue("hasCertificate", v);
                  }}
                />
              </div>

              {hasCert && (
                <div className="space-y-4 pt-3 border-t border-border/60">
                  <div>
                    <Label className="text-xs font-bold text-foreground mb-2 block">
                      Sélectionnez le Modèle de Vraie Certification (3 modèles au choix)
                    </Label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* VRAIE CERTIF 1: Prestige Académique */}
                      <button
                        type="button"
                        onClick={() => setSelectedCertTemplate("ACADEMIC_GOLD")}
                        className={`group relative flex flex-col justify-between rounded-2xl border-2 p-2.5 text-left transition-all bg-[#faf8f2] dark:bg-[#15130f] text-zinc-900 dark:text-zinc-100 ${
                          selectedCertTemplate === "ACADEMIC_GOLD"
                            ? "border-amber-500 ring-2 ring-amber-500/50 shadow-xl"
                            : "border-zinc-300 dark:border-zinc-800 hover:border-amber-400 opacity-85 hover:opacity-100"
                        }`}
                      >
                        {selectedCertTemplate === "ACADEMIC_GOLD" && (
                          <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-amber-500 text-black z-20 shadow-md">
                            <Check className="size-2.5 font-bold" />
                          </span>
                        )}

                        <div className="rounded-xl border-2 border-double border-amber-600/70 p-2.5 space-y-1.5 text-center bg-gradient-to-b from-amber-500/5 to-transparent">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-[7px] font-mono font-bold text-amber-700 dark:text-amber-400">
                              N° GA-CERT-2026
                            </span>
                            <span className="flex size-5 items-center justify-center rounded-full bg-amber-500 text-black text-[7px] font-extrabold shadow-xs">
                              ★
                            </span>
                          </div>

                          <div className="font-serif text-[10px] font-extrabold tracking-widest text-amber-700 dark:text-amber-400 uppercase pt-0.5">
                            CERTIFICAT D&apos;ACCOMPLISSEMENT
                          </div>
                          <div className="h-0.5 w-16 mx-auto bg-amber-500/60" />

                          <p className="text-[7px] text-zinc-600 dark:text-zinc-400 italic">
                            Atteste que <strong className="text-zinc-900 dark:text-white">[Nom du Participant]</strong> a validé la formation
                          </p>
                          <p className="font-display font-bold text-[8px] text-zinc-800 dark:text-zinc-200 truncate">
                            {titleValue || "Executive Masterclass 2026"}
                          </p>

                          <div className="flex justify-between items-end pt-2 border-t border-amber-600/30 text-[6px] text-zinc-500">
                            <div className="text-left">
                              <div className="font-serif italic font-bold text-amber-600">{signatoryValue || "P. Mba"}</div>
                              <span>Direction Pédagogique</span>
                            </div>
                            <div className="flex items-center gap-1 bg-white dark:bg-black p-0.5 rounded border border-amber-500/30">
                              <QrCode className="size-4 text-black dark:text-white" />
                              <span className="text-[5px] font-mono">AUTHENTIQUE</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="font-bold text-xs text-amber-600 dark:text-amber-400">
                            Prestige Académique & Or
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Double cadre orné doré, sceau officiel et QR de vérification.
                          </p>
                        </div>
                      </button>

                      {/* VRAIE CERTIF 2: Corporate Executive */}
                      <button
                        type="button"
                        onClick={() => setSelectedCertTemplate("CORPORATE_PRESTIGE")}
                        className={`group relative flex flex-col justify-between rounded-2xl border-2 p-2.5 text-left transition-all bg-[#f4f7fb] dark:bg-[#0c1420] text-zinc-900 dark:text-zinc-100 ${
                          selectedCertTemplate === "CORPORATE_PRESTIGE"
                            ? "border-blue-500 ring-2 ring-blue-500/50 shadow-xl"
                            : "border-zinc-300 dark:border-zinc-800 hover:border-blue-400 opacity-85 hover:opacity-100"
                        }`}
                      >
                        {selectedCertTemplate === "CORPORATE_PRESTIGE" && (
                          <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-blue-500 text-white z-20 shadow-md">
                            <Check className="size-2.5 font-bold" />
                          </span>
                        )}

                        <div className="rounded-xl border border-blue-500/60 p-2.5 space-y-1.5 text-center bg-gradient-to-b from-blue-500/10 to-transparent">
                          <div className="flex justify-between items-center px-1">
                            <ShieldCheck className="size-4 text-blue-500" />
                            <span className="text-[7px] font-mono font-bold text-blue-600 dark:text-blue-400">
                              EXECUTIVE DIPLOMA
                            </span>
                          </div>

                          <div className="font-sans text-[10px] font-extrabold tracking-wider text-blue-700 dark:text-blue-400 uppercase pt-0.5">
                            ATTESTATION OFFICIELLE DE SUCCÈS
                          </div>
                          <div className="h-0.5 w-16 mx-auto bg-blue-500/60" />

                          <p className="text-[7px] text-zinc-600 dark:text-zinc-400">
                            Délivrée par <strong className="text-blue-600 dark:text-blue-300">{issuerValue || "Giya Executive"}</strong>
                          </p>
                          <p className="font-display font-bold text-[8px] text-zinc-800 dark:text-zinc-200 truncate">
                            {titleValue || "Leadership & Stratégie"}
                          </p>

                          <div className="flex justify-between items-end pt-2 border-t border-blue-500/30 text-[6px] text-zinc-500">
                            <div className="text-left">
                              <span className="text-blue-500 font-mono">Signé Numériquement</span>
                              <div>Sceau d&apos;Accréditation</div>
                            </div>
                            <div className="bg-white dark:bg-black p-0.5 rounded border border-blue-500/30">
                              <QrCode className="size-4 text-black dark:text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="font-bold text-xs text-blue-600 dark:text-blue-400">
                            Corporate Executive
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Cadre moderne navy avec signature numérique certifiée.
                          </p>
                        </div>
                      </button>

                      {/* VRAIE CERTIF 3: Tech & Digital Skills */}
                      <button
                        type="button"
                        onClick={() => setSelectedCertTemplate("TECH_INNOVATION")}
                        className={`group relative flex flex-col justify-between rounded-2xl border-2 p-2.5 text-left transition-all bg-[#f0fdfa] dark:bg-[#071917] text-zinc-900 dark:text-zinc-100 ${
                          selectedCertTemplate === "TECH_INNOVATION"
                            ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-xl"
                            : "border-zinc-300 dark:border-zinc-800 hover:border-cyan-400 opacity-85 hover:opacity-100"
                        }`}
                      >
                        {selectedCertTemplate === "TECH_INNOVATION" && (
                          <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-cyan-400 text-black z-20 shadow-md">
                            <Check className="size-2.5 font-bold" />
                          </span>
                        )}

                        <div className="rounded-xl border border-cyan-500/60 p-2.5 space-y-1.5 text-center bg-gradient-to-b from-cyan-500/10 to-transparent">
                          <div className="flex justify-between items-center px-1">
                            <Sparkles className="size-4 text-cyan-500" />
                            <span className="rounded bg-cyan-400/20 px-1 py-0.2 text-[7px] font-mono font-bold text-cyan-600 dark:text-cyan-300">
                              BLOCKCHAIN VERIFIED
                            </span>
                          </div>

                          <div className="font-mono text-[9px] font-extrabold tracking-wider text-cyan-700 dark:text-cyan-400 uppercase pt-0.5">
                            DIGITAL SKILLS CREDENTIAL
                          </div>
                          <div className="h-0.5 w-16 mx-auto bg-cyan-400/60" />

                          <p className="text-[7px] text-zinc-600 dark:text-zinc-400 font-mono">
                            Validation de compétences & aptitudes
                          </p>
                          <p className="font-display font-bold text-[8px] text-zinc-800 dark:text-zinc-200 truncate">
                            {titleValue || "IA & Transformation Digitale"}
                          </p>

                          <div className="flex justify-between items-end pt-2 border-t border-cyan-500/30 text-[6px] text-zinc-500 font-mono">
                            <div className="text-left text-cyan-600 dark:text-cyan-400">
                              ID: #0x9F4C...2026
                            </div>
                            <div className="bg-white dark:bg-black p-0.5 rounded border border-cyan-500/30">
                              <QrCode className="size-4 text-black dark:text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="font-bold text-xs text-cyan-600 dark:text-cyan-400">
                            Tech & Digital Skills
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Design moderne avec vérification cryptographique instantanée.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Titre du Certificat / Attestation</Label>
                      <Input
                        className="h-9 rounded-xl text-xs"
                        placeholder="Ex: Certificat d'Accomplissement & de Formation"
                        {...register("certificateTitle")}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Organisme Émetteur / Académie</Label>
                      <Input
                        className="h-9 rounded-xl text-xs"
                        placeholder="Ex: Institut Supérieur de Management"
                        {...register("issuerName")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4.2 Récapitulatif Complet avant Publication */}
            <div className="space-y-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                <BadgeCheck className="size-5 text-primary" />
                <h4 className="font-display font-bold text-sm text-foreground">
                  Récapitulatif de l&apos;Événement
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 bg-muted/20 p-3 rounded-2xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Événement
                  </span>
                  <p className="font-bold text-foreground text-sm truncate">{titleValue || "Sans titre"}</p>
                  <p className="text-muted-foreground line-clamp-2 mt-0.5">{descValue}</p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-2xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Date & Lieu
                  </span>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <Calendar className="size-3.5 text-primary" /> {dateValue} {startTimeValue ? `à ${startTimeValue}` : ""}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="size-3.5 text-primary" /> {venueValue || "Lieu à confirmer"}
                  </p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-2xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Formules & Jauge
                  </span>
                  <p className="font-bold text-foreground">
                    {ticketFormulas.length} formule(s) • {totalCalculatedCapacity} places
                  </p>
                  <p className="text-emerald-500 font-bold font-mono mt-0.5">
                    CA: {totalPotentialRevenue.toLocaleString("fr-FR")} FCFA
                  </p>
                </div>

                <div className="space-y-1 bg-muted/20 p-3 rounded-2xl border border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                    Questionnaire & Certifs
                  </span>
                  <p className="font-bold text-foreground">
                    {hasQuestionnaire ? `${questions.length} question(s) configurée(s)` : "Aucun questionnaire"}
                  </p>
                  <p className="text-muted-foreground text-[11px] truncate mt-0.5">
                    {hasCert ? "Certification activée" : "Sans certification"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEPPER FOOTER BUTTONS (Toujours visible en bas / Sticky) */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur-md flex items-center justify-between gap-3 pt-3.5 pb-1 border-t border-border z-20">
          <div>
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-xs gap-1.5"
                onClick={handlePrevStep}
              >
                <ChevronLeft className="size-3.5" />
                Précédent
              </Button>
            ) : onCancel ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-xs"
                onClick={onCancel}
              >
                Annuler
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 4 ? (
              <Button
                type="button"
                className="rounded-xl bg-primary text-white font-semibold text-xs gap-1.5 shadow-md shadow-primary/20"
                onClick={handleNextStep}
              >
                <span>Continuer vers l&apos;Étape {currentStep + 1}</span>
                <ChevronRight className="size-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="rounded-xl bg-primary text-white font-semibold text-xs shadow-md shadow-primary/20 gap-1.5"
                disabled={submitting}
              >
                <Check className="size-3.5" />
                {submitting
                  ? "Enregistrement..."
                  : initialData?.id
                  ? "Mettre à jour l'événement"
                  : "Publier l'événement"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>

    {/* Giya AI Poster Studio Upgrade Modal */}
    <PricingUpgradeModal
      isOpen={isAiPosterModalOpen}
      onClose={() => setIsAiPosterModalOpen(false)}
      feature="AI_POSTER"
    />
  </div>
  );
}
