"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  DollarSign, 
  ShieldAlert, 
  Search,
  Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReconciliationPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  async function fetchReconciliations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reconciliations")
        .select("*")
        .order("reconciled_at", { ascending: false });

      if (data && !error) {
        setRecords(data);
      } else {
        // Mock fallback
        setRecords([
          { id: "r1", invoice_number: "INV/20260602/089", system_amount: 35000, gateway_amount: 35000, status: "MATCH", reconciled_at: new Date().toISOString() },
          { id: "r2", invoice_number: "INV/20260602/088", system_amount: 78000, gateway_amount: 78000, status: "MATCH", reconciled_at: new Date().toISOString() },
          { id: "r3", invoice_number: "INV/20260602/087", system_amount: 52000, gateway_amount: 0, status: "DISCREPANCY", reconciled_at: new Date().toISOString() }, 
          { id: "r4", invoice_number: "INV/20260602/086", system_amount: 24000, gateway_amount: 24000, status: "MATCH", reconciled_at: new Date(Date.now() - 3600000).toISOString() },
          { id: "r5", invoice_number: "INV/20260602/085", system_amount: 46000, gateway_amount: 40000, status: "DISCREPANCY", reconciled_at: new Date(Date.now() - 7200000).toISOString() }, 
          { id: "r6", invoice_number: "INV/20260602/084", system_amount: 38000, gateway_amount: 38000, status: "UNCONFIRMED", reconciled_at: new Date(Date.now() - 10800000).toISOString() }, 
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReconciliations();
  }, []);

  const handleResolveReconciliation = async (id: string, newStatus: string) => {
    try {
      setResolvingId(id);
      
      const targetRecord = records.find(r => r.id === id);
      if (!targetRecord) return;

      const { error } = await supabase
        .from("reconciliations")
        .update({ 
          status: newStatus,
          gateway_amount: targetRecord.system_amount 
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setRecords(prev => prev.map(rec => {
        if (rec.id === id) {
          return { ...rec, status: newStatus, gateway_amount: rec.system_amount };
        }
        return rec;
      }));

      alert("Rekonsiliasi terselesaikan!");
      fetchReconciliations();
    } catch (err: any) {
      console.error(err);
      alert("Gagal merubah status: " + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  const matchCount = records.filter(r => r.status === "MATCH").length;
  const discrepancyCount = records.filter(r => r.status === "DISCREPANCY").length;
  const unconfirmedCount = records.filter(r => r.status === "UNCONFIRMED").length;
  const reconciliationRate = records.length > 0 
    ? Math.round((matchCount / records.length) * 100) 
    : 100;

  const filteredRecords = records.filter(r => 
    r.invoice_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto text-zinc-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 flex items-center gap-2">
            <RefreshCw className="h-8 w-8 text-amber-650" />
            Gateway Reconciliation Center
          </h1>
          <p className="text-zinc-500 mt-1">
            Proses otomatis verifikasi nominal POS internal dengan laporan mutasi CIMB & Midtrans.
          </p>
        </div>
        <Button onClick={fetchReconciliations} variant="outline" className="border-zinc-200 bg-white hover:bg-zinc-100 flex gap-2 shadow-sm text-zinc-700">
          <RefreshCw className="h-4 w-4" />
          Re-Sync Gateway
        </Button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">MATCHED OK</p>
              <h3 className="text-lg font-bold text-zinc-900">{matchCount} Transaksi</h3>
              <p className="text-[10px] text-zinc-500">Nominal POS & Gateway 100% klop</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-rose-200 bg-rose-50 text-rose-700 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-rose-100 text-rose-700 p-3 rounded-xl">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-rose-750">DISCREPANCIES</p>
              <h3 className="text-lg font-bold text-rose-750">{discrepancyCount} Selisih</h3>
              <p className="text-[10px] text-rose-600/80">Butuh investigasi selisih dana</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">UNCONFIRMED</p>
              <h3 className="text-lg font-bold text-zinc-900">{unconfirmedCount} Transaksi</h3>
              <p className="text-[10px] text-zinc-500">Belum disinkronisasi server</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 bg-white shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="bg-amber-50 text-amber-700 p-3 rounded-xl">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500">RECON ACCURACY</p>
              <h3 className="text-lg font-bold text-zinc-900">{reconciliationRate}%</h3>
              <p className="text-[10px] text-zinc-500">Tingkat kecocokan data kas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="border border-zinc-200 bg-white shadow-sm">
        <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100">
          <div>
            <CardTitle className="text-lg font-bold text-zinc-900">Auditor Rekonsiliasi Kas & Gateway</CardTitle>
            <CardDescription>Pemeriksaan silang pencatatan kas POS dan penyelesaian saldo gantung</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari Invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:border-amber-500"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading && records.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 animate-pulse">Loading reconciliation audits...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-500 text-left font-semibold">
                    <th className="pb-3 font-medium">No. Invoice POS</th>
                    <th className="pb-3 font-medium text-right">System POS Amount</th>
                    <th className="pb-3 font-medium text-right">Gateway Amount</th>
                    <th className="pb-3 font-medium text-right">Selisih</th>
                    <th className="pb-3 font-medium text-center">Status Audit</th>
                    <th className="pb-3 font-medium text-right">Penyelesaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredRecords.map((r) => {
                    const diff = Number(r.system_amount || 0) - Number(r.gateway_amount || 0);
                    return (
                      <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-4">
                          <span className="font-semibold text-zinc-900 block">{r.invoice_number}</span>
                          <span className="text-[10px] text-zinc-500 block">
                            Recon At: {new Date(r.reconciled_at).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </td>
                        <td className="py-4 text-right font-bold text-zinc-700">
                          Rp {Number(r.system_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 text-right font-bold text-zinc-700">
                          Rp {Number(r.gateway_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className={`py-4 text-right font-bold ${diff === 0 ? "text-zinc-400" : "text-rose-600"}`}>
                          Rp {diff.toLocaleString("id-ID")}
                        </td>
                        <td className="py-4 text-center">
                          <Badge 
                            className={
                              r.status === "MATCH"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/50 shadow-none"
                                : r.status === "DISCREPANCY"
                                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/50 shadow-none animate-pulse"
                                : "bg-amber-50 text-amber-700 border border-amber-250 hover:bg-amber-100/50 shadow-none"
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-right">
                          {r.status !== "MATCH" ? (
                            <Button 
                              onClick={() => handleResolveReconciliation(r.id, "MATCH")}
                              disabled={resolvingId === r.id}
                              size="sm"
                              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ml-auto cursor-pointer shadow-sm animate-pulse"
                            >
                              <Check className="h-3 w-3" />
                              Force Resolve MATCH
                            </Button>
                          ) : (
                            <span className="text-xs text-zinc-500 font-semibold">Terselesaikan</span>
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
  );
}
