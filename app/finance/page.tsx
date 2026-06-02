"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CircleDollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RefreshCw,
  Wallet,
  Receipt,
  FileSpreadsheet
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    type: "EXPENSE", 
    amount: "",
    description: "",
  });

  async function fetchFinance() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && !error) {
        setTransactions(data);
      } else {
        // Mock fallback
        setTransactions([
          { id: "f1", transaction_type: "REVENUE", amount: 2450000, description: "Penjualan Harian POS 02 Jun", created_at: new Date().toISOString() },
          { id: "f2", transaction_type: "EXPENSE", amount: 350000, description: "Restock Susu UHT 2 Karton", created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: "f3", transaction_type: "REVENUE", amount: 3100000, description: "Penjualan Harian POS 01 Jun", created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: "f4", transaction_type: "EXPENSE", amount: 1800000, description: "Restock Biji Kopi Arabica 10kg", created_at: new Date(Date.now() - 172800000).toISOString() },
          { id: "f5", transaction_type: "EXPENSE", amount: 450000, description: "Listrik & Internet Kedai Mei", created_at: new Date(Date.now() - 259200000).toISOString() },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleLogTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;

    try {
      setSubmitting(true);
      const amt = Number(form.amount);

      const { error } = await supabase
        .from("financial_transactions")
        .insert({
          transaction_type: form.type,
          amount: amt,
          description: form.description
        });

      if (error) throw error;

      setTransactions(prev => [
        {
          id: Math.random().toString(),
          transaction_type: form.type,
          amount: amt,
          description: form.description,
          created_at: new Date().toISOString()
        },
        ...prev
      ]);

      setForm({
        type: "EXPENSE",
        amount: "",
        description: "",
      });

      alert("Transaksi keuangan berhasil disimpan!");
      fetchFinance();
    } catch (err: any) {
      console.error(err);
      alert("Gagal menyimpan transaksi: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = transactions
    .filter(t => t.transaction_type === "REVENUE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.transaction_type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netProfit = totalRevenue - totalExpense;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-zinc-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-2">
            <CircleDollarSign className="h-8 w-8 text-amber-600" />
            Financial Ledger & P&L
          </h1>
          <p className="text-zinc-500 mt-1">
            Penyusunan laporan operasional dan arus kas keuangan otomatis terintegrasi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchFinance} variant="outline" className="border-zinc-200 bg-white hover:bg-zinc-100 flex gap-2 shadow-sm text-zinc-700">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700">TOTAL OPERATIONAL REVENUE</span>
              <div className="bg-emerald-100 text-emerald-700 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 mt-4">Rp {totalRevenue.toLocaleString("id-ID")}</h2>
            <p className="text-[10px] text-emerald-650 mt-2">Akumulasi pendapatan kotor kedai</p>
          </CardContent>
        </Card>

        <Card className="border border-rose-200 bg-rose-50 text-rose-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-rose-700">TOTAL EXPENDITURE</span>
              <div className="bg-rose-100 text-rose-700 p-2 rounded-xl">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 mt-4">Rp {totalExpense.toLocaleString("id-ID")}</h2>
            <p className="text-[10px] text-rose-650 mt-2">Bahan baku tumpah, restock, listrik, dll.</p>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm ${netProfit >= 0 ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">NET OPERATING PROFIT</span>
              <div className="bg-amber-100 text-amber-700 p-2 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-zinc-900 mt-4">Rp {netProfit.toLocaleString("id-ID")}</h2>
            <p className="text-[10px] mt-2">Netto bersih setelah dikurangi pengeluaran</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Entries and Log Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Ledger table */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 border-b border-zinc-100">
              <div>
                <CardTitle className="text-lg font-bold text-zinc-900">Jurnal Transaksi Kas</CardTitle>
                <CardDescription>Pencatatan kas masuk dan kas keluar terperinci</CardDescription>
              </div>
              <Badge className="bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 shadow-none">
                <FileSpreadsheet className="h-3 w-3 mr-1" />
                Auto-Compiled Ledger
              </Badge>
            </CardHeader>
            <CardContent className="pt-4">
              {loading && transactions.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 animate-pulse">Loading financial logs...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-500 text-left font-semibold">
                        <th className="pb-3 font-medium">Tanggal</th>
                        <th className="pb-3 font-medium">Deskripsi Transaksi</th>
                        <th className="pb-3 font-medium text-center">Jenis</th>
                        <th className="pb-3 font-medium text-right">Nilai Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="py-3.5 text-zinc-500 text-xs">
                            {new Date(t.created_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </td>
                          <td className="py-3.5 font-semibold text-zinc-900">
                            {t.description}
                          </td>
                          <td className="py-3.5 text-center">
                            <Badge 
                              className={
                                t.transaction_type === "REVENUE"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/50 shadow-none"
                                  : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/50 shadow-none"
                              }
                            >
                              {t.transaction_type}
                            </Badge>
                          </td>
                          <td className={`py-3.5 text-right font-bold ${t.transaction_type === "REVENUE" ? "text-emerald-600" : "text-rose-600"}`}>
                            {t.transaction_type === "REVENUE" ? "+" : "-"} Rp {Number(t.amount || 0).toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Log Manual */}
        <div>
          <Card className="border border-zinc-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-zinc-900">Catat Pengeluaran / Pemasukan</CardTitle>
              <CardDescription>Log transaksi biaya operasional manual (listrik, air, gaji, restock darurat)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogTransaction} className="space-y-4 text-xs">
                
                {/* Select Type */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Jenis Transaksi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type: "REVENUE" }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        form.type === "REVENUE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 bg-white"
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-500 bg-white"
                      }`}
                    >
                      Pemasukan
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type: "EXPENSE" }))}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                        form.type === "EXPENSE"
                          ? "bg-rose-50 text-rose-700 border-rose-500 bg-white"
                          : "border-zinc-200 hover:bg-zinc-50 text-zinc-500 bg-white"
                      }`}
                    >
                      Pengeluaran
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Jumlah Nominal (Rupiah)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 150000"
                    value={form.amount}
                    onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 text-sm font-bold shadow-none"
                    required
                    min="1"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-zinc-500 font-semibold">Deskripsi Transaksi</label>
                  <textarea
                    placeholder="Tuliskan alasan pengeluaran atau detail pemasukan..."
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500 h-20 text-sm shadow-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl py-3 text-sm transition-colors duration-200 shadow-sm cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : "Simpan Log Keuangan"}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
