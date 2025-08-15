import React, { useState } from 'react'
import { 
  Plus, 
  Home, 
  CreditCard, 
  DollarSign, 
  LogOut,
  Menu,
  X,
  Receipt,
  Building2,
  MessageSquare,
  Calendar,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import useStoreSimple from '../store/useStoreSimple'
import { formatCurrency, formatDate } from '../utils/formattersSimple'
import NewExpenseModalCompleto from './modals/NewExpenseModalCompleto'
import GastosDoMesModal from './modals/GastosDoMesModal'
import DetalhesCompraModal from './modals/DetalhesCompraModal'
import ContasDoMesModal from './modals/ContasDoMesModal'
import NotificationSystemSimple from './NotificationSystemSimple'
import ContasDoMesTab from './tabs/ContasDoMesTab'
import PedidosTabSimples from './tabs/PedidosTabSimples'
import NovaRendaModal from './modals/NovaRendaModal'

const DashboardSimple = () => {
  const [activeTab, setActiveTab] = useState('geral')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false)
  const [showNovaRendaModal, setShowNovaRendaModal] = useState(false)
  const [showGastosModal, setShowGastosModal] = useState(false)
  const [showContasModal, setShowContasModal] = useState(false)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)
  const [selectedCompra, setSelectedCompra] = useState(null)

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
    updateDespesaFixa,
    rendas,
    despesas,
    despesasFixas,
    pedidos
  } = useStoreSimple()

  const totalRendas = getTotalRendas()
  const totalDespesas = getTotalDespesas()
  const totalFixas = getTotalDespesasFixas()
  const totalGastos = totalDespesas + totalFixas
  const saldoRestante = totalRendas - totalGastos

  const tabs = [
    { id: 'geral', label: 'Geral', icon: Home },
    { id: 'despesas', label: 'Despesas', icon: CreditCard },
    { id: 'renda', label: 'Renda', icon: DollarSign },
    { id: 'fixas', label: 'Fixas', icon: Calendar },
    { id: 'bancos', label: 'Bancos', icon: Building2 },
    { id: 'pedidos', label: 'Pedidos', icon: MessageSquare }
  ]

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

  const getUserIcon = (profile) => {
    const icons = {
      'Gabriel': '👨‍💼',
      'Paloma': '👩‍💼',
      'Ambos': '👥'
    }
    return icons[profile] || '👤'
  }

  const getStatusFinanceiro = () => {
    const percentualGasto = totalRendas > 0 ? (totalGastos / totalRendas) * 100 : 0
    if (percentualGasto <= 50) return { status: 'Excelente', color: 'text-emerald-600', bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50', borderColor: 'border-emerald-200' }
    if (percentualGasto <= 70) return { status: 'Bom', color: 'text-blue-600', bgColor: 'bg-gradient-to-r from-blue-50 to-cyan-50', borderColor: 'border-blue-200' }
    if (percentualGasto <= 85) return { status: 'Atenção', color: 'text-amber-600', bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50', borderColor: 'border-amber-200' }
    return { status: 'Crítico', color: 'text-red-600', bgColor: 'bg-gradient-to-r from-red-50 to-rose-50', borderColor: 'border-red-200' }
  }

  const statusFinanceiro = getStatusFinanceiro()

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout()
    }
  }

  const handleOpenDetalhes = (compra) => {
    setSelectedCompra(compra)
    setShowDetalhesModal(true)
  }

  const handleMarcarComoPaga = (despesaId) => {
    if (window.confirm('Marcar esta despesa como paga?')) {
      // Encontrar a despesa e marcar como paga
      const despesaAtualizada = {
        status_pagamento: 'pago',
        data_pagamento: new Date().toISOString().split('T')[0]
      }
      
      // Usar função do store para atualizar
      updateDespesaFixa(despesaId, despesaAtualizada)
      
      // Mostrar feedback
      alert('Despesa marcada como paga!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header com Gradiente Moderno */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 shadow-xl border-b border-amber-300/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Menu Mobile */}
            <div className="flex items-center">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-gray-800 hover:text-gray-900 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>

            {/* Controles Centrais */}
            <div className="flex items-center justify-center flex-1 space-x-3 md:space-x-4">
              {/* Seletor de Data Unificado */}
              <div className="flex items-center">
                <input
                  type="month"
                  value={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-')
                    setSelectedYear(parseInt(year))
                    setSelectedMonth(parseInt(month))
                  }}
                  className="bg-white/90 backdrop-blur-sm border border-white/30 text-gray-800 font-medium text-sm rounded-xl px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Seletor de Perfil */}
              <div className="block">
                <Select 
                  value={perfis.some(p => p === selectedProfile) ? selectedProfile : ""} 
                  onValueChange={setSelectedProfile}
                >
                  <SelectTrigger className="w-10 md:w-32 bg-white/90 backdrop-blur-sm border border-white/30 text-gray-800 font-medium text-xs md:text-sm h-9 rounded-xl shadow-sm hover:bg-white transition-all duration-200">
                    <SelectValue placeholder="Perfil">
                      {perfis.some(p => p === selectedProfile) ? (
                        <>
                          <span className="md:hidden">{getUserIcon(selectedProfile)}</span>
                          <span className="hidden md:flex items-center">
                            <span className="mr-2">{getUserIcon(selectedProfile)}</span>
                            {selectedProfile}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-xs">Perfil</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl backdrop-blur-sm">
                    {perfis.map(perfil => (
                      <SelectItem key={perfil} value={perfil} className="rounded-lg">
                        <span className="flex items-center">
                          <span className="mr-2">{getUserIcon(perfil)}</span>
                          {perfil}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Controles da Direita */}
            <div className="flex items-center space-x-3">
              {/* Sistema de Notificações - Oculto no mobile */}
              <div className="hidden md:block">
                <NotificationSystemSimple />
              </div>

              {/* Botão Sair - Moderno */}
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm" 
                className="bg-white/90 backdrop-blur-sm border border-white/30 text-gray-800 hover:bg-white hover:shadow-md px-2 md:px-4 h-9 rounded-xl transition-all duration-200 font-medium"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline text-xs">Sair</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile com glassmorphism */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/20 bg-white/10 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              {/* Botão Nova Despesa Mobile */}
              <Button 
                onClick={() => {
                  setShowNewExpenseModal(true)
                  setShowMobileMenu(false)
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4 mr-2" />
                GERAR NOVA DESPESA
              </Button>
              
              {/* Seletor de Perfil Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">Perfil</label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm rounded-xl border border-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {perfis.map(perfil => (
                      <SelectItem key={perfil} value={perfil} className="rounded-lg">
                        <span className="flex items-center">
                          <span className="mr-2">{getUserIcon(perfil)}</span>
                          {perfil}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navegação por abas com underline animado */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex items-center space-x-2 py-4 px-2 font-medium text-sm whitespace-nowrap transition-all duration-300 group
                    ${activeTab === tab.id
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 transition-all duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span>{tab.label}</span>
                  {/* Underline animado */}
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300
                    ${activeTab === tab.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                  `} />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'geral' && (
          <div className="space-y-8">
            {/* Cards principais com glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <div className="p-2 rounded-lg bg-emerald-100 mr-3">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    Renda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRendas)}</div>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <div className="p-2 rounded-lg bg-red-100 mr-3">
                      <CreditCard className="w-4 h-4 text-red-600" />
                    </div>
                    Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalGastos)}</div>
                </CardContent>
              </Card>
              
              <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <div className="p-2 rounded-lg bg-blue-100 mr-3">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                    </div>
                    Saldo Restante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${saldoRestante >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(saldoRestante)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contas do Mês - Compartilhada */}
            <Card 
              className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] group"
              onClick={() => setShowContasModal(true)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <div className="p-2 rounded-lg bg-orange-100 mr-3 group-hover:bg-orange-200 transition-colors duration-300">
                    <Receipt className="w-4 h-4 text-orange-600" />
                  </div>
                  Contas do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalGastos)}</div>
                <div className="text-sm text-gray-500 mt-2 group-hover:text-gray-600 transition-colors duration-300">Clique para ver todas as contas</div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100 mr-3">
                    <Home className="w-4 h-4 text-purple-600" />
                  </div>
                  Status Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${statusFinanceiro.bgColor} ${statusFinanceiro.color} border ${statusFinanceiro.borderColor} shadow-sm`}>
                  {statusFinanceiro.status}
                </div>
              </CardContent>
            </Card>
            
            <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800">
                  Resumo Financeiro - {meses.find(m => m.value === selectedMonth)?.label} {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Perfil Selecionado:</span>
                    <span className="font-semibold flex items-center text-gray-800">
                      <span className="mr-2">{getUserIcon(selectedProfile)}</span>
                      {selectedProfile}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Renda Total:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(totalRendas)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Despesas Variáveis:</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalDespesas)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Despesas Fixas:</span>
                    <span className="font-bold text-purple-600">{formatCurrency(totalFixas)}</span>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200/50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold text-lg">Saldo Final:</span>
                      <span className={`font-bold text-xl ${saldoRestante >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(saldoRestante)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Status Financeiro:</span>
                    <span className={`font-semibold ${statusFinanceiro.color}`}>
                      {statusFinanceiro.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'despesas' && (
          <div className="space-y-6">
            <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-800">
                  <span>Despesas Variáveis</span>
                  <Button 
                    onClick={() => setShowNewExpenseModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Nova Despesa
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {despesas.filter(d => d.mes === selectedMonth && d.ano === selectedYear).map((despesa) => (
                    <div 
                      key={despesa.id} 
                      className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md backdrop-blur-sm"
                      onClick={() => handleOpenDetalhes(despesa)}
                    >
                      <div>
                        <div className="font-medium text-gray-800">{despesa.descricao}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>{despesa.categoria}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{despesa.banco}</span>
                        </div>
                        {despesa.parcelas && (
                          <div className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded-lg inline-block">
                            Parcela {despesa.parcela_atual}/{despesa.parcelas}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          {formatCurrency(despesa.parcelas ? despesa.valor / despesa.parcelas : despesa.valor)}
                        </div>
                        {despesa.parcelas && (
                          <div className="text-xs text-gray-500">
                            Total: {formatCurrency(despesa.valor)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {despesas.filter(d => d.mes === selectedMonth && d.ano === selectedYear).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <CreditCard className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium mb-2">Nenhuma despesa cadastrada</p>
                      <p className="text-sm mb-4">Adicione sua primeira despesa para começar</p>
                      <Button 
                        onClick={() => setShowNewExpenseModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeira Despesa
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'renda' && (
          <div className="space-y-6">
            <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-800">
                  <span>Fontes de Renda</span>
                  <Button 
                    onClick={() => setShowNovaRendaModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Renda
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rendas.filter(r => r.mes === selectedMonth && r.ano === selectedYear).map((renda) => (
                    <div 
                      key={renda.id} 
                      className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl hover:bg-gray-50/80 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] hover:shadow-md backdrop-blur-sm"
                      onClick={() => handleOpenDetalhes(renda)}
                    >
                      <div>
                        <div className="font-medium text-gray-800">{renda.descricao}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>{renda.categoria}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{renda.usuario}</span>
                        </div>
                      </div>
                      <div className="font-bold text-emerald-600">{formatCurrency(renda.valor)}</div>
                    </div>
                  ))}
                  
                  {rendas.filter(r => r.mes === selectedMonth && r.ano === selectedYear).length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium mb-2">Nenhuma renda cadastrada</p>
                      <p className="text-sm mb-4">Adicione sua primeira fonte de renda</p>
                      <Button 
                        onClick={() => setShowNovaRendaModal(true)}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-xl shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeira Renda
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'fixas' && (
          <div className="space-y-6">
            <Card className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-800">Despesas Fixas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {despesasFixas.filter(f => f.mes === selectedMonth && f.ano === selectedYear).map((fixa) => (
                    <div 
                      key={fixa.id} 
                      className="flex items-center justify-between p-4 border border-gray-200/50 rounded-xl hover:bg-gray-50/80 transition-all duration-200 backdrop-blur-sm"
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleOpenDetalhes(fixa)}
                      >
                        <div className="font-medium text-gray-800">{fixa.descricao}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <span>{fixa.categoria}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>Vence dia {fixa.dia_vencimento}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold text-purple-600">{formatCurrency(fixa.valor)}</div>
                          <Badge 
                            variant={fixa.status_pagamento === 'pago' ? 'default' : 'destructive'}
                            className="rounded-lg"
                          >
                            {fixa.status_pagamento}
                          </Badge>
                        </div>
                        {fixa.status_pagamento === 'pendente' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarcarComoPaga(fixa.id)
                            }}
                          >
                            ✓ Pagar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'bancos' && (
          <div className="space-y-6">
            {['Nubank', 'Bradesco', 'Itaú'].map((banco) => {
              const despesasBanco = despesas.filter(d => d.banco === banco && d.mes === selectedMonth && d.ano === selectedYear)
              const despesasFixasBanco = despesasFixas.filter(f => f.banco === banco && f.mes === selectedMonth && f.ano === selectedYear)
              
              // Calcular totais
              const totalVariaveis = despesasBanco.reduce((sum, d) => sum + d.valor, 0)
              const totalFixas = despesasFixasBanco.reduce((sum, f) => sum + f.valor, 0)
              const totalMes = totalVariaveis + totalFixas
              
              // Calcular parcelamentos
              const despesasParceladas = despesasBanco.filter(d => d.parcelas && d.parcelas > 1)
              const totalParcelado = despesasParceladas.reduce((sum, d) => sum + (d.valor * d.parcelas), 0)
              const valorParceladoMes = despesasParceladas.reduce((sum, d) => sum + d.valor, 0)

              const getBancoIcon = (banco) => {
                switch (banco) {
                  case 'Nubank': return '💜'
                  case 'Bradesco': return '🔴'
                  case 'Itaú': return '🔵'
                  default: return '🏦'
                }
              }

              const getBancoGradient = (banco) => {
                switch (banco) {
                  case 'Nubank': return 'from-purple-500 to-pink-500'
                  case 'Bradesco': return 'from-red-500 to-orange-500'
                  case 'Itaú': return 'from-blue-500 to-cyan-500'
                  default: return 'from-gray-500 to-slate-500'
                }
              }

              return (
                <Card key={banco} className="rounded-xl shadow-md bg-white/70 backdrop-blur-sm border border-white/20 overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${getBancoGradient(banco)}`}></div>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                      <span className="text-2xl mr-3">{getBancoIcon(banco)}</span>
                      {banco}
                    </CardTitle>
                    
                    {/* Resumo do Cartão */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200/50">
                        <div className="text-sm text-gray-600 font-medium">Valor do Mês</div>
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(totalMes)}</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200/50">
                        <div className="text-sm text-gray-600 font-medium">Total Parcelado</div>
                        <div className="text-lg font-bold text-purple-600">{formatCurrency(totalParcelado)}</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200/50">
                        <div className="text-sm text-gray-600 font-medium">Parcelas do Mês</div>
                        <div className="text-lg font-bold text-orange-600">{formatCurrency(valorParceladoMes)}</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200/50">
                        <div className="text-sm text-gray-600 font-medium">Total Transações</div>
                        <div className="text-lg font-bold text-emerald-600">{despesasBanco.length + despesasFixasBanco.length}</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* Despesas Variáveis */}
                    {despesasBanco.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <div className="p-2 rounded-lg bg-blue-100 mr-3">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          Despesas Variáveis ({despesasBanco.length})
                        </h4>
                        <div className="space-y-3">
                          {despesasBanco.map((despesa) => (
                            <div 
                              key={despesa.id} 
                              className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:from-gray-100 hover:to-blue-100 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] border border-gray-200/50"
                              onClick={() => handleOpenDetalhes(despesa)}
                            >
                              <div>
                                <div className="font-medium text-gray-800">{despesa.descricao}</div>
                                <div className="text-sm text-gray-500 flex items-center space-x-2">
                                  <span>{despesa.categoria}</span>
                                  {despesa.parcelas && despesa.parcelas > 1 && (
                                    <>
                                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                      <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded-lg text-xs">
                                        {despesa.parcela_atual || 1}/{despesa.parcelas}x
                                      </span>
                                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                      <span className="text-purple-600 text-xs">
                                        Total: {formatCurrency(despesa.valor * despesa.parcelas)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-blue-600">{formatCurrency(despesa.valor)}</div>
                                {despesa.parcelas && despesa.parcelas > 1 && (
                                  <div className="text-xs text-gray-500">parcela atual</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Despesas Fixas */}
                    {despesasFixasBanco.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                          <div className="p-2 rounded-lg bg-purple-100 mr-3">
                            <Calendar className="w-4 h-4 text-purple-600" />
                          </div>
                          Despesas Fixas ({despesasFixasBanco.length})
                        </h4>
                        <div className="space-y-3">
                          {despesasFixasBanco.map((fixa) => (
                            <div 
                              key={fixa.id} 
                              className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] border border-purple-200/50"
                              onClick={() => handleOpenDetalhes(fixa)}
                            >
                              <div>
                                <div className="font-medium text-gray-800">{fixa.descricao}</div>
                                <div className="text-sm text-gray-500">
                                  {fixa.categoria} • Vence dia {fixa.dia_vencimento}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-purple-600">{formatCurrency(fixa.valor)}</div>
                                <Badge 
                                  variant={fixa.status_pagamento === 'pago' ? 'default' : 'destructive'} 
                                  className="text-xs rounded-lg"
                                >
                                  {fixa.status_pagamento}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mensagem quando não há transações */}
                    {despesasBanco.length === 0 && despesasFixasBanco.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="p-4 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                        <p className="text-sm">para {banco} neste mês.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {activeTab === 'pedidos' && <PedidosTabSimples />}
      </main>

      {/* Modal de Nova Despesa */}
      <NewExpenseModalCompleto 
        isOpen={showNewExpenseModal}
        onClose={() => setShowNewExpenseModal(false)}
      />

      {/* Modal de Gastos do Mês */}
      <GastosDoMesModal 
        isOpen={showGastosModal}
        onClose={() => setShowGastosModal(false)}
      />

      {/* Modal de Contas do Mês */}
      <ContasDoMesModal 
        isOpen={showContasModal}
        onClose={() => setShowContasModal(false)}
        despesas={despesas}
        despesasFixas={despesasFixas}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedProfile={selectedProfile}
        onOpenDetalhes={handleOpenDetalhes}
      />

      {/* Modal de Detalhes */}
      <DetalhesCompraModal 
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        compra={selectedCompra}
      />

      {/* Modal de Nova Renda */}
      <NovaRendaModal 
        isOpen={showNovaRendaModal}
        onClose={() => setShowNovaRendaModal(false)}
      />
    </div>
  )
}

export default DashboardSimple

