import { connection } from "next/server";
import { getSiteData } from "@/lib/store";
import { SiteNavbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Highlights } from "@/components/site/highlights";
import { About } from "@/components/site/about";
import { Darshan } from "@/components/site/darshan";
import { Videos } from "@/components/site/videos";
import { Events } from "@/components/site/events";
import { SpecialEvents } from "@/components/site/showcase";
import { Yatra } from "@/components/site/yatra";
import { Gallery } from "@/components/site/gallery";
import { Schedule } from "@/components/site/schedule";
import { Contact } from "@/components/site/contact";
import { Support } from "@/components/site/support";
import { Footer } from "@/components/site/footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";

export default async function Home() {
  await connection(); // always render with the latest admin content
  const data = await getSiteData();
  const { settings } = data;

  return (
    <div className="relative w-full overflow-x-clip bg-background">
      <SiteNavbar />
      <main>
        <Hero settings={settings} />
        <Marquee items={settings.announcement} />
        <Highlights items={data.highlights} />
        <Darshan items={data.shringar} />
        <SpecialEvents items={data.events} />
        <Videos items={data.videos} settings={settings} />
        <About settings={settings} />
        <Events items={data.events} />
        <Yatra items={data.trips} settings={settings} />
        <Schedule items={data.schedule} />
        <Gallery items={data.gallery} />
        <Support settings={settings} />
        <Contact settings={settings} trips={data.trips} />
      </main>
      <Footer settings={settings} />
      <WhatsAppButton number={settings.whatsapp} />
    </div>
  );
}
