// src/components/layout/MarketingHeader.tsx


import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function MarketingHeader() {
  // Links de navegação para a página de marketing
  const navLinks = [
    { href: '/faq', label: 'FAQ' },
    { href: '/terms-of-service', label: 'Termos de Serviço' },
    { href: '/contact', label: 'Contato' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl font-bold text-primary-600">
            FinancePro
          </Link>
        </div>

        {/* Links de Navegação (Centro) */}
        <nav className="hidden md:flex gap-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-semibold text-gray-600 transition-colors hover:text-primary-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Botões de Ação (Direita) */}
        <div className="flex items-center gap-x-4">
          <Button variant="outline">
            Enquiry
          </Button>
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/signup"> {/* <-- ALTERADO: de /register para /signup */}
            <Button>Criar Conta</Button>
          </Link>
        </div>

      </div>
    </header>
  );
}