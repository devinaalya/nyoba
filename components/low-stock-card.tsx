import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface LowStockItem {
  id: string;
  ingredient_name: string;
  current_stock: number;
  minimum_stock: number;
  unit?: string;
}

interface LowStockCardProps {
  items: LowStockItem[];
}

export default function LowStockCard({ items }: LowStockCardProps) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
          Low Stock Alerts
        </CardTitle>
        <Badge variant={items.length > 0 ? "destructive" : "secondary"}>
          {items.length} Alerts
        </Badge>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
            <span className="text-sm">All raw materials healthy</span>
            <span className="text-xs text-zinc-400 mt-1">Stok aman di atas batas minimum</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 hover:shadow-sm transition-all duration-200"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      {item.ingredient_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>Stock: <strong className="text-amber-700 dark:text-amber-400">{item.current_stock} {item.unit || "unit"}</strong></span>
                      <span className="text-zinc-300 dark:text-zinc-700">|</span>
                      <span>Min: {item.minimum_stock} {item.unit || "unit"}</span>
                    </div>
                  </div>
                  <Link
                    href="/inventory"
                    className="p-1.5 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg text-amber-700 dark:text-amber-400 transition-colors"
                    title="Tambah Stok"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                  </Link>
                </div>
              ))}
            </div>
            <Link
              href="/inventory"
              className="block w-full text-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Manage Inventory
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
