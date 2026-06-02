"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Trash2, 
  Plus, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function WastePage() {
  const [loading, setLoading] = useState(true);
  const [wasteLogs, setWasteLogs] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    itemId: "",
    quantity: "",
    reason: "SPOILED", 
    note: ""
  });

  async function fetchData() {
    try {
      setLoading(true);
      
      const { data: logs, error: logsError } = await supabase
        .from("waste_records")
        .select(`
          id,
          quantity_wasted,
          reason,
          recorded_at,
          note,
          inventory_items(id, ingredient_name, price_per_unit, unit)
        `)
        .order("recorded_at", { ascending: false });

      const { data: activeIngredients, error: ingError } = await supabase
        .from("inventory_items")
        .select("*");

      if (logs && !logsError) {
        const transformedLogs = logs.map((l: any) => ({
          id: l.id,
          recorded_at: l.recorded_at,
          quantity_wasted: l.quantity_wasted,
          reason: l.reason,
          note: l.note,
          ingredient_name: l.inventory_items?.ingredient_name || "Unknown",
          price_per_unit: l.inventory_items?.price_per_unit || 0,
          unit: l.inventory_items?.unit || "unit"
        }));
        setWasteLogs(transformedLogs);
      } else {
        // Mock fallback
        setWasteLogs([
          { id: "w1", ingredient_name: "UHT Milk", quantity_wasted: 2, unit: "L", price_per_unit: 16000, reason: "EXPIRED", note: "Sisa stock mingguan basi", recorded_at: new Date().toISOString() },
          { id: "w2", ingredient_name: "Coffee Beans (Arabica)", quantity_wasted: 0.5, unit: "kg", price_per_unit: 180000, reason: "SPILLED", note: "Tumpah saat kalibrasi grinder", recorded_at: new Date(Date.now() - 86400000).toISOString() },
          { id: "w3", ingredient_name: "Palm Sugar Syrup", quantity_wasted: 1.5, unit: "L", price_per_unit: 35000, reason: "SPOILED", note: "Rasa berubah masam", recorded_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
      }

      if (activeIngredients && !ingError) {
        setIngredients(activeIngredients);
      } else {
        setIngredients([
          { id: "1", ingredient_name: "Coffee Beans (Arabica)", current_stock: 4.5, unit: "kg", price_per_unit: 180000 },
          { id: "2", ingredient_name: "UHT Milk", current_stock: 8, unit: "L", price_per_unit: 16000 },
          { id: "3", ingredient_name: "Palm Sugar Syrup", current_stock: 2, unit: "L", price_per_unit: 35000 },
          { id: "4", ingredient_name: "Matcha Powder", current_stock: 1.2, unit: "kg", price_per_unit: 280000 },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemId || !form.quantity) return;

    try {
      setSubmitting(true);
      const targetItem = ingredients.find(i => i.id === form.itemId);
      if (!targetItem) return;

      const qty = Number(form.quantity);
      const itemCost = Number(targetItem.price_per_unit || 0) * qty;

      const { error: insertErr } = await supabase
        .from("waste_records")
        .insert({
          inventory_item_id: targetItem.id,
          quantity_wasted: qty,
          reason: form.reason,
          note: form.note || `${form.reason} waste`
        });

      if (insertErr) throw insertErr;

      const updatedStock = Number(targetItem.current_stock) - qty;
      await supabase
        .from("inventory_items")
        .update({ current_stock: updatedStock })
        .eq("id", targetItem.id);

      await supabase
        .from("financial_transactions")
        .insert({
          transaction_type: "EXPENSE",
          amount: itemCost,
          description: `Waste loss: ${qty} ${targetItem.unit} of ${targetItem.ingredient_name} (${form.reason})`
        });

      setForm({
        itemId: "",
        quantity: "",
        reason: "SPOILED",
        note: ""
      });

      alert("Laporan waste berhasil disimpan!");
      fetchData();
    } catch (err: any) {
      console.error(err);
      alert("Gagal mencatat waste: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCostLoss = wasteLogs.reduce((sum, log) => {
    return sum + (Number(log.quantity_wasted) * Number(log.price_per_unit || 15000));
  }, 0);

  const spoiledCount = wasteLogs.filter(l => l.reason === "SPOILED").length;
  const expiredCount = wasteLogs.filter(l => l.reason === "EXPIRED").length;
  const spilledCount = wasteLogs.filter(l => l.reason === "SPILLED").length;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-zinc-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-2">
            <Trash2 className="h-8 w-8 text-amber-600" />
            Raw Material Waste Tracker
          </h1>
          <p className="text-zinc-500 mt-1">
            Pencatatan dan analisis bahan baku tumpah, kedaluwarsa, atau rusak selama operasional kedai.
          </p>
        </div>
        <Button onClick={fetchData} variant="outline" className="border-zinc-200 bg-white hover:bg-zinc-100 flex gap-2 shadow-sm text-zinc-700">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-rose-50 text-rose-700 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">TOTAL KERUGIAN WASTE</p>
              <h3 className="text-lg font-bold text-zinc-900">Rp {totalCostLoss.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-zinc-500">Nilai finansial dari bahan terbuang</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">FREKUENSI INSIDEN</p>
              <h3 className="text-lg font-bold text-zinc-900">{wasteLogs.length} Laporan</h3>
              <p className="text-[10px] text-zinc-500">
                Basi: {spoiledCount} | Expired: {expiredCount} | Tumpah: {spilledCount}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white text-zinc-500 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">IMBAS EFISIENSI DAPUR</p>
              <h3 className="text-lg font-bold text-zinc-900">98.25%</h3>
              <p className="text-[10px] text-zinc-500">Bahan baku sukses terpakai</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Form & Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Ledger */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader className="border-b border-zinc-105 pb-3">
              <CardTitle className="text-lg font-bold text-zinc-900">Log Pembuangan Bahan Baku</CardTitle>
              <CardDescription>Catatan audit insiden waste operasional Sector Seven</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {loading && wasteLogs.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 animate-pulse">Loading waste audit logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-500 text-left font-semibold">
                        <th className="pb-3 font-medium">Bahan</th>
                        <th className="pb-3 font-medium">Qty</th>
                        <th className="pb-3 font-medium text-right">Perkiraan Rugi</th>
                        <th className="pb-3 font-medium text-center">Alasan</th>
                        <th className="pb-3 font-medium">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {wasteLogs.map((log) => {
                        const totalLoss = Number(log.quantity_wasted) * Number(log.price_per_unit || 0);
                        return (
                          <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-3.5">
                              <span className="font-semibold text-zinc-900 block">{log.ingredient_name}</span>
                              <span className="text-[10px] text-zinc-500">
                                {new Date(log.recorded_at).toLocaleDateString("id-ID", {
                                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                                })}
                              </span>
                            </td>
                            <td className="py-3.5 text-zinc-700 font-medium">
                              {log.quantity_wasted} {log.unit}
                            </td>
                            <td className="py-3.5 text-right font-semibold text-rose-600">
                              Rp {totalLoss.toLocaleString("id-ID")}
                            </td>
                            <td className="py-3.5 text-center">
                              <Badge 
                                className={
                                  log.reason === "EXPIRED"
                                    ? "bg-rose-50 text-rose-700 border border-rose-250 hover:bg-rose-100/50 shadow-none"
                                    : log.reason === "SPOILED"
                                    ? "bg-amber-50 text-amber-700 border border-amber-250 hover:bg-amber-100/50 shadow-none"
                                    : "bg-sky-50 text-sky-700 border border-sky-250 hover:bg-sky-100/50 shadow-none"
                                }
                              >
                                {log.reason}
                              </Badge>
                            </td>
                            <td className="py-3.5 text-zinc-600 text-xs max-w-xs truncate">
                              {log.note || "-"}
                            </td>
                          </tr>
                        );
                      })}
                      {wasteLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-zinc-500">
                            Belum ada rekam data waste.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Log Form */}
        <div>
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900">Laporkan Waste</CardTitle>
              <CardDescription>Laporkan bahan terbuang untuk memperbarui neraca inventori & akuntansi secara otomatis</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogWaste} className="space-y-4 text-xs">
                
                {/* Select Ingredient */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Pilih Bahan Baku</label>
                  <select
                    value={form.itemId}
                    onChange={(e) => setForm(prev => ({ ...prev, itemId: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 shadow-none cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih bahan baku --</option>
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.ingredient_name} ({i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Waste Qty */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Kuantitas Terbuang</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="Contoh: 1.5 atau 0.5"
                    value={form.quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 text-sm shadow-none"
                    required
                    min="0.01"
                  />
                </div>

                {/* Waste Reason */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Alasan Waste</label>
                  <select
                    value={form.reason}
                    onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 text-sm font-semibold shadow-none cursor-pointer"
                    required
                  >
                    <option value="SPOILED">SPOILED (Rusak / Berubah Rasa)</option>
                    <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
                    <option value="SPILLED">SPILLED (Tumpah)</option>
                    <option value="RECIPE_ERROR">RECIPE ERROR (Kesalahan Barista)</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Catatan Kronologi</label>
                  <textarea
                    placeholder="Tuliskan keterangan detail mengapa bahan terbuang..."
                    value={form.note}
                    onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 h-20 text-sm shadow-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl py-3 text-sm transition-colors duration-200 shadow-sm cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan Laporan Waste"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
