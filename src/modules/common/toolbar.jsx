import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../../assets/images/logo.jpeg';
import HomeIcon from '../../assets/icons/homeIcon';
import NailIcon from '../../assets/icons/nailIcon';
import GaleryIcon from '../../assets/icons/galeryIcon';
import PriceIcon from '../../assets/icons/priceIcon';
import ContactIcon from '../../assets/icons/contactIcon';
import ReserveIcon from '../../assets/icons/reserveIcon';

const Toolbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isActive = (path) => location.pathname === path;

  // Detectar scroll para efectos visuales
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-xl' 
        : 'bg-primary-light/95 backdrop-blur-sm shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Premium */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-2 ring-2 ring-primary/20">
                <img 
                  src={logoImage} 
                  alt="Ona Nails Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-dark rounded-full animate-pulse shadow-lg"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-text-dark tracking-tight leading-none group-hover:text-primary-dark transition-colors">
                Ona Nails
              </h1>
              <span className="text-xs text-text-light font-medium tracking-wider">& ART</span>
            </div>
          </Link>
          
          {/* Menú Desktop - Navegación moderna */}
          <div className='hidden lg:flex items-center gap-3'>
            <Link 
              to="/" 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-primary-dark text-white shadow-lg shadow-primary-dark/30 scale-105' 
                  : 'text-text-dark hover:bg-primary/20 hover:text-primary-dark hover:scale-105 hover:shadow-md'
              }`}
            >
              Inicio
            </Link>
            <Link 
              to="/servicios" 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 ${
                isActive('/servicios') 
                  ? 'bg-primary-dark text-white shadow-lg shadow-primary-dark/30 scale-105' 
                  : 'text-text-dark hover:bg-primary/20 hover:text-primary-dark hover:scale-105 hover:shadow-md'
              }`}
            >
              Servicios
            </Link>
            <Link 
              to="/galeria" 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 ${
                isActive('/galeria') 
                  ? 'bg-primary-dark text-white shadow-lg shadow-primary-dark/30 scale-105' 
                  : 'text-text-dark hover:bg-primary/20 hover:text-primary-dark hover:scale-105 hover:shadow-md'
              }`}
            >
              Galería
            </Link>
            <Link 
              to="/precios" 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 ${
                isActive('/precios') 
                  ? 'bg-primary-dark text-white shadow-lg shadow-primary-dark/30 scale-105' 
                  : 'text-text-dark hover:bg-primary/20 hover:text-primary-dark hover:scale-105 hover:shadow-md'
              }`}
            >
              Precios
            </Link>
            <Link 
              to="/contacto" 
              className={`px-5 py-2.5 rounded-xl font-medium text-sm tracking-wide transition-all duration-300 ${
                isActive('/contacto') 
                  ? 'bg-primary-dark text-white shadow-lg shadow-primary-dark/30 scale-105' 
                  : 'text-text-dark hover:bg-primary/20 hover:text-primary-dark hover:scale-105 hover:shadow-md'
              }`}
            >
              Contacto
            </Link>
          </div>
          
          {/* Botones CTA Desktop */}
          <div className='hidden lg:flex items-center gap-3'>
            <button className="px-5 py-2.5 text-text-dark font-medium text-sm rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-105">
              Iniciar Sesión
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-dark to-primary text-white font-semibold text-sm rounded-xl shadow-lg shadow-primary-dark/30 hover:shadow-xl hover:shadow-primary-dark/40 hover:scale-105 transition-all duration-300">
              <ReserveIcon className="w-4 h-4" />
              Reservar Cita
            </button>
          </div>
          
          {/* Botón Hamburguesa Moderno */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all duration-300"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`w-5 h-0.5 bg-text-dark rounded-full transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1' : ''
              }`}></span>
              <span className={`w-5 h-0.5 bg-text-dark rounded-full my-1 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`w-5 h-0.5 bg-text-dark rounded-full transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-1' : ''
              }`}></span>
            </div>
          </button>
        </div>
      </div>

      
      {/* Menú Móvil Premium con animación */}
      <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
        isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 py-6 bg-white/95 backdrop-blur-md border-t border-primary/20 shadow-xl">
          <div className="flex flex-col gap-2">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-base transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-gradient-to-r from-primary-dark to-primary text-white shadow-lg scale-[1.02]' 
                  : 'text-text-dark hover:bg-primary/10 hover:text-primary-dark active:scale-95'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              Inicio
            </Link>
            <Link 
              to="/servicios"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-base transition-all duration-300 ${
                isActive('/servicios') 
                  ? 'bg-gradient-to-r from-primary-dark to-primary text-white shadow-lg scale-[1.02]' 
                  : 'text-text-dark hover:bg-primary/10 hover:text-primary-dark active:scale-95'
              }`}
            >
              <NailIcon className="w-5 h-5" />
              Servicios
            </Link>
            <Link 
              to="/galeria"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-base transition-all duration-300 ${
                isActive('/galeria') 
                  ? 'bg-gradient-to-r from-primary-dark to-primary text-white shadow-lg scale-[1.02]' 
                  : 'text-text-dark hover:bg-primary/10 hover:text-primary-dark active:scale-95'
              }`}
            >
              <GaleryIcon className="w-5 h-5" />
              Galería
            </Link>
            <Link 
              to="/precios"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-base transition-all duration-300 ${
                isActive('/precios') 
                  ? 'bg-gradient-to-r from-primary-dark to-primary text-white shadow-lg scale-[1.02]' 
                  : 'text-text-dark hover:bg-primary/10 hover:text-primary-dark active:scale-95'
              }`}
            >
              <PriceIcon className="w-5 h-5" />
              Precios
            </Link>
            <Link 
              to="/contacto"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium text-base transition-all duration-300 ${
                isActive('/contacto') 
                  ? 'bg-gradient-to-r from-primary-dark to-primary text-white shadow-lg scale-[1.02]' 
                  : 'text-text-dark hover:bg-primary/10 hover:text-primary-dark active:scale-95'
              }`}
            >
              <ContactIcon className="w-5 h-5" />
              Contacto
            </Link>
            
            {/* Divisor elegante */}
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-3"></div>
            
            {/* Botones CTA Móvil */}
            <button className="px-5 py-3.5 text-text-dark font-medium text-base rounded-xl hover:bg-primary/10 transition-all duration-300 active:scale-95 border-2 border-primary/20">
              Iniciar Sesión
            </button>
            <button className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary-dark to-primary text-white font-semibold text-base rounded-xl shadow-lg shadow-primary-dark/30 hover:shadow-xl hover:shadow-primary-dark/40 transition-all duration-300 active:scale-95">
              <ReserveIcon className="w-5 h-5" />
              Reservar Cita
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
};

export default Toolbar;