import React, { useState } from 'react'
import { Plus, Send, Check, X, Clock, MessageSquare, DollarSign, User, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import useStoreSimple from '../../store/useStoreSimple'
import { formatCurrency } from '../../utils/formattersSimple'

const PedidosTabSimples = () => {
  const [showModal, setShowModal] = useState(false)
  const [showRejeicaoModal, setShowRejeicaoModal] = useState(false)
  const [pedidoParaRejeitar, setPedidoParaRejeitar] = useState(null)
  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  
  const [formData, setFormData] = useState({
    destinatario: '',
    item: '',
    valor: '',
    motivo: ''
  })

  const { 
    pedidos = [],
    selectedProfile,
    addPedido,
    updatePedido,
    deletePedido
  } = useStoreSimple()

  // Lógica simples - sem filtros complexos
  const meusPedidos = pedidos.filter(p => p.solicitante === selectedProfile)
  const pedidosRecebidos = pedidos.filter(p => p.destinatario === selectedProfile)
  const todosPedidos = [...meusPedidos, ...pedidosRecebidos]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validações simples
    if (!formData.destinatario || !formData.item || !formData.motivo) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.destinatario === selectedProfile) {
      alert('Você não pode enviar um pedido para si mesmo')
      return
    }

    // Criar pedido simples
    const novoPedido = {
      id: Date.now(),
      solicitante: selectedProfile,
      destinatario: formData.destinatario,
      item: formData.item,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      motivo: formData.motivo,
      status: 'pendente',
      data: new Date().toISOString().split('T')[0]
    }

    addPedido(novoPedido)
    
    // Reset form
    setFormData({
      destinatario: '',
      item: '',
      valor: '',
      motivo: ''
    })
    
    setShowModal(false)
    alert('Pedido enviado com sucesso!')
  }

  const handleAprovar = (pedidoId) => {
    updatePedido(pedidoId, { status: 'aprovado' })
    alert('Pedido aprovado!')
  }

  const handleRejeitar = (pedido) => {
    setPedidoParaRejeitar(pedido)
    setShowRejeicaoModal(true)
  }

  const confirmarRejeicao = () => {
    if (!motivoRejeicao.trim()) {
      alert('Motivo da rejeição é obrigatório')
      return
    }

    updatePedido(pedidoParaRejeitar.id, { 
      status: 'rejeitado',
      motivo_rejeicao: motivoRejeicao.trim()
    })
    
    setShowRejeicaoModal(false)
    setPedidoParaRejeitar(null)
    setMotivoRejeicao('')
    alert('Pedido rejeitado!')
  }

  const handleExcluir = (pedidoId, item) => {
    if (window.confirm(`Tem certeza que deseja excluir o pedido "${item}"?`)) {
      deletePedido(pedidoId)
      alert('Pedido excluído!')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'aprovado': return 'bg-green-100 text-green-800'
      case 'rejeitado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendente': return <Clock className="w-3 h-3" />
      case 'aprovado': return <Check className="w-3 h-3" />
      case 'rejeitado': return <X className="w-3 h-3" />
      default: return <MessageSquare className="w-3 h-3" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pedidos</h2>
        <Button onClick={() => setShowModal(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Pedido
        </Button>
      </div>

      {/* Estatísticas simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Meus Pedidos</div>
            <div className="text-2xl font-bold text-blue-600">{meusPedidos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Recebidos</div>
            <div className="text-2xl font-bold text-green-600">{pedidosRecebidos.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-gray-800">{todosPedidos.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {todosPedidos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum pedido encontrado</p>
              <p className="text-sm text-gray-400 mt-2">
                Crie um novo pedido clicando no botão "Novo Pedido"
              </p>
            </CardContent>
          </Card>
        ) : (
          todosPedidos.map((pedido) => (
            <Card key={pedido.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{pedido.item}</h3>
                      <Badge className={getStatusColor(pedido.status)}>
                        <span className="flex items-center">
                          {getStatusIcon(pedido.status)}
                          <span className="ml-1 capitalize">{pedido.status}</span>
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        De: {pedido.solicitante}
                      </div>
                      
                      <div className="flex items-center">
                        <Send className="w-4 h-4 mr-1" />
                        Para: {pedido.destinatario}
                      </div>
                      
                      {pedido.valor && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCurrency(pedido.valor)}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Motivo:</strong> {pedido.motivo}
                    </p>
                    
                    {pedido.status === 'rejeitado' && pedido.motivo_rejeicao && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-red-800">
                          <strong>Motivo da rejeição:</strong> {pedido.motivo_rejeicao}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Ações */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Botões para pedidos recebidos pendentes */}
                    {pedido.status === 'pendente' && pedido.destinatario === selectedProfile && (
                      <>
                        <Button
                          onClick={() => handleAprovar(pedido.id)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleRejeitar(pedido)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {/* Botão de exclusão para pedidos próprios */}
                    {pedido.solicitante === selectedProfile && (
                      <Button
                        onClick={() => handleExcluir(pedido.id, pedido.item)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de novo pedido */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Novo Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="destinatario">Para quem?</Label>
                  <Select value={formData.destinatario} onValueChange={(value) => handleInputChange('destinatario', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o destinatário" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Gabriel', 'Paloma'].filter(u => u !== selectedProfile).map(usuario => (
                        <SelectItem key={usuario} value={usuario}>
                          {usuario}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="item">Item/Produto</Label>
                  <Input
                    id="item"
                    value={formData.item}
                    onChange={(e) => handleInputChange('item', e.target.value)}
                    placeholder="Ex: Notebook, Curso, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="valor">Valor (opcional)</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => handleInputChange('motivo', e.target.value)}
                    placeholder="Explique o motivo do pedido..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                    Enviar Pedido
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de rejeição */}
      {showRejeicaoModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Rejeitar Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Informe o motivo da rejeição para "{pedidoParaRejeitar?.item}":
                </p>
                
                <Textarea
                  value={motivoRejeicao}
                  onChange={(e) => setMotivoRejeicao(e.target.value)}
                  placeholder="Motivo da rejeição..."
                  required
                />

                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowRejeicaoModal(false)
                      setPedidoParaRejeitar(null)
                      setMotivoRejeicao('')
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={confirmarRejeicao}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Rejeitar
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

export default PedidosTabSimples

