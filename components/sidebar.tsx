"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Coffee, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Trash2, 
  RefreshCw, 
  CircleDollarSign,
  LogOut
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Sales & Payments", href: "/sales", icon: ShoppingCart },
    { name: "Waste Tracking", href: "/waste", icon: Trash2 },
    { name: "Reconciliation", href: "/reconciliation", icon: RefreshCw },
    { name: "Finance & Reports", href: "/finance", icon: CircleDollarSign },
  ];

  const handleLogout = () => {
    localStorage.removeItem("s7_session");
    localStorage.removeItem("s7_user_email");
    router.push("/");
  };

  // If we are on the login page (root page), do not display the sidebar at all
  if (pathname === "/") {
    return null;
  }

  return (
    <aside className="w-64 bg-white text-zinc-900 border-r border-zinc-200 min-h-screen flex flex-col justify-between select-none">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-amber-600 p-2 rounded-xl text-white">
            <Coffee className="h-6 w-6 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-tight text-zinc-950">Sector Seven</h1>
            <p className="text-[10px] text-amber-600 font-bold tracking-widest uppercase mt-0.5">ERP SYSTEM</p>
          </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-amber-50 text-amber-700 border-l-2 border-amber-600 pl-3.5"
                    : "text-zinc-650 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-amber-600" : "text-zinc-500 group-hover:text-zinc-800"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 truncate">
          <div className="h-8 w-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
            S7
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-zinc-800">Sector Seven Store</p>
            <p className="text-[10px] text-zinc-500 truncate">admin@sectorseven.com</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-zinc-400 transition-colors duration-200 cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="h-4.5 w-4.5" />
        </button>
      </div>
    </aside>
  );
}
