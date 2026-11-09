"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community";
import { LedgerEntry } from "@/lib/types/domain";
import {
  COVERAGE_CHANNELS,
  COVERAGE_TERRITORIES,
  buildRightsCoverageMatrix,
} from "@/lib/analytics/coverage-matrix";
import {
  TableProperties,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  PieChart,
  Filter,
} from "lucide-react";

// Register AG Grid Community modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface Props {
  initialLedger: LedgerEntry[];
  initialStats: {
    grossRevenue: number;
    activeLicenses: number;
    totalAssets: number;
    inquiriesProcessed: number;
  };
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export function ControlRoomView({ initialLedger, initialStats }: Props) {
  const [ledger] = useState<LedgerEntry[]>(initialLedger);
  const [quickFilter, setQuickFilter] = useState("");
  const [provenanceFilter, setProvenanceFilter] = useState<string>("ALL");
  const [selectedCell, setSelectedCell] = useState<{ channel: string; territory: string; count: number } | null>(null);

  // Filtered rows for grid and metrics
  const filteredLedger = useMemo(() => {
    if (provenanceFilter === "ALL") return ledger;
    return ledger.filter((entry) => entry.provenance === provenanceFilter);
  }, [ledger, provenanceFilter]);

  // Provenance revenue breakdown
  const revenueBreakdown = useMemo(() => {
    let liveRevenue = 0;
    let fixtureRevenue = 0;
    let seededRevenue = 0;

    for (const entry of ledger) {
      const amount = typeof entry.amountUsd === "number" ? entry.amountUsd : parseFloat(entry.amountUsd) || 0;
      if (entry.provenance === "LIVE_SANDBOX") {
        liveRevenue += amount;
      } else if (entry.provenance === "FIXTURE") {
        fixtureRevenue += amount;
      } else {
        seededRevenue += amount;
      }
    }

    return { liveRevenue, fixtureRevenue, seededRevenue };
  }, [ledger]);

  // Column definitions for AG Grid Community
  const colDefs = useMemo<ColDef<LedgerEntry>[]>(
    () => [
      {
        field: "timestamp",
        headerName: "Settled At (UTC)",
        width: 170,
        sort: "desc",
        valueFormatter: (p) => {
          if (!p.value) return "";
          return new Date(p.value).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        field: "assetTitle",
        headerName: "Licensed Asset",
        width: 200,
        cellRenderer: (p: ICellRendererParams<LedgerEntry>) => {
          if (!p.data) return null;
          return (
            <Link
              href={`/assets/${p.data.assetId}`}
              className="text-[#1769E0] font-semibold hover:underline flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#1769E0]"
            >
              <span>{p.value}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          );
        },
      },
      {
        field: "licenseTier",
        headerName: "Policy Tier",
        width: 170,
        cellRenderer: (p: ICellRendererParams) => {
          const val = p.value || "";
          const isCommercial = val.toLowerCase().includes("commercial");
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold ${
                isCommercial
                  ? "bg-[#EDF7F2] text-[#16805B] border border-[#C6E6D6]"
                  : "bg-[#F1EFEA] text-[#475569] border border-[#E4E2DB]"
              }`}
            >
              {val}
            </span>
          );
        },
      },
      {
        field: "amountUsd",
        headerName: "Gross (USD)",
        width: 130,
        valueFormatter: (p) => {
          const num = typeof p.value === "number" ? p.value : parseFloat(p.value);
          return isNaN(num) ? "$0.00" : usdFormatter.format(num);
        },
        cellClass: "font-mono font-bold text-[#091A2A]",
      },
      {
        field: "channel",
        headerName: "Channels Granted",
        width: 180,
      },
      {
        field: "territory",
        headerName: "Territories",
        width: 160,
      },
      {
        field: "paypalCaptureId",
        headerName: "PayPal Capture ID",
        width: 190,
        cellClass: "font-mono text-xs text-[#475569]",
      },
      {
        field: "receiptHash",
        headerName: "SHA-256 Digest",
        width: 210,
        cellRenderer: (p: ICellRendererParams<LedgerEntry>) => {
          if (!p.value) return null;
          const shortHash = p.value.slice(0, 14) + "…";
          return (
            <Link
              href={`/receipt/verify`}
              className="font-mono text-[11px] text-[#1769E0] hover:underline flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-[#1769E0]"
              title="Click to independently verify on receipt inspector"
            >
              <ShieldCheck className="w-3 h-3 text-[#16805B]" />
              <span>{shortHash}</span>
            </Link>
          );
        },
      },
      {
        field: "provenance",
        headerName: "Provenance",
        width: 150,
        cellRenderer: (p: ICellRendererParams) => {
          const val = p.value || "SEEDED";
          const isLive = val === "LIVE_SANDBOX";
          const isFixture = val === "FIXTURE";
          return (
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isLive
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : isFixture
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}
            >
              {val}
            </span>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: (p: ICellRendererParams) => (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16805B]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16805B]" />
            <span>{p.value}</span>
          </span>
        ),
      },
    ],
    []
  );

  // Default Column Config
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  // Compute Data for the Rights Coverage Matrix Widget using strictly isolated matching
  const coverageMatrix = useMemo(() => {
    return buildRightsCoverageMatrix(filteredLedger);
  }, [filteredLedger]);

  return (
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1769E0] mb-1">
            <TableProperties className="w-4 h-4" />
            <span>AG Grid Community Creator Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-[#091A2A] tracking-tight">
            Creator Rights & Revenue Control Room
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Audited transaction ledger, machine-negotiated licenses, and global rights distribution telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#475569] bg-[#F1EFEA] border border-[#E4E2DB] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16805B]" />
            <span>Persistent SQLite Ledger</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Gross Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#16805B]" />
          </div>
          <span className="text-2xl font-black text-[#091A2A] block">
            {usdFormatter.format(initialStats.grossRevenue)}
          </span>
          <div className="text-[11px] text-[#475569] border-t border-[#F1EFEA] pt-1.5 space-y-0.5">
            <div className="flex justify-between">
              <span className="text-emerald-700 font-semibold">Live Sandbox:</span>
              <span className="font-mono">{usdFormatter.format(revenueBreakdown.liveRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700 font-semibold">Fixture:</span>
              <span className="font-mono">{usdFormatter.format(revenueBreakdown.fixtureRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Seeded:</span>
              <span className="font-mono">{usdFormatter.format(revenueBreakdown.seededRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Active Rights Granted</span>
            <ShieldCheck className="w-4 h-4 text-[#1769E0]" />
          </div>
          <span className="text-2xl font-black text-[#091A2A] block">
            {initialStats.activeLicenses}
          </span>
          <span className="text-[11px] text-[#64748B] font-medium">
            Across {initialStats.totalAssets} protected works
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Agent Inquiries</span>
            <Cpu className="w-4 h-4 text-[#9333EA]" />
          </div>
          <span className="text-2xl font-black text-[#091A2A] block">
            {initialStats.inquiriesProcessed}
          </span>
          <span className="text-[11px] text-[#64748B] font-medium">
            Fact-Quarantined Extractions
          </span>
        </div>

        <div className="p-5 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span>Settlement Rail</span>
            <Layers className="w-4 h-4 text-[#D97706]" />
          </div>
          <span className="text-2xl font-black text-[#091A2A] block">
            PayPal Orders v2
          </span>
          <span className="text-[11px] text-[#16805B] font-semibold">
            Integer Minor Cents & SHA-256
          </span>
        </div>
      </div>

      {/* Rights Coverage Matrix */}
      <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#1769E0]" />
              <h2 className="font-extrabold text-base text-[#091A2A]">
                Rights Coverage Matrix
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Visualizes cross-territory channel saturation from machine-cleared agent licenses.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
              <span className="text-[#64748B]">0 (Unlicensed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
              <span className="text-[#16805B] font-medium">Active Coverage</span>
            </div>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" aria-label="Global Rights Coverage Matrix">
            <thead>
              <tr className="border-b border-[#E4E2DB]">
                <th scope="col" className="text-left py-2.5 px-3 font-bold text-[#64748B] uppercase tracking-wider text-[11px] bg-[#F8FAFC]">
                  Channel \ Region
                </th>
                {COVERAGE_TERRITORIES.map((t) => (
                  <th scope="col" key={t} className="text-center py-2.5 px-3 font-bold text-[#091A2A] bg-[#F8FAFC]">
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COVERAGE_CHANNELS.map((ch) => (
                <tr key={ch} className="border-b border-[#F1EFEA] hover:bg-[#FBFBFA]">
                  <th scope="row" className="py-2.5 px-3 font-semibold text-[#091A2A] text-left">
                    {ch}
                  </th>
                  {COVERAGE_TERRITORIES.map((t) => {
                    const count = coverageMatrix[ch]?.[t] || 0;
                    const isActive = count > 0;
                    return (
                      <td
                        key={t}
                        onClick={() => setSelectedCell({ channel: ch, territory: t, count })}
                        className={`text-center py-2.5 px-3 cursor-pointer transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-[#16805B] font-bold hover:bg-emerald-100 border border-emerald-200/50"
                            : "bg-slate-50/50 text-slate-400 hover:bg-slate-100/50"
                        }`}
                      >
                        {isActive ? `✓ ${count} active` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCell && (
          <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#475569] flex items-center justify-between">
            <span>
              Selected: <strong>{selectedCell.channel}</strong> in <strong>{selectedCell.territory}</strong> — {selectedCell.count} active machine clearances.
            </span>
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              className="text-[#1769E0] font-semibold hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* AG Grid Transaction Audit Table */}
      <div className="p-6 rounded-xl bg-white border border-[#E4E2DB] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-extrabold text-base text-[#091A2A]">
              Full Transaction Audit Ledger
            </h2>
            <p className="text-xs text-[#64748B]">
              Every machine-negotiated license, server-held price, and cryptographic hash recorded in persistent SQLite.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Provenance Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F1EFEA] p-1 rounded-lg border border-[#E4E2DB] text-xs font-semibold">
              <Filter className="w-3.5 h-3.5 text-[#64748B] ml-1.5" />
              {(["ALL", "LIVE_SANDBOX", "FIXTURE", "SEEDED"] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setProvenanceFilter(prov)}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                    provenanceFilter === prov
                      ? "bg-white text-[#091A2A] shadow-sm font-bold"
                      : "text-[#64748B] hover:text-[#091A2A]"
                  }`}
                >
                  {prov === "ALL" ? "All" : prov}
                </button>
              ))}
            </div>

            {/* Quick Filter Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="text"
                id="control-room-search"
                name="controlRoomSearch"
                aria-label="Filter transaction ledger"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Search asset, hash, channel..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs text-[#091A2A] focus:outline-none focus:ring-2 focus:ring-[#1769E0]"
              />
            </div>
          </div>
        </div>

        {/* AG Grid Container */}
        <div className="ag-theme-quartz w-full h-[400px] rounded-lg overflow-hidden border border-[#E4E2DB]">
          <AgGridReact<LedgerEntry>
            rowData={filteredLedger}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            quickFilterText={quickFilter}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            animateRows={true}
          />
        </div>
      </div>
    </main>
  );
}
