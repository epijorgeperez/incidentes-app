'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/client"

type FormData = {
  incident_type_id: string
  description: string
  fecha_incidente: string
  tipo_incidente: string
  probabilidad_pot: string
  severidad_pot: string
  criterio_sifp: string
  nombre_colaborador: string
  region_inc: string
  sucursal_inc: string
  proceso: string
  subproceso_inc: string
  sub_subproceso: string
  dias_incapacidad: string
  mecanismo: string
  otros: string
  parte_afectada: string
  dentro_fuera: boolean
  interno_imss: boolean
  resumen: string
  conclusion: string
  ko: string
  registrable: boolean
}

export default function IncidentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [evidenciaFoto, setEvidenciaFoto] = useState<File | null>(null)
  const [evidenciaDoc, setEvidenciaDoc] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<FormData>({
    defaultValues: {
      incident_type_id: "",
      description: "",
      fecha_incidente: "",
      tipo_incidente: "",
      probabilidad_pot: "",
      severidad_pot: "",
      criterio_sifp: "",
      nombre_colaborador: "",
      region_inc: "",
      sucursal_inc: "",
      proceso: "",
      subproceso_inc: "",
      sub_subproceso: "",
      dias_incapacidad: "",
      mecanismo: "",
      otros: "",
      parte_afectada: "",
      dentro_fuera: false,
      interno_imss: false,
      resumen: "",
      conclusion: "",
      ko: "",
      registrable: false,
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleFileUpload = async (incidentId: number, file: File, fieldName: string) => {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${incidentId}-${fieldName}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase
      .storage
      .from('incident-reports')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { error: updateError } = await supabase
      .from('incidents')
      .update({ [fieldName]: fileName })
      .eq('id', incidentId)

    if (updateError) throw updateError
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setSubmitMessage(null)

    const supabase = createClient()

    try {
      const { data: insertedData, error } = await supabase
        .from('incidents')
        .insert([
          {
            ...data,
            incident_type_id: parseInt(data.incident_type_id),
            region_inc: parseInt(data.region_inc),
            sucursal_inc: parseInt(data.sucursal_inc),
            proceso: parseInt(data.proceso),
            subproceso_inc: parseInt(data.subproceso_inc),
            dias_incapacidad: parseInt(data.dias_incapacidad),
          }
        ])
        .select()

      if (error) throw error

      if (insertedData && insertedData[0]) {
        if (evidenciaFoto) {
          await handleFileUpload(insertedData[0].id, evidenciaFoto, 'evidencia_foto_inc')
        }
        if (evidenciaDoc) {
          await handleFileUpload(insertedData[0].id, evidenciaDoc, 'evidencia_doc_inc')
        }
      }

      setSubmitMessage("Incident report submitted successfully!")
      form.reset()
      setEvidenciaFoto(null)
      setEvidenciaDoc(null)
    } catch (error: any) {
      console.error('Error submitting incident report:', error)
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      if (error.code) {
        errorMessage += ` (Code: ${error.code})`
      }
      
      if (error.details) {
        errorMessage += ` Details: ${error.details}`
      }
      
      setSubmitMessage(errorMessage)
    } finally {
      setIsSubmitting(false)
      setIsDialogOpen(true)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="incident_type_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Type</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fecha_incidente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha Incidente</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo_incidente"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo Incidente</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="probabilidad_pot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Probabilidad POT</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severidad_pot"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severidad POT</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="criterio_sifp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Criterio SIFP</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nombre_colaborador"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Colaborador</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="region_inc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Region</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sucursal_inc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sucursal</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="proceso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proceso</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subproceso_inc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subproceso</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_subproceso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub Subproceso</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dias_incapacidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Días Incapacidad</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mecanismo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mecanismo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="otros"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Otros</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parte_afectada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parte Afectada</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dentro_fuera"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Dentro/Fuera</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interno_imss"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Interno IMSS</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resumen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resumen</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conclusion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conclusión</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ko"
          render={({ field }) => (
            <FormItem>
              <FormLabel>KO</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Evidencia Foto</FormLabel>
          <FormControl>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, setEvidenciaFoto)}
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Evidencia Documento</FormLabel>
          <FormControl>
            <Input
              type="file"
              onChange={(e) => handleFileChange(e, setEvidenciaDoc)}
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="registrable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Registrable</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Guardar Incidente"}
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{submitMessage?.includes("Error") ? "Error" : "Success"}</DialogTitle>
            <DialogDescription>
              {submitMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  )
}