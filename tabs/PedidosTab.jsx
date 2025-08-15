import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Send, 
  Check, 
  X, 
  Clock, 
  MessageSquare, 
  DollarSign, 
  User,
  Calendar,
  Filter,
  AlertCircle,
  Trash2
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import useStoreSimple from '../../store/useStoreSimple'
import { supabaseService } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../utils/formattersSimple'

const PedidosTab = () => {
  const [showModal, setShowModal] = useState(false)
  const [showRejeicaoModal, setShowRejeicaoModal] = useState(false)
  const [pedidoParaRejeitar, setPedidoParaRejeitar] = useState(null)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    destinatario: '',
    tipo: '',
    valor: '',
    descricao: ''
  })

  const { 
    pedidos,
    selectedProfile,
    addPedido,
    updatePedido,
    deletePedido
  } = useStoreSimple()

  // Função para excluir pedido
  const handleExcluirPedido = async (pedidoId, descricao) => {
    if (!window.confirm(`Tem certeza que deseja excluir o pedido "${descricao}"?`)) {
      return
    }

    try {
      setIsLoading(true)
      
      // Tentar excluir no Supabase primeiro
      const { error } = await supabaseService.deletePedido(pedidoId)
      if (error) throw new Error(error.message)
      
      // Se sucesso, excluir do estado local
      deletePedido(pedidoId)
      
      alert('Pedido excluído com sucesso!')
      
    } catch (err) {
      console.error('Erro ao excluir pedido:', err)
      alert('Erro ao excluir pedido: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Tratamento de erro para evitar tela branca
  useEffect(() => {
    try {
      // Verificar se os dados estão carregados corretamente
      if (!pedidos) {
        setError('Erro ao carregar pedidos')
      }
    } catch (err) {
      setError('Erro inesperado: ' + err.message)
    }
  }, [pedidos])

  const usuarios = ['Gabriel', 'Paloma']
  const tiposPedido = [
    { value: 'compra', label: 'Compra', icon: '🛒' },
    { value: 'transferencia', label: 'Transferência', icon: '💸' },
    { value: 'reembolso', label: 'Reembolso', icon: '💰' },
    { value: 'emprestimo', label: 'Empréstimo', icon: '🤝' }
  ]

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroStatus && pedido.status !== filtroStatus) return false
    if (filtroTipo && pedido.tipo !== filtroTipo) return false
    return true
  })

  // Separar pedidos por categoria
  const pedidosEnviados = pedidosFiltrados.filter(p => p.solicitante === selectedProfile)
  const pedidosRecebidos = pedidosFiltrados.filter(p => p.destinatario === selectedProfile)
  const pedidosPendentes = pedidosRecebidos.filter(p => p.status === 'pendente')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validações
      if (!formData.destinatario) {
        throw new Error('Destinatário é obrigatório')
      }
      if (formData.destinatario === selectedProfile) {
        throw new Error('Você não pode enviar um pedido para si mesmo')
      }
      if (!formData.tipo) {
        throw new Error('Tipo do pedido é obrigatório')
      }
      if (!formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (formData.valor && parseFloat(formData.valor) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }

      const pedidoData = {
        solicitante: selectedProfile,
        destinatario: formData.destinatario,
        tipo: formData.tipo,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        descricao: formData.descricao.trim(),
        status: 'pendente'
      }

      const { data, error } = await supabaseService.createPedido(pedidoData)
      if (error) throw new Error(error.message)
      
      if (data && data[0]) {
        addPedido(data[0])
      }

      // Resetar formulário e fechar modal
      setFormData({
        destinatario: '',
        tipo: '',
        valor: '',
        descricao: ''
      })
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAprovar = async (pedidoId) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabaseService.updatePedido(pedidoId, { 
        status: 'aprovado',
        updated_at: new Date().toISOString()
      })
      if (error) throw new Error(error.message)
      
      updatePedido(pedidoId, { status: 'aprovado' })
    } catch (err) {
      console.error('Erro ao aprovar pedido:', err)
      alert('Erro ao aprovar pedido: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRejeitar = (pedido) => {
    setPedidoParaRejeitar(pedido)
    setMotivoRejeicao('')
    setShowRejeicaoModal(true)
  }

  const confirmarRejeicao = async () => {
    if (!motivoRejeicao.trim()) {
      alert('Motivo da rejeição é obrigatório')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabaseService.updatePedido(pedidoParaRejeitar.id, { 
        status: 'rejeitado',
        motivo_rejeicao: motivoRejeicao.trim(),
        updated_at: new Date().toISOString()
      })
      if (error) throw new Error(error.message)
      
      updatePedido(pedidoParaRejeitar.id, { 
        status: 'rejeitado',
        motivo_rejeicao: motivoRejeicao.trim()
      })
      
      setShowRejeicaoModal(false)
      setPedidoParaRejeitar(null)
      setMotivoRejeicao('')
    } catch (err) {
      console.error('Erro ao rejeitar pedido:', err)
      alert('Erro ao rejeitar pedido: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'aprovado': 'bg-green-100 text-green-800',
      'rejeitado': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      'pendente': <Clock className="w-4 h-4" />,
      'aprovado': <Check className="w-4 h-4" />,
      'rejeitado': <X className="w-4 h-4" />
    }
    return icons[status] || <Clock className="w-4 h-4" />
  }

  const getTipoIcon = (tipo) => {
    const tipoObj = tiposPedido.find(t => t.value === tipo)
    return tipoObj ? tipoObj.icon : '📝'
  }

  const getUserIcon = (usuario) => {
    const icons = {
      'Gabriel': '👨‍💼',
      'Paloma': '👩‍💼'
    }
    return icons[usuario] || '👤'
  }

  return (
    <div className="space-y-6">
      {/* Exibir erro se houver */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pedidosPendentes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pedidosEnviados.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recebidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pedidosRecebidos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{pedidosFiltrados.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </span>
            <Button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pedido
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {tiposPedido.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    <span className="flex items-center">
                      <span className="mr-2">{tipo.icon}</span>
                      {tipo.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {(filtroStatus || filtroTipo) && (
              <Button 
                onClick={() => {
                  setFiltroStatus('')
                  setFiltroTipo('')
                }} 
                variant="outline" 
                size="sm"
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerta para pedidos pendentes */}
      {pedidosPendentes.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você tem {pedidosPendentes.length} pedido{pedidosPendentes.length !== 1 ? 's' : ''} pendente{pedidosPendentes.length !== 1 ? 's' : ''} aguardando sua resposta.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de pedidos */}
      <div className="space-y-3">
        {pedidosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum pedido encontrado</p>
              <p className="text-sm text-gray-400 mt-2">
                {filtroStatus || filtroTipo
                  ? 'Tente ajustar os filtros'
                  : 'Crie um novo pedido clicando no botão "Novo Pedido"'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl">{getTipoIcon(pedido.tipo)}</span>
                      <h3 className="font-semibold text-gray-900">{pedido.descricao}</h3>
                      <Badge className={getStatusColor(pedido.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(pedido.status)}
                          <span className="ml-1 capitalize">{pedido.status}</span>
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-1">{getUserIcon(pedido.solicitante)}</span>
                        {pedido.solicitante}
                      </div>
                      
                      <div className="flex items-center">
                        <Send className="w-4 h-4 mr-1" />
                        <span className="mr-1">{getUserIcon(pedido.destinatario)}</span>
                        {pedido.destinatario}
                      </div>
                      
                      {pedido.valor && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-medium">{formatCurrency(pedido.valor)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(pedido.created_at)}
                      </div>
                    </div>

                    {/* Motivo da rejeição */}
                    {pedido.status === 'rejeitado' && pedido.motivo_rejeicao && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-red-800">
                          <strong>Motivo da rejeição:</strong> {pedido.motivo_rejeicao}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Ações para pedidos pendentes recebidos */}
                  {pedido.status === 'pendente' && pedido.destinatario === selectedProfile && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => {
                          try {
                            handleAprovar(pedido.id)
                          } catch (err) {
                            setError('Erro ao aprovar pedido: ' + err.message)
                          }
                        }}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        disabled={isLoading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        onClick={() => {
                          try {
                            handleRejeitar(pedido)
                          } catch (err) {
                            setError('Erro ao rejeitar pedido: ' + err.message)
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {/* Botão de exclusão para pedidos próprios */}
                  {pedido.solicitante === selectedProfile && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        onClick={() => {
                          try {
                            handleExcluirPedido(pedido.id, pedido.descricao)
                          } catch (err) {
                            setError('Erro ao excluir pedido: ' + err.message)
                          }
                        }}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de novo pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Novo Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Destinatário */}
                <div className="space-y-2">
                  <Label>Destinatário *</Label>
                  <Select value={formData.destinatario} onValueChange={(value) => handleInputChange('destinatario', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destinatário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.filter(u => u !== selectedProfile).map(usuario => (
                        <SelectItem key={usuario} value={usuario}>
                          <span className="flex items-center">
                            <span className="mr-2">{getUserIcon(usuario)}</span>
                            {usuario}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposPedido.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{tipo.icon}</span>
                            {tipo.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Valor (opcional) */}
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (opcional)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva o que você está pedindo..."
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </div>
                    ) : (
                      'Enviar Pedido'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de rejeição */}
      {showRejeicaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Rejeitar Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Você está rejeitando o pedido: <strong>{pedidoParaRejeitar?.descricao}</strong>
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo da rejeição *</Label>
                  <Textarea
                    id="motivo"
                    placeholder="Explique o motivo da rejeição..."
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRejeicaoModal(false)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmarRejeicao}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    disabled={isLoading || !motivoRejeicao.trim()}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Rejeitando...
                      </div>
                    ) : (
                      'Confirmar Rejeição'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PedidosTab

