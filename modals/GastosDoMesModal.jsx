import React, { useState } from 'react'
import { X, Search, Calendar, DollarSign, Tag, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import useStoreSimple from '../../store/useStoreSimple'
import { formatCurrency, formatDate } from '../../utils/formattersSimple'

const GastosDoMesModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const {
    despesas,
    despesasFixas,
    selectedMonth,
    selectedYear,
    selectedProfile
  } = useStoreSimple()

  if (!isOpen) return null

  // Filtrar despesas do mês
  const despesasDoMes = despesas.filter(d => {
    const matchesMonth = d.mes === selectedMonth && d.ano === selectedYear
    const matchesProfile = selectedProfile === 'Ambos' || 
                          d.usuario === selectedProfile || 
                          (selectedProfile === 'Gabriel' || selectedProfile === 'Paloma') && d.usuario === 'Casa'
    return matchesMonth && matchesProfile
  })

  const fixasDoMes = despesasFixas.filter(f => {
    const matchesMonth = f.mes === selectedMonth && f.ano === selectedYear
    const matchesProfile = selectedProfile === 'Ambos' || 
                          f.usuario === selectedProfile || 
                          (selectedProfile === 'Gabriel' || selectedProfile === 'Paloma') && f.usuario === 'Casa'
    return matchesMonth && matchesProfile
  })

  // Combinar todas as despesas
  const todasDespesas = [
    ...despesasDoMes.map(d => ({
      ...d,
      tipo: 'variavel',
      valorExibido: d.parcelas ? d.valor / d.parcelas : d.valor
    })),
    ...fixasDoMes.map(f => ({
      ...f,
      tipo: 'fixa',
      valorExibido: f.valor,
      data_compra: `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${f.dia_vencimento.toString().padStart(2, '0')}`
    }))
  ]

  // Filtrar por termo de busca
  const despesasFiltradas = todasDespesas.filter(despesa =>
    despesa.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    despesa.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    despesa.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular total
  const totalGastos = despesasFiltradas.reduce((total, despesa) => total + despesa.valorExibido, 0)

  const getBancoIcon = (banco) => {
    const icons = {
      'Nubank': '💜',
      'Bradesco': '🔴',
      'Itaú': '🔵',
      'Pix': '💳',
      'Dinheiro': '💵'
    }
    return icons[banco] || '🏦'
  }

  const getTipoIcon = (tipo) => {
    return tipo === 'fixa' ? '📅' : '🛒'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <Card className="border-0 shadow-none h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Gastos do Mês
                <Badge variant="outline" className="ml-2">
                  {formatCurrency(totalGastos)}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por descrição, categoria ou usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>

          <CardContent className="overflow-y-auto max-h-[60vh]">
            <div className="space-y-3">
              {despesasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhuma despesa encontrada com esse termo' : 'Nenhuma despesa neste mês'}
                </div>
              ) : (
                despesasFiltradas.map((despesa, index) => (
                  <div 
                    key={`${despesa.tipo}-${despesa.id}-${index}`} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {despesa.tipo === 'fixa' ? getTipoIcon('fixa') : getBancoIcon(despesa.banco)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{despesa.descricao}</span>
                          {despesa.parcelas && (
                            <Badge variant="outline" className="text-xs">
                              {despesa.parcela_atual}/{despesa.parcelas}x
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-4">
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {despesa.categoria}
                          </span>
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {getUserIcon(despesa.usuario)} {despesa.usuario}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(despesa.data_compra)}
                          </span>
                          {despesa.banco && (
                            <span>{despesa.banco}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">
                        {formatCurrency(despesa.valorExibido)}
                      </div>
                      {despesa.parcelas && despesa.valor !== despesa.valorExibido && (
                        <div className="text-xs text-gray-500">
                          Total: {formatCurrency(despesa.valor)}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>

          {/* Footer com resumo */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {despesasFiltradas.length} despesa(s) encontrada(s)
              </div>
              <div className="text-lg font-bold text-red-600">
                Total: {formatCurrency(totalGastos)}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default GastosDoMesModal

