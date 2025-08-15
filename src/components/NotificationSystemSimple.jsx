import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  X, 
  Check, 
  AlertTriangle, 
  Info, 
  MessageSquare,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import useStoreSimple from '../store/useStoreSimple'
import { formatCurrency, formatDate } from '../utils/formattersSimple'

const NotificationSystemSimple = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  const {
    selectedProfile,
    pedidos,
    despesasFixas,
    updatePedido
  } = useStoreSimple()

  // Gerar notificações baseadas nos dados
  useEffect(() => {
    const newNotifications = []

    // Notificações de pedidos pendentes
    const pedidosPendentes = pedidos.filter(p => 
      p.destinatario === selectedProfile && p.status === 'pendente'
    )
    
    pedidosPendentes.forEach(pedido => {
      newNotifications.push({
        id: `pedido-${pedido.id}`,
        type: 'pedido',
        title: 'Novo Pedido Recebido',
        message: `${pedido.solicitante} solicitou: ${pedido.item}`,
        value: pedido.valor,
        timestamp: new Date().toISOString(),
        priority: 'high',
        data: pedido,
        actions: ['approve', 'reject']
      })
    })

    // Notificações de despesas fixas próximas do vencimento
    const hoje = new Date()
    const proximosDias = 7 // Alertar 7 dias antes

    despesasFixas.forEach(fixa => {
      if (selectedProfile === 'Ambos' || fixa.usuario === selectedProfile || fixa.usuario === 'Casa') {
        const proximoVencimento = getProximoVencimento(fixa.dia_vencimento)
        const diasParaVencimento = Math.ceil((proximoVencimento - hoje) / (1000 * 60 * 60 * 24))
        
        if (diasParaVencimento <= proximosDias && diasParaVencimento >= 0 && fixa.status !== 'pago') {
          let priority = 'low'
          if (diasParaVencimento <= 1) priority = 'high'
          else if (diasParaVencimento <= 3) priority = 'medium'
          
          newNotifications.push({
            id: `fixa-${fixa.id}`,
            type: 'vencimento',
            title: 'Despesa Fixa Vencendo',
            message: `${fixa.descricao} vence em ${diasParaVencimento} dia${diasParaVencimento !== 1 ? 's' : ''}`,
            value: fixa.valor,
            timestamp: new Date().toISOString(),
            priority,
            data: fixa,
            actions: []
          })
        }
      }
    })

    // Ordenar por prioridade e data
    newNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(b.timestamp) - new Date(a.timestamp)
    })

    setNotifications(newNotifications)
  }, [pedidos, despesasFixas, selectedProfile])

  const getProximoVencimento = (diaVencimento) => {
    const hoje = new Date()
    const mesAtual = hoje.getMonth()
    const anoAtual = hoje.getFullYear()
    
    let proximoVencimento = new Date(anoAtual, mesAtual, diaVencimento)
    
    if (proximoVencimento < hoje) {
      proximoVencimento = new Date(anoAtual, mesAtual + 1, diaVencimento)
    }
    
    return proximoVencimento
  }

  const handleApprove = (notification) => {
    try {
      // Simular aprovação do pedido
      const updatedPedidos = pedidos.map(p => 
        p.id === notification.data.id 
          ? { ...p, status: 'aprovado' }
          : p
      )
      
      // Remover notificação
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      
      showToast('Pedido aprovado com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao aprovar pedido', 'error')
    }
  }

  const handleReject = (notification) => {
    const motivo = prompt('Digite o motivo da rejeição:')
    if (!motivo || !motivo.trim()) {
      showToast('Motivo da rejeição é obrigatório', 'warning')
      return
    }

    try {
      // Simular rejeição do pedido
      const updatedPedidos = pedidos.map(p => 
        p.id === notification.data.id 
          ? { ...p, status: 'rejeitado', motivo_rejeicao: motivo.trim() }
          : p
      )
      
      // Remover notificação
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      
      showToast('Pedido rejeitado', 'success')
    } catch (error) {
      showToast('Erro ao rejeitar pedido', 'error')
    }
  }

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const showToast = (message, type) => {
    // Implementação simples de toast
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white font-medium`
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 3000)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'pedido':
        return <MessageSquare className="w-4 h-4" />
      case 'vencimento':
        return <Calendar className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const unreadCount = notifications.length

  return (
    <div className="relative">
      {/* Botão de notificações */}
      <Button
        onClick={() => setShowNotifications(!showNotifications)}
        variant="outline"
        size="sm"
        className="relative bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50">
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Notificações
              </h3>
              <Button
                onClick={() => setShowNotifications(false)}
                variant="ghost"
                size="sm"
                className="hover:bg-white/50 rounded-full p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} notificação{unreadCount !== 1 ? 'ões' : ''} pendente{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="font-medium text-gray-900 mb-2">Tudo em dia!</h4>
                <p className="text-sm text-gray-500">
                  Você não tem notificações pendentes.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.value && (
                          <div className="flex items-center mt-2 text-sm">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-bold text-green-600">
                              {formatCurrency(notification.value)}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.timestamp).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => dismissNotification(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="ml-2 hover:bg-gray-200 rounded-full p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Ações da notificação */}
                  {notification.actions.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3 ml-11">
                      {notification.actions.includes('approve') && (
                        <Button
                          onClick={() => handleApprove(notification)}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white shadow-md"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Aprovar
                        </Button>
                      )}
                      
                      {notification.actions.includes('reject') && (
                        <Button
                          onClick={() => handleReject(notification)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Rejeitar
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <Button
                onClick={() => setNotifications([])}
                variant="ghost"
                size="sm"
                className="w-full text-sm hover:bg-gray-200"
              >
                Limpar todas as notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationSystemSimple

