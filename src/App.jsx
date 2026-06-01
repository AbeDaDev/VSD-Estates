import { useEffect, useRef, useState } from "react";
import RealEstateAIChat from "../RealEstateAIChat.jsx";

const stats = [
  { target: 420, label: "Properties Sold" },
  { target: 18, label: "Years Experience" },
  { target: 97, label: "% Client Satisfaction" },
  { target: 12, label: "Awards Won" },
];

const properties = [
  {
    large: true,
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80",
    status: "For Sale",
    price: "£4,250,000",
    name: "Thornfield Manor",
    location: "Surrey, South East England",
    details: ["6 Beds", "5 Baths", "8,400 sq ft"],
  },
  {
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=700&q=80",
    status: "New",
    price: "£1,875,000",
    name: "The Glasshouse Penthouse",
    location: "Kensington, London",
    details: ["3 Beds", "3 Baths"],
  },
  {
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80",
    status: "For Sale",
    price: "£2,600,000",
    name: "Coastal Cliffside Villa",
    location: "Cornwall, South West",
    details: ["5 Beds", "4 Baths"],
  },
  {
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=80",
    status: "Under Offer",
    price: "£975,000",
    name: "Willow Farmhouse",
    location: "Oxfordshire, England",
    details: ["4 Beds", "2 Baths"],
  },
  {
    image: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=700&q=80",
    status: "For Rent",
    price: "£8,500 / mo",
    name: "Riverside Apartment",
    location: "Chelsea, London",
    details: ["2 Beds", "2 Baths"],
  },
];

const aboutFeatures = [
  {
    icon: "🏛",
    title: "Heritage Properties",
    desc: "Specialists in listed buildings and period homes",
  },
  {
    icon: "🔑",
    title: "Private Sales",
    desc: "Discreet off-market transactions",
  },
  {
    icon: "📊",
    title: "Market Intelligence",
    desc: "Data-driven valuations and insight",
  },
  {
    icon: "🤝",
    title: "Concierge Service",
    desc: "Dedicated advisor from search to keys",
  },
];

const testimonials = [
  {
    quote:
      "Corner Stone found us our dream home in three weeks. The attention to detail and personal care was unlike anything we had experienced before.",
    name: "James & Sarah Thornton",
    role: "Purchased in Surrey, 2024",
    img: "https://i.pravatar.cc/80?img=12",
  },
  {
    quote:
      "Selling our Kensington flat felt daunting, but the Corner Stone team handled everything seamlessly. We achieved well above asking price.",
    name: "Catherine Obi",
    role: "Sold in Kensington, 2025",
    img: "https://i.pravatar.cc/80?img=44",
  },
  {
    quote:
      "I've worked with many estate agents over the years. Corner Stone Realty Solutions is in a different league - professional, honest, and genuinely passionate.",
    name: "Richard Hargreaves",
    role: "Investor Client since 2019",
    img: "https://i.pravatar.cc/80?img=68",
  },
];

const quickLinks = {
  properties: ["For Sale", "For Rent", "New Developments", "Off Market"],
  company: ["About Us", "Our Team", "Testimonials", "Careers"],
};

function useRevealAndCounters() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));
  const revealRefs = useRef([]);
  const statRefs = useRef([]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealRefs.current.filter(Boolean).forEach((el) => revealObserver.observe(el));

    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.index);
        const target = Number(entry.target.dataset.target);
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const next = Math.round(target * progress);
          setCounts((prev) => {
            if (prev[index] === next) return prev;
            const updated = [...prev];
            updated[index] = next;
            return updated;
          });
          if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        statObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    statRefs.current.filter(Boolean).forEach((el) => statObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      statObserver.disconnect();
    };
  }, []);

  return { navScrolled, counts, revealRefs, statRefs };
}

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { navScrolled, counts, revealRefs, statRefs } = useRevealAndCounters();
  const cursorRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorDotRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring = cursorRingRef.current;
    const dot = cursorDotRef.current;
    if (!cursor || !ring || !dot) return undefined;

    const onMove = (event) => {
      const x = event.clientX;
      const y = event.clientY;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const hoverTargets = document.querySelectorAll("a, button, .prop-card, .testi-card");
    const onEnter = () => {
      ring.classList.add("is-hovered");
      dot.classList.add("is-hovered");
    };
    const onLeave = () => {
      ring.classList.remove("is-hovered");
      dot.classList.remove("is-hovered");
    };

    document.addEventListener("mousemove", onMove);
    hoverTargets.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      document.removeEventListener("mousemove", onMove);
      hoverTargets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, []);

  return (
    <>
      <div className="cursor-wrap" ref={cursorRef} aria-hidden="true">
        <div className="cursor-ring" ref={cursorRingRef} />
        <div className="cursor-dot" ref={cursorDotRef} />
      </div>

      <nav className={navScrolled ? "scrolled" : ""} id="nav">
        <a href="#home" className="nav-logo">
          Corner Stone <span>Realty Solutions</span>
        </a>
        <ul className="nav-links">
          <li><a href="#properties">Properties</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><a href="#contact" className="nav-cta">Contact Us</a></li>
        </ul>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-bg" />
          <div className="hero-noise" />
          <div className="hero-content">
            <div className="hero-eyebrow">Luxury Real Estate</div>
            <h1 className="hero-title">
              Find Your <em>Perfect</em>
              <br />
              Estate
            </h1>
            <p className="hero-sub">
              Curated properties for discerning buyers. We match extraordinary homes with the people who deserve them.
            </p>
            <div className="hero-actions">
              <a href="#properties" className="btn-primary">Explore Listings</a>
              <button type="button" className="btn-ghost btn-chat" onClick={() => setIsChatOpen(true)}>Talk to Victor</button>
            </div>
          </div>
          <div className="scroll-indicator">
            <span className="scroll-text">Scroll</span>
            <div className="scroll-line" />
          </div>
        </section>

        <div className="stats-bar reveal" ref={(el) => (revealRefs.current[0] = el)}>
          {stats.map((stat, index) => (
            <div className="stat" key={stat.label} ref={(el) => (statRefs.current[index] = el)} data-index={index} data-target={stat.target} style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
              <div className="stat-num">{counts[index]}{stat.target === 97 ? "%" : "+"}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="search-section reveal" id="search" ref={(el) => (revealRefs.current[1] = el)}>
          <div className="section-tag">Find a Property</div>
          <h2 className="section-title">Search Our <em>Portfolio</em></h2>
          <div className="search-bar">
            <input className="search-field" type="text" placeholder="Location, neighbourhood or address..." />
            <select className="search-select" defaultValue="Property Type">
              <option>Property Type</option>
              <option>House</option>
              <option>Apartment</option>
              <option>Villa</option>
              <option>Penthouse</option>
            </select>
            <select className="search-select" defaultValue="Price Range">
              <option>Price Range</option>
              <option>Under £500k</option>
              <option>£500k - £1M</option>
              <option>£1M - £3M</option>
              <option>£3M+</option>
            </select>
            <button className="search-btn" type="button">Search</button>
          </div>
        </section>

        <section id="properties">
          <div className="properties-header reveal" ref={(el) => (revealRefs.current[2] = el)}>
            <div>
              <div className="section-tag">Featured</div>
              <h2 className="section-title">Exceptional <em>Homes</em></h2>
            </div>
            <a href="#contact" className="view-all">View All Properties</a>
          </div>

          <div className="properties-grid reveal" ref={(el) => (revealRefs.current[3] = el)}>
            {properties.map((property) => (
              <article key={property.name} className={`prop-card ${property.large ? "large" : ""}`}>
                <img className="prop-img" src={property.image} alt={property.name} loading="lazy" />
                <div className="prop-overlay">
                  <span className="prop-status">{property.status}</span>
                  <div className="prop-price">{property.price}</div>
                  <div className="prop-name">{property.name}</div>
                  <div className="prop-location">📍 {property.location}</div>
                  <div className="prop-details">
                    {property.details.map((detail) => (
                      <span className="prop-detail" key={detail}>
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-img-wrap reveal" ref={(el) => (revealRefs.current[4] = el)}>
            <img className="about-img" src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80" alt="Corner Stone Realty Solutions office" loading="lazy" />
            <div className="about-accent" />
          </div>
          <div className="about-text reveal" ref={(el) => (revealRefs.current[5] = el)}>
            <div className="section-tag">About Corner Stone Realty Solutions</div>
            <h2 className="section-title">A Legacy of <em>Excellence</em></h2>
            <div className="divider" />
            <p className="about-body">
              For nearly two decades, Corner Stone Realty Solutions has been the trusted name in luxury property across the UK. We do not just sell houses - we match extraordinary people with extraordinary homes, backed by unrivalled local knowledge and white-glove service at every step.
            </p>
            <div className="about-features">
              {aboutFeatures.map((feature) => (
                <div className="about-feature" key={feature.title}>
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-title">{feature.title}</div>
                  <div className="feature-desc">{feature.desc}</div>
                </div>
              ))}
            </div>
            <a href="#contact" className="btn-primary">Meet Our Team</a>
          </div>
        </section>

        <section className="testimonials" id="testimonials">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title reveal" ref={(el) => (revealRefs.current[6] = el)}>What Our Clients <em>Say</em></h2>
          <div className="testi-grid reveal" ref={(el) => (revealRefs.current[7] = el)}>
            {testimonials.map((item) => (
              <article className="testi-card" key={item.name}>
                <div className="testi-stars">★★★★★</div>
                <p className="testi-quote">"{item.quote}"</p>
                <div className="testi-author">
                  <img className="testi-avatar" src={item.img} alt={item.name} />
                  <div>
                    <div className="testi-name">{item.name}</div>
                    <div className="testi-role">{item.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="section-tag reveal" ref={(el) => (revealRefs.current[8] = el)} style={{ justifyContent: "center" }}>
            <span>Get In Touch</span>
          </div>
          <h2 className="section-title reveal" ref={(el) => (revealRefs.current[9] = el)} style={{ marginBottom: 18 }}>
            Ready to Find Your <em>Dream Home?</em>
          </h2>
          <p className="contact-copy reveal" ref={(el) => (revealRefs.current[10] = el)}>
            Speak with one of our property experts today. No obligation, just a conversation about what you are looking for.
          </p>
          <div className="contact-actions reveal" ref={(el) => (revealRefs.current[11] = el)}>
            <a href="tel:+19095324251" className="btn-primary">📞 Call Us Now</a>
            <a href="mailto:hello@vsdestates.com" className="btn-ghost contact-ghost">Email Us</a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" className="nav-logo">Corner Stone <span>Realty Solutions</span></a>
            <p>Award-winning luxury estate agents with over 18 years of experience placing discerning buyers and sellers across the United Kingdom.</p>
          </div>
          <div className="footer-col">
            <h4>Properties</h4>
            <ul>
              {quickLinks.properties.map((item) => <li key={item}><a href="#properties">{item}</a></li>)}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {quickLinks.company.map((item) => <li key={item}><a href="#about">{item}</a></li>)}
            </ul>
          </div>
          <div className="footer-col footer-contact">
            <h4>Contact</h4>
            <p>
              10681 Foothill Blvd<br />
              Suite 140<br />
              <br />
              <a href="tel:+19095324251">909 532 4251</a>
              <br />
              <a href="mailto:hello@vsdestates.com">hello@vsdestates.com</a>
              <br />
              <br />
              <span className="footer-social footer-social-inline">
                <a href="https://www.instagram.com/realestatewitvic?igsh=NTc4MTIwNjQ2YQ%3D%3D" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://www.linkedin.com/in/victor-serna-delgado-3a7073371/" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://www.tiktok.com/@realestatewitvic?_t=ZT-8uzEIw4LmN4&_r=1" target="_blank" rel="noreferrer">TikTok</a>
              </span>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Corner Stone Realty Solutions. All rights reserved.</span>
        </div>
      </footer>

      <RealEstateAIChat isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </>
  );
}
