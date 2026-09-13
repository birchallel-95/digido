"use client";

import { useState } from "react";
import Papa from "papaparse";
import { importSkillRows, type ImportRow, type ImportRowResult } from "@/lib/adminActions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const COLUMN_MAP: Record<string, keyof ImportRow> = {
  "capability area": "areaName",
  area: "areaName",
  level: "levelName",
  skill: "title",
  title: "title",
  description: "description",
  outcome: "practicalOutcome",
  "practical outcome": "practicalOutcome",
  "why it matters": "whyItMatters",
  "how to": "howTo",
  "how to do this": "howTo",
  instructions: "howTo",
  "benefit category": "benefitCategory",
  platform: "platform",
  tool: "tool",
  "estimated time": "estimatedTimeMins",
  "resource url": "resourceUrl",
  "image url": "imageUrl",
  "video url": "videoUrl",
};

const REQUIRED_COLUMNS = ["Capability Area", "Level", "Skill"];

type Step = "upload" | "preview" | "done";

export function ImportWizard({ knownAreas, knownLevels }: { knownAreas: string[]; knownLevels: string[] }) {
  const [step, setStep] = useState<Step>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [rowIssues, setRowIssues] = useState<Map<number, string>>(new Map());
  const [results, setResults] = useState<ImportRowResult[] | null>(null);
  const [importing, setImporting] = useState(false);

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const fields = result.meta.fields ?? [];
        setHeaders(fields);

        const missing = REQUIRED_COLUMNS.filter(
          (c) => !fields.some((f) => f.trim().toLowerCase() === c.toLowerCase())
        );
        setMissingColumns(missing);

        const parsedRows: ImportRow[] = result.data.map((raw) => {
          const row: Partial<ImportRow> = {};
          for (const [header, value] of Object.entries(raw)) {
            const key = COLUMN_MAP[header.trim().toLowerCase()];
            if (!key) continue;
            if (key === "estimatedTimeMins") {
              const n = parseInt(value, 10);
              if (!Number.isNaN(n)) row.estimatedTimeMins = n;
            } else {
              (row as Record<string, string>)[key] = value?.trim();
            }
          }
          return row as ImportRow;
        });
        setRows(parsedRows);

        const issues = new Map<number, string>();
        parsedRows.forEach((r, i) => {
          if (!r.title?.trim()) {
            issues.set(i, "Missing skill title");
          } else if (r.areaName && !knownAreas.some((a) => a.toLowerCase() === r.areaName.toLowerCase())) {
            issues.set(i, `Unknown capability area "${r.areaName}"`);
          } else if (r.levelName && !knownLevels.some((l) => l.toLowerCase() === r.levelName.toLowerCase())) {
            issues.set(i, `Unknown level "${r.levelName}"`);
          }
        });
        setRowIssues(issues);
        setStep("preview");
      },
    });
  }

  async function confirmImport() {
    setImporting(true);
    const validRows = rows.filter((_, i) => !rowIssues.has(i));
    const result = await importSkillRows(validRows);
    setResults(result);
    setImporting(false);
    setStep("done");
  }

  if (step === "upload") {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-raised)] p-10 text-center">
        <Icon name="upload" className="h-10 w-10 mx-auto text-[var(--color-ink-faint)] mb-3" />
        <p className="font-medium text-[var(--color-ink)] mb-1">Upload a CSV file</p>
        <p className="text-sm text-[var(--color-ink-muted)] mb-4">
          Expected columns: Capability Area, Level, Skill, Description, Outcome, Why It Matters, How To (steps
          separated by a line break or &quot; | &quot;), Platform (Google, Microsoft, or Both — defaults to Both),
          Benefit Category, Tool, Estimated Time, Resource URL, Image URL, Video URL.
        </p>
        <label className="inline-block">
          <input
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <span className="inline-flex items-center rounded-xl bg-[var(--color-brand)] text-[var(--color-ink)] px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-[var(--color-brand-hover)]">
            Choose file
          </span>
        </label>
      </div>
    );
  }

  if (step === "preview") {
    const errorCount = rowIssues.size;
    return (
      <div className="space-y-4">
        {missingColumns.length > 0 && (
          <div className="rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm px-4 py-3">
            Missing required column{missingColumns.length > 1 ? "s" : ""}: {missingColumns.join(", ")}. Rows can still
            be reviewed below, but import is disabled until headers are fixed.
          </div>
        )}
        <p className="text-sm text-[var(--color-ink-muted)]">
          Found {rows.length} row{rows.length === 1 ? "" : "s"} from columns: {headers.join(", ")}.{" "}
          {errorCount > 0 && <span className="text-[var(--color-danger)]">{errorCount} row{errorCount === 1 ? "" : "s"} will be skipped.</span>}
        </p>
        <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] max-h-96">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--color-ink-faint)] border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface-raised)]">
                <th className="py-2 px-3 font-medium">Area</th>
                <th className="py-2 px-3 font-medium">Level</th>
                <th className="py-2 px-3 font-medium">Skill</th>
                <th className="py-2 px-3 font-medium">Platform</th>
                <th className="py-2 px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2 px-3">{r.areaName}</td>
                  <td className="py-2 px-3">{r.levelName}</td>
                  <td className="py-2 px-3">{r.title}</td>
                  <td className="py-2 px-3 text-[var(--color-ink-faint)]">{r.platform || "Both"}</td>
                  <td className="py-2 px-3">
                    {rowIssues.has(i) ? (
                      <span className="text-[var(--color-danger)]">{rowIssues.get(i)}</span>
                    ) : (
                      <span className="text-[var(--color-success)]">Ready</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <Button onClick={confirmImport} disabled={importing || missingColumns.length > 0 || rows.length === errorCount}>
            {importing ? "Importing…" : `Import ${rows.length - errorCount} skill${rows.length - errorCount === 1 ? "" : "s"}`}
          </Button>
          <Button variant="ghost" onClick={() => setStep("upload")}>
            Choose a different file
          </Button>
        </div>
      </div>
    );
  }

  const created = results?.filter((r) => r.status === "created").length ?? 0;
  const updated = results?.filter((r) => r.status === "updated").length ?? 0;
  const errors = results?.filter((r) => r.status === "error").length ?? 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 text-center">
      <Icon name="check" className="h-10 w-10 mx-auto text-[var(--color-success)] mb-3" />
      <p className="font-semibold text-[var(--color-ink)] mb-1">Import complete</p>
      <p className="text-sm text-[var(--color-ink-muted)] mb-4">
        {created} created · {updated} updated{errors > 0 ? ` · ${errors} failed` : ""}
      </p>
      <Button onClick={() => setStep("upload")}>Import another file</Button>
    </div>
  );
}
