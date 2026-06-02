"use client";

import { useState, useEffect } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  sales: number;
  waste: number;
  expenses: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  // Recharts needs client mounting to prevent hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="col-span-3 border border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-base font-bold">Sales & Operations Trend</CardTitle>
          <CardDescription>Visualizing revenue, waste costs, and expenses</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="flex space-x-2">
            <div className="h-2 w-2 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-zinc-300 dark:bg-zinc-700 rounded-full animate-bounce"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (val: number) => {
    return "Rp " + val.toLocaleString("id-ID");
  };

  return (
    <Card className="col-span-3 border border-zinc-200 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-bold">Sales & Operations Trend</CardTitle>
          <CardDescription>Grafik tren pendapatan, biaya operasional, dan kerugian bahan baku</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" className="dark:stroke-zinc-800" />
              <XAxis 
                dataKey="date" 
                stroke="#a1a1aa" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#a1a1aa" 
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Rp ${val >= 1000000 ? (val / 1000000).toFixed(1) + "M" : (val / 1000).toFixed(0) + "k"}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#ffffff", 
                  borderColor: "#e4e4e7",
                  borderRadius: "12px",
                  color: "#09090b",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
                formatter={(val: any) => [formatCurrency(Number(val || 0)), ""]}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
              <Area 
                name="Sales Revenue"
                type="monotone" 
                dataKey="sales" 
                stroke="#d97706" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
              <Area 
                name="Expenses"
                type="monotone" 
                dataKey="expenses" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorExpenses)" 
              />
              <Area 
                name="Waste Cost"
                type="monotone" 
                dataKey="waste" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorWaste)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
