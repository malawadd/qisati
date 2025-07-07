import NavBar from '../components/NavBar';
import { PrimaryButton } from '../components/atoms/PrimaryButton';
import { Avatar } from '../components/atoms/Avatar';
import { ChapterCard } from '../components/ChapterCard';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
// import { CoinTradingWidget } from '../components/coin/CoinTradingWidget';
import { Address ,  } from 'viem';
import TradingScreen from '@/components/coin/TradingScreen';
import { useState } from "react";
import { useAccount } from 'wagmi';


export function Work() {
  const path = window.location.pathname;
  const slug = path.split('/')[2]; // Extract slug from /work/{slug}
  const work = useQuery(api.queries.seriesBySlug, { slug });
  const { address, isConnected } = useAccount();
  const series = useQuery(api.queries.seriesById, work?.chapters[0] ? { id: work.id } : "skip");
  console.log("Work data:", work);
  console.log("Series data:", series);
  const hasTrading = series?.contract && series.contract !== "0x0000000000000000000000000000000000000000";
  const [tab, setTab] = useState("chapters");

  const tabs = [
    { label: "Chapters", key: "chapters" },
    ...(hasTrading ? [{ label: "Trading", key: "trading" }] : [])
  ];

  if (!work) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen grid-bg flex items-center justify-center">
          <div className="neo bg-white p-8">
            <div className="text-black font-bold">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid-bg">
    {/* Cover Section */}
    <div className="relative min-h-[35vh] flex items-end justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${work.cover})` }}
      />
        <div className="relative z-10 w-full flex justify-center pb-8">
        <div className="neo bg-white p-8 max-w-4xl w-full text-center shadow-lg rounded-2xl">
            <img 
              src={work.cover || undefined} 
              alt={work.title}
              className="w-60 h-90 object-cover mx-auto mb-6 neo"
            />
            <h1 className="text-4xl font-bold text-black mb-4">{work.title}</h1>
            <p className="text-lg text-black mb-6 font-medium">{work.logline}</p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Avatar src={work.author.avatar} alt={work.author.name} />
              <div className="text-left">
                <a 
                  href={`/@${work.author.name}`}
                  className="font-bold text-black hover:text-primary transition-colors cursor-pointer"
                >
                  {work.author.name}
                </a>
                <div className="text-sm text-black">{work.author.bio}</div>
              </div>
            </div>
            <PrimaryButton>Collect Series</PrimaryButton>
          </div>
        </div>
      </div>

      {/* Main Section - overlaps the cover a bit */}
      <main className="max-w-6xl mx-auto px-8 py-12 -mt-12">
      <div className="neo bg-white p-8 mb-12">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: work.synopsis.replace(/\n/g, "<br>")
          }}
        />
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-8 border-b-4 border-black justify-center">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-6 py-2 font-bold text-lg rounded-t border-x-2 border-t-2 border-black 
              ${tab === t.key ? "bg-white text-black" : "bg-gray-100 text-gray-400"}
              transition`}
            style={{
              borderBottom: tab === t.key ? "2px solid white" : "2px solid black"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {/* Chapters */}
        {tab === "chapters" && (
          <>
            <h2 className="text-3xl font-bold text-black mb-8">Chapters</h2>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
              {work.chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  index={index + 1}
                  {...chapter}
                  onClick={() =>
                    window.location.href = `/work/${slug}/chap/${chapter.id}`
                  }
                />
              ))}
            </div>
          </>
        )}

        {/* Trading */}
        {tab === "trading" && hasTrading && (
          <TradingScreen
            coinAddress={series.contract}
            userAddress={address as Address}
          />
        )}
      </div>

      {/* Comments Panel */}
      <div className="neo bg-white p-8 mt-12" style={{ minHeight: "240px" }}>
        <h3 className="text-xl font-bold text-black mb-4">Comments</h3>
        <div className="text-black font-medium">
          Join the conversation about this series...
        </div>
      </div>
    </main>
      </div>
    </>
  );
}
