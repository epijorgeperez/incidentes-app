"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function IncidentForm() {
  const [formData, setFormData] = useState({
    sucursal: "",
    subproceso: "",
    tipo_incidente: "",
    fecha: "",
    dias_incapacidad: "",
    atencion_imss: false,
    report: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, report: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const supabase = createClient();

    try {
      // First, insert the incident data
      const { data, error } = await supabase
        .from('incidentes')
        .insert([
          {
            sucursal: formData.sucursal,
            subproceso: formData.subproceso,
            tipo_incidente: formData.tipo_incidente,
            fecha: formData.fecha,
            dias_incapacidad: parseInt(formData.dias_incapacidad),
            atencion_imss: formData.atencion_imss,
          }
        ])
        .select();

      if (error) throw error;

      // If there's a report file, upload it
      if (formData.report) {
        const fileExt = formData.report.name.split('.').pop();
        const fileName = `${data[0].id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase
          .storage
          .from('incident-reports')
          .upload(fileName, formData.report);

        if (uploadError) throw uploadError;

        // Update the incident record with the file path
        const { error: updateError } = await supabase
          .from('incidentes')
          .update({ report_file: fileName })
          .eq('id', data[0].id);

        if (updateError) throw updateError;
      }

      setSubmitMessage("Incident report submitted successfully!");
      // Reset form
      setFormData({
        sucursal: "",
        subproceso: "",
        tipo_incidente: "",
        fecha: "",
        dias_incapacidad: "",
        atencion_imss: false,
        report: null,
      });
    } catch (error: any) {
      console.error('Error submitting incident report:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      if (error.code) {
        errorMessage += ` (Code: ${error.code})`;
      }
      
      if (error.details) {
        errorMessage += ` Details: ${error.details}`;
      }
      
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Report an Incident</h3>
      
      <div>
        <label htmlFor="sucursal" className="block text-sm font-medium text-gray-700">Sucursal</label>
        <input type="text" id="sucursal" name="sucursal" value={formData.sucursal} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>

      <div>
        <label htmlFor="subproceso" className="block text-sm font-medium text-gray-700">Subproceso</label>
        <input type="text" id="subproceso" name="subproceso" value={formData.subproceso} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>

      <div>
        <label htmlFor="tipo_incidente" className="block text-sm font-medium text-gray-700">Tipo de Incidente</label>
        <input type="text" id="tipo_incidente" name="tipo_incidente" value={formData.tipo_incidente} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>

      <div>
        <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
        <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>

      <div>
        <label htmlFor="dias_incapacidad" className="block text-sm font-medium text-gray-700">Días de Incapacidad</label>
        <input type="number" id="dias_incapacidad" name="dias_incapacidad" value={formData.dias_incapacidad} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
      </div>

      <div>
        <label className="flex items-center">
          <input type="checkbox" name="atencion_imss" checked={formData.atencion_imss} onChange={handleChange} className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
          <span className="ml-2 text-sm text-gray-700">Atención IMSS</span>
        </label>
      </div>

      <div>
        <label htmlFor="report" className="block text-sm font-medium text-gray-700">Upload Report</label>
        <input type="file" id="report" name="report" onChange={handleFileChange} className="mt-1 block w-full" />
      </div>

      <div>
        <button 
          type="submit" 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Incident Report"}
        </button>
      </div>

      {submitMessage && (
        <div className={`mt-4 text-center ${submitMessage.includes("Error") ? "text-red-600" : "text-green-600"}`}>
          {submitMessage}
        </div>
      )}
    </form>
  );
}