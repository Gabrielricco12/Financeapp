import React, { useState } from 'react'
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  Receipt,
  Calendar,
  DollarSign,
  User,
  Filter
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import useStoreSimple from '../../store/useStoreSimple'
import { formatCurrency, formatDate } from '../../utils/formattersSimple'
import DetalhesCompraModal from '../modals/DetalhesCompraModal'

const ContasDoMesTab = ({ onNewExpense }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('todas')
  const [selectedCompra, setSelectedCompra] = useState(null)
  const [showDetalhesModal, setShowDetalhesModal] = useState(false)

  const {
    selectedMonth,
    selectedYear,
    selectedProfile,
    despesas,
    despesasFixas,
    getTotalDespesas,
    getTotalDespesasFixas
  } = useStoreSimple()

  // Filtrar despesas do mês atual
  const despesasDoMes = despesas.filter(despesa => {
    const despesaDate = new Date(despesa.data_compra)
    const matchesMonth = despesaDate.getMonth() + 1 === selectedMonth
    const matchesYear = despesaDate.getFullYear() === selectedYear
    const matchesProfile = selectedProfile === 'Ambos' || despesa.usuario === selectedProfile || despesa.usuario === 'Casa'
    
    return matchesMonth && matchesYear && matchesProfile
  })

  // Filtrar despesas fixas do mês atual
  const fixasDoMes = despesasFixas.filter(fixa => {
    const matchesProfile = selectedProfile === 'Ambos' || fixa.usuario === selectedProfile || fixa.usuario === 'Casa'
    return matchesProfile
  })

  // Combinar todas as contas do mês
  const todasContasDoMes = [
    ...despesasDoMes.map(d => ({ ...d, tipo: 'variavel' })),
    ...fixasDoMes.map(f => ({ ...f, tipo: 'fixa' }))
  ]

  // Aplicar filtros
  const contasFiltradas = todasContasDoMes.filter(conta => {
    const matchesSearch = conta.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.item?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'todas' || 
                           (selectedCategory === 'variavel' && conta.tipo === 'variavel') ||
                           (selectedCategory === 'fixa' && conta.tipo === 'fixa')
    
    return matchesSearch && matchesCategory
  })

  const totalVariaveis = despesasDoMes.reduce((sum, d) => sum + (d.valor_parcela || d.valor), 0)
  const totalFixas = fixasDoMes.reduce((sum, f) => sum + f.valor, 0)
  const totalGeral = totalVariaveis + totalFixas

  const handleVerDetalhes = (conta) => {
    setSelectedCompra(conta)
    setShowDetalhesModal(true)
  }

  const getCategoryIcon = (categoria) => {
    const icons = {
      'Alimentação': '🍽️',
      'Transporte': '🚗',
      'Lazer': '🎮',
      'Saúde': '🏥',
      'Casa': '🏠',
      'Educação': '📚',
      'Outros': '📦'
    }
    return icons[categoria] || '📦'
  }

  const getPaymentIcon = (formaPagamento) => {
    const icons = {
      'Pix': '💳',
      'Bradesco': '🔴',
      'Itaú': '🔵',
      'Nubank': '💜',
      'Dinheiro': '💵'
    }
    return icons[formaPagamento] || '💳'
  }

  const getUserIcon = (usuario) => {
    const icons = {
      'Gabriel': '👨‍💼',
      'Paloma': '👩‍💼',
      'Casa': '🏠'
    }
    return icons[usuario] || '👤'
  }

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-blue-500" />
              Contas Variáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalVariaveis)}</div>
            <div className="text-xs text-gray-500 mt-1">{despesasDoMes.length} contas</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-purple-500" />
              Contas Fixas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalFixas)}</div>
            <div className="text-xs text-gray-500 mt-1">{fixasDoMes.length} contas</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-orange-500" />
              Total Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalGeral)}</div>
            <div className="text-xs text-gray-500 mt-1">{contasFiltradas.length} contas</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de busca e filtro */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar conta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'todas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('todas')}
              >
                Todas
              </Button>
              <Button
                variant={selectedCategory === 'variavel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('variavel')}
              >
                Variáveis
              </Button>
              <Button
                variant={selectedCategory === 'fixa' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('fixa')}
              >
                Fixas
              </Button>
            </div>

            <Button onClick={onNewExpense} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de contas */}
      <div className="space-y-4">
        {contasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma conta encontrada</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Adicione uma nova conta para começar.'}
                </p>
                <Button onClick={onNewExpense} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeira Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          contasFiltradas.map((conta) => (
            <Card key={`${conta.tipo}-${conta.id}`} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg">
                          {getCategoryIcon(conta.categoria)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conta.descricao || conta.item}
                        </h3>
                        <Badge variant={conta.tipo === 'fixa' ? 'secondary' : 'default'} className="text-xs">
                          {conta.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">{getUserIcon(conta.usuario)}</span>
                          {conta.usuario}
                        </span>
                        
                        {conta.forma_pagamento && (
                          <span className="flex items-center">
                            <span className="mr-1">{getPaymentIcon(conta.forma_pagamento)}</span>
                            {conta.forma_pagamento}
                          </span>
                        )}
                        
                        {conta.data_compra && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(conta.data_compra)}
                          </span>
                        )}
                        
                        {conta.parcelas > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {conta.parcela_atual}/{conta.parcelas}x
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(conta.valor_parcela || conta.valor)}
                      </div>
                      {conta.valor_total && conta.valor_total !== (conta.valor_parcela || conta.valor) && (
                        <div className="text-xs text-gray-500">
                          Total: {formatCurrency(conta.valor_total)}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerDetalhes(conta)}
                      className="hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de detalhes */}
      {showDetalhesModal && selectedCompra && (
        <DetalhesCompraModal
          compra={selectedCompra}
          isOpen={showDetalhesModal}
          onClose={() => {
            setShowDetalhesModal(false)
            setSelectedCompra(null)
          }}
        />
      )}
    </div>
  )
}

export default ContasDoMesTab

