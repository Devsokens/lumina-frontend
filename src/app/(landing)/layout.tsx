import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";
import { BackToTop } from "@/components/shared/back-to-top";
import { GiyaxAssistant } from "@/components/ai/giyax-assistant";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <BackToTop />
      <GiyaxAssistant mode="public" />
    </>
  );
}
