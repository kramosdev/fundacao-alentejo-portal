import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useRequests } from "@/hooks/useRequests"
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { CalendarIcon, Upload, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface NewRequestFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function NewRequestForm({ onSuccess, onCancel }: NewRequestFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [type, setType] = useState<'viatura' | 'alimentacao' | 'material' | 'outro'>('material')
  const [priority, setPriority] = useState<'baixa' | 'media' | 'alta' | 'critica'>('media')
  const [requestedDate, setRequestedDate] = useState<Date>()
  const [requestedTime, setRequestedTime] = useState("")
  const [location, setLocation] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])

  const { createRequest, categories, loading } = useRequests()
  const { user } = useAuth()

  // Filter categories by selected type
  const filteredCategories = categories.filter(cat => cat.type === type)

  // Auto-select first category when type changes
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id)
    } else {
      setCategoryId("")
    }
  }, [type, filteredCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !title || !description || !categoryId) {
      return
    }

    const { error } = await createRequest({
      category_id: categoryId,
      title: title.trim(),
      description: description.trim(),
      type,
      priority,
      requested_date: requestedDate?.toISOString(),
      requested_time: requestedTime || undefined,
      location: location.trim() || undefined,
      additional_info: additionalInfo.trim() ? { notes: additionalInfo.trim() } : undefined,
      attachments: attachments.length > 0 ? attachments : undefined
    })

    if (!error && onSuccess) {
      onSuccess()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // In a real implementation, you would upload files to Supabase Storage
      // For now, we'll just simulate file names
      const newFiles = Array.from(files).map(file => file.name)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const isFormValid = title.trim() && description.trim() && categoryId

  return (
    <Card className="w-full max-w-2xl mx-auto portal-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Plus className="h-6 w-6 text-primary" />
          Nova Requisição
        </CardTitle>
        <CardDescription>
          Preencha os campos abaixo para submeter uma nova requisição
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Requisição *</Label>
              <Select value={type} onValueChange={(value) => setType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viatura">Viatura</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da Requisição *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva brevemente o que necessita"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Forneça todos os detalhes relevantes sobre a sua requisição"
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Priority and Date/Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Pretendida</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !requestedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {requestedDate ? (
                      format(requestedDate, "PPP", { locale: pt })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={requestedDate}
                    onSelect={setRequestedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora Pretendida</Label>
              <Input
                id="time"
                type="time"
                value={requestedTime}
                onChange={(e) => setRequestedTime(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Local (se aplicável)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Indique o local se relevante para a requisição"
            />
          </div>

          {/* Additional Information */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo">Informações Adicionais</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Qualquer informação adicional que considere relevante"
              className="min-h-[80px]"
            />
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Anexos</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="relative"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Adicionar Ficheiros
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </Button>
                <span className="text-sm text-muted-foreground">
                  PDF, DOC, XLS, JPG (máx. 10MB cada)
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 py-1 px-2"
                    >
                      {file}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !isFormValid}
              className="flex-1"
            >
              {loading ? "A submeter..." : "Submeter Requisição"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}