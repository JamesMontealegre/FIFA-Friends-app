import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
      <span className="text-6xl mb-4 text-neon neon-text">404</span>
      <h1 className="text-2xl font-bold text-gray-100 mb-2">Pagina no encontrada</h1>
      <p className="text-gray-500 mb-6">La pagina que buscas no existe.</p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  )
}
