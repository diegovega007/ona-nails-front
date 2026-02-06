import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-text-dark mt-auto">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-bold text-primary mb-4">Ona Nails</h3>
            <p className="text-neutral-light text-base leading-relaxed mb-6">
              Transformando uñas en obras de arte. Tu belleza es nuestra pasión.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Navegación</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-neutral-light hover:text-primary transition-colors duration-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/servicios" className="text-neutral-light hover:text-primary transition-colors duration-300">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/galeria" className="text-neutral-light hover:text-primary transition-colors duration-300">
                  Galería
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-neutral-light hover:text-primary transition-colors duration-300">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-neutral-light">
              <li>
                <a href="mailto:info@onanails.com" className="hover:text-primary transition-colors duration-300">
                  info@onanails.com
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="hover:text-primary transition-colors duration-300">
                  +1 (555) 123-4567
                </a>
              </li>
              <li className="text-neutral-light">
                123 Calle Principal, Ciudad
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-dark mb-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-neutral-light text-sm">
            © 2026 Ona Nails. Todos los derechos reservados.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-neutral-light text-sm hover:text-primary transition-colors duration-300">
              Privacidad
            </a>
            <a href="#" className="text-neutral-light text-sm hover:text-primary transition-colors duration-300">
              Términos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
