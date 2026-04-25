import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const teamMembers = [
    { name: "Malak Saad Khan", role: "President" },
    { name: "Hamid Naeem", role: "Vice President" },
    { name: "Muhammad Adam", role: "General Secretary" },
    { name: "Muhammad Umar", role: "General Manager" },
    { name: "Hammad Khan", role: "Industrial Liaison" },
    { name: "Waleed Khan", role: "Games & Dev Lead" },
    { name: "Mustaqim Khan", role: "Finance Manager" },
    { name: "Zuhaib", role: "Co-Manager" },
    { name: "Muhammad Ahmad Mushtaq", role: "Projector & Multimedia Head" },
    { name: "Abdul Samad", role: "Graphic Designer" },
    { name: "Hamza Taif", role: "Media Co-Lead" },
  ];

  const getImagePath = (name) => {
    const filenameMap = {
      "Hamid Naeem": "HamidNaeem.jpg",
      "Malak Saad Khan": "malak-saad-khan.jpg",
      "Muhammad Adam": "muhammad-adam.jpg",
      "Muhammad Umar": "muhammad-umar.jpg",
      "Hammad Khan": "hammad-khan.jpg",
      "Waleed Khan": "waleed-khan.jpg",
      "Mustaqim Khan": "mustaqim-khan.jpg",
      "Zuhaib": "zuhaib.jpg",
      "Muhammad Ahmad Mushtaq": "muhammad-ahmad-mushtaq.jpg",
      "Abdul Samad": "abdul-samad.jpg",
      "Hamza Taif": "hamza-taif.jpg",
    };
    
    const filename = filenameMap[name] || name.toLowerCase().replace(/\s+/g, "-") + ".jpg";
    try {
      return require(`../assets/members/${filename}`);
    } catch {
      return null;
    }
  };

  return (
    <div className="home-page">
      {/* Navigation Links */}
      <nav className="home-nav">
        <button onClick={() => scrollToSection("about")}>About Us</button>
        <button onClick={() => scrollToSection("motive")}>Mission & Vision</button>
        <button onClick={() => scrollToSection("staff")}>Staff & Faculty</button>
        <button onClick={() => navigate("/se-society")}>SE Society</button>
        <button onClick={() => scrollToSection("team")}>Team</button>
        <button onClick={() => scrollToSection("batches")}>Batches</button>
        <button onClick={() => scrollToSection("contact")}>Contact</button>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        {/* Animated Code Background */}
        <div className="hero-code-bg">
          <div className="code-line">const department = "Software Engineering";</div>
          <div className="code-line">function innovate() &#123; return excellence; &#125;</div>
          <div className="code-line">class Student &#123; constructor(name) &#123; &#125; &#125;</div>
          <div className="code-line">const skills = ["Python", "Java", "JavaScript"];</div>
          <div className="code-line">while(true) &#123; buildProjects(); &#125;</div>
          <div className="code-line">async function collaborate() &#123; await learn(); &#125;</div>
          <div className="code-line">interface Excellence &#123; quality: true &#125;</div>
          <div className="code-line">const vision = "Leading Software Engineers";</div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-code"></i>
            Software Excellence
          </div>
          <h1>UET Software Engineering</h1>
          <p className="tagline">Excellence in Code, Innovation in Action</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">
              <i className="fas fa-sign-in-alt"></i> Student Portal
            </Link>
            <button onClick={() => scrollToSection("about")} className="btn btn-secondary">
              <i className="fas fa-arrow-down"></i> Learn More
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="container">
          <h2>About Our Department</h2>
          
          {/* SE Society Intro */}
          <div className="se-intro-banner">
            <div className="se-intro-content">
              <i className="fas fa-code se-intro-icon"></i>
              <h3>Software Excellence Society</h3>
              <p>
                Our official student organization promoting learning, collaboration, and innovation through workshops, competitions, projects, and networking opportunities.
              </p>
              <Link to="/se-society" className="se-intro-link">
                Explore SE Society <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="about-grid">
            <div className="about-card">
              <i className="fas fa-graduation-cap card-icon"></i>
              <h3>Excellence in Education</h3>
              <p>
                We provide world-class software engineering education with a focus on practical
                skills and industry-relevant knowledge. Supported by our vibrant SE Society.
              </p>
            </div>
            <div className="about-card">
              <i className="fas fa-flask-vial card-icon"></i>
              <h3>Research & Innovation</h3>
              <p>
                Our faculty and students are engaged in cutting-edge research projects that
                contribute to the field of software engineering through collaboration and innovation.
              </p>
            </div>
            <div className="about-card">
              <i className="fas fa-handshake card-icon"></i>
              <h3>Industry Partnerships</h3>
              <p>
                We collaborate with leading tech companies to ensure our curriculum stays
                relevant and prepares students for real-world challenges through industry liaison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Motive Section */}
      <section id="motive" className="section motive-section">
        <div className="container">
          <h2>Mission & Vision</h2>
          <div className="motive-content">
            <div className="motive-card">
              <i className="fas fa-bullseye motive-icon"></i>
              <h3>Mission</h3>
              <p>
                To develop skilled software engineers who are equipped with technical expertise,
                ethical values, and creative thinking to solve real-world problems and drive
                innovation in technology. We foster this through academic excellence and our SE Society initiatives.
              </p>
            </div>
            <div className="motive-card">
              <i className="fas fa-telescope motive-icon"></i>
              <h3>Vision</h3>
              <p>
                To be a leading department recognized globally for producing software engineers
                who drive technological advancement and create positive impact on society through continuous learning and collaboration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Staff & Faculty Section */}
      <section id="staff" className="section staff-section">
        <div className="container">
          <h2>Staff & Faculty</h2>
          <div className="staff-grid">
            <div className="staff-card chairman">
              <div className="staff-avatar">
                <img src={require("../assets/members/chairman.jpeg")} alt="Dr. Nasru Minallah" />
              </div>
              <h3>Dr. Nasru Minallah</h3>
              <p className="position">Chairman</p>
              <p className="bio">
                Leading the Department of Software Engineering with vision and expertise in software architecture and engineering excellence.
              </p>
              <div className="staff-contact">
                <a href="mailto:nasruminallah@uet.edu.pk" title="Email">
                  <i className="fas fa-envelope"></i>
                </a>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section id="team" className="section team-section">
        <div className="container">
          <h2>SE Society Leadership Team</h2>
          <p className="team-intro">
            Meet the dedicated team leading the Software Excellence Society for 2026
          </p>
          <div className="team-grid">
            {teamMembers.map((member, idx) => {
              const imagePath = getImagePath(member.name);
              return (
                <div key={idx} className="team-member">
                  <div className="member-photo">
                    {imagePath ? (
                      <img src={imagePath} alt={member.name} />
                    ) : (
                      <i className="fas fa-user-circle"></i>
                    )}
                  </div>
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              );
            })}
          </div>
          <p className="team-note">
            📸 Add photos to <code>src/assets/members/</code> with names like <code>malak-saad-khan.jpg</code>
          </p>
        </div>
      </section>

      {/* Batches Section */}
      <section id="batches" className="section batches-section">
        <div className="container">
          <h2>Student Batches</h2>
          <div className="batches-grid">
            <div className="batch-card">
              <div className="batch-header">
                <i className="fas fa-users"></i>
                <h3>2024 Batch</h3>
              </div>
              <p className="batch-year">Admission Year: 2024</p>
              <div className="batch-images">
                <img src={require("../assets/batches/batch2024.jpeg")} alt="Batch 2024" style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px"}} />
              </div>
            </div>
            <div className="batch-card">
              <div className="batch-header">
                <i className="fas fa-users"></i>
                <h3>2025 Batch</h3>
              </div>
              <p className="batch-year">Admission Year: 2025</p>
              <div className="batch-images">
                <img src={require("../assets/batches/batch2025.jpeg")} alt="Batch 2025" style={{width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px"}} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>
                <i className="fas fa-link"></i> Quick Links
              </h4>
              <ul>
                <li><Link to="/login">Student Portal</Link></li>
                <li><a href="#about">About Us</a></li>
                <li><button onClick={() => navigate("/se-society")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline" }}>SE Society</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>
                <i className="fas fa-book"></i> Resources
              </h4>
              <ul>
                <li><button onClick={() => navigate("/past-papers")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline" }}>Past Papers</button></li>
                <li><button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline" }}>Course Materials</button></li>
                <li><button onClick={() => navigate("/announcements")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline" }}>Announcements</button></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>
                <i className="fas fa-share-alt"></i> Follow Us
              </h4>
              <div className="social-links">
                <button onClick={() => {}} aria-label="Facebook" title="Facebook" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button onClick={() => {}} aria-label="Instagram" title="Instagram" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
                  <i className="fab fa-instagram"></i>
                </button>
                <button onClick={() => {}} aria-label="LinkedIn" title="LinkedIn" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
                  <i className="fab fa-linkedin-in"></i>
                </button>
                <button onClick={() => {}} aria-label="Twitter" title="Twitter" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}>
                  <i className="fab fa-twitter"></i>
                </button>
              </div>
            </div>
            <div className="footer-section">
              <h4>
                <i className="fas fa-phone"></i> Contact
              </h4>
              <p>Department of Software Engineering</p>
              <p>University of Engineering & Technology</p>
              <p><i className="fas fa-envelope"></i> se@uet.edu.pk</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 UET Software Engineering. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
