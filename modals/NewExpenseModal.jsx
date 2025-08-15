import React, { useState } from 'react'
import { X, Calendar, DollarSign, Tag, CreditCard, User, Hash, Clock } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import useStore from '../../store/useStore'
import { supabaseService } from '../../lib/supabase'
import { calcularMesCobranca, gerarParcelas } from '../../utils/calculations'
import { formatCurrency } from '../../utils/formatters'

const NewExpenseModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    categoria: '',
    forma_pagamento: '',
    data_compra: new Date().toISOString().split('T')[0],
    quem_efetuou: '',
    parcelas: 1,
    iniciar_proximo_mes: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { currentUser, selectedProfile, addDespesa } = useStore()

  const categorias = [
    { value: 'Despesa', label: 'Despesa', icon: '🛒' },
    { value: 'Lazer', label: 'Lazer', icon: '🎉' },
    { value: 'Fixo', label: 'Fixo', icon: '🏠' }
  ]

  const formasPagamento = [
    { value: 'Pix', label: 'Pix', icon: '💳' },
    { value: 'Bradesco', label: 'Bradesco', icon: '🏦' },
    { value: 'Itaú', label: 'Itaú', icon: '🏦' },
    { value: 'Nubank', label: 'Nubank', icon: '💜' },
    { value: 'Dinheiro', label: 'Dinheiro', icon: '💵' }
  ]

  const quemEfetuou = [
    { value: 'Gabriel', label: 'Gabriel', icon: '👨‍💼' },
    { value: 'Paloma', label: 'Paloma', icon: '👩‍💼' },
    { value: 'Casa', label: 'Casa', icon: '🏠' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validações
      if (!formData.valor || parseFloat(formData.valor) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      if (!formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (!formData.categoria) {
        throw new Error('Categoria é obrigatória')
      }
      if (!formData.forma_pagamento) {
        throw new Error('Forma de pagamento é obrigatória')
      }
      if (!formData.quem_efetuou) {
        throw new Error('Quem efetuou é obrigatório')
      }

      // Calcular mês de cobrança
      const { mes, ano } = calcularMesCobranca(
        formData.data_compra,
        formData.forma_pagamento,
        formData.iniciar_proximo_mes
      )

      // Preparar dados da despesa
      const despesaBase = {
        usuario: formData.quem_efetuou === 'Casa' ? 'Casa' : selectedProfile,
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        forma_pagamento: formData.forma_pagamento,
        data_compra: formData.data_compra,
        quem_efetuou: formData.quem_efetuou,
        parcelas: parseInt(formData.parcelas),
        parcela_atual: 1,
        iniciar_proximo_mes: formData.iniciar_proximo_mes,
        mes_cobranca: mes,
        ano_cobranca: ano
      }

      if (parseInt(formData.parcelas) > 1) {
        // Gerar parcelas
        const parcelas = gerarParcelas(despesaBase)
        
        // Salvar cada parcela
        for (const parcela of parcelas) {
          const { data, error } = await supabaseService.createDespesa(parcela)
          if (error) throw new Error(error.message)
          if (data && data[0]) {
            addDespesa(data[0])
          }
        }
      } else {
        // Despesa única
        const { data, error } = await supabaseService.createDespesa(despesaBase)
        if (error) throw new Error(error.message)
        if (data && data[0]) {
          addDespesa(data[0])
        }
      }

      // Resetar formulário e fechar modal
      setFormData({
        valor: '',
        descricao: '',
        categoria: '',
        forma_pagamento: '',
        data_compra: new Date().toISOString().split('T')[0],
        quem_efetuou: '',
        parcelas: 1,
        iniciar_proximo_mes: false
      })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const valorParcela = formData.valor && formData.parcelas > 1 
    ? parseFloat(formData.valor) / parseInt(formData.parcelas)
    : parseFloat(formData.valor) || 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Nova Despesa</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor" className="flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Valor *
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                className="text-lg"
                required
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Descrição *
              </Label>
              <Input
                id="descricao"
                placeholder="Descrição da compra"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Categoria *
              </Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{categoria.icon}</span>
                        {categoria.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Forma de Pagamento *
              </Label>
              <Select value={formData.forma_pagamento} onValueChange={(value) => handleInputChange('forma_pagamento', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {formasPagamento.map(forma => (
                    <SelectItem key={forma.value} value={forma.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{forma.icon}</span>
                        {forma.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data da Compra */}
            <div className="space-y-2">
              <Label htmlFor="data_compra" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Data da Compra *
              </Label>
              <Input
                id="data_compra"
                type="date"
                value={formData.data_compra}
                onChange={(e) => handleInputChange('data_compra', e.target.value)}
                required
              />
            </div>

            {/* Quem Efetuou */}
            <div className="space-y-2">
              <Label className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Quem Efetuou *
              </Label>
              <Select value={formData.quem_efetuou} onValueChange={(value) => handleInputChange('quem_efetuou', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione quem efetuou" />
                </SelectTrigger>
                <SelectContent>
                  {quemEfetuou.map(pessoa => (
                    <SelectItem key={pessoa.value} value={pessoa.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{pessoa.icon}</span>
                        {pessoa.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parcelamento */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parcelas" className="flex items-center">
                  <Hash className="w-4 h-4 mr-2" />
                  Número de Parcelas
                </Label>
                <Input
                  id="parcelas"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.parcelas}
                  onChange={(e) => handleInputChange('parcelas', e.target.value)}
                />
              </div>

              {formData.parcelas > 1 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Parcelamento:</strong> {formData.parcelas}x de {formatCurrency(valorParcela)}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="iniciar_proximo_mes"
                  checked={formData.iniciar_proximo_mes}
                  onCheckedChange={(checked) => handleInputChange('iniciar_proximo_mes', checked)}
                />
                <Label htmlFor="iniciar_proximo_mes" className="flex items-center text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Iniciar cobrança no próximo mês
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Despesa'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewExpenseModal

