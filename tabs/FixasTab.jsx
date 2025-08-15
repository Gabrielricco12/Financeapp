import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  User, 
  Tag,
  RotateCcw,
  AlertTriangle,
  Filter,
  Check,
  X,
  Upload,
  Eye,
  FileText,
  Image,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import useStore from '../../store/useStore'
import { supabaseService } from '../../lib/supabase'
import { formatCurrency } from '../../utils/formatters'
import ComprovanteModal from '../modals/ComprovanteModal'

const FixasTab = () => {
  const [showModal, setShowModal] = useState(false)
  const [showPagamentoModal, setShowPagamentoModal] = useState(false)
  const [showComprovanteModal, setShowComprovanteModal] = useState(false)
  const [editingFixa, setEditingFixa] = useState(null)
  const [pagamentoFixa, setPagamentoFixa] = useState(null)
  const [comprovanteVisualizacao, setComprovanteVisualizacao] = useState(null)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroUsuario, setFiltroUsuario] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    usuario: '',
    dia_vencimento: ''
  })

  const [pagamentoData, setPagamentoData] = useState({
    status_pagamento: 'pendente',
    data_pagamento: '',
    comprovante_pagamento: null
  })

  const { 
    selectedProfile, 
    selectedMonth, 
    selectedYear,
    despesasFixas,
    addDespesaFixa,
    updateDespesaFixa,
    removeDespesaFixa,
    getTotalDespesasFixas
  } = useStore()

  const categorias = [
    { value: 'Moradia', label: 'Moradia', color: 'bg-blue-100 text-blue-800' },
    { value: 'Transporte', label: 'Transporte', color: 'bg-green-100 text-green-800' },
    { value: 'Alimentação', label: 'Alimentação', color: 'bg-orange-100 text-orange-800' },
    { value: 'Saúde', label: 'Saúde', color: 'bg-red-100 text-red-800' },
    { value: 'Educação', label: 'Educação', color: 'bg-purple-100 text-purple-800' },
    { value: 'Lazer', label: 'Lazer', color: 'bg-pink-100 text-pink-800' },
    { value: 'Outros', label: 'Outros', color: 'bg-gray-100 text-gray-800' }
  ]

  const usuarios = [
    { value: 'Gabriel', label: 'Gabriel', icon: '👨‍💼' },
    { value: 'Paloma', label: 'Paloma', icon: '👩‍💼' },
    { value: 'Casa', label: 'Casa', icon: '🏠' }
  ]

  const statusPagamento = [
    { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'pago', label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'atrasado', label: 'Atrasado', color: 'bg-red-100 text-red-800', icon: XCircle }
  ]

  // Filtrar despesas fixas
  const todasDespesasFixas = despesasFixas
    .filter(despesa => {
      console.log('Verificando despesa fixa:', despesa) // Debug
      
      // Filtro por perfil - mais flexível
      if (selectedProfile !== 'Ambos') {
        const usuario = despesa.usuario || despesa.quem_efetuou
        if (usuario !== selectedProfile && usuario !== 'Casa') {
          console.log('Filtrado por perfil:', usuario, 'vs', selectedProfile)
          return false
        }
      }
      
      // Filtro por categoria
      if (filtroCategoria && filtroCategoria !== 'todas') {
        const categoria = despesa.categoria
        if (categoria !== filtroCategoria && categoria !== 'Fixo') {
          console.log('Filtrado por categoria:', categoria, 'vs', filtroCategoria)
          return false
        }
      }
      
      // Filtro por usuário
      if (filtroUsuario && filtroUsuario !== 'todos') {
        const usuario = despesa.usuario || despesa.quem_efetuou
        if (usuario !== filtroUsuario) {
          console.log('Filtrado por usuário:', usuario, 'vs', filtroUsuario)
          return false
        }
      }
      
      // Filtro por status
      if (filtroStatus && filtroStatus !== 'todos') {
        const status = despesa.status_pagamento || 'pendente'
        if (status !== filtroStatus) {
          console.log('Filtrado por status:', status, 'vs', filtroStatus)
          return false
        }
      }
      
      // Apenas despesas ativas (se campo existir)
      if (despesa.hasOwnProperty('ativa') && despesa.ativa === false) {
        console.log('Filtrado por ativa:', despesa.ativa)
        return false
      }
      
      console.log('Despesa aprovada:', despesa.descricao)
      return true
    })
    .sort((a, b) => {
      // Primeiro por status (pendentes primeiro)
      if (a.status_pagamento !== b.status_pagamento) {
        if (a.status_pagamento === 'pendente') return -1
        if (b.status_pagamento === 'pendente') return 1
      }
      // Depois por dia de vencimento
      return (a.dia_vencimento || 0) - (b.dia_vencimento || 0)
    })

  // Paginação
  const totalPages = Math.ceil(todasDespesasFixas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const despesasFixasPaginadas = todasDespesasFixas.slice(startIndex, endIndex)

  // Resetar página quando filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filtroCategoria, filtroUsuario, filtroStatus])

  const totalDespesasFixas = getTotalDespesasFixas()

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handlePagamentoChange = (field, value) => {
    setPagamentoData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou PDF.')
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 5MB.')
        return
      }

      setPagamentoData(prev => ({
        ...prev,
        comprovante_pagamento: file
      }))
    }
  }

  // NOVA FUNÇÃO: Marcar como pago rapidamente
  const handleMarcarComoPago = async (despesa) => {
    if (window.confirm(`Marcar "${despesa.descricao}" como pago?`)) {
      setIsLoading(true)
      try {
        const updateData = {
          status_pagamento: 'pago',
          data_pagamento: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabaseService.updateDespesaFixa(despesa.id, updateData)
        if (error) throw new Error(error.message)

        updateDespesaFixa(despesa.id, updateData)
        alert('Despesa marcada como paga!')
      } catch (err) {
        console.error('Erro ao marcar como pago:', err)
        alert('Erro ao marcar como pago: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // NOVA FUNÇÃO: Marcar como pendente
  const handleMarcarComoPendente = async (despesa) => {
    if (window.confirm(`Marcar "${despesa.descricao}" como pendente?`)) {
      setIsLoading(true)
      try {
        const updateData = {
          status_pagamento: 'pendente',
          data_pagamento: null,
          comprovante_pagamento: null,
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabaseService.updateDespesaFixa(despesa.id, updateData)
        if (error) throw new Error(error.message)

        updateDespesaFixa(despesa.id, updateData)
        alert('Despesa marcada como pendente!')
      } catch (err) {
        console.error('Erro ao marcar como pendente:', err)
        alert('Erro ao marcar como pendente: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validações
      if (!formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (!formData.valor || parseFloat(formData.valor) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      if (!formData.categoria) {
        throw new Error('Categoria é obrigatória')
      }
      if (!formData.usuario) {
        throw new Error('Usuário é obrigatório')
      }
      if (!formData.dia_vencimento || parseInt(formData.dia_vencimento) < 1 || parseInt(formData.dia_vencimento) > 31) {
        throw new Error('Dia de vencimento deve ser entre 1 e 31')
      }

      const fixaData = {
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        usuario: formData.usuario,
        dia_vencimento: parseInt(formData.dia_vencimento),
        ativa: true,
        status_pagamento: 'pendente',
        data_pagamento: null,
        comprovante_pagamento: null,
        mes_referencia: selectedMonth,
        ano_referencia: selectedYear
      }

      if (editingFixa) {
        // Atualizar despesa fixa existente
        const { data, error } = await supabaseService.updateDespesaFixa(editingFixa.id, fixaData)
        if (error) throw new Error(error.message)
        
        if (data && data[0]) {
          updateDespesaFixa(editingFixa.id, data[0])
        }
      } else {
        // Criar nova despesa fixa
        const { data, error } = await supabaseService.createDespesaFixa(fixaData)
        if (error) throw new Error(error.message)
        
        if (data && data[0]) {
          addDespesaFixa(data[0])
        }
      }

      // Resetar formulário e fechar modal
      setFormData({
        descricao: '',
        valor: '',
        categoria: '',
        usuario: '',
        dia_vencimento: ''
      })
      setEditingFixa(null)
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (fixa) => {
    setEditingFixa(fixa)
    setFormData({
      descricao: fixa.descricao,
      valor: fixa.valor.toString(),
      categoria: fixa.categoria,
      usuario: fixa.usuario,
      dia_vencimento: fixa.dia_vencimento.toString()
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      setIsLoading(true)
      try {
        const { error } = await supabaseService.deleteDespesaFixa(id)
        if (error) throw new Error(error.message)
        
        removeDespesaFixa(id)
      } catch (err) {
        console.error('Erro ao excluir despesa fixa:', err)
        alert('Erro ao excluir despesa fixa: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFixa(null)
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      usuario: '',
      dia_vencimento: ''
    })
    setError('')
  }

  const getCategoriaColor = (categoria) => {
    const categoriaObj = categorias.find(c => c.value === categoria)
    return categoriaObj ? categoriaObj.color : 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    const statusObj = statusPagamento.find(s => s.value === status)
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const statusObj = statusPagamento.find(s => s.value === status)
    if (statusObj) {
      const IconComponent = statusObj.icon
      return <IconComponent className="w-4 h-4" />
    }
    return <Clock className="w-4 h-4" />
  }

  const getUserIcon = (usuario) => {
    const usuarioObj = usuarios.find(u => u.value === usuario)
    return usuarioObj ? usuarioObj.icon : '👤'
  }

  const limparFiltros = () => {
    setFiltroCategoria('todas')
    setFiltroUsuario('todos')
    setFiltroStatus('todos')
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Mensal (Fixas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalDespesasFixas)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {todasDespesasFixas.filter(d => d.status_pagamento === 'pendente').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {todasDespesasFixas.filter(d => d.status_pagamento === 'pago').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros - Despesas Fixas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria.value} value={categoria.value}>
                    {categoria.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
              <SelectTrigger>
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {usuarios.map(usuario => (
                  <SelectItem key={usuario.value} value={usuario.value}>
                    <span className="flex items-center">
                      <span className="mr-2">{usuario.icon}</span>
                      {usuario.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {statusPagamento.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <span className="flex items-center">
                      <status.icon className="w-4 h-4 mr-2" />
                      {status.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <Button onClick={limparFiltros} variant="outline" size="sm">
              Limpar Filtros
            </Button>
            <Button onClick={() => setShowModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa Fixa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Erro */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de despesas fixas */}
      <div className="space-y-3">
        {despesasFixasPaginadas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhuma despesa fixa encontrada</p>
              <p className="text-sm text-gray-400 mt-2">
                {filtroCategoria || filtroUsuario || filtroStatus
                  ? 'Tente ajustar os filtros'
                  : 'Adicione uma nova despesa fixa'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          despesasFixasPaginadas.map((despesa) => (
            <Card key={despesa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{despesa.descricao}</h3>
                      <Badge className={getCategoriaColor(despesa.categoria)}>
                        {despesa.categoria}
                      </Badge>
                      <Badge className={`${getStatusColor(despesa.status_pagamento)} flex items-center space-x-1`}>
                        {getStatusIcon(despesa.status_pagamento)}
                        <span>{statusPagamento.find(s => s.value === despesa.status_pagamento)?.label}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium text-gray-900">{formatCurrency(despesa.valor)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Vence dia {despesa.dia_vencimento}
                      </div>
                      
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-1">{getUserIcon(despesa.usuario)}</span>
                        {despesa.usuario}
                      </div>
                      
                      <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {despesa.banco || 'Não informado'}
                      </div>
                    </div>

                    {despesa.data_pagamento && (
                      <div className="mt-2 text-xs text-green-600">
                        Pago em: {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {/* BOTÃO PRINCIPAL: Marcar como Pago/Pendente */}
                    {despesa.status_pagamento === 'pendente' ? (
                      <Button
                        onClick={() => handleMarcarComoPago(despesa)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Marcar como Pago
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleMarcarComoPendente(despesa)}
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                        disabled={isLoading}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Marcar como Pendente
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleEdit(despesa)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(despesa.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {startIndex + 1} a {Math.min(endIndex, todasDespesasFixas.length)} de {todasDespesasFixas.length} despesas fixas
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page
                    if (totalPages <= 5) {
                      page = i + 1
                    } else if (currentPage <= 3) {
                      page = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i
                    } else {
                      page = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-9 h-9"
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Nova/Editar Despesa Fixa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingFixa ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Ex: Aluguel, Internet..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="usuario">Usuário *</Label>
                  <Select value={formData.usuario} onValueChange={(value) => handleInputChange('usuario', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map(usuario => (
                        <SelectItem key={usuario.value} value={usuario.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{usuario.icon}</span>
                            {usuario.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dia_vencimento">Dia de Vencimento *</Label>
                  <Select value={formData.dia_vencimento} onValueChange={(value) => handleInputChange('dia_vencimento', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                        <SelectItem key={dia} value={dia.toString()}>
                          Dia {dia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Salvando...' : (editingFixa ? 'Atualizar' : 'Criar')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default FixasTab

