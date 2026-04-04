"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  Users, 
  Settings, 
  LogOut,
  UserCircle,
  Calendar
} from "lucide-react"; // Using Lucide for a pro look

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    { name: "Tableau de Bord", path: "/dashboard", icon: LayoutDashboard, roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"] },
    { name: "Mes Demandes", path: "/demandes", icon: FileText, roles: ["EMPLOYEE"] },
    { name: "Validation Manager", path: "/demandes", icon: CheckCircle, roles: ["MANAGER"] },
    { name: "Planning", path: "/calendrier", icon: Calendar, roles: ["HR_ADMIN", "MANAGER"] },
    { name: "Gestion RH", path: "/employes", icon: Users, roles: ["HR_ADMIN"] },
    { name: "Mon Profil", path: "/profil", icon: UserCircle, roles: ["EMPLOYEE", "MANAGER", "HR_ADMIN"] },
  ];

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col p-6 fixed left-0 top-0">
      {/* Brand Header */}
      <div className="mb-12 px-4">
        <h2 className="text-2xl font-black italic text-blue-600 tracking-tighter">SOMEPHARM</h2>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">HR Management v2.0</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          // Check if user's role is allowed to see this item
          if (user && item.roles.includes(user.role)) {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-200 group ${
                  isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          }
          return null;
        })}
      </nav>

      {/* Settings & Logout Section */}
      <div className="pt-6 border-t border-gray-50 space-y-2">
        {user?.role === "HR_ADMIN" && (
          <Link href="/settings" className="flex items-center gap-4 px-6 py-4 text-gray-400 font-bold hover:text-gray-600 transition">
            <Settings size={20} />
            <span className="text-sm">Paramètres</span>
          </Link>
        )}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 text-red-400 font-bold hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}