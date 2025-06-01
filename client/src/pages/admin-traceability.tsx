import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, Download, Activity, Users, FileText } from 'lucide-react';

interface EventLogEntry {
  id: string;
  tracking_code?: string;
  user_id?: string;
  user_role?: 'patient' | 'doctor' | 'admin';
  event_type: string;
  event_payload: Record<string, any>;
  timestamp: string;
}

interface EventStats {
  total_events: number;
  event_types: Record<string, number>;
  user_activity: Record<string, number>;
  tracking_codes: number;
  date_range: {
    oldest: string | null;
    newest: string | null;
  };
}

export default function AdminTraceabilityPage() {
  const [filters, setFilters] = useState({
    tracking_code: '',
    user_id: '',
    event_type: '',
    limit: 100,
    offset: 0
  });

  const [exportFilters, setExportFilters] = useState({
    tracking_code: '',
    user_id: '',
    event_type: '',
    date_from: '',
    date_to: ''
  });

  // Fetch events based on current filters
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['admin-events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      
      const response = await fetch(`/api/admin/events?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      return response.json();
    }
  });

  // Fetch event statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-events-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/events/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch event stats');
      }
      return response.json();
    }
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/events/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exportFilters)
      });
      
      if (!response.ok) {
        throw new Error('Failed to export events');
      }
      
      const data = await response.json();
      
      // Create downloadable CSV
      const csv = generateCSV(data.events);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-log-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const generateCSV = (events: EventLogEntry[]) => {
    const headers = ['ID', 'Timestamp', 'Event Type', 'Tracking Code', 'User ID', 'User Role', 'Event Data'];
    const rows = events.map(event => [
      event.id,
      event.timestamp,
      event.event_type,
      event.tracking_code || '',
      event.user_id || '',
      event.user_role || '',
      JSON.stringify(event.event_payload)
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  };

  const formatEventType = (eventType: string) => {
    return eventType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('error') || eventType.includes('failed')) return 'destructive';
    if (eventType.includes('created') || eventType.includes('confirmed')) return 'default';
    if (eventType.includes('access')) return 'secondary';
    return 'outline';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Trazabilidad</h1>
          <p className="text-gray-600">Panel de administración para consulta y análisis de eventos del sistema</p>
        </div>

        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filtros de Búsqueda</CardTitle>
                <CardDescription>
                  Filtra los eventos por código de seguimiento, usuario o tipo de evento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Código de Seguimiento</label>
                    <Input
                      placeholder="TRK-..."
                      value={filters.tracking_code}
                      onChange={(e) => handleFilterChange('tracking_code', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">ID de Usuario</label>
                    <Input
                      placeholder="123"
                      value={filters.user_id}
                      onChange={(e) => handleFilterChange('user_id', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
                    <Select
                      value={filters.event_type}
                      onValueChange={(value) => handleFilterChange('event_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        <SelectItem value="tracking_access">Acceso a Seguimiento</SelectItem>
                        <SelectItem value="patient_visit_confirmed">Visita Confirmada</SelectItem>
                        <SelectItem value="appointment_created">Cita Creada</SelectItem>
                        <SelectItem value="patient_review_submitted">Reseña Enviada</SelectItem>
                        <SelectItem value="complaint_created">Queja Creada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => refetchEvents()} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registro de Eventos</CardTitle>
                <CardDescription>
                  {eventsData?.total || 0} eventos encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="text-center py-8">Cargando eventos...</div>
                ) : (
                  <div className="space-y-4">
                    {eventsData?.events?.map((event: EventLogEntry) => (
                      <div key={event.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={getEventTypeColor(event.event_type)}>
                              {formatEventType(event.event_type)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(event.timestamp).toLocaleString('es-ES')}
                            </span>
                          </div>
                          {event.tracking_code && (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {event.tracking_code}
                            </code>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {event.user_id && (
                            <div>
                              <span className="font-medium text-gray-700">Usuario:</span>
                              <span className="ml-2">{event.user_id} ({event.user_role})</span>
                            </div>
                          )}
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Datos del evento:</span>
                            <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                              {JSON.stringify(event.event_payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            {statsLoading ? (
              <div className="text-center py-8">Cargando estadísticas...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsData?.total_events || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Códigos de Seguimiento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{statsData?.tracking_codes || 0}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Object.keys(statsData?.user_activity || {}).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Tipos de Evento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Object.keys(statsData?.event_types || {}).length}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Eventos por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(statsData?.event_types || {}).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm">{formatEventType(type)}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Eventos</CardTitle>
                <CardDescription>
                  Configura los filtros y exporta los eventos a CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Código de Seguimiento</label>
                    <Input
                      placeholder="TRK-..."
                      value={exportFilters.tracking_code}
                      onChange={(e) => setExportFilters(prev => ({ ...prev, tracking_code: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">ID de Usuario</label>
                    <Input
                      placeholder="123"
                      value={exportFilters.user_id}
                      onChange={(e) => setExportFilters(prev => ({ ...prev, user_id: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
                    <Select
                      value={exportFilters.event_type}
                      onValueChange={(value) => setExportFilters(prev => ({ ...prev, event_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los tipos</SelectItem>
                        <SelectItem value="tracking_access">Acceso a Seguimiento</SelectItem>
                        <SelectItem value="patient_visit_confirmed">Visita Confirmada</SelectItem>
                        <SelectItem value="appointment_created">Cita Creada</SelectItem>
                        <SelectItem value="patient_review_submitted">Reseña Enviada</SelectItem>
                        <SelectItem value="complaint_created">Queja Creada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha Desde</label>
                    <Input
                      type="date"
                      value={exportFilters.date_from}
                      onChange={(e) => setExportFilters(prev => ({ ...prev, date_from: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fecha Hasta</label>
                    <Input
                      type="date"
                      value={exportFilters.date_to}
                      onChange={(e) => setExportFilters(prev => ({ ...prev, date_to: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar a CSV
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}