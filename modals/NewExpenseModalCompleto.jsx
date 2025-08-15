import React, { useState } from 'react'
import { 
  X, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  User, 
  Tag, 
  FileText,
  Check,
  AlertCircle,
  ShoppingCart,
  Clock
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Checkbox } from '../ui/checkbox'
import useStore from '../../store/useStore'
import { supabaseService } from '../../lib/supabase'
import { formatCurrency } from '../../utils/formatters'

const NewExpenseModalCompleto = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    usuario: '',
    banco: '',
    parcelas: 1,
    data_compra: new Date().toISOString().split('T')[0],
    observacoes: '',
    compra_outro_mes: false,
    eh_conta_fixa: false,
    dia_vencimento: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const { 
    selectedProfile, 
    selectedMonth, 
    selectedYear,
    addDespesa,
    addDespesaFixa
  } = useStore()

  const categorias = [
    { value: 'Despesa', label: 'Despesa Geral', color: 'bg-blue-100 text-blue-800' },
    { value: 'Lazer', label: 'Lazer', color: 'bg-green-100 text-green-800' },
    { value: 'Alimentação', label: 'Alimentação', color: 'bg-orange-100 text-orange-800' },
    { value: 'Transporte', label: 'Transporte', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Saúde', label: 'Saúde', color: 'bg-red-100 text-red-800' },
    { value: 'Educação', label: 'Educação', color: 'bg-purple-100 text-purple-800' }
  ]

  const usuarios = [
    { value: 'Gabriel', label: 'Gabriel', icon: '👨‍💼' },
    { value: 'Paloma', label: 'Paloma', icon: '👩‍💼' },
    { value: 'Casa', label: 'Casa', icon: '🏠' }
  ]

  const bancos = [
    { value: 'Pix', label: 'Pix', icon: '💳' },
    { value: 'Bradesco', label: 'Bradesco', icon: '🏦' },
    { value: 'Itaú', label: 'Itaú', icon: '🏦' },
    { value: 'Nubank', label: 'Nubank', icon: '💜' },
    { value: 'Dinheiro', label: 'Dinheiro', icon: '💵' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Se mudou para conta fixa, resetar parcelamento e definir categoria
      if (field === 'eh_conta_fixa' && value === true) {
        newData.parcelas = 1
        newData.compra_outro_mes = false
        newData.categoria = 'Fixo' // Definir categoria automaticamente
      }
      
      // Se mudou para não fixa, resetar dia de vencimento e categoria
      if (field === 'eh_conta_fixa' && value === false) {
        newData.dia_vencimento = ''
        newData.categoria = '' // Resetar categoria para permitir seleção
      }
      
      return newData
    })
    setError('')
  }

  // FUNÇÃO CORRIGIDA: Calcular datas das parcelas
  const calcularDatasParcelas = () => {
    const { parcelas, data_compra, compra_outro_mes } = formData
    const dataCompra = new Date(data_compra)
    const datas = []

    for (let i = 0; i < parcelas; i++) {
      let dataParcela

      if (compra_outro_mes) {
        // Se compra foi em outro mês, primeira parcela é no mês vigente
        dataParcela = new Date(selectedYear, selectedMonth - 1, dataCompra.getDate())
        dataParcela.setMonth(dataParcela.getMonth() + i)
      } else {
        // Se compra é do mês atual, primeira parcela é no mês da compra
        dataParcela = new Date(dataCompra)
        dataParcela.setMonth(dataParcela.getMonth() + i)
      }

      // Ajustar se o dia não existe no mês (ex: 31 de fevereiro)
      if (dataParcela.getDate() !== dataCompra.getDate()) {
        dataParcela = new Date(dataParcela.getFullYear(), dataParcela.getMonth() + 1, 0)
      }

      datas.push(dataParcela)
    }

    return datas
  }

  const gerarPreviewParcelas = () => {
    if (formData.eh_conta_fixa || formData.parcelas <= 1) return []

    const valorParcela = parseFloat(formData.valor) / formData.parcelas
    const datasParcelas = calcularDatasParcelas()

    return datasParcelas.map((data, index) => ({
      numero: index + 1,
      valor: valorParcela,
      data: data.toISOString().split('T')[0],
      mes: data.getMonth() + 1,
      ano: data.getFullYear()
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validações
      if (!formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (!formData.valor || parseFloat(formData.valor) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      if (!formData.eh_conta_fixa && !formData.categoria) {
        throw new Error('Categoria é obrigatória')
      }
      if (!formData.usuario) {
        throw new Error('Usuário é obrigatório')
      }
      if (!formData.banco) {
        throw new Error('Forma de pagamento é obrigatória')
      }

      // Validações específicas para conta fixa
      if (formData.eh_conta_fixa) {
        if (!formData.dia_vencimento || parseInt(formData.dia_vencimento) < 1 || parseInt(formData.dia_vencimento) > 31) {
          throw new Error('Dia de vencimento deve ser entre 1 e 31')
        }
      }

      console.log('Iniciando salvamento...', formData)

      if (formData.eh_conta_fixa) {
        // SALVAR COMO DESPESA FIXA
        const despesaFixaData = {
          descricao: formData.descricao.trim(),
          valor: parseFloat(formData.valor),
          categoria: 'Fixo', // Forçar categoria como Fixo
          usuario: formData.usuario,
          banco: formData.banco,
          dia_vencimento: parseInt(formData.dia_vencimento),
          observacoes: formData.observacoes || '',
          ativa: true,
          status_pagamento: 'pendente',
          mes_referencia: selectedMonth,
          ano_referencia: selectedYear,
          tipo_despesa: 'fixa'
        }

        console.log('Salvando despesa fixa:', despesaFixaData)

        // Tentar usar addDespesaFixa se existir, senão usar addDespesa
        if (typeof addDespesaFixa === 'function') {
          const result = await addDespesaFixa(despesaFixaData)
          console.log('Resultado addDespesaFixa:', result)
        } else {
          // Fallback: usar addDespesa com categoria Fixo
          const result = await addDespesa(despesaFixaData)
          console.log('Resultado addDespesa (fixa):', result)
        }

      } else {
        // SALVAR COMO DESPESA VARIÁVEL (COM OU SEM PARCELAMENTO)
        const valorParcela = parseFloat(formData.valor) / formData.parcelas
        const datasParcelas = calcularDatasParcelas()

        console.log('Datas das parcelas calculadas:', datasParcelas)

        // Criar uma despesa para cada parcela
        for (let i = 0; i < formData.parcelas; i++) {
          const dataParcela = datasParcelas[i]
          
          const despesaData = {
            descricao: formData.descricao.trim(),
            valor: valorParcela,
            categoria: formData.categoria,
            usuario: formData.usuario,
            banco: formData.banco,
            data_compra: dataParcela.toISOString().split('T')[0],
            observacoes: formData.observacoes || '',
            parcelas: formData.parcelas,
            parcela_atual: i + 1,
            valor_total: parseFloat(formData.valor),
            mes: dataParcela.getMonth() + 1,
            ano: dataParcela.getFullYear(),
            tipo_despesa: 'variavel'
          }

          console.log(`Salvando parcela ${i + 1}:`, despesaData)

          const result = await addDespesa(despesaData)
          console.log(`Resultado parcela ${i + 1}:`, result)

          if (!result || !result.success) {
            throw new Error(`Erro ao salvar parcela ${i + 1}`)
          }
        }
      }

      // Resetar formulário e fechar modal
      setFormData({
        descricao: '',
        valor: '',
        categoria: '',
        usuario: '',
        banco: '',
        parcelas: 1,
        data_compra: new Date().toISOString().split('T')[0],
        observacoes: '',
        compra_outro_mes: false,
        eh_conta_fixa: false,
        dia_vencimento: ''
      })
      setShowPreview(false)
      onClose()

      alert('Despesa adicionada com sucesso!')

    } catch (err) {
      console.error('Erro ao adicionar despesa:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      usuario: '',
      banco: '',
      parcelas: 1,
      data_compra: new Date().toISOString().split('T')[0],
      observacoes: '',
      compra_outro_mes: false,
      eh_conta_fixa: false,
      dia_vencimento: ''
    })
    setError('')
    setShowPreview(false)
    onClose()
  }

  if (!isOpen) return null

  const previewParcelas = gerarPreviewParcelas()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Nova Despesa
            </CardTitle>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-white/50"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Checkbox: É conta fixa? */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="eh_conta_fixa"
                    checked={formData.eh_conta_fixa}
                    onCheckedChange={(checked) => handleInputChange('eh_conta_fixa', checked)}
                    className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                  />
                  <div className="flex-1">
                    <Label htmlFor="eh_conta_fixa" className="text-lg font-semibold text-purple-800 cursor-pointer">
                      É uma conta fixa?
                    </Label>
                    <p className="text-sm text-purple-600 mt-1">
                      Contas fixas são despesas recorrentes mensais (ex: aluguel, internet, plano de celular)
                    </p>
                  </div>
                  <div className="text-2xl">
                    {formData.eh_conta_fixa ? '📋' : '🛒'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                Descrição *
              </Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder={formData.eh_conta_fixa ? "Ex: Aluguel, Internet, Plano de celular..." : "Ex: Compras no supermercado, Jantar no restaurante..."}
                className="rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor" className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                Valor Total *
              </Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                placeholder="0.00"
                className="rounded-xl border-gray-200 focus:border-green-400 focus:ring-green-400"
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                  <Tag className="w-4 h-4 text-purple-600" />
                </div>
                Categoria *
              </Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => handleInputChange('categoria', value)}
                disabled={formData.eh_conta_fixa}
              >
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-purple-400">
                  <SelectValue placeholder={formData.eh_conta_fixa ? "Fixo (automático)" : "Selecione a categoria"} />
                </SelectTrigger>
                <SelectContent>
                  {formData.eh_conta_fixa ? (
                    <SelectItem value="Fixo">Fixo</SelectItem>
                  ) : (
                    categorias.map(categoria => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Usuário */}
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                Quem efetuou *
              </Label>
              <Select value={formData.usuario} onValueChange={(value) => handleInputChange('usuario', value)}>
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-orange-400">
                  <SelectValue placeholder="Selecione quem efetuou" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map(usuario => (
                    <SelectItem key={usuario.value} value={usuario.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{usuario.icon}</span>
                        {usuario.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label htmlFor="banco" className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                </div>
                Forma de Pagamento *
              </Label>
              <Select value={formData.banco} onValueChange={(value) => handleInputChange('banco', value)}>
                <SelectTrigger className="rounded-xl border-gray-200 focus:border-indigo-400">
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {bancos.map(banco => (
                    <SelectItem key={banco.value} value={banco.value}>
                      <span className="flex items-center">
                        <span className="mr-2">{banco.icon}</span>
                        {banco.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Campos condicionais para CONTA FIXA */}
            {formData.eh_conta_fixa && (
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Configurações da Conta Fixa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dia_vencimento" className="text-sm font-medium">
                      Dia de Vencimento *
                    </Label>
                    <Select value={formData.dia_vencimento} onValueChange={(value) => handleInputChange('dia_vencimento', value)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione o dia do vencimento" />
                      </SelectTrigger>
                      <SelectContent className="max-h-48">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(dia => (
                          <SelectItem key={dia} value={dia.toString()}>
                            Dia {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Campos condicionais para DESPESA VARIÁVEL */}
            {!formData.eh_conta_fixa && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-800 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Configurações da Compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Data da Compra */}
                  <div className="space-y-2">
                    <Label htmlFor="data_compra" className="text-sm font-medium">
                      Data da Compra
                    </Label>
                    <Input
                      id="data_compra"
                      type="date"
                      value={formData.data_compra}
                      onChange={(e) => handleInputChange('data_compra', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>

                  {/* Checkbox: Compra de outro mês */}
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-blue-200">
                    <Checkbox
                      id="compra_outro_mes"
                      checked={formData.compra_outro_mes}
                      onCheckedChange={(checked) => handleInputChange('compra_outro_mes', checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="compra_outro_mes" className="font-medium cursor-pointer">
                        Compra foi feita em outro mês
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        {formData.compra_outro_mes 
                          ? "As parcelas começarão no mês vigente" 
                          : "As parcelas começarão no mês da compra"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Número de Parcelas */}
                  <div className="space-y-2">
                    <Label htmlFor="parcelas" className="text-sm font-medium">
                      Número de Parcelas
                    </Label>
                    <Select value={formData.parcelas.toString()} onValueChange={(value) => handleInputChange('parcelas', parseInt(value))}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}x de {formData.valor ? formatCurrency(parseFloat(formData.valor) / num) : 'R$ 0,00'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-medium flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais (opcional)"
                className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
                rows={3}
              />
            </div>

            {/* Preview das Parcelas */}
            {!formData.eh_conta_fixa && formData.parcelas > 1 && formData.valor && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Preview do Parcelamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {previewParcelas.map((parcela, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                        <span className="text-sm font-medium">
                          Parcela {parcela.numero}/{formData.parcelas}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(parcela.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="text-sm font-bold text-green-600">
                          {formatCurrency(parcela.valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview para Conta Fixa */}
            {formData.eh_conta_fixa && formData.valor && formData.dia_vencimento && (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-800 flex items-center">
                    <Check className="w-5 h-5 mr-2" />
                    Preview da Conta Fixa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Valor Mensal:</span>
                      <span className="font-bold text-purple-600">{formatCurrency(parseFloat(formData.valor))}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-600">Vencimento:</span>
                      <span className="text-sm">Todo dia {formData.dia_vencimento}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Botões */}
            <div className="flex space-x-3 pt-6">
              <Button
                type="button"
                onClick={handleClose}
                variant="outline"
                className="flex-1 rounded-xl"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {formData.eh_conta_fixa ? 'Criar Conta Fixa' : 'Adicionar Despesa'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default NewExpenseModalCompleto

