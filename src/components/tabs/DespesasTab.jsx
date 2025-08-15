import React, { useState } from 'react'
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  CreditCard, 
  User, 
  Tag,
  DollarSign,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import useStore from '../../store/useStore'
import { supabaseService } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../utils/formatters'

const DespesasTab = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroFormaPagamento, setFiltroFormaPagamento] = useState('todas')
  const [filtroQuemEfetuou, setFiltroQuemEfetuou] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('data_desc')
  const [busca, setBusca] = useState('')
  const [despesaSelecionada, setDespesaSelecionada] = useState(null)
  const [showDetalhes, setShowDetalhes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { 
    selectedProfile, 
    selectedMonth, 
    selectedYear,
    getDespesasByCategory,
    removeDespesa,
    getTotalDespesas
  } = useStore()

  // Obter despesas filtradas - EXCLUINDO DESPESAS FIXAS
  const todasDespesas = getDespesasByCategory()
    .filter(despesa => {
      // FILTRO PRINCIPAL: Excluir despesas fixas
      if (despesa.categoria === 'Fixo' || despesa.tipo_despesa === 'fixa') {
        return false
      }
      
      // Filtro por categoria
      if (filtroCategoria && filtroCategoria !== 'todas' && despesa.categoria !== filtroCategoria) return false
      
      // Filtro por forma de pagamento
      const formaPagamento = despesa.forma_pagamento || despesa.banco
      if (filtroFormaPagamento && filtroFormaPagamento !== 'todas' && formaPagamento !== filtroFormaPagamento) return false
      
      // Filtro por quem efetuou
      const quemEfetuou = despesa.quem_efetuou || despesa.usuario
      if (filtroQuemEfetuou && filtroQuemEfetuou !== 'todos' && quemEfetuou !== filtroQuemEfetuou) return false
      
      // Filtro por busca
      if (busca && !despesa.descricao.toLowerCase().includes(busca.toLowerCase())) return false
      
      return true
    })
    .sort((a, b) => {
      switch (ordenacao) {
        case 'data_asc':
          return new Date(a.data_compra || a.created_at) - new Date(b.data_compra || b.created_at)
        case 'data_desc':
          return new Date(b.data_compra || b.created_at) - new Date(a.data_compra || a.created_at)
        case 'valor_asc':
          return a.valor - b.valor
        case 'valor_desc':
          return b.valor - a.valor
        case 'descricao_asc':
          return a.descricao.localeCompare(b.descricao)
        case 'descricao_desc':
          return b.descricao.localeCompare(a.descricao)
        default:
          return 0
      }
    })

  // Paginação
  const totalPages = Math.ceil(todasDespesas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const despesas = todasDespesas.slice(startIndex, endIndex)

  // Resetar página quando filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1)
  }, [filtroCategoria, filtroFormaPagamento, filtroQuemEfetuou, busca, ordenacao])

  // Categorias excluindo "Fixo"
  const categorias = ['Despesa', 'Lazer', 'Alimentação', 'Transporte', 'Saúde', 'Educação']
  const formasPagamento = ['Pix', 'Bradesco', 'Itaú', 'Nubank', 'Dinheiro']
  const quemEfetuou = ['Gabriel', 'Paloma', 'Casa']

  const totalDespesas = getTotalDespesas()
  const totalFiltrado = todasDespesas.reduce((total, despesa) => total + despesa.valor, 0)

  const handleExcluirDespesa = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      setIsLoading(true)
      try {
        const { error } = await supabaseService.deleteDespesa(id)
        if (error) throw new Error(error.message)
        
        removeDespesa(id)
      } catch (err) {
        console.error('Erro ao excluir despesa:', err)
        alert('Erro ao excluir despesa: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleVerDetalhes = (despesa) => {
    setDespesaSelecionada(despesa)
    setShowDetalhes(true)
  }

  const getCategoriaColor = (categoria) => {
    const colors = {
      'Despesa': 'bg-blue-100 text-blue-800',
      'Lazer': 'bg-green-100 text-green-800',
      'Alimentação': 'bg-orange-100 text-orange-800',
      'Transporte': 'bg-yellow-100 text-yellow-800',
      'Saúde': 'bg-red-100 text-red-800',
      'Educação': 'bg-purple-100 text-purple-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const getFormaPagamentoIcon = (forma) => {
    const icons = {
      'Pix': '💳',
      'Bradesco': '🏦',
      'Itaú': '🏦',
      'Nubank': '💜',
      'Dinheiro': '💵'
    }
    return icons[forma] || '💳'
  }

  const limparFiltros = () => {
    setFiltroCategoria('todas')
    setFiltroFormaPagamento('todas')
    setFiltroQuemEfetuou('todos')
    setBusca('')
    setOrdenacao('data_desc')
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total do Mês (Variáveis)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Filtrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalFiltrado)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quantidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{todasDespesas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros e Busca - Despesas Variáveis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div>
            <Input
              placeholder="Buscar por descrição..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroFormaPagamento} onValueChange={setFiltroFormaPagamento}>
              <SelectTrigger>
                <SelectValue placeholder="Forma de Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {formasPagamento.map(forma => (
                  <SelectItem key={forma} value={forma}>
                    <span className="flex items-center">
                      <span className="mr-2">{getFormaPagamentoIcon(forma)}</span>
                      {forma}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filtroQuemEfetuou} onValueChange={setFiltroQuemEfetuou}>
              <SelectTrigger>
                <SelectValue placeholder="Quem Efetuou" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {quemEfetuou.map(pessoa => (
                  <SelectItem key={pessoa} value={pessoa}>
                    {pessoa}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="data_desc">Data (Mais recente)</SelectItem>
                <SelectItem value="data_asc">Data (Mais antiga)</SelectItem>
                <SelectItem value="valor_desc">Valor (Maior)</SelectItem>
                <SelectItem value="valor_asc">Valor (Menor)</SelectItem>
                <SelectItem value="descricao_asc">Descrição (A-Z)</SelectItem>
                <SelectItem value="descricao_desc">Descrição (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={limparFiltros} variant="outline" size="sm">
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de despesas */}
      <div className="space-y-3">
        {despesas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhuma despesa variável encontrada</p>
              <p className="text-sm text-gray-400 mt-2">
                {busca || filtroCategoria || filtroFormaPagamento || filtroQuemEfetuou
                  ? 'Tente ajustar os filtros'
                  : 'Adicione uma nova despesa usando o botão flutuante'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          despesas.map((despesa) => (
            <Card key={despesa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{despesa.descricao}</h3>
                      <Badge className={getCategoriaColor(despesa.categoria)}>
                        {despesa.categoria}
                      </Badge>
                      {despesa.parcelas > 1 && (
                        <Badge variant="outline">
                          {despesa.parcela_atual}/{despesa.parcelas}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium text-gray-900">{formatCurrency(despesa.valor)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(despesa.data_compra || despesa.created_at)}
                      </div>
                      
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-1" />
                        <span className="mr-1">{getFormaPagamentoIcon(despesa.forma_pagamento || despesa.banco)}</span>
                        {despesa.forma_pagamento || despesa.banco}
                      </div>
                      
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {despesa.quem_efetuou || despesa.usuario}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {despesa.parcelas > 1 && (
                      <Button
                        onClick={() => handleVerDetalhes(despesa)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      onClick={() => handleExcluirDespesa(despesa.id)}
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
                Mostrando {startIndex + 1} a {Math.min(endIndex, todasDespesas.length)} de {todasDespesas.length} despesas
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

      {/* Modal de detalhes da despesa parcelada */}
      {showDetalhes && despesaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Detalhes da Despesa Parcelada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{despesaSelecionada.descricao}</h3>
                <Badge className={getCategoriaColor(despesaSelecionada.categoria)}>
                  {despesaSelecionada.categoria}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="font-semibold">
                    {formatCurrency(despesaSelecionada.valor_total || despesaSelecionada.valor * despesaSelecionada.parcelas)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor da Parcela:</span>
                  <span className="font-semibold">{formatCurrency(despesaSelecionada.valor)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcelas:</span>
                  <span className="font-semibold">
                    {despesaSelecionada.parcela_atual} de {despesaSelecionada.parcelas}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Data da Compra:</span>
                  <span className="font-semibold">{formatDate(despesaSelecionada.data_compra || despesaSelecionada.created_at)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Forma de Pagamento:</span>
                  <span className="font-semibold">
                    <span className="mr-1">{getFormaPagamentoIcon(despesaSelecionada.forma_pagamento || despesaSelecionada.banco)}</span>
                    {despesaSelecionada.forma_pagamento || despesaSelecionada.banco}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => setShowDetalhes(false)}
                  variant="outline"
                  className="flex-1"
                >
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

export default DespesasTab

