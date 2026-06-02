"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingCart, 
  Search, 
  CreditCard, 
  DollarSign, 
  Smartphone, 
  RefreshCw,
  CheckCircle,
  XCircle,
  HelpCircle,
  Filter
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SalesPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL"); 
  const [filterGateway, setFilterGateway] = useState("ALL"); 
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchSales() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("sales")
        .select(`
          id,
          invoice_number,
          net_sales,
          payment_status,
          created_at,
          payment_method,
          transaction_ref
        `)
        .order("created_at", { ascending: false });

      if (data && !error) {
        setTransactions(data);
      } else {
        // Fallback mockup
        setTransactions([
          { id: "1", invoice_number: "INV/20260602/089", net_sales: 35000, payment_status: "SUCCESS", payment_method: "QRIS_CIMB", transaction_ref: "TX-QRIS-98211", created_at: new Date().toISOString() },
          { id: "2", invoice_number: "INV/20260602/088", net_sales: 78000, payment_status: "SUCCESS", payment_method: "MIDTRANS", transaction_ref: "MID-82910-SUCCESS", created_at: new Date().toISOString() },
          { id: "3", invoice_number: "INV/20260602/087", net_sales: 52000, payment_status: "FAILED", payment_method: "MIDTRANS", transaction_ref: "MID-82909-EXPIRED", created_at: new Date().toISOString() },
          { id: "4", invoice_number: "INV/20260602/086", net_sales: 24000, payment_status: "SUCCESS", payment_method: "CASH", transaction_ref: "CASH-REG-01", created_at: new Date().toISOString() },
          { id: "5", invoice_number: "INV/20260602/085", net_sales: 46000, payment_status: "PENDING", payment_method: "QRIS_CIMB", transaction_ref: "TX-QRIS-98210", created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: "6", invoice_number: "INV/20260602/084", net_sales: 38000, payment_status: "UNCONFIRMED", payment_method: "MIDTRANS", transaction_ref: "MID-82908-PENDING", created_at: new Date(Date.now() - 7200000).toISOString() },
          { id: "7", invoice_number: "INV/20260602/083", net_sales: 65000, payment_status: "SUCCESS", payment_method: "QRIS_CIMB", transaction_ref: "TX-QRIS-98209", created_at: new Date(Date.now() - 10800000).toISOString() },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSales();
  }, []);

  const handleVerifyStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      
      const { error } = await supabase
        .from("sales")
        .update({ payment_status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setTransactions(prev => prev.map(tx => {
        if (tx.id === id) {
          return { ...tx, payment_status: newStatus };
        }
        return tx;
      }));

      if (newStatus === "SUCCESS") {
        const tx = transactions.find(t => t.id === id);
        if (tx) {
          await supabase.from("financial_transactions").insert({
            transaction_type: "REVENUE",
            amount: tx.net_sales,
            description: `Payment confirmation for invoice ${tx.invoice_number}`
          });
        }
      }

      alert("Status transaksi berhasil diperbarui!");
      fetchSales();
    } catch (err: any) {
      console.error(err);
      alert("Gagal merubah status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Aggregates
  const totalSuccessSales = transactions
    .filter(tx => tx.payment_status === "SUCCESS")
    .reduce((sum, tx) => sum + Number(tx.net_sales || 0), 0);

  const cashSales = transactions
    .filter(tx => tx.payment_status === "SUCCESS" && tx.payment_method === "CASH")
    .reduce((sum, tx) => sum + Number(tx.net_sales || 0), 0);

  const qrisSales = transactions
    .filter(tx => tx.payment_status === "SUCCESS" && tx.payment_method === "QRIS_CIMB")
    .reduce((sum, tx) => sum + Number(tx.net_sales || 0), 0);

  const midtransSales = transactions
    .filter(tx => tx.payment_status === "SUCCESS" && tx.payment_method === "MIDTRANS")
    .reduce((sum, tx) => sum + Number(tx.net_sales || 0), 0);

  const pendingCount = transactions.filter(tx => tx.payment_status === "PENDING" || tx.payment_status === "UNCONFIRMED").length;

  // Filters
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
      (tx.transaction_ref && tx.transaction_ref.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = filterStatus === "ALL" || tx.payment_status === filterStatus;
    const matchesGateway = filterGateway === "ALL" || tx.payment_method === filterGateway;

    return matchesSearch && matchesStatus && matchesGateway;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-zinc-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-amber-600" />
            Centralized Sales Ledger
          </h1>
          <p className="text-zinc-500 mt-1">
            Data transaksi terintegrasi dari Cash Register, QRIS CIMB Niaga, dan Gateway Midtrans.
          </p>
        </div>
        <Button onClick={fetchSales} variant="outline" className="border-zinc-200 bg-white hover:bg-zinc-100 flex gap-2 shadow-sm text-zinc-700">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Aggregate Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">CASH REGISTER</p>
              <h3 className="text-lg font-bold text-zinc-900">Rp {cashSales.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-zinc-500">Transaksi tunai kasir</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">QRIS CIMB NIAGA</p>
              <h3 className="text-lg font-bold text-zinc-900">Rp {qrisSales.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-zinc-500">QR Code dinamis / statis</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-sky-50 text-sky-700 p-3 rounded-xl">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">MIDTRANS GATEWAY</p>
              <h3 className="text-lg font-bold text-zinc-900">Rp {midtransSales.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-zinc-500">Debit, Credit Card & E-Wallet</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-zinc-200 bg-amber-500/5 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${pendingCount > 0 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-zinc-100 text-zinc-500"}`}>
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">BUTUH VERIFIKASI</p>
              <h3 className={`text-lg font-bold ${pendingCount > 0 ? "text-amber-800" : "text-zinc-500"}`}>
                {pendingCount} Transaksi
              </h3>
              <p className="text-[10px] text-zinc-500">Belum terkonfirmasi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List and Filters */}
      <Card className="border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-4 border-b border-zinc-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-zinc-900">Ledger Transaksi</CardTitle>
              <CardDescription>Semua rekam penjualan masuk untuk memantau status gerbang pembayaran</CardDescription>
            </div>
            
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari Invoice / Referensi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 rounded-lg">
              <Filter className="h-3 w-3 text-zinc-400" />
              <span>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent text-zinc-800 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="ALL">Semua</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING">PENDING</option>
                <option value="UNCONFIRMED">UNCONFIRMED</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 rounded-lg">
              <CreditCard className="h-3 w-3 text-zinc-400" />
              <span>Gateway:</span>
              <select
                value={filterGateway}
                onChange={(e) => setFilterGateway(e.target.value)}
                className="bg-transparent text-zinc-800 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="ALL">Semua Metode</option>
                <option value="CASH">CASH</option>
                <option value="QRIS_CIMB">QRIS CIMB</option>
                <option value="MIDTRANS">MIDTRANS</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {loading && transactions.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 animate-pulse">Loading transaction records...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-500 text-left font-semibold">
                    <th className="pb-3 font-medium">Nomor Invoice</th>
                    <th className="pb-3 font-medium">Metode</th>
                    <th className="pb-3 font-medium">Gateway ID Ref</th>
                    <th className="pb-3 font-medium text-right">Nilai Sales</th>
                    <th className="pb-3 font-medium text-center">Status</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4">
                        <span className="font-semibold text-zinc-900 block">{tx.invoice_number}</span>
                        <span className="text-[10px] text-zinc-500 block">
                          {new Date(tx.created_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                          })}
                        </span>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="border-zinc-200 bg-zinc-50 text-zinc-650 text-[10px]">
                          {tx.payment_method}
                        </Badge>
                      </td>
                      <td className="py-4 text-xs font-mono text-zinc-500">
                        {tx.transaction_ref || "-"}
                      </td>
                      <td className="py-4 text-right font-bold text-zinc-900">
                        Rp {Number(tx.net_sales || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 text-center">
                        <Badge 
                          className={
                            tx.payment_status === "SUCCESS"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-250 hover:bg-emerald-100/50 shadow-none"
                              : tx.payment_status === "FAILED"
                              ? "bg-rose-50 text-rose-700 border border-rose-250 hover:bg-rose-100/50 shadow-none"
                              : tx.payment_status === "PENDING"
                              ? "bg-amber-50 text-amber-700 border border-amber-250 hover:bg-amber-100/50 shadow-none"
                              : "bg-zinc-50 text-zinc-600 border border-zinc-200 hover:bg-zinc-100 shadow-none"
                          }
                        >
                          {tx.payment_status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        {(tx.payment_status === "PENDING" || tx.payment_status === "UNCONFIRMED") ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => handleVerifyStatus(tx.id, "SUCCESS")}
                              disabled={updatingId === tx.id}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              Verify SUCCESS
                            </Button>
                            <Button 
                              onClick={() => handleVerifyStatus(tx.id, "FAILED")}
                              disabled={updatingId === tx.id}
                              size="sm"
                              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer"
                            >
                              Fail
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 font-semibold">Terselesaikan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-500">
                        Tidak ada data transaksi yang cocok dengan filter.
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
  );
}
