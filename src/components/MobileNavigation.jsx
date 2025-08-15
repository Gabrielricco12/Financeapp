import React, { useState } from 'react'
import { 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  DollarSign, 
  RotateCcw, 
  Building2, 
  MessageSquare,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronRight
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'
import useStore from '../store/useStore'
import { formatCurrency } from '../utils/formatters'

const MobileNavigation = ({ activeTab, onTabChange, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const { 
    user, 
    selectedProfile,
    selectedMonth,
    selectedYear,
    pedidos,
    despesasFixas,
    getTotalRendas,
    getTotalDespesas,
    getTotalDespesasFixas
  } = useStore()

  const menuItems = [
    {
      id: 'geral',
      label: 'Visão Geral',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'despesas',
      label: 'Despesas',
      icon: CreditCard,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      id: 'renda',
      label: 'Renda',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'fixas',
      label: 'Despesas Fixas',
      icon: RotateCcw,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'bancos',
      label: 'Por Bancos',
      icon: Building2,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  // Calcular notificações
  const pedidosPendentes = pedidos.filter(p => 
    p.destinatario === selectedProfile && p.status === 'pendente'
  ).length

  const despesasVencendo = despesasFixas.filter(fixa => {
    if (selectedProfile !== 'Ambos' && fixa.usuario !== selectedProfile && fixa.usuario !== 'Casa') return false
    
    const hoje = new Date()
    const proximosDias = 7
    const proximoVencimento = getProximoVencimento(fixa.dia_vencimento)
    const diasParaVencimento = Math.ceil((proximoVencimento - hoje) / (1000 * 60 * 60 * 24))
    
    return diasParaVencimento <= proximosDias && diasParaVencimento >= 0 && fixa.status_pagamento === 'pendente'
  }).length

  const totalNotificacoes = pedidosPendentes + despesasVencendo

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

  const handleMenuClick = (tabId) => {
    onTabChange(tabId)
    setIsOpen(false)
  }

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()
  }

  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return months[month - 1]
  }

  const getUserIcon = (profile) => {
    const icons = {
      'Gabriel': '👨‍💼',
      'Paloma': '👩‍💼',
      'Ambos': '👥'
    }
    return icons[profile] || '👤'
  }

  // Calcular resumo financeiro
  const totalRendas = getTotalRendas()
  const totalDespesas = getTotalDespesas()
  const totalFixas = getTotalDespesasFixas()
  const saldoRestante = totalRendas - totalDespesas - totalFixas

  return (
    <>
      {/* Botão do menu mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-white shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          size="sm"
        >
          <Menu className="w-5 h-5" />
          {totalNotificacoes > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
              {totalNotificacoes > 99 ? '99+' : totalNotificacoes}
            </Badge>
          )}
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menu lateral */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header do menu */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Gestão Financeira</h2>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Informações do usuário */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
              {getUserIcon(selectedProfile)}
            </div>
            <div>
              <p className="font-medium">{selectedProfile}</p>
              <p className="text-sm text-white/80">
                {getMonthName(selectedMonth)} {selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Resumo do Mês</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Renda Total:</span>
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(totalRendas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Despesas:</span>
              <span className="text-sm font-medium text-red-600">
                {formatCurrency(totalDespesas + totalFixas)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium text-gray-800">Saldo:</span>
              <span className={`text-sm font-bold ${saldoRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(saldoRestante)}
              </span>
            </div>
          </div>
        </div>

        {/* Notificações */}
        {totalNotificacoes > 0 && (
          <div className="p-4 border-b bg-yellow-50">
            <div className="flex items-center space-x-2 mb-2">
              <Bell className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Notificações</span>
              <Badge className="bg-yellow-500 text-white text-xs">
                {totalNotificacoes}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-yellow-700">
              {pedidosPendentes > 0 && (
                <p>• {pedidosPendentes} pedido{pedidosPendentes !== 1 ? 's' : ''} pendente{pedidosPendentes !== 1 ? 's' : ''}</p>
              )}
              {despesasVencendo > 0 && (
                <p>• {despesasVencendo} despesa{despesasVencendo !== 1 ? 's' : ''} vencendo</p>
              )}
            </div>
          </div>
        )}

        {/* Menu de navegação */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              const hasNotification = (item.id === 'pedidos' && pedidosPendentes > 0) || 
                                    (item.id === 'fixas' && despesasVencendo > 0)
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg mb-1 transition-all duration-200
                    ${isActive 
                      ? `${item.bgColor} ${item.color} shadow-sm` 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`
                      p-2 rounded-lg
                      ${isActive ? 'bg-white shadow-sm' : item.bgColor}
                    `}>
                      <Icon className={`w-4 h-4 ${isActive ? item.color : 'text-gray-600'}`} />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {hasNotification && (
                      <Badge className="bg-red-500 text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                        {item.id === 'pedidos' ? pedidosPendentes : despesasVencendo}
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer do menu */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-4 h-4 mr-3" />
              Configurações
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sair
            </Button>
          </div>
          
          <div className="mt-3 pt-3 border-t text-center">
            <p className="text-xs text-gray-500">
              Gestão Financeira v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileNavigation

