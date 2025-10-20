import React, { useEffect, useRef } from 'react';
import './Home.css';
import phoneImage from '../assets/banner.jpg'; // Make sure this asset exists or replace with your phone mockup image

const Home = () => {
  // References for animation elements
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const studentsRef = useRef(null);
  const teachersRef = useRef(null);
  const ctaRef = useRef(null);
  
  // Animation on component mount
  useEffect(() => {
    // Add animation classes after component mounts
    const elements = [
      { ref: heroRef, delay: 300 },
      { ref: featuresRef, delay: 600 },
      { ref: studentsRef, delay: 750 },
      { ref: teachersRef, delay: 850 },
      { ref: ctaRef, delay: 950 },
    ];
    
    elements.forEach(({ ref, delay }) => {
      if (ref.current) {
        setTimeout(() => {
          ref.current.classList.add('animated');
        }, delay);
      }
    });

    // Add scroll animation
    const handleScroll = () => {
      const scrollElements = document.querySelectorAll('.scroll-animation');
      
      scrollElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animated');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check for elements in view on initial load
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="home-container">
      {/* Background elements */}
      <div className="shape blue-gradient"></div>
      
      {/* Animated shapes */}
      <div className="floating-shapes">
        <div className="shape circle shape-1"></div>
        <div className="shape circle shape-2"></div>
        <div className="shape square shape-3"></div>
        <div className="shape square shape-4"></div>
        <div className="shape circle shape-5"></div>
        <div className="shape cross shape-6"></div>
      </div>
      
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-content">
          <div className="left-content">
            <span className="hero-badge">AI-Powered Note Taking</span>
            
            <h1 className="hero-title">
              <span className="light-text">Effortless Notes.</span>
              <span className="gradient-text">Limitless Thinking.</span>
            </h1>
            
            <p className="hero-description">
              Capture your thoughts, ideas, and inspiration effortlessly. Let our AI organize and connect your knowledge into a powerful second brain.
            </p>
            
            <div className="hero-buttons">
              <button className="primary-button">
                <span>Get Started</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              
              <button className="secondary-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <span>Watch Demo</span>
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">4.9</span>
                <span className="stat-label">User Rating</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </div>
          </div>
          
          <div className="right-content">
            <div className="device-mockup">
              <div className="device-frame">
                <img src={phoneImage} alt="NoteMind App Interface" />
                <div className="device-glare"></div>
              </div>
              <div className="device-shadow"></div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="features-section scroll-animation" ref={featuresRef}>
        <div className="section-header">
          <h2 className="section-title">Features that <span className="gradient-text">empower</span> your thinking</h2>
          <p className="section-subtitle">Everything you need to capture, organize, and expand your ideas</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card scroll-animation">
            <div className="feature-icon ai-icon"></div>
            <h3 className="feature-title">Summarize</h3>
            <p className="feature-description">Smart AI that helps organize your notes and suggests connections between ideas.</p>
          </div>
          
          <div className="feature-card scroll-animation">
            <div className="feature-icon sync-icon"></div>
            <h3 className="feature-title">Generate Ideas</h3>
            <p className="feature-description">Access your notes from any device with real-time synchronization.</p>
          </div>
          
          <div className="feature-card scroll-animation">
            <div className="feature-icon secure-icon"></div>
            <h3 className="feature-title">Translate</h3>
            <p className="feature-description">Your notes are securely encrypted and only accessible by you.</p>
          </div>
          
          <div className="feature-card scroll-animation">
            <div className="feature-icon collab-icon"></div>
            <h3 className="feature-title">Create Flashcards</h3>
            <p className="feature-description">Share and collaborate on notes with teammates in real-time.</p>
          </div>
        </div>
      </section>
      
      {/* Students Section */}
      <section id="services" className="students-section scroll-animation" ref={studentsRef}>
        <div className="students-container">
          <div className="students-content">
            <div className="students-brief">FEATURES WITH BRIEF</div>
            <h2 className="students-heading">For Students.</h2>
            
            <div className="students-features">
              <div className="student-feature">
                <div className="check-icon">✓</div>
                <p>Get personalized mentorship at <strong>Affordable price</strong></p>
              </div>
              
              <div className="student-feature">
                <div className="check-icon">✓</div>
                <p>Choose Your mentor from a wide range of NoteMind verified mentors</p>
              </div>
              
              <div className="student-feature">
                <div className="check-icon">✓</div>
                <p>Get AI suggested personalized remedies to <strong>Score better</strong></p>
              </div>
              
              <button className="learn-more-button">
                Learn more
              </button>
            </div>
          </div>
          
          <div className="students-illustration">
            <div className="illustration-container">
              <div className="nodes-container">
                <div className="node node-1"></div>
                <div className="node node-2"></div>
                <div className="node node-3"></div>
                <div className="connector connector-1"></div>
                <div className="connector connector-2"></div>
              </div>
              <div className="student-terminal">
                <div className="terminal-screen">
                  <div className="wave-line"></div>
                  <div className="wave-line"></div>
                  <div className="wave-line"></div>
                </div>
                <div className="student-figure"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Teachers Section */}
      <section id="about" className="teachers-section scroll-animation" ref={teachersRef}>
        <div className="teachers-container">
          <div className="teachers-illustration">
            <div className="illustration-container">
              <div className="teacher-screen animated-element">
                <div className="screen-content">
                  <div className="data-wave"></div>
                </div>
                <div className="teacher-figure"></div>
              </div>
              <div className="data-cylinder animated-element">
                <div className="cylinder-layer cylinder-layer-1"></div>
                <div className="cylinder-layer cylinder-layer-2"></div>
                <div className="cylinder-layer cylinder-layer-3"></div>
              </div>
            </div>
          </div>
          
          <div className="teachers-content">
            <div className="teachers-brief">FEATURES WITH BRIEF</div>
            <h2 className="teachers-heading">For Teachers.</h2>
            
            <div className="teachers-features">
              <div className="teacher-feature">
                <div className="check-icon">✓</div>
                <p>Create your free <strong>Online portal</strong></p>
              </div>
              
              <div className="teacher-feature">
                <div className="check-icon">✓</div>
                <p>Drag and drop to <strong>Create assessment</strong> hassle free</p>
              </div>
              
              <div className="teacher-feature">
                <div className="check-icon">✓</div>
                <p>Manage student's <strong>Performance with AI</strong></p>
              </div>
              
              <button className="learn-more-button">
                Learn more
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <footer id="testimonials" className="footer-section scroll-animation" ref={ctaRef}>
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <h3 className="footer-column-title">NoteMind</h3>
              <p className="footer-column-text">AI-powered note-taking platform designed to enhance your thinking process.</p>
              <div className="footer-social">
                <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-facebook"></i></a>
                <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-column-title">Product</h3>
              <ul className="footer-links">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">For Students</a></li>
                <li><a href="#">For Teachers</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-column-title">Company</h3>
              <ul className="footer-links">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3 className="footer-column-title">Support</h3>
              <ul className="footer-links">
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p className="copyright">&copy; {new Date().getFullYear()} NoteMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
