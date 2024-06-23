import { clear } from "console";
import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export const Reports = ({ reports, removeReports }: { reports: string, removeReports: () => void }) => {
  const [error, setError] = useState<string | null>(null);

  const [parsedReports, setParsedReports] = useState<string[]>([]);

  useEffect(() => {
    if (!reports) {
      return;
    }

    try {
      const parsed = JSON.parse(reports);
      setParsedReports(parsed);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setError("Invalid JSON reports: " + e.message);
      }
    }
  }, [reports]);

  if (!reports) {
    return <div>
      <h1>no reports</h1>
    </div>
  }


  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      <h1>Reports</h1>
      <ul>
        {parsedReports.map((report: any, i: React.Key | null | undefined) => (
          <Report key={i} report={report} />
        ))}
      </ul>
      <button onClick={removeReports} type="button" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
        Clear reports
      </button>
    </div>
  );
}

const Report = ({ report }: { report: any }) => {
  return (
    <div className="border p-4 my-4 rounded-lg overflow-auto">
      <pre>{JSON.stringify(report, null, 2)}</pre>
    </div>
  );
}
