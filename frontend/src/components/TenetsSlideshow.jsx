import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBookOpen, faUniversalAccess, faUserTimes, faPray, faWater, 
    faDove, faHeartbeat, faHandHoldingHeart, faCloudUploadAlt, faRing, faSun
} from '@fortawesome/free-solid-svg-icons';

const tenets = [
    { id: 1, title: "The Bible", icon: faBookOpen, color: "from-blue-900 to-indigo-950", description: "We believe in the divine inspiration and authority of the Holy Scriptures. That the Bible is infallible in its declaration, final in its authority, all-sufficient in its provisions and comprehensive in its sufficiency." },
    { id: 2, title: "The One True God", icon: faSun, color: "from-amber-600 to-yellow-900", description: "We believe in the existence of the One True God, Elohim, Maker of the whole universe; revealed as Triune Godhead – Father, Son, and Holy Spirit – one in nature, essence and attributes; Omnipotent, Omniscient and Omnipresent." },
    { id: 3, title: "Man's Depraved Nature", icon: faUserTimes, color: "from-slate-800 to-black", description: "We believe that all have sinned and come short of the glory of God, and are subject to eternal punishment, and need repentance and regeneration." },
    { id: 4, title: "The Saviour", icon: faPray, color: "from-mdPrimary to-blue-900", description: "We believe that man’s need of a Saviour has been met in the person of Jesus Christ, because of His Deity, Virgin Birth, Sinless Life, Atoning Death, Resurrection, and Ascension; His Abiding Intercession and His Second Coming." },
    { id: 5, title: "Repentance, Justification and Regeneration", icon: faSun, color: "from-indigo-800 to-blue-900", description: "We believe all men have to repent of and confess their sins before God, and believe in the vicarious death of Jesus Christ to be justified before God. We believe in the sanctification of the believer through the working of the Holy Spirit." },
    { id: 6, title: "Baptism and the Lord's Supper", icon: faWater, color: "from-cyan-800 to-blue-950", description: "We believe in the ordinance of Baptism by immersion as a testimony of a convert, and the ordinance of the Lord’s Supper which should be partaken of by all members who are in full fellowship." },
    { id: 7, title: "The Holy Spirit", icon: faDove, color: "from-amber-400 to-orange-700", description: "We believe in the baptism of the Holy Spirit for believers with signs following, and in the operation of the gifts and the fruit of the Holy Spirit in the lives of believers." },
    { id: 8, title: "Divine Healing", icon: faHeartbeat, color: "from-rose-800 to-red-950", description: "We believe that the healing of sickness and disease is provided for God’s people in the atonement. The Church is, however, not opposed to soliciting the help of qualified medical practitioners." },
    { id: 9, title: "Tithes and Offerings", icon: faHandHoldingHeart, color: "from-emerald-800 to-green-950", description: "We believe in tithing and in the giving of free-will offerings towards the cause of carrying forward the Kingdom of God. We believe that God blesses a cheerful giver." },
    { id: 10, title: "The Second Coming and Next Life", icon: faCloudUploadAlt, color: "from-indigo-900 to-purple-950", description: "We believe in the Second Coming of Christ and the resurrection of the dead, both the saved and the unsaved – they that are saved, to the resurrection of life; and the unsaved, to the resurrection of damnation." },
    { id: 11, title: "Marriage and Family", icon: faRing, color: "from-pink-800 to-rose-950", description: "We believe in the institution of marriage as a union established and ordained by God for the lifelong, intimate relationship between a man as husband and a woman as wife." }
];

export default function TenetsSlideshow() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % tenets.length);
        }, 10000); // 10 seconds interval as requested
        return () => clearInterval(timer);
    }, []);

    const current = tenets[currentIndex];

    return (
        <section className="relative min-h-[650px] w-full overflow-hidden rounded-[3rem] shadow-premium group">
            <div className={`absolute inset-0 bg-gradient-to-br ${current.color} transition-all duration-[2s] ease-in-out`}></div>
            
            {/* Animated Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 animate-spin-slow bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            </div>

            <div className="relative z-10 h-full min-h-[650px] flex flex-col items-center justify-center p-8 md:p-16 text-center text-white">
                <div className="mb-10 animate-float">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-6xl shadow-lifted">
                        <FontAwesomeIcon icon={current.icon} className="animate-pulse" />
                    </div>
                </div>

                <div className="max-w-5xl animate-slide-up">
                    <span className="text-mdSecondary font-black uppercase tracking-[0.4em] text-xs mb-4 block">
                        Tenet No. {current.id}
                    </span>
                    <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-none italic">
                        {current.title}
                    </h2>
                    <p className="text-lg md:text-xl text-white/90 font-medium leading-[1.8] max-w-4xl mx-auto italic drop-shadow-md">
                        "{current.description}"
                    </p>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-12 flex gap-3">
                    {tenets.map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-mdSecondary' : 'w-3 bg-white/20'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Side Labels for Context */}
            <div className="absolute top-1/2 -left-20 -translate-y-1/2 rotate-90 hidden md:block">
                <p className="text-white/10 font-black text-6xl uppercase tracking-[0.5em] whitespace-nowrap">FUNDAMENTAL BELIEFS</p>
            </div>
        </section>
    );
}
