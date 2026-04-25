import React from "react";
import { Link } from "react-router-dom";
import "../styles/se-society.css";

export default function SESociety() {
  const orgChart = [
    {
      name: "Malak Saad Khan",
      position: "President 2026",
      icon: "fas fa-crown",
      tier: 1,
    },
    {
      name: "Hamid Naeem",
      position: "Vice President (VP)",
      icon: "fas fa-user-tie",
      tier: 2,
    },
    {
      name: "Muhammad Adam",
      position: "General Secretary",
      icon: "fas fa-pen-fancy",
      tier: 2,
    },
    {
      name: "Muhammad Umar",
      position: "General Manager",
      icon: "fas fa-briefcase",
      tier: 2,
    },
    {
      name: "Hammad Khan",
      position: "Industrial Liaison",
      icon: "fas fa-handshake",
      tier: 3,
    },
    {
      name: "Waleed Khan",
      position: "Games & Dev Lead",
      icon: "fas fa-gamepad",
      tier: 3,
    },
    {
      name: "Mustaqim Khan",
      position: "Finance Manager",
      icon: "fas fa-calculator",
      tier: 3,
    },
    {
      name: "Zuhaib",
      position: "Co-Manager",
      icon: "fas fa-tasks",
      tier: 3,
    },
    {
      name: "Muhammad Ahmad Mushtaq",
      position: "Projector & Multimedia Head",
      icon: "fas fa-video",
      tier: 3,
    },
    {
      name: "Abdul Samad",
      position: "Graphic Designer",
      icon: "fas fa-palette",
      tier: 3,
    },
    {
      name: "Hamza Taif",
      position: "Media Co-Lead",
      icon: "fas fa-camera",
      tier: 3,
    },
  ];

  const recentActivities = [
    {
      title: "ICCIIOT Conference",
      date: "Recent",
      icon: "fas fa-conference",
      description: "International Collaborative Conference on IoT and Innovation",
    },
    {
      title: "ICET Conference",
      date: "Recent",
      icon: "fas fa-chalkboard",
      description: "Information & Communication Engineering Technology Conference",
    },
    {
      title: "Mental Health Session",
      date: "Recent",
      icon: "fas fa-heart",
      description: "Wellness and mental health awareness session for students",
    },
    {
      title: "Github & Learn in Public Session",
      date: "Recent",
      icon: "fas fa-code-branch",
      description: "Learn git, GitHub, and open-source contribution practices",
    },
  ];

  const president = orgChart.find((m) => m.tier === 1);
  const viceLeaders = orgChart.filter((m) => m.tier === 2);
  const teamMembers = orgChart.filter((m) => m.tier === 3);

  return (
    <div className="se-society-page">
      {/* Header */}
      <header className="se-header">
        <Link to="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
        <h1>Software Excellence Society</h1>
        <p className="tagline">Official Society of Software Engineering Department</p>
      </header>

      {/* Introduction */}
      <section className="introduction">
        <div className="container">
          <h2>Welcome to Software Excellence Society</h2>
          <p>
            The Software Excellence Society is the official student-led organization dedicated to
            fostering a culture of learning, collaboration, and innovation within the Software
            Engineering program at UET. We are committed to providing students with opportunities
            to develop their technical skills, network with industry professionals, and make a
            positive impact on society through technology.
          </p>
        </div>
      </section>

      {/* Organization Chart */}
      <section className="org-chart-section">
        <div className="container">
          <h2>Organization Chart 2026</h2>

          {/* President */}
          {president && (
            <div className="org-tier tier-1">
              <div className="org-member president-card">
                <div className="member-avatar">
                  <i className={president.icon}></i>
                </div>
                <h3>{president.name}</h3>
                <p className="position">{president.position}</p>
              </div>
            </div>
          )}

          {/* Vice Leaders */}
          <div className="org-tier tier-2">
            {viceLeaders.map((member, idx) => (
              <div key={idx} className="org-member">
                <div className="member-avatar">
                  <i className={member.icon}></i>
                </div>
                <h4>{member.name}</h4>
                <p className="position">{member.position}</p>
              </div>
            ))}
          </div>

          {/* Team Members */}
          <div className="org-tier tier-3">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="org-member">
                <div className="member-avatar small">
                  <i className={member.icon}></i>
                </div>
                <h5>{member.name}</h5>
                <p className="position small">{member.position}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activities */}
      <section className="activities-section">
        <div className="container">
          <h2>Recent Activities</h2>
          <div className="activities-grid">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="activity-card">
                <div className="activity-icon">
                  <i className={activity.icon}></i>
                </div>
                <h3>{activity.title}</h3>
                <p className="activity-date">{activity.date}</p>
                <p className="activity-description">{activity.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-book"></i>
              </div>
              <h3>Learning & Development</h3>
              <p>Workshops, seminars, and training sessions on the latest technologies and best practices</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-trophy"></i>
              </div>
              <h3>Competitions</h3>
              <p>Hackathons, coding competitions, and project showcases to showcase your skills</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-code"></i>
              </div>
              <h3>Projects</h3>
              <p>Collaborative projects applying software engineering principles and real-world solutions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-network-wired"></i>
              </div>
              <h3>Networking</h3>
              <p>Connect with peers, mentors, and industry professionals for career growth</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Mentorship</h3>
              <p>Get guidance from experienced seniors and industry experts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Community</h3>
              <p>Build lasting friendships and be part of a supportive community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Home Button */}
      <section className="back-section">
        <div className="container">
          <Link to="/" className="btn btn-primary">
            <i className="fas fa-home"></i> Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
