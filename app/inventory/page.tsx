"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Package, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  RefreshCw,
  Search
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adjustment, setAdjustment] = useState({
    itemId: "",
    type: "IN", 
    quantity: "",
    reason: ""
  });

  async function fetchInventory() {
    try {
      setLoading(true);
            const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("ingredient_name");

      if (data && data.length > 0 && !error) {
        setItems(data);
      } else {
        // Mock fallback
        setItems([
          { id: "1", ingredient_name: "Coffee Beans (Arabica)", current_stock: 4.5, minimum_stock: 10, unit: "kg", price_per_unit: 180000, category: "Beans" },
          { id: "2", ingredient_name: "UHT Milk", current_stock: 8, minimum_stock: 24, unit: "L", price_per_unit: 16000, category: "Dairy" },
          { id: "3", ingredient_name: "Palm Sugar Syrup", current_stock: 2, minimum_stock: 5, unit: "L", price_per_unit: 35000, category: "Syrups" },
          { id: "4", ingredient_name: "Matcha Powder", current_stock: 1.2, minimum_stock: 1.0, unit: "kg", price_per_unit: 280000, category: "Powders" },
          { id: "5", ingredient_name: "Chocolate Powder", current_stock: 3.5, minimum_stock: 2, unit: "kg", price_per_unit: 140000, category: "Powders" },
          { id: "6", ingredient_name: "Paper Cups 12oz", current_stock: 420, minimum_stock: 200, unit: "pcs", price_per_unit: 800, category: "Packaging" },
          { id: "7", ingredient_name: "Plastic Straws", current_stock: 80, minimum_stock: 100, unit: "pcs", price_per_unit: 150, category: "Packaging" },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustment.itemId || !adjustment.quantity) return;

    try {
      setSubmitting(true);
      const targetItem = items.find(i => i.id === adjustment.itemId);
      if (!targetItem) return;

      const qty = Number(adjustment.quantity);
      const newStock = adjustment.type === "IN" 
        ? Number(targetItem.current_stock) + qty 
        : Number(targetItem.current_stock) - qty;

      const { error } = await supabase
        .from("inventory_items")
        .update({ current_stock: newStock })
        .eq("id", targetItem.id);

      if (error) {
        throw error;
      }

      if (adjustment.type === "OUT" && adjustment.reason.toLowerCase().includes("waste")) {
        await supabase
          .from("waste_records")
          .insert({
            inventory_item_id: targetItem.id,
            quantity_wasted: qty,
            reason: adjustment.reason || "Operational waste"
          });
      }

      setItems(prev => prev.map(item => {
        if (item.id === targetItem.id) {
          return { ...item, current_stock: newStock };
        }
        return item;
      }));

      setAdjustment({
        itemId: "",
        type: "IN",
        quantity: "",
        reason: ""
      });

      alert("Stok berhasil diperbarui!");
      fetchInventory();
    } catch (err: any) {
      console.error(err);
      alert("Gagal memperbarui stok: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.ingredient_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-zinc-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-2">
            <Package className="h-8 w-8 text-amber-600" />
            Inventory Tracking
          </h1>
          <p className="text-zinc-500 mt-1">
            Monitoring stok bahan baku real-time dan pencatatan aliran stok masuk/keluar.
          </p>
        </div>
        <Button onClick={fetchInventory} variant="outline" className="border-zinc-200 hover:bg-zinc-100 flex gap-2 shadow-sm text-zinc-700 bg-white">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Alert Summary */}
      {items.some(item => Number(item.current_stock) <= Number(item.minimum_stock)) && (
        <div className="bg-amber-500/10 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800">Peringatan Batas Minimum!</h4>
            <p className="text-sm text-zinc-650">
              Beberapa bahan baku berada di bawah atau setara dengan batas minimum stok. Silakan jadwalkan restock segera.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Table List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b border-zinc-100">
              <div>
                <CardTitle className="text-lg font-bold text-zinc-900">Stok Bahan Baku</CardTitle>
                <CardDescription>Daftar persediaan bahan baku aktif di dapur & gudang</CardDescription>
              </div>
              <div className="relative w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari bahan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {loading && items.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 animate-pulse">Loading inventory items...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-500 text-left font-semibold">
                        <th className="pb-3 font-medium">Bahan Baku</th>
                        <th className="pb-3 font-medium">Kategori</th>
                        <th className="pb-3 font-medium text-right">Stok Saat Ini</th>
                        <th className="pb-3 font-medium text-right">Batas Min</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredItems.map((item) => {
                        const isLow = Number(item.current_stock) <= Number(item.minimum_stock);
                        return (
                          <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-3.5 font-semibold text-zinc-900">{item.ingredient_name}</td>
                            <td className="py-3.5 text-zinc-500 text-xs">
                              <Badge variant="outline" className="border-zinc-250 text-zinc-500 bg-zinc-50 uppercase text-[9px] tracking-wider font-semibold">
                                {item.category || "General"}
                              </Badge>
                            </td>
                            <td className="py-3.5 text-right font-bold text-zinc-900">
                              {item.current_stock} <span className="text-zinc-500 font-normal text-xs">{item.unit}</span>
                            </td>
                            <td className="py-3.5 text-right text-zinc-500 text-xs">
                              {item.minimum_stock} {item.unit}
                            </td>
                            <td className="py-3.5 text-right">
                              {isLow ? (
                                <Badge className="bg-rose-50 text-rose-700 border border-rose-200 shadow-none">
                                  LOW STOCK
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-none">
                                  SAFE
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Quick Action Log Stock */}
        <div className="space-y-8">
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900">Catat Mutasi Stok</CardTitle>
              <CardDescription>Pencatatan manual stok masuk (restock) atau stok keluar (rusak/expired)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStockAdjustment} className="space-y-4 text-xs">
                
                {/* Select Item */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Pilih Bahan Baku</label>
                  <select
                    value={adjustment.itemId}
                    onChange={(e) => setAdjustment(prev => ({ ...prev, itemId: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 shadow-none cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih bahan baku --</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.ingredient_name} ({i.current_stock} {i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Adjustment Type */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Jenis Penyesuaian</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAdjustment(prev => ({ ...prev, type: "IN" }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        adjustment.type === "IN"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500"
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-500 bg-white"
                      }`}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Stok Masuk
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustment(prev => ({ ...prev, type: "OUT" }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        adjustment.type === "OUT"
                          ? "bg-rose-50 text-rose-700 border-rose-500"
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-500 bg-white"
                      }`}
                    >
                      <ArrowDownLeft className="h-4 w-4" />
                      Stok Keluar
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Jumlah Kuantitas</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 10 atau 2.5"
                    value={adjustment.quantity}
                    onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 text-sm shadow-none"
                    required
                    min="0.01"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Keterangan / Alasan</label>
                  <textarea
                    placeholder="Contoh: Restock Supplier A, Bubuk Tumpah (Waste), Expired"
                    value={adjustment.reason}
                    onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 h-20 text-sm shadow-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl py-3 text-sm transition-colors duration-200 cursor-pointer shadow-sm"
                >
                  {submitting ? "Memproses..." : "Simpan Penyesuaian"}
                </Button>

              </form>
            </CardContent>
          </Card>

          {/* Auto reduction info */}
          <Card className="border border-zinc-200 bg-white text-zinc-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-1.5">
                Recipe Auto-Reduction
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 leading-relaxed">
              <p>Setiap menu kopi dikaitkan dengan resep bahan baku di dalam tabel <code className="text-zinc-700 bg-zinc-50 px-1 py-0.5 rounded">product_recipes</code>.</p>
              <p>Stok bahan baku akan berkurang secara otomatis ketika pesanan sukses, misalnya:</p>
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-150 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="font-semibold text-zinc-700">Es Kopi Susu Aren:</span>
                  <span className="text-zinc-500">15g Beans, 150ml Milk, 20ml Syrup</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
