"use client";

import { useState } from "react";
import IncidentForm from "./IncidentForm";
import CollisionForm from "./CollisionForm";

export default function ReportSelector() {
  const [selectedReport, setSelectedReport] = useState<"incident" | "collision" | null>(null);

  return (
    <div>
      {!selectedReport ? (
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Select the type of report:</h3>
          <div className="space-x-4">
            <button
              onClick={() => setSelectedReport("incident")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Report Incident
            </button>
            <button
              onClick={() => setSelectedReport("collision")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Report Collision
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedReport(null)}
            className="mb-4 text-blue-500 hover:text-blue-600"
          >
            ← Back to selection
          </button>
          {selectedReport === "incident" ? <IncidentForm /> : <CollisionForm />}
        </div>
      )}
    </div>
  );
}