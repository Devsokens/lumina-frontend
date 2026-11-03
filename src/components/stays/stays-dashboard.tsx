"use client";

import Link from "next/link";
import { BedDouble, CalendarCheck, Home, Percent, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/charts/stat-card";
import { BookingList } from "@/components/stays/booking-list";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { formatXAF } from "@/lib/format";
import { useBookings, useStayStats } from "@/hooks/useStays";
import { useAuthStore } from "@/stores/useAuthStore";

// Tableau de bord hôte : indicateurs (OWNER/MANAGER), arrivées et départs
// du jour, prochains séjours — l'accueil (STAFF) voit les listes.
export function StaysDashboard() {
  const role = useAuthStore((s) => s.user?.role);
  const canSeeStats = role === "OWNER" || role === "MANAGER";
  const { data: stats, isLoading } = useStayStats(canSeeStats);
  const { data: upcoming } = useBookings("upcoming");
  const base = "/admin/accommodation";

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Tableau de bord</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Vos logements et séjours en un coup d&apos;œil</p>
        </div>
        {canSeeStats && (
          <Button asChild className="rounded-xl">
            <Link href={`${base}/listings/new`}>
              <Plus className="size-4" /> Nouveau logement
            </Link>
          </Button>
        )}
      </div>

      {canSeeStats &&
        (isLoading || !stats ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard index={0} label="Revenus du mois" value={stats.revenueThisMonth} format={formatXAF} icon={Wallet} />
            <StatCard index={1} label="Occupation (30 j)" value={stats.occupancyNext30} format={(v) => `${Math.round(v)} %`} icon={Percent} />
            <StatCard index={2} label="Séjours à venir" value={stats.upcomingBookings} icon={CalendarCheck} hint={`${stats.inHouse} voyageur(s) sur place`} />
            <StatCard index={3} label="Logements en ligne" value={stats.publishedListings} icon={Home} />
          </div>
        ))}

      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <h2 className="font-semibold">Arrivées du jour</h2>
            <BookingList bookings={stats.arrivalsToday} empty="Aucune arrivée aujourd'hui." />
          </section>
          <section className="space-y-3">
            <h2 className="font-semibold">Départs du jour</h2>
            <BookingList bookings={stats.departuresToday} empty="Aucun départ aujourd'hui." />
          </section>
        </div>
      )}

      {canSeeStats && <AnalyticsOverview ordersLabel="Réservations" topTitle="Logements les plus rentables" topUnit="nuits" />}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <BedDouble className="size-4" /> Prochains séjours
          </h2>
          <Link href={`${base}/bookings`} className="text-sm text-primary underline-offset-4 hover:underline">
            Tout voir
          </Link>
        </div>
        <BookingList bookings={(upcoming ?? []).slice(0, 5)} empty="Aucun séjour à venir pour le moment." />
      </section>
    </div>
  );
}
