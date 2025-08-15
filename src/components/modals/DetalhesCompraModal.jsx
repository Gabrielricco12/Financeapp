import React from 'react'
import { X, DollarSign, Calendar, User, CreditCard, Tag, Hash, MapPin, Clock, Edit, Trash2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatCurrency, formatDate } from '../../utils/formattersSimple'
import useStoreSimple from '../../store/useStoreSimple'
import EditarDespesaModal from './EditarDespesaModal'
import { useState } from 'react'

const DetalhesCompraModal = ({ isOpen, onClose, compra, onEdit }) => {
  const { deleteDespesa, deleteDespesaFixa, deleteRenda } = useStoreSimple()
  const [showEditModal, setShowEditModal] = useState(false)
  
  if (!isOpen || !compra) return null

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleCloseEdit = () => {
    setShowEditModal(false)
  }

  // Determinar tipo da despesa
  const getTipoDespesa = () => {
    if (compra.categoria === 'Salário' || compra.categoria === 'Renda') {
      return 'renda'
    } else if (compra.dia_vencimento) {
      return 'fixa'
    } else {
      return 'despesa'
    }
  }

  const handleDelete = async () => {
    const confirmMessage = `Tem certeza que deseja excluir "${compra.descricao}"?`
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // Se for uma despesa parcelada, avisar sobre exclusão de todas as parcelas
      if (compra.parcelas && compra.parcelas > 1) {
        const parceladaConfirm = `Esta é uma compra parcelada (${compra.parcelas}x). Todas as parcelas serão excluídas. Continuar?`
        if (!window.confirm(parceladaConfirm)) {
          return
        }
      }

      // Determinar tipo de despesa e excluir
      if (compra.categoria === 'Salário' || compra.categoria === 'Renda') {
        deleteRenda(compra.id)
      } else if (compra.dia_vencimento) {
        deleteDespesaFixa(compra.id)
      } else {
        deleteDespesa(compra.id)
      }
      
      alert('Despesa excluída com sucesso!')
      onClose()
      
    } catch (error) {
      console.error('Erro ao excluir despesa:', error)
      alert('Erro ao excluir despesa: ' + error.message)
    }
  }

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

  const getUserIcon = (usuario) => {
    const icons = {
      'Gabriel': '👨‍💼',
      'Paloma': '👩‍💼',
      'Casa': '🏠'
    }
    return icons[usuario] || '👤'
  }

  const getCategoriaColor = (categoria) => {
    const colors = {
      'Despesa': 'bg-blue-100 text-blue-800',
      'Lazer': 'bg-green-100 text-green-800',
      'Fixo': 'bg-purple-100 text-purple-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const isParcelado = compra.parcelas && compra.parcelas > 1
  const valorParcela = isParcelado ? compra.valor / compra.parcelas : compra.valor

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay suave */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Detalhes da Compra
              </CardTitle>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-full p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Valor Principal */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(compra.valor)}
              </div>
              {isParcelado && (
                <div className="text-sm text-gray-600">
                  {compra.parcelas}x de {formatCurrency(valorParcela)}
                </div>
              )}
            </div>

            {/* Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">{compra.descricao}</div>
                  <div className="text-sm text-gray-500">Descrição</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Tag className="w-5 h-5 text-purple-500" />
                <div>
                  <Badge className={getCategoriaColor(compra.categoria)}>
                    {compra.categoria}
                  </Badge>
                  <div className="text-sm text-gray-500 mt-1">Categoria</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="flex items-center">
                    <span className="mr-2">{getUserIcon(compra.usuario)}</span>
                    <span className="font-medium">{compra.usuario}</span>
                  </div>
                  <div className="text-sm text-gray-500">Quem efetuou</div>
                </div>
              </div>

              {compra.banco && (
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="flex items-center">
                      <span className="mr-2">{getBancoIcon(compra.banco)}</span>
                      <span className="font-medium">{compra.banco}</span>
                    </div>
                    <div className="text-sm text-gray-500">Forma de pagamento</div>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-medium">{formatDate(compra.data_compra)}</div>
                  <div className="text-sm text-gray-500">Data da compra</div>
                </div>
              </div>
            </div>

            {/* Informações de Parcelamento */}
            {isParcelado && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Hash className="w-5 h-5 text-teal-500" />
                  <span className="font-medium">Informações do Parcelamento</span>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total de parcelas:</span>
                    <span className="font-medium">{compra.parcelas}x</span>
                  </div>
                  
                  {compra.parcela_atual && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Parcela atual:</span>
                      <span className="font-medium">{compra.parcela_atual}ª parcela</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor por parcela:</span>
                    <span className="font-medium text-green-600">{formatCurrency(valorParcela)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Valor total:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(compra.valor)}</span>
                  </div>

                  {/* Data de término do parcelamento */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Término previsto:</span>
                    <span className="font-medium text-purple-600">
                      {(() => {
                        const dataCompra = new Date(compra.data_compra)
                        const mesTermino = dataCompra.getMonth() + compra.parcelas
                        const anoTermino = dataCompra.getFullYear() + Math.floor(mesTermino / 12)
                        const mesTerminoFinal = mesTermino % 12
                        const dataTermino = new Date(anoTermino, mesTerminoFinal, dataCompra.getDate())
                        return dataTermino.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                      })()}
                    </span>
                  </div>

                  {/* Barra de progresso */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progresso</span>
                      <span>{compra.parcela_atual || 1}/{compra.parcelas}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((compra.parcela_atual || 1) / compra.parcelas) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Informações de Status (para despesas fixas) */}
            {compra.status_pagamento && (
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">Status do Pagamento</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={compra.status_pagamento === 'pago' ? 'default' : 'destructive'}>
                    {compra.status_pagamento}
                  </Badge>
                </div>

                {compra.dia_vencimento && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Vencimento:</span>
                    <span className="font-medium">Dia {compra.dia_vencimento}</span>
                  </div>
                )}
              </div>
            )}

            {/* Botões de Ação */}
            <div className="border-t pt-4">
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <EditarDespesaModal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        despesa={compra}
        tipo={getTipoDespesa()}
      />
    </div>
  )
}

export default DetalhesCompraModal

