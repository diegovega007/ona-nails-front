import { Link, useOutletContext } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import imagen1 from '../../../assets/images/imagen_nail_1.jpeg';
import imagen2 from '../../../assets/images/imagen_nail_2.jpeg';
import imagen3 from '../../../assets/images/imagen_nail_3.jpeg';
import imagen4 from '../../../assets/images/imagen_nail_4.jpeg';
import video1 from '../../../assets/videos/video_nail_1.mp4';
import video2 from '../../../assets/videos/video_nail_2.mp4';
import DimondIcon from '../../../assets/icons/DimondIcon';
import NailIcon from '../../../assets/icons/NailIcon';
import StarsIcon from '../../../assets/icons/StarsIcon';

const Welcome = () => {
  const { onOpenBooking } = useOutletContext() ?? {};
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef(null);

  // Tus videos locales
  const videos = [
    video1,
    video2
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
      };

      const handleError = (e) => {
        console.error('Error cargando video:', e);
        console.log('Video actual:', videos[currentVideoIndex]);
      };

      video.addEventListener('ended', handleVideoEnd);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('ended', handleVideoEnd);
        video.removeEventListener('error', handleError);
      };
    }
  }, [videos.length, currentVideoIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      
      // Intentar reproducir después de cargar
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video reproduciendo correctamente');
          })
          .catch(error => {
            console.error('Error al reproducir video:', error);
          });
      }
    }
  }, [currentVideoIndex]);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative bg-white py-20 lg:py-32 overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          >
            <source src={videos[currentVideoIndex]} type="video/mp4" />
          </video>
          {/* Overlay para mejorar legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Subtitle */}
            <p className="text-primary-light text-sm font-medium tracking-[0.2em] uppercase mb-6 drop-shadow-lg">
              BELLEZA Y CUIDADO
            </p>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Transforma tus uñas en obras de arte
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
              Experimenta el lujo y la elegancia en cada detalle. Nuestro equipo de profesionales está dedicado a realzar tu belleza natural con técnicas innovadoras y productos premium.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/servicios"
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-full shadow-soft hover:shadow-medium transition-all duration-300 transform hover:scale-105"
              >
                Explorar Servicios
              </Link>
              <Link 
                to="/galeria"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-primary font-medium rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Ver Trabajos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
              NUESTROS SERVICIOS
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark mb-4">
              Servicios de excelencia para ti
            </h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios premium diseñados para realzar tu belleza y bienestar
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Service 1 */}
            <div className="bg-white rounded-2xl p-10 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <StarsIcon className="w-8 h-8 text-primary-dark" />
              </div>
              <h3 className="text-2xl font-semibold text-text-dark mb-4">
                Manicure Premium
              </h3>
              <p className="text-text-light leading-relaxed">
                Tratamiento completo de manos con productos de alta calidad, limado perfecto y acabados impecables.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-2xl p-10 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <NailIcon className="w-8 h-8 text-primary-dark" />
              </div>
              <h3 className="text-2xl font-semibold text-text-dark mb-4">
                Nail Art
              </h3>
              <p className="text-text-light leading-relaxed">
                Diseños personalizados y creativos que reflejan tu estilo único con técnicas avanzadas de decoración.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-2xl p-10 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 text-center">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-6">
                <DimondIcon className="w-8 h-8 text-primary-dark" />
              </div>
              <h3 className="text-2xl font-semibold text-text-dark mb-4">
                Pedicure Luxury
              </h3>
              <p className="text-text-light leading-relaxed">
                Experiencia relajante de pies con hidratación profunda, exfoliación y masaje terapéutico.
              </p>
            </div>
          </div>

          {/* View All Services Button */}
          <div className="text-center">
            <Link 
              to="/servicios"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors duration-300"
            >
              Ver todos los servicios
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Mini Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
              NUESTRO TRABAJO
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark mb-4">
              Inspiración en cada detalle
            </h2>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 aspect-square">
              <img 
                src={imagen1} 
                alt="Diseño de uñas 1" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 aspect-square">
              <img 
                src={imagen2} 
                alt="Diseño de uñas 2" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 aspect-square">
              <img 
                src={imagen3} 
                alt="Diseño de uñas 3" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-2 aspect-square">
              <img 
                src={imagen4} 
                alt="Diseño de uñas 4" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* View Gallery Button */}
          <div className="text-center">
            <Link 
              to="/galeria"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors duration-300"
            >
              Ver galería completa
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            ¿Lista para tu transformación?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Agenda tu cita hoy y descubre la diferencia de un servicio de lujo
          </p>
          {onOpenBooking ? (
            <button
              type="button"
              onClick={onOpenBooking}
              className="inline-block px-10 py-4 bg-white text-primary hover:bg-neutral-light font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Reservar Ahora
            </button>
          ) : (
            <Link
              to="/contacto"
              className="inline-block px-10 py-4 bg-white text-primary hover:bg-neutral-light font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Reservar Ahora
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default Welcome;