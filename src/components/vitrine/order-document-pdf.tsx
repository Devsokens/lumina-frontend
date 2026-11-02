import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { PAYMENT_LABELS, type OrderDocumentData } from "@/lib/order-document";

// Facture / addition en PDF (A5). Palette « Forêt Gabonaise ». Polices
// standard du PDF (Helvetica) : aucune police à télécharger à la volée.
const C = {
  forest: "#0A4F3C",
  sun: "#F4B942",
  text: "#1C1C1E",
  muted: "#6B7280",
  surface: "#EAE8E1",
  bg: "#F8F7F4",
};

const s = StyleSheet.create({
  page: { padding: 28, fontSize: 9, color: C.text, fontFamily: "Helvetica", backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 44, height: 44, objectFit: "contain", borderRadius: 8 },
  monogram: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: C.forest,
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    paddingTop: 11,
  },
  restaurant: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.forest },
  small: { fontSize: 8, color: C.muted },
  badge: { borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, fontFamily: "Helvetica-Bold", fontSize: 10 },
  band: { height: 3, backgroundColor: C.sun, marginTop: 12, marginBottom: 12, borderRadius: 2 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", backgroundColor: C.bg, borderRadius: 6, padding: 8, marginBottom: 12 },
  metaCell: { width: "50%", paddingVertical: 3 },
  metaLabel: { fontSize: 7, color: C.muted, textTransform: "uppercase" },
  metaValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  tableHead: { flexDirection: "row", backgroundColor: C.forest, color: "#FFFFFF", padding: 6, borderRadius: 4, fontFamily: "Helvetica-Bold", fontSize: 8 },
  row: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: C.surface },
  cName: { flex: 1 },
  cQty: { width: 34, textAlign: "center" },
  cUnit: { width: 70, textAlign: "right" },
  cTotal: { width: 76, textAlign: "right" },
  note: { fontSize: 7, color: C.muted, marginTop: 1 },
  totals: { marginTop: 10, marginLeft: "auto", width: 200 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  grand: { flexDirection: "row", justifyContent: "space-between", marginTop: 4, padding: 8, borderRadius: 6, backgroundColor: C.forest, color: "#FFFFFF", fontFamily: "Helvetica-Bold", fontSize: 12 },
  notice: { marginTop: 14, padding: 8, borderRadius: 6, borderWidth: 1, fontSize: 8 },
  footer: { position: "absolute", left: 28, right: 28, bottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: C.surface, paddingTop: 6 },
  appLogo: { width: 52, height: 22, objectFit: "contain" },
});

// toLocaleString("fr-FR") produit des espaces fines insécables, absentes
// d'Helvetica : remplacées par des espaces simples.
function money(cents: number) {
  return `${Math.round(cents / 100).toLocaleString("fr-FR").replace(/[  ]/g, " ")} FCFA`;
}

const ORDER_TYPES = { DINE_IN: "Sur place", TAKEAWAY: "À emporter", DELIVERY: "Livraison", EVENT: "Billetterie", STAY: "Séjour" };

export function OrderDocumentPdf({ data, appLogoUrl }: { data: OrderDocumentData; appLogoUrl?: string | null }) {
  const invoice = data.kind === "INVOICE";
  const title = invoice ? "FACTURE" : "ADDITION";
  const r = data.restaurant;
  const date = new Date(data.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

  return (
    <Document title={`${title} ${data.orderNumber} — ${r.name}`} author={r.name} creator="GiyaX">
      <Page size="A5" style={s.page}>
        <View style={s.header}>
          <View style={s.brandRow}>
            {r.logoUrl ? <Image src={r.logoUrl} style={s.logo} /> : <Text style={s.monogram}>{r.name.charAt(0).toUpperCase()}</Text>}
            <View>
              <Text style={s.restaurant}>{r.name}</Text>
              {r.address && <Text style={s.small}>{r.address}</Text>}
              {r.phone && <Text style={s.small}>Tél. {r.phone}</Text>}
            </View>
          </View>
          <Text
            style={[
              s.badge,
              invoice ? { backgroundColor: C.forest, color: "#FFFFFF" } : { backgroundColor: C.sun, color: C.text },
            ]}
          >
            {title}
          </Text>
        </View>

        <View style={s.band} />

        <View style={s.metaGrid}>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>N° de commande</Text>
            <Text style={s.metaValue}>{data.orderNumber}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>Date</Text>
            <Text style={s.metaValue}>{date}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>Service</Text>
            <Text style={s.metaValue}>
              {ORDER_TYPES[data.orderType]}
              {data.tableNumber ? ` · Table ${String(data.tableNumber).padStart(2, "0")}` : ""}
            </Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>{data.guests ? "Couverts" : "Client"}</Text>
            <Text style={s.metaValue}>{data.guests ? String(data.guests) : data.customerName || data.customerPhone || "—"}</Text>
          </View>
        </View>

        <View style={s.tableHead}>
          <Text style={s.cName}>Article</Text>
          <Text style={s.cQty}>Qté</Text>
          <Text style={s.cUnit}>Prix unit.</Text>
          <Text style={s.cTotal}>Montant</Text>
        </View>
        {data.lines.length === 0 ? (
          <View style={s.row}>
            <Text style={s.cName}>Commande {data.orderNumber}</Text>
            <Text style={s.cTotal}>{money(data.total)}</Text>
          </View>
        ) : (
          data.lines.map((l, i) => (
            <View key={i} style={s.row} wrap={false}>
              <View style={s.cName}>
                <Text>{l.name}</Text>
                {l.notes ? <Text style={s.note}>{l.notes}</Text> : null}
              </View>
              <Text style={s.cQty}>{l.quantity}</Text>
              <Text style={s.cUnit}>{money(l.unitPrice)}</Text>
              <Text style={s.cTotal}>{money(l.unitPrice * l.quantity)}</Text>
            </View>
          ))
        )}

        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text style={s.small}>Sous-total</Text>
            <Text>{money(data.subtotal)}</Text>
          </View>
          {data.tax > 0 && (
            <View style={s.totalRow}>
              <Text style={s.small}>Taxes</Text>
              <Text>{money(data.tax)}</Text>
            </View>
          )}
          <View style={s.grand}>
            <Text>{invoice ? "Total payé" : "Total à régler"}</Text>
            <Text>{money(data.total)}</Text>
          </View>
        </View>

        <Text
          style={[
            s.notice,
            invoice ? { borderColor: "#10B981", color: "#065F46" } : { borderColor: C.sun, color: "#78350F" },
          ]}
        >
          {invoice
            ? `Payée par ${PAYMENT_LABELS[data.paymentMethod]}. Merci de votre visite !`
            : "Montant à régler sur place (espèces ou au comptoir). Présentez cette addition au serveur."}
        </Text>

        <View style={s.footer} fixed>
          <Text style={s.small}>
            {r.slug}.giyax · Document généré le {new Date().toLocaleDateString("fr-FR")}
          </Text>
          {appLogoUrl ? <Image src={appLogoUrl} style={s.appLogo} /> : <Text style={s.small}>GiyaX</Text>}
        </View>
      </Page>
    </Document>
  );
}
