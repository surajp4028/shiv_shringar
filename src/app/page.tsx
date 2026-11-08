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
  // Sections switched off in /admin → Settings → Website sections.
  const off = new Set(settings.hiddenSections ?? []);
  const on = (id: string) => !off.has(id);

  return (
    <div className="relative w-full overflow-x-clip bg-background">
      <SiteNavbar hidden={[...off]} />
      <main>
        <Hero settings={settings} />
        {on("marquee") && <Marquee items={settings.announcement} />}
        {on("highlights") && <Highlights items={data.highlights} />}
        {on("darshan") && <Darshan items={data.shringar} />}
        {on("special") && <SpecialEvents items={data.events} />}
        {on("videos") && <Videos items={data.videos} settings={settings} />}
        {on("about") && <About settings={settings} />}
        {on("events") && <Events items={data.events} />}
        {on("yatra") && <Yatra items={data.trips} settings={settings} />}
        {on("schedule") && <Schedule items={data.schedule} />}
        {on("gallery") && <Gallery items={data.gallery} />}
        {on("support") && <Support settings={settings} />}
        {on("contact") && <Contact settings={settings} trips={data.trips} />}
      </main>
      <Footer settings={settings} hidden={[...off]} />
      <WhatsAppButton number={settings.whatsapp} />
    </div>
  );
}
