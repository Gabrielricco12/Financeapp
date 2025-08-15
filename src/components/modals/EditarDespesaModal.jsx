import React, { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import useStoreSimple from '../../store/useStoreSimple'

const EditarDespesaModal = ({ isOpen, onClose, despesa, tipo = 'despesa' }) => {
  const { updateDespesa, updateDespesaFixa, updateRenda } = useStoreSimple()
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    banco: '',
    usuario: '',
    parcelas: '',
    observacoes: '',
    dia_vencimento: ''
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (despesa && isOpen) {
      setFormData({
        descricao: despesa.descricao || '',
        valor: despesa.valor?.toString() || '',
        categoria: despesa.categoria || '',
        banco: despesa.banco || '',
        usuario: despesa.usuario || '',
        parcelas: despesa.parcelas?.toString() || '',
        observacoes: despesa.observacoes || '',
        dia_vencimento: despesa.dia_vencimento?.toString() || ''
      })
    }
  }, [despesa, isOpen])

  if (!isOpen || !despesa) return null

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.descricao || !formData.valor) {
      alert('Preencha os campos obrigatórios')
      return
    }

    try {
      setIsLoading(true)
      
      const dadosAtualizados = {
        ...despesa,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        banco: formData.banco,
        usuario: formData.usuario,
        observacoes: formData.observacoes
      }

      // Adicionar campos específicos baseado no tipo
      if (tipo === 'fixa' && formData.dia_vencimento) {
        dadosAtualizados.dia_vencimento = parseInt(formData.dia_vencimento)
      }
      
      if (tipo === 'despesa' && formData.parcelas) {
        dadosAtualizados.parcelas = parseInt(formData.parcelas)
      }

      // Chamar função de update apropriada
      if (tipo === 'renda') {
        updateRenda(despesa.id, dadosAtualizados)
      } else if (tipo === 'fixa') {
        updateDespesaFixa(despesa.id, dadosAtualizados)
      } else {
        updateDespesa(despesa.id, dadosAtualizados)
      }

      alert('Despesa atualizada com sucesso!')
      onClose()
      
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error)
      alert('Erro ao atualizar despesa: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const categorias = tipo === 'renda' 
    ? ['Salário', 'Renda', 'Freelance', 'Investimento', 'Outros']
    : ['Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Casa', 'Roupas', 'Outros']

  const bancos = ['Nubank', 'Bradesco', 'Itaú', 'Pix', 'Dinheiro']
  const usuarios = ['Gabriel', 'Paloma', 'Casa']

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Editar {tipo === 'renda' ? 'Renda' : 'Despesa'}</CardTitle>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Descrição */}
            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descrição da despesa"
                required
              />
            </div>

            {/* Valor */}
            <div>
              <Label htmlFor="valor">Valor *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => handleInputChange('valor', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Banco */}
            <div>
              <Label htmlFor="banco">Banco/Forma de Pagamento</Label>
              <Select value={formData.banco} onValueChange={(value) => handleInputChange('banco', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  {bancos.map(banco => (
                    <SelectItem key={banco} value={banco}>{banco}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Usuário */}
            <div>
              <Label htmlFor="usuario">Usuário</Label>
              <Select value={formData.usuario} onValueChange={(value) => handleInputChange('usuario', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o usuário" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parcelas - apenas para despesas normais */}
            {tipo === 'despesa' && (
              <div>
                <Label htmlFor="parcelas">Parcelas</Label>
                <Input
                  id="parcelas"
                  type="number"
                  min="1"
                  value={formData.parcelas}
                  onChange={(e) => handleInputChange('parcelas', e.target.value)}
                  placeholder="1"
                />
              </div>
            )}

            {/* Dia de vencimento - apenas para despesas fixas */}
            {tipo === 'fixa' && (
              <div>
                <Label htmlFor="dia_vencimento">Dia de Vencimento</Label>
                <Input
                  id="dia_vencimento"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_vencimento}
                  onChange={(e) => handleInputChange('dia_vencimento', e.target.value)}
                  placeholder="5"
                />
              </div>
            )}

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditarDespesaModal

