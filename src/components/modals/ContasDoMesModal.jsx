import React, { useState } from 'react'
import { X, Search, Calendar, CreditCard, User, Receipt, Eye } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { formatCurrency, formatDate } from '../../utils/formattersSimple'

const ContasDoMesModal = ({ isOpen, onClose, despesas, despesasFixas, selectedMonth, selectedYear, selectedProfile, onOpenDetalhes }) => {
  const [searchTerm, setSearchTerm] = useState('')

  if (!isOpen) return null

  // Combinar despesas variáveis e fixas
  const todasContas = [
    ...despesas.map(d => ({ ...d, tipo: 'variavel' })),
    ...despesasFixas.map(d => ({ ...d, tipo: 'fixa' }))
  ]

  // Filtrar por mês, ano e perfil
  const contasFiltradas = todasContas.filter(conta => {
    const matchMes = conta.mes === selectedMonth
    const matchAno = conta.ano === selectedYear
    const matchPerfil = selectedProfile === 'Ambos' || conta.usuario === selectedProfile
    const matchSearch = conta.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchMes && matchAno && matchPerfil && matchSearch
  })

  const totalGeral = contasFiltradas.reduce((sum, conta) => sum + conta.valor, 0)

  const getBancoIcon = (banco) => {
    switch (banco) {
      case 'Nubank': return '💜'
      case 'Bradesco': return '🔴'
      case 'Itaú': return '🔵'
      case 'Pix': return '💚'
      case 'Dinheiro': return '💵'
      default: return '💳'
    }
  }

  const getUserIcon = (usuario) => {
    switch (usuario) {
      case 'Gabriel': return '👨'
      case 'Paloma': return '👩'
      case 'Casa': return '🏠'
      default: return '👤'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay suave */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal - Menor e mais flutuante */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Header compacto */}
        <div className="bg-orange-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center">
                <Receipt className="w-6 h-6 mr-3" />
                Contas do Mês
              </h2>
              <p className="text-sm opacity-90">
                {selectedProfile} - {selectedMonth}/{selectedYear}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          
          {/* Resumo compacto */}
          <div className="flex justify-between items-center mt-3 text-sm">
            <span className="text-gray-600">
              {contasFiltradas.length} contas encontradas
            </span>
            <span className="font-semibold text-orange-600">
              Total: {formatCurrency(totalGeral)}
            </span>
          </div>
        </div>

        {/* Lista de Contas */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {contasFiltradas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhuma conta encontrada</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {contasFiltradas.map((conta) => (
                <div
                  key={`${conta.tipo}-${conta.id}`}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all cursor-pointer hover:border-orange-300"
                  onClick={() => onOpenDetalhes(conta)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xl">{getBancoIcon(conta.banco)}</div>
                    <div>
                      <div className="font-medium text-gray-900">{conta.descricao}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span>{conta.categoria}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          {getUserIcon(conta.usuario)} {conta.usuario}
                        </span>
                        {conta.tipo === 'fixa' && (
                          <>
                            <span>•</span>
                            <span>Venc: {conta.dia_vencimento}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">{formatCurrency(conta.valor)}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver detalhes
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total de {contasFiltradas.length} contas
            </div>
            <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContasDoMesModal

