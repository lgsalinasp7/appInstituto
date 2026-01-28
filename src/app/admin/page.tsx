
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminService } from "@/modules/admin/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await AdminService.getSystemStats();

  const systemStats = [
    { title: "Usuarios Totales", value: stats.usersCount, icon: "👥", color: "bg-blue-50 text-blue-600" },
    { title: "Roles Definidos", value: stats.rolesCount, icon: "🔐", color: "bg-purple-50 text-purple-600" },
    { title: "Sesiones Activas", value: stats.sessionsCount, icon: "🟢", color: "bg-green-50 text-green-600" },
    { title: "Registros de Auditoría", value: stats.logsCount, icon: "📋", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Panel de Administración</h1>
        <p className="text-[#64748b] mt-1">
          Resumen del estado del sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up animation-delay-100">
        {systemStats.map((stat, index) => (
          <Card
            key={stat.title}
            className="shadow-instituto card-hover border-0"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#64748b]">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1e3a5f]">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 animate-fade-in-up animation-delay-200">
        {/* Quick Actions */}
        <Card className="shadow-instituto border-0">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <AdminAction
              icon="👤"
              title="Gestionar usuarios"
              description="Ver, crear y editar usuarios"
              href="/admin/users"
            />
            <AdminAction
              icon="🔐"
              title="Configurar roles"
              description="Permisos y niveles de acceso"
              href="/admin/roles"
            />
            <AdminAction
              icon="📋"
              title="Ver auditoría"
              description="Historial de actividades"
              href="/admin/audit"
            />
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="shadow-instituto border-0">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Estado del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusItem
              label="Base de datos"
              status="Conectada"
              isHealthy={true}
            />
            <StatusItem
              label="Servicios de autenticación"
              status="Operativo"
              isHealthy={true}
            />
            <StatusItem
              label="API"
              status="En línea"
              isHealthy={true}
            />
            <StatusItem
              label="Almacenamiento"
              status="75% disponible"
              isHealthy={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminAction({
  icon,
  title,
  description,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-3 rounded-lg border border-transparent hover:border-[#1e3a5f]/10 hover:bg-[#f8fafc] transition-all duration-200 group"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <div>
        <p className="font-medium text-[#1e3a5f]">{title}</p>
        <p className="text-sm text-[#64748b]">{description}</p>
      </div>
      <span className="ml-auto text-[#94a3b8] group-hover:text-[#1e3a5f] transition-colors">
        →
      </span>
    </a>
  );
}

function StatusItem({
  label,
  status,
  isHealthy,
}: {
  label: string;
  status: string;
  isHealthy: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${isHealthy ? "bg-green-500" : "bg-red-500"
            }`}
        />
        <span className="text-sm text-[#1e3a5f]">{label}</span>
      </div>
      <span className="text-sm text-[#64748b]">{status}</span>
    </div>
  );
}
