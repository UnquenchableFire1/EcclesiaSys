import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt, faQuoteLeft, faCopy } from '@fortawesome/free-solid-svg-icons';

const DAILY_VERSES = [
  { verse: "For I know the plans I have for you,\" declares the LORD, \"plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { verse: "I can do all this through him who gives me strength.", reference: "Philippians 4:13" },
  { verse: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28" },
  { verse: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6" },
  { verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", reference: "Matthew 6:33" },
  { verse: "The LORD is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
  { verse: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.", reference: "Isaiah 41:10" },
  { verse: "Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you.", reference: "Deuteronomy 31:6" },
  { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
  { verse: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", reference: "Isaiah 40:31" },
  { verse: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own.", reference: "Matthew 6:34" },
  { verse: "Jesus looked at them and said, 'With man this is impossible, but with God all things are possible.'", reference: "Matthew 19:26" },
  { verse: "The LORD is good, a refuge in times of trouble. He cares for those who trust in him.", reference: "Nahum 1:7" },
  { verse: "He gives strength to the weary and increases the power of the weak.", reference: "Isaiah 40:29" },
  { verse: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", reference: "Matthew 5:16" },
  { verse: "Give thanks to the LORD, for he is good; his love endures forever.", reference: "Psalm 107:1" },
  { verse: "The LORD is my light and my salvation—whom shall I fear? The LORD is the stronghold of my life—of whom shall I be afraid?", reference: "Psalm 27:1" },
  { verse: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", reference: "Colossians 3:23" },
  { verse: "God is our refuge and strength, an ever-present help in trouble.", reference: "Psalm 46:1" },
  { verse: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.", reference: "2 Timothy 1:7" },
  { verse: "Commit to the LORD whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
  { verse: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.", reference: "Galatians 5:22-23" },
  { verse: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105" },
  { verse: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", reference: "Ephesians 4:32" },
  { verse: "And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.", reference: "Colossians 3:17" },
  { verse: "The heavens declare the glory of God; the skies proclaim the work of his hands.", reference: "Psalm 19:1" },
  { verse: "Humble yourselves, therefore, under God’s mighty hand, that he may lift you up in due time.", reference: "1 Peter 5:6" },
  { verse: "This is the day the LORD has made; let us rejoice and be glad in it.", reference: "Psalm 118:24" },
  { verse: "Draw near to God, and he will draw near to you.", reference: "James 4:8" },
  { verse: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.", reference: "John 14:27" },
  { verse: "Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.", reference: "1 Thessalonians 5:16-18" }
];

const DailyVerse = () => {
  const [currentVerse, setCurrentVerse] = useState({ verse: '', reference: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get day of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Select verse based on day of year
    const index = dayOfYear % DAILY_VERSES.length;
    setCurrentVerse(DAILY_VERSES[index]);
  }, []);

  const handleCopy = () => {
    const text = `"${currentVerse.verse}" - ${currentVerse.reference}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Daily Bible Verse',
        text: `"${currentVerse.verse}" - ${currentVerse.reference}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative group overflow-hidden bg-mdSurfaceVariant/40 backdrop-blur-md border border-white/40 rounded-[2.5rem] p-8 md:p-10 shadow-premium transition-all duration-500 hover:shadow-lifted hover:-translate-y-1">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-mdPrimary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-mdPrimary/20 transition-all duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-mdSecondary/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:bg-mdSecondary/20 transition-all duration-700"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
        <div className="bg-mdPrimary/10 w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-sm border border-mdPrimary/20">
          <FontAwesomeIcon icon={faQuoteLeft} className="text-3xl text-mdPrimary" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <p className="text-[10px] md:text-xs font-black text-mdPrimary uppercase tracking-[0.2em] mb-3 opacity-70">
            Spiritual Nourishment • Daily Verse
          </p>
          <div className="relative">
            <p className="text-2xl md:text-3xl font-serif italic text-mdOnSurface leading-tight mb-4 tracking-tight drop-shadow-sm">
              {currentVerse.verse}
            </p>
          </div>
          <p className="text-mdPrimary font-black text-lg md:text-xl tracking-wide">
            {currentVerse.reference}
          </p>
        </div>

        <div className="flex flex-row md:flex-col gap-3 shrink-0">
          <button 
            onClick={handleCopy}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
              copied ? 'bg-mdPrimary text-white' : 'bg-white hover:bg-mdPrimary/10 text-mdPrimary border border-mdPrimary/20'
            }`}
            title="Copy to clipboard"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
          <button 
            onClick={handleShare}
            className="w-12 h-12 rounded-2xl bg-white hover:bg-mdSecondary/10 text-mdSecondary border border-mdSecondary/20 flex items-center justify-center transition-all duration-300 shadow-sm"
            title="Share verse"
          >
            <FontAwesomeIcon icon={faShareAlt} />
          </button>
        </div>
      </div>
      
      {copied && (
        <div className="absolute bottom-4 right-4 bg-mdPrimary text-white text-[10px] font-bold py-1 px-3 rounded-full animate-bounce">
          Copied!
        </div>
      )}
    </div>
  );
};

export default DailyVerse;
