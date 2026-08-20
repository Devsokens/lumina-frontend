import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BackToTop />
    </>
  );
}
