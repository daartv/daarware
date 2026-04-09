"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
// settings hooks available if needed in future
import {
  exportAllData,
  importAllData,
  clearAllData,
  downloadJson,
} from "@/lib/data-transfer";

export default function SettingsPage() {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const date = new Date().toISOString().split("T")[0];
      downloadJson(json, `daarware-backup-${date}.json`);
      setMessage("Data exported successfully");
    } catch {
      setMessage("Export failed");
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setImporting(true);
      try {
        const text = await file.text();
        await importAllData(text);
        setMessage("Data imported successfully");
      } catch (err) {
        setMessage("Import failed: invalid file");
      } finally {
        setImporting(false);
      }
    };
    input.click();
  };

  const handleClear = async () => {
    if (
      confirm(
        "This will delete ALL your data (workouts, PRs, templates). This cannot be undone. Continue?"
      )
    ) {
      await clearAllData();
      setMessage("All data cleared");
    }
  };

  return (
    <div>
      <Header title="Settings" back />

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto pb-4">
        {/* Data Management */}
        <section>
          <h2 className="cyber-heading mb-2">Data Management</h2>
          <div className="space-y-2">
            <button onClick={handleExport} className="cyber-btn w-full">
              Export Data (JSON)
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="cyber-btn w-full"
            >
              {importing ? "Importing..." : "Import Data"}
            </button>
            <button onClick={handleClear} className="cyber-btn cyber-btn-danger w-full">
              Clear All Data
            </button>
          </div>
          {message && (
            <p className="text-xs text-cyber-green mt-2 text-center font-mono">
              {message}
            </p>
          )}
        </section>

        <div className="cyber-divider" />

        {/* About */}
        <section>
          <h2 className="cyber-heading mb-2">About</h2>
          <div className="cyber-card">
            <p className="text-sm font-bold text-cyber-cyan">DaarWare</p>
            <p className="text-xs text-cyber-text-muted mt-1">
              Cyberpunk strength training tracker
            </p>
            <p className="text-xs text-cyber-text-muted mt-0.5">
              by Daartv
            </p>
          </div>
        </section>

        <div className="cyber-divider" />

        {/* PWA Install Instructions */}
        <section>
          <h2 className="cyber-heading mb-2">Install App</h2>
          <div className="cyber-card text-xs text-cyber-text-muted space-y-2">
            <p>
              <span className="text-cyber-yellow font-semibold">Android:</span>{" "}
              Open in Chrome &rarr; Menu (&vellip;) &rarr; &quot;Add to Home
              screen&quot;
            </p>
            <p>
              <span className="text-cyber-yellow font-semibold">iOS:</span>{" "}
              Open in Safari &rarr; Share button &rarr; &quot;Add to Home
              Screen&quot;
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
