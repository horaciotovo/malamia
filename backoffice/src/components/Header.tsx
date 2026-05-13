import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/dashboard': 'Panel de Control',
  '/products': 'Productos',
  '/products/new': 'Nuevo Producto',
  '/customers': 'Clientes',
  '/notifications': 'Notificaciones',
  '/loyalty': 'Programa de Lealtad',
};

export default function Header() {
  const { pathname } = useLocation();
  const title = Object.entries(titles).find(([key]) => pathname.startsWith(key))?.[1] ?? 'Malamia';

  return (
    <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-white font-semibold text-base">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-gray-500 text-xs">Live</span>
      </div>
    </header>
  );
}
