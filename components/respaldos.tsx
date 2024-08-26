'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

        {submitMessage && (
          <Alert variant={submitMessage.includes("Error") ? "destructive" : "default"}>
            <AlertDescription>{submitMessage}</AlertDescription>
          </Alert>
        )}
      </form>
    </Form>
  )
}






'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, ArrowUpIcon, RefreshCcwIcon, DownloadIcon, SearchIcon, FilterIcon } from 'lucide-react'
import { createClient } from "@/utils/supabase/client"
import AuthButton from "@/components/AuthButton"
import ReportSelector from "@/components/ReportSelector"

// Define the Incident type based on your Supabase table structure
type Incident = {
  id: number
  incident_type_id: number
  description: string
  fecha_incidente: string
  tipo_incidente: string
  nombre_colaborador: string
  region_inc: number
  sucursal_inc: number
  status: string
  reported_at: string
  registrable: boolean
}

export default function ProtectedPage() {
  const [activeTab, setActiveTab] = useState('incidents')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [incidentStats, setIncidentStats] = useState({
    totalIncidents: 0,
    averageResponseTime: 0,
    severityRate: 0,
    activeIncidents: 0,
  })

  useEffect(() => {
    fetchIncidents()
    fetchIncidentStats()
  }, [])

  const fetchIncidents = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('reported_at', { ascending: false })
    
    console.log('Fetched incidents:', data)
    console.log('Fetch error:', error)
  
    if (error) {
      console.error('Error fetching incidents:', error)
    } else {
      setIncidents(data || [])
    }
  }

  const fetchIncidentStats = async () => {
    const supabase = createClient()
    const { count: totalCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true })
    const { count: activeCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'Abierto')
    
    // Calculate average response time (placeholder logic)
    const { data: responseTimeData } = await supabase
      .from('incidents')
      .select('reported_at, resolved_at')
      .not('resolved_at', 'is', null)
    
    const averageResponseTime = responseTimeData
      ? responseTimeData.reduce((acc, inc) => {
          const responseTime = new Date(inc.resolved_at).getTime() - new Date(inc.reported_at).getTime()
          return acc + responseTime / (1000 * 60 * 60) // Convert to hours
        }, 0) / responseTimeData.length
      : 0

    // Calculate severity rate (placeholder logic)
    const { data: severityData } = await supabase
      .from('incidents')
      .select('severity')
    
    const severityRate = severityData
      ? severityData.reduce((acc, inc) => acc + (inc.severity || 0), 0) / severityData.length
      : 0

    setIncidentStats({
      totalIncidents: totalCount || 0,
      averageResponseTime: Number(averageResponseTime.toFixed(2)),
      severityRate: Number(severityRate.toFixed(2)),
      activeIncidents: activeCount || 0,
    })
  }

  const toggleIncidentStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Validado' ? 'Pendiente' : 'Validado'
    const supabase = createClient()
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating incident status:', error)
    } else {
      fetchIncidents()
    }
  }

  const filteredIncidents = incidents.filter(incident => 
    (incident.nombre_colaborador.toLowerCase().includes(searchTerm.toLowerCase()) ||
     incident.tipo_incidente.toLowerCase().includes(searchTerm.toLowerCase()) ||
     incident.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === '' || incident.status === statusFilter)
  )

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Panel de Observabilidad de Incidentes</h1>
        <div className="flex flex-col items-end space-y-2">
          <AuthButton />
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={fetchIncidents}>
              <RefreshCcwIcon className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Incidentes</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.totalIncidents}</div>
            <p className="text-xs text-muted-foreground">+5% desde la última hora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Respuesta Promedio</CardTitle>
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.averageResponseTime} horas</div>
            <p className="text-xs text-muted-foreground">-10% desde ayer</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Severidad</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.severityRate}</div>
            <p className="text-xs text-muted-foreground">+2% desde la semana pasada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidentes Activos</CardTitle>
            <ArrowUpIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">+3 desde ayer</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Incidentes Recientes</CardTitle>
            <div className="space-x-2">
              <Button
                variant={activeTab === 'incidents' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('incidents')}
              >
                Incidentes
              </Button>
              <Button
                variant={activeTab === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('analytics')}
              >
                Análisis
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'incidents' && (
            <>
              <div className="flex justify-between mb-4">
                <div className="relative w-64">
                  <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar incidentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Abierto">Abierto</SelectItem>
                      <SelectItem value="En Progreso">En Progreso</SelectItem>
                      <SelectItem value="Resuelto">Resuelto</SelectItem>
                      <SelectItem value="En Revisión">En Revisión</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Registrable</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>{new Date(incident.fecha_incidente).toLocaleDateString()}</TableCell>
                      <TableCell>{incident.nombre_colaborador}</TableCell>
                      <TableCell>{incident.tipo_incidente}</TableCell>
                      <TableCell>Region {incident.region_inc}, Sucursal {incident.sucursal_inc}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.registrable ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {incident.registrable ? 'Registrable' : 'No Registrable'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => toggleIncidentStatus(incident.id, incident.status)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            incident.status === 'Validado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {incident.status === 'Validado' ? 'Validado' : 'Pendiente'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
          {activeTab === 'analytics' && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Análisis de incidentes no implementado aún.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Reportar Incidente o Colisión</h2>
        <ReportSelector />
      </div>
    </div>
  )
}