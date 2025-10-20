import './Navbar.css';
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Handle scrolling to section on page load if hash is present
  useEffect(() => {
    if (isHomePage && location.hash) {
      const sectionId = location.hash.substring(1); // Remove the # symbol
      const section = document.getElementById(sectionId);
      if (section) {
        const navbarHeight = 80;
        
        // Small delay to ensure page is fully loaded and elements are rendered
        setTimeout(() => {
          const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }, 300);
      }
    }
  }, [location, isHomePage]);

  // Handle smooth scrolling to sections
  const handleSmoothScroll = (e, sectionId) => {
    e.preventDefault();
    
    if (!isHomePage) {
      // If not on home page, navigate to home first then scroll
      window.location.href = `/#${sectionId}`;
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = 80; // Height of the fixed navbar
      const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6.5A5.5,5.5 0 0,1 17.5,12A5.5,5.5 0 0,1 12,17.5A5.5,5.5 0 0,1 6.5,12A5.5,5.5 0 0,1 12,6.5M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z" />
            </svg>
          </div>
          <span>NoteMind.</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <a 
            href="#features" 
            className="nav-link"
            onClick={(e) => handleSmoothScroll(e, 'features')}
          >
            Features
          </a>
          <a 
            href="#services" 
            className="nav-link"
            onClick={(e) => handleSmoothScroll(e, 'services')}
          >
            Students
          </a>
          <a 
            href="#about" 
            className="nav-link"
            onClick={(e) => handleSmoothScroll(e, 'about')}
          >
            Teachers
          </a>
          <a 
            href="#testimonials" 
            className="nav-link"
            onClick={(e) => handleSmoothScroll(e, 'testimonials')}
          >
            About
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Log In</Link>
          <Link to="/signup" className="signup-btn">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
