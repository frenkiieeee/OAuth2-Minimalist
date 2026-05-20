import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components';

export function AccountPage() {
  const { user, accessToken, isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isLoading, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mi Cuenta</CardTitle>
            <CardDescription>
              Informacion de tu sesion actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'Avatar'}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-semibold">
                  {user.name?.[0]?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-lg">{user.name || 'Sin nombre'}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Metodo de autenticacion</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.authMethod === 'GOOGLE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.authMethod === 'GOOGLE' ? 'Google' : 'Email/Password'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID de usuario</span>
                <span className="font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de registro</span>
                <span>{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tokens de sesion</CardTitle>
            <CardDescription>
              Informacion sobre los tokens de autenticacion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Access Token</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs break-all">
                {accessToken || 'No disponible'}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Refresh Token</p>
              <p className="text-sm text-muted-foreground">
                Almacenado en cookie httpOnly
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debug</CardTitle>
            <CardDescription>
              Datos completos del usuario para desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
              {JSON.stringify({ user, hasToken: !!accessToken }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          Cerrar Sesion
        </Button>
      </div>
    </div>
  );
}