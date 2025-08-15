import React, { useState } from 'react'
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  User, 
  Tag,
  AlertTriangle,
  TrendingUp,
  Eye,
  Filter
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import useStore from '../../store/useStore'
import { formatCurrency, formatDate } from '../../utils/formatters'

const BancosTab = () => {
  const [bancoSelecionado, setBancoSelecionado] = useState('')
  const [showDetalhes, setShowDetalhes] = useState(false)
  const [despesasSelecionadas, setDespesasSelecionadas] = useState([])
  const [bancoDetalhes, setBancoDetalhes] = useState('')

  const { 
    getDespesasByCategory,
    getTotalRenda,
    selectedProfile
  } = useStore()

  const despesas = getDespesasByCategory()
  const totalRenda = getTotalRenda()

  // Configuração dos bancos
  const bancosConfig = {
    'Bradesco': {
      icon: '🏦',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      limite: totalRenda * 0.3, // 30% da renda
      fechamento: 5
    },
    'Itaú': {
      icon: '🏦',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      limite: totalRenda * 0.25, // 25% da renda
      fechamento: 28
    },
    'Nubank': {
      icon: '💜',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      limite: totalRenda * 0.20, // 20% da renda
      fechamento: 5
    },
    'Pix': {
      icon: '💳',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      limite: totalRenda * 0.15, // 15% da renda
      fechamento: null
    },
    'Dinheiro': {
      icon: '💵',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      limite: totalRenda * 0.10, // 10% da renda
      fechamento: null
    }
  }

  // Agrupar despesas por banco
  const despesasPorBanco = despesas.reduce((acc, despesa) => {
    const banco = despesa.forma_pagamento
    if (!acc[banco]) {
      acc[banco] = []
    }
    acc[banco].push(despesa)
    return acc
  }, {})

  // Calcular totais por banco
  const totaisPorBanco = Object.keys(bancosConfig).map(banco => {
    const despesasBanco = despesasPorBanco[banco] || []
    const total = despesasBanco.reduce((sum, despesa) => sum + despesa.valor, 0)
    const config = bancosConfig[banco]
    const percentualUsado = config.limite > 0 ? (total / config.limite) * 100 : 0
    
    // Determinar nível de alerta
    let alertLevel = 'success'
    if (percentualUsado >= 85) alertLevel = 'danger'
    else if (percentualUsado >= 75) alertLevel = 'warning'
    else if (percentualUsado >= 65) alertLevel = 'caution'

    return {
      banco,
      despesas: despesasBanco,
      total,
      limite: config.limite,
      percentualUsado,
      alertLevel,
      config
    }
  }).sort((a, b) => b.total - a.total)

  const handleVerDetalhes = (banco, despesas) => {
    setBancoDetalhes(banco)
    setDespesasSelecionadas(despesas)
    setShowDetalhes(true)
  }

  const getAlertColor = (level) => {
    const colors = {
      'success': 'text-green-600',
      'caution': 'text-yellow-600',
      'warning': 'text-orange-600',
      'danger': 'text-red-600'
    }
    return colors[level] || 'text-gray-600'
  }

  const getAlertIcon = (level) => {
    if (level === 'danger' || level === 'warning' || level === 'caution') {
      return <AlertTriangle className="w-4 h-4" />
    }
    return null
  }

  const getProgressColor = (level) => {
    const colors = {
      'success': 'bg-green-500',
      'caution': 'bg-yellow-500',
      'warning': 'bg-orange-500',
      'danger': 'bg-red-500'
    }
    return colors[level] || 'bg-gray-500'
  }

  const bancosFiltrados = bancoSelecionado 
    ? totaisPorBanco.filter(item => item.banco === bancoSelecionado)
    : totaisPorBanco

  return (
    <div className="space-y-6">
      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totaisPorBanco.reduce((sum, item) => sum + item.total, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Limite Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totaisPorBanco.reduce((sum, item) => sum + item.limite, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Bancos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {totaisPorBanco.filter(item => item.total > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={bancoSelecionado} onValueChange={setBancoSelecionado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por banco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os bancos</SelectItem>
                {Object.keys(bancosConfig).map(banco => (
                  <SelectItem key={banco} value={banco}>
                    <span className="flex items-center">
                      <span className="mr-2">{bancosConfig[banco].icon}</span>
                      {banco}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {bancoSelecionado && (
              <Button onClick={() => setBancoSelecionado('')} variant="outline" size="sm">
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de consumo */}
      {totaisPorBanco.some(item => item.alertLevel === 'danger' || item.alertLevel === 'warning') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> Alguns bancos estão com alto consumo do limite:
            {totaisPorBanco
              .filter(item => item.alertLevel === 'danger' || item.alertLevel === 'warning')
              .map(item => ` ${item.banco} (${item.percentualUsado.toFixed(1)}%)`)
              .join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de bancos */}
      <div className="space-y-4">
        {bancosFiltrados.map((item) => (
          <Card key={item.banco} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${item.config.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    {item.config.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{item.banco}</h3>
                    <p className="text-sm text-gray-500">
                      {item.despesas.length} transação{item.despesas.length !== 1 ? 'ões' : ''}
                      {item.config.fechamento && ` • Fechamento dia ${item.config.fechamento}`}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${item.config.textColor} flex items-center`}>
                    {formatCurrency(item.total)}
                    {getAlertIcon(item.alertLevel) && (
                      <span className={`ml-2 ${getAlertColor(item.alertLevel)}`}>
                        {getAlertIcon(item.alertLevel)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    de {formatCurrency(item.limite)} ({item.percentualUsado.toFixed(1)}%)
                  </p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Consumo do limite</span>
                  <span className={getAlertColor(item.alertLevel)}>
                    {item.percentualUsado.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.alertLevel)}`}
                    style={{ width: `${Math.min(item.percentualUsado, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Disponível: {formatCurrency(Math.max(0, item.limite - item.total))}
                </div>
                
                {item.despesas.length > 0 && (
                  <Button
                    onClick={() => handleVerDetalhes(item.banco, item.despesas)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de detalhes do banco */}
      {showDetalhes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="mr-2">{bancosConfig[bancoDetalhes]?.icon}</span>
                Detalhes - {bancoDetalhes}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto">
              <div className="space-y-4">
                {despesasSelecionadas.map((despesa) => (
                  <div key={despesa.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{despesa.descricao}</h4>
                      <span className="font-bold text-lg">{formatCurrency(despesa.valor)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(despesa.data_compra)}
                      </div>
                      
                      <div className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        {despesa.categoria}
                      </div>
                      
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {despesa.quem_efetuou}
                      </div>
                      
                      {despesa.parcelas > 1 && (
                        <div className="flex items-center">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {despesa.parcela_atual}/{despesa.parcelas}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowDetalhes(false)} variant="outline">
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default BancosTab

