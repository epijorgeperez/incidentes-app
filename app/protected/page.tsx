'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowDownIcon, ArrowUpIcon, RefreshCcwIcon, DownloadIcon, SearchIcon, FilterIcon } from 'lucide-react'
import { createClient } from "@/utils/supabase/client"
import AuthButton from "@/components/AuthButton"
import ReportSelector from "@/components/ReportSelector"

type Incident = {
  id: number
  incident_type_id: number
  description: string
  fecha_incidente: string
  tipo_incidente: string
  nombre_colaborador: string
  region_inc: number
  sucursal_inc: number
  status: 'Pendiente' | 'Validado'
  reported_at: string
  registrable: boolean
}

export default function ProtectedPage() {
  const [activeTab, setActiveTab] = useState('incidents')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [incidentStats, setIncidentStats] = useState({
    totalIncidents: 0,
    averageResponseTime: 0,
    severityRate: 0,
    activeIncidents: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
    fetchIncidentStats()
  }, [])

  const fetchIncidents = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('reported_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching incidents:', error)
    } else {
      setIncidents(data || [])
    }
    setIsLoading(false)
  }

  const fetchIncidentStats = async () => {
    const supabase = createClient()
    const { count: totalCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true })
    const { count: activeCount } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'Pendiente')
    
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

  const toggleIncidentStatus = async (id: number, currentStatus: 'Pendiente' | 'Validado') => {
    const newStatus = currentStatus === 'Validado' ? 'Pendiente' : 'Validado'
    const supabase = createClient()
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating incident status:', error)
    } else {
      setIncidents(incidents.map(incident => 
        incident.id === id ? { ...incident, status: newStatus } : incident
      ))
    }
  }

  const filteredIncidents = incidents.filter(incident => 
    (incident.nombre_colaborador.toLowerCase().includes(searchTerm.toLowerCase()) ||
     incident.tipo_incidente.toLowerCase().includes(searchTerm.toLowerCase()) ||
     incident.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === undefined || incident.status === statusFilter)
  )

  const handleExport = () => {
    // Implement export functionality
    console.log('Export functionality not implemented yet')
  }

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
            <Button variant="outline" size="sm" onClick={handleExport}>
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
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Validado">Validado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <FilterIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {isLoading ? (
                <div className="text-center py-4">Cargando incidentes...</div>
              ) : (
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
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={incident.status === 'Validado'}
                              onCheckedChange={() => toggleIncidentStatus(incident.id, incident.status)}
                            />
                            <span className={`text-sm font-medium ${
                              incident.status === 'Validado' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                              {incident.status}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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