import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Home, 
  CreditCard, 
  DollarSign, 
  RotateCcw, 
  Building2, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import useStore from '../store/useStore'
import { formatCurrency, formatPercentage } from '../utils/formatters'
import NewExpenseModal from './modals/NewExpenseModal'
import NotificationSystem from './NotificationSystem'
import MobileNavigation from './MobileNavigation'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('geral')
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const {
    user,
    selectedProfile,
    selectedMonth,
    selectedYear,
    setSelectedProfile,
    setSelectedMonth,
    setSelectedYear,
    logout,
    getTotalRendas,
    getTotalDespesas,
    getTotalDespesasFixas,
    despesas,
    despesasFixas
  } = useStore()

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const totalRendas = getTotalRendas()
  const totalDespesas = getTotalDespesas()
  const totalFixas = getTotalDespesasFixas()
  const totalGastos = totalDespesas + totalFixas
  const saldoRestante = totalRendas - totalGastos
  const percentualGasto = totalRendas > 0 ? (totalGastos / totalRendas) * 100 : 0

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  const anos = [2023, 2024, 2025, 2026]
  const perfis = ['Gabriel', 'Paloma', 'Ambos']

  const tabItems = [
    {
      id: 'geral',
      label: 'Geral',
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
      label: 'Fixas',
      icon: RotateCcw,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'bancos',
      label: 'Bancos',
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

  const getStatusFinanceiro = () => {
    if (percentualGasto <= 50) return { status: 'Excelente', color: 'text-green-600', bgColor: 'bg-green-50' }
    if (percentualGasto <= 70) return { status: 'Bom', color: 'text-blue-600', bgColor: 'bg-blue-50' }
    if (percentualGasto <= 85) return { status: 'Atenção', color: 'text-yellow-600', bgColor: 'bg-yellow-50' }
    return { status: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-50' }
  }

  const statusFinanceiro = getStatusFinanceiro()

  const getUserIcon = (profile) => {
    const icons = {
      'Gabriel': '👨‍💼',
      'Paloma': '👩‍💼',
      'Ambos': '👥'
    }
    return icons[profile] || '👤'
  }

  const getRecentTransactions = () => {
    const allTransactions = [
      ...despesas.map((d, index) => ({ ...d, type: 'despesa', date: d.data_compra, uniqueId: `despesa-${d.id || index}` })),
      ...despesasFixas.filter(f => f.status_pagamento === 'pago').map((f, index) => ({ 
        ...f, 
        type: 'fixa', 
        date: f.data_pagamento,
        uniqueId: `fixa-${f.id || index}`
      }))
    ]
    
    return allTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
  }

  const recentTransactions = getRecentTransactions()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'despesas':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aba Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Funcionalidade de despesas em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        )
      case 'renda':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aba Renda</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Funcionalidade de renda em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        )
      case 'bancos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aba Bancos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Funcionalidade de bancos em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        )
      case 'pedidos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aba Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Funcionalidade de pedidos em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        )
      case 'fixas':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aba Fixas</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Funcionalidade de despesas fixas em desenvolvimento...</p>
              </CardContent>
            </Card>
          </div>
        )
      default:
        return renderGeralTab()
    }
  }

  const renderGeralTab = () => (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
              Renda Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRendas)}</div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
              Total Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalGastos)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(percentualGasto)} da renda
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-blue-500" />
              Saldo Restante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoRestante >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldoRestante)}
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusFinanceiro.bgColor} ${statusFinanceiro.color}`}>
              {statusFinanceiro.status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {percentualGasto > 85 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> Você já gastou {formatPercentage(percentualGasto)} da sua renda mensal.
          </AlertDescription>
        </Alert>
      )}

      {/* Transações recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Transações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma transação encontrada</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.uniqueId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'despesa' ? 'bg-red-100' : 'bg-purple-100'}`}>
                      {transaction.type === 'despesa' ? (
                        <CreditCard className="w-4 h-4 text-red-600" />
                      ) : (
                        <RotateCcw className="w-4 h-4 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.descricao}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      -{formatCurrency(transaction.valor)}
                    </p>
                    {transaction.categoria && (
                      <p className="text-xs text-gray-500">{transaction.categoria}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tabItems.slice(1).map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={`action-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 hover:${tab.bgColor} hover:${tab.color} transition-colors`}
                >
                  <div className={`p-2 rounded-lg ${tab.bgColor}`}>
                    <Icon className={`w-5 h-5 ${tab.color}`} />
                  </div>
                  <span className="text-xs font-medium">{tab.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegação mobile */}
      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e título */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900">Gestão Financeira</h1>
              </div>
              <div className="md:hidden ml-12">
                <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              </div>
            </div>

            {/* Controles centrais */}
            <div className="flex items-center space-x-3">
              {/* Seletores */}
              <div className="hidden sm:flex items-center space-x-2">
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map(perfil => (
                      <SelectItem key={`perfil-${perfil}`} value={perfil}>
                        <span className="flex items-center">
                          <span className="mr-2">{getUserIcon(perfil)}</span>
                          {perfil}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {meses.map(mes => (
                      <SelectItem key={`mes-${mes.value}`} value={mes.value.toString()}>
                        {mes.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map(ano => (
                      <SelectItem key={`ano-${ano}`} value={ano.toString()}>
                        {ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notificações */}
              <NotificationSystem />

              {/* Botão de nova despesa */}
              <Button
                onClick={() => setShowNewExpenseModal(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="w-4 h-4 mr-1" />
                {!isMobile && "Nova Despesa"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Seletores mobile */}
      <div className="sm:hidden bg-white border-b p-4">
        <div className="grid grid-cols-3 gap-2">
          <Select value={selectedProfile} onValueChange={setSelectedProfile}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {perfis.map(perfil => (
                <SelectItem key={`mobile-perfil-${perfil}`} value={perfil}>
                  <span className="flex items-center">
                    <span className="mr-2">{getUserIcon(perfil)}</span>
                    {perfil}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map(mes => (
                <SelectItem key={`mobile-mes-${mes.value}`} value={mes.value.toString()}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map(ano => (
                <SelectItem key={`mobile-ano-${ano}`} value={ano.toString()}>
                  {ano}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navegação por abas - Desktop */}
      <div className="hidden md:block bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            {tabItems.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={`tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                    ${isActive 
                      ? `${tab.bgColor} ${tab.color} border-b-2 border-current` 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderTabContent()}
      </main>

      {/* Modal de nova despesa */}
      <NewExpenseModal
        isOpen={showNewExpenseModal}
        onClose={() => setShowNewExpenseModal(false)}
      />
    </div>
  )
}

export default Dashboard

