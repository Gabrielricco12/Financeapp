import React, { useState } from 'react'
import { X, DollarSign, User, Calendar, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import useStoreSimple from '../../store/useStoreSimple'

const NovaRendaModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    usuario: 'Gabriel'
  })

  const { addRenda, selectedMonth, selectedYear, user } = useStoreSimple()

  const categorias = [
    { value: 'Salário', label: 'Salário', icon: '💼' },
    { value: 'Renda', label: 'Renda Extra', icon: '💰' }
  ]

  const usuarios = [
    { value: 'Gabriel', label: 'Gabriel', icon: '👨‍💼' },
    { value: 'Paloma', label: 'Paloma', icon: '👩‍💼' },
    { value: 'Casa', label: 'Casa', icon: '🏠' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.descricao || !formData.valor || !formData.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    const novaRenda = {
      id: Date.now(),
      usuario: formData.usuario,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      categoria: formData.categoria,
      mes: selectedMonth,
      ano: selectedYear,
      data_criacao: new Date().toISOString().split('T')[0]
    }

    addRenda(novaRenda)
    
    // Reset form
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      usuario: user || 'Gabriel'
    })
    
    onClose()
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay suave */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center justify-between text-green-800">
            <span className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Nova Renda
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-green-100 text-green-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Renda *
              </label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
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

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <Input
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Ex: Salário mensal, Freelance, etc."
                className="w-full"
                required
              />
            </div>

            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', e.target.value)}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsável *
              </label>
              <Select value={formData.usuario} onValueChange={(value) => handleInputChange('usuario', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
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

            {/* Informações do período */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center text-sm text-green-700">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Esta renda será adicionada para <strong>
                    {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </strong>
                </span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Adicionar Renda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default NovaRendaModal

