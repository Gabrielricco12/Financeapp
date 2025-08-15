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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import useStore from '../store/useStore'
import { formatCurrency, formatDate } from '../utils/formatters'

const NotificationSystem = () => {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  const {
    selectedProfile,
    pedidos,
    despesasFixas,
    updatePedido
  } = useStore()

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
        message: `${pedido.solicitante} solicitou: ${pedido.descricao}`,
        value: pedido.valor,
        timestamp: pedido.created_at,
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
        
        if (diasParaVencimento <= proximosDias && diasParaVencimento >= 0) {
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

  const handleApprove = async (notification) => {
    try {
      await updatePedido(notification.data.id, { 
        status: 'aprovado',
        updated_at: new Date().toISOString()
      })
      
      // Remover notificação
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      
      // Mostrar feedback
      showToast('Pedido aprovado com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao aprovar pedido', 'error')
    }
  }

  const handleReject = async (notification) => {
    const motivo = prompt('Digite o motivo da rejeição:')
    if (!motivo || !motivo.trim()) {
      showToast('Motivo da rejeição é obrigatório', 'warning')
      return
    }

    try {
      await updatePedido(notification.data.id, { 
        status: 'rejeitado',
        motivo_rejeicao: motivo.trim(),
        updated_at: new Date().toISOString()
      })
      
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
    } text-white`
    toast.textContent = message
    document.body.appendChild(toast)
    
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'pedido':
        return <MessageSquare className="w-5 h-5" />
      case 'vencimento':
        return <Calendar className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
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
        className="relative"
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
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificações</h3>
              <Button
                onClick={() => setShowNotifications(false)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} notificação{unreadCount !== 1 ? 'ões' : ''} pendente{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Nenhuma notificação</p>
                <p className="text-sm text-gray-400 mt-1">
                  Você está em dia com tudo!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        {notification.value && (
                          <div className="flex items-center mt-2 text-sm">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            <span className="font-medium text-green-600">
                              {formatCurrency(notification.value)}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => dismissNotification(notification.id)}
                      variant="ghost"
                      size="sm"
                      className="ml-2"
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
                          className="bg-green-500 hover:bg-green-600 text-white"
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
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                className="w-full text-sm"
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

export default NotificationSystem

