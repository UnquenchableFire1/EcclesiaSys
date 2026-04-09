import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

// The images are located in public/assets/images/church/
const council = [
    { name: "Apostle Eric Nyamekye",           role: "Chairman",                      location: "COP Headquarters",      img: "/assets/images/church/eric_nyamekye.jpg" },
    { name: "Apostle Samuel Gyau Obuobi",       role: "General Secretary",             location: "COP Headquarters",      img: "/assets/images/church/samuel_obuobi.jpg" },
    { name: "Apostle Emmanuel Agyemang Bekoe",  role: "International Missions Director",location: "International Missions",img: "/assets/images/church/emmanuel_bekoe.jpg" },
    { name: "Apostle Alexander N.Y. Kumi-Larbi",role: "Executive Member",              location: "Ashanti Area",          img: "/assets/images/church/alexander_kumi_larbi.jpg" },
    { name: "Apostle Vincent Anane Denteh",     role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/vincent_denteh.jpg" },
    { name: "Apostle Sundaram James Raj",       role: "Executive Member",              location: "International",         img: "/assets/images/church/sundaram_raj.jpg" },
    { name: "Apostle Dr. Amos Jimmy Markin",    role: "Executive Member",              location: "Evangelism Ministry",   img: "/assets/images/church/amos_markin.jpg" },
    { name: "Apostle Larry Banimpo",            role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/larry_banimpo.jpg" },
    { name: "Apostle Dr. Dieudonne Komla Nuekpe",role: "Executive Member",             location: "La Area",               img: "/assets/images/church/dieudonne_nuekpe.jpg" },
    { name: "Apostle Dr. David Nyansah Hayfron",role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/david_hayfron.jpg" },
    { name: "Apostle Dr. Philip Osei-Korsah",  role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/philip_osei_korsah.jpg" },
    { name: "Apostle John Budu Kobina Tawiah",  role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/john_tawiah.jpg" },
    { name: "Apostle Emmanuel Agyei Kwafo",     role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/emmanuel_kwafo.jpg" },
    { name: "Apostle Peter Kofi Dzemekey",      role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/peter_dzemekey.jpg" },
    { name: "Apostle Abraham Swanzy",           role: "Executive Member",              location: "Ghana",                 img: "/assets/images/church/abraham_swanzy.jpg" },
];

export default function ExecutiveCouncil() {
    return (
        <section className="py-24 px-4 overflow-hidden relative">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-mdPrimary/10 to-transparent"></div>
            
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 reveal">
                    <h2 className="text-5xl md:text-7xl font-black text-mdOnSurface tracking-tight mb-6">
                        Executive <span className="text-mdPrimary">Council</span>
                    </h2>
                    <p className="text-xl text-mdOnSurfaceVariant font-medium max-w-2xl mx-auto">
                        The principal governing body of The Church of Pentecost, leading with divine wisdom and apostolic vision.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
                    {council.map((leader, i) => (
                        <div 
                            key={i} 
                            className="reveal group bg-white rounded-[2.5rem] border border-mdOutline/5 shadow-premium hover:shadow-lifted hover:-translate-y-3 transition-all duration-700 flex flex-col items-center p-8 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-mdPrimary/5 rounded-bl-[4rem] -translate-y-2 translate-x-2 transition-transform group-hover:scale-110"></div>
                            
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden mb-6 shadow-inner ring-4 ring-offset-4 ring-mdPrimary/5">
                                <img
                                    src={leader.img}
                                    alt={leader.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:1.5rem;font-weight:900;color:#1A2F5F;background:linear-gradient(135deg,rgba(26,47,95,0.1),rgba(201,175,30,0.1))">${leader.name.split(' ').filter(n => n.length > 2).slice(0,2).map(n => n[0]).join('')}</div>`;
                                    }}
                                />
                            </div>
                            
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-mdSecondary mb-2">{leader.role}</p>
                                <h3 className="text-lg font-black text-mdOnSurface leading-tight mb-4 group-hover:text-mdPrimary transition-colors">{leader.name}</h3>
                                
                                <div className="flex flex-col gap-2 items-center opacity-60">
                                   <div className="flex items-center gap-2 text-[10px] font-bold">
                                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-mdPrimary" />
                                      {leader.location}
                                   </div>
                                </div>
                            </div>

                            <button className="mt-8 w-10 h-10 rounded-full bg-mdSurfaceVariant text-mdPrimary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-mdPrimary hover:text-white transform translate-y-4 group-hover:translate-y-0 shadow-sm">
                                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
