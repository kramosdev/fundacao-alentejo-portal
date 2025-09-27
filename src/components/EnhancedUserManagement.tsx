import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, Clock, User, Mail } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface PendingRegistration {
  id: string;
  email: string;
  full_name: string;
  requested_role: string;
  status: string;
  created_at: string;
}

interface Department {
  id: string;
  name: string;
}

export function EnhancedUserManagement() {
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('colaborador');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRegistrations();
    fetchDepartments();
  }, []);

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRegistrations(data || []);
    } catch (error: any) {
      console.error('Error fetching pending registrations:', error);
      toast({
        title: "Erro ao carregar registos pendentes",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleApproveRegistration = async () => {
    if (!selectedRegistration) return;

    try {
      setLoading(true);
      
      // Call the approve function
      const { data, error } = await supabase.rpc('approve_user_registration', {
        registration_id: selectedRegistration.id,
        assigned_role: selectedRole,
        assigned_department: selectedDepartment || null
      });

      if (error) throw error;

      toast({
        title: "Registo aprovado",
        description: `O registo de ${selectedRegistration.full_name} foi aprovado com sucesso`,
      });

      // Refresh the list
      await fetchPendingRegistrations();
      setOpenApprovalDialog(false);
      setSelectedRegistration(null);
      setSelectedRole('colaborador');
      setSelectedDepartment('');

    } catch (error: any) {
      console.error('Error approving registration:', error);
      toast({
        title: "Erro ao aprovar registo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRegistration = async (registration: PendingRegistration) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('pending_registrations')
        .update({ 
          status: 'rejected',
          rejection_reason: 'Rejeitado pela administração',
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', registration.id);

      if (error) throw error;

      toast({
        title: "Registo rejeitado",
        description: `O registo de ${registration.full_name} foi rejeitado`,
        variant: "destructive"
      });

      await fetchPendingRegistrations();

    } catch (error: any) {
      console.error('Error rejecting registration:', error);
      toast({
        title: "Erro ao rejeitar registo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    'colaborador': 'Colaborador',
    'DGIEA': 'DGIEA',
    'direcao': 'Direção',
    'admin': 'Administrador'
  };

  return (
    <div className="space-y-6">
      <Card className="portal-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Registos Pendentes de Aprovação
          </CardTitle>
          <CardDescription>
            Gerir novos utilizadores que solicitaram acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Não há registos pendentes de aprovação</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo Solicitado</TableHead>
                    <TableHead>Data de Solicitação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.full_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {registration.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {roleLabels[registration.requested_role as keyof typeof roleLabels] || registration.requested_role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(registration.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={openApprovalDialog && selectedRegistration?.id === registration.id} onOpenChange={(open) => {
                            setOpenApprovalDialog(open);
                            if (!open) {
                              setSelectedRegistration(null);
                              setSelectedRole('colaborador');
                              setSelectedDepartment('');
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSelectedRegistration(registration);
                                  setSelectedRole(registration.requested_role);
                                }}
                                className="h-8"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprovar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Aprovar Registo de {registration.full_name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Cargo</label>
                                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="colaborador">Colaborador</SelectItem>
                                      <SelectItem value="DGIEA">DGIEA</SelectItem>
                                      <SelectItem value="direcao">Direção</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Departamento (Opcional)</label>
                                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um departamento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="">Nenhum departamento</SelectItem>
                                      {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.name}>
                                          {dept.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setOpenApprovalDialog(false)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleApproveRegistration}
                                    disabled={loading}
                                  >
                                    {loading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    ) : (
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Aprovar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectRegistration(registration)}
                            disabled={loading}
                            className="h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}