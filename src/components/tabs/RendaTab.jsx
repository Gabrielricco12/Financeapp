import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  User, 
  Calendar,
  TrendingUp,
  Filter
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import useStore from '../../store/useStore'
import { supabaseService } from '../../lib/supabase'
import { formatCurrency, formatMonthYear } from '../../utils/formatters'

const RendaTab = () => {
  const [showModal, setShowModal] = useState(false)
  const [editingRenda, setEditingRenda] = useState(null)
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    usuario: ''
  })

  const { 
    rendas,
    selectedProfile, 
    selectedMonth, 
    selectedYear,
    addRenda,
    updateRenda,
    removeRenda,
    getTotalRenda
  } = useStore()

  const usuarios = ['Gabriel', 'Paloma', 'Casa']
  
  // Filtrar rendas
  const rendasFiltradas = rendas.filter(renda => {
    if (filtroUsuario && renda.usuario !== filtroUsuario) return false
    return true
  })

  const totalRenda = getTotalRenda()
  const totalFiltrado = rendasFiltradas.reduce((total, renda) => total + renda.valor, 0)

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
      if (!formData.descricao.trim()) {
        throw new Error('Descrição é obrigatória')
      }
      if (!formData.valor || parseFloat(formData.valor) <= 0) {
        throw new Error('Valor deve ser maior que zero')
      }
      if (!formData.usuario) {
        throw new Error('Usuário é obrigatório')
      }

      const rendaData = {
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor),
        usuario: formData.usuario,
        mes: selectedMonth,
        ano: selectedYear
      }

      if (editingRenda) {
        // Atualizar renda existente
        const { data, error } = await supabaseService.updateRenda(editingRenda.id, rendaData)
        if (error) throw new Error(error.message)
        
        if (data && data[0]) {
          updateRenda(editingRenda.id, data[0])
        }
      } else {
        // Criar nova renda
        const { data, error } = await supabaseService.createRenda(rendaData)
        if (error) throw new Error(error.message)
        
        if (data && data[0]) {
          addRenda(data[0])
        }
      }

      // Resetar formulário e fechar modal
      setFormData({
        descricao: '',
        valor: '',
        usuario: ''
      })
      setEditingRenda(null)
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (renda) => {
    setEditingRenda(renda)
    setFormData({
      descricao: renda.descricao,
      valor: renda.valor.toString(),
      usuario: renda.usuario
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta renda?')) {
      setIsLoading(true)
      try {
        const { error } = await supabaseService.deleteRenda(id)
        if (error) throw new Error(error.message)
        
        removeRenda(id)
      } catch (err) {
        console.error('Erro ao excluir renda:', err)
        alert('Erro ao excluir renda: ' + err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRenda(null)
    setFormData({
      descricao: '',
      valor: '',
      usuario: ''
    })
    setError('')
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
      {/* Cabeçalho com resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRenda)}</div>
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
            <div className="text-2xl font-bold text-gray-800">{rendasFiltradas.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filtros
            </span>
            <Button onClick={() => setShowModal(true)} className="bg-green-500 hover:bg-green-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Renda
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                {usuarios.map(usuario => (
                  <SelectItem key={usuario} value={usuario}>
                    <span className="flex items-center">
                      <span className="mr-2">{getUserIcon(usuario)}</span>
                      {usuario}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {filtroUsuario && (
              <Button onClick={() => setFiltroUsuario('')} variant="outline" size="sm">
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de rendas */}
      <div className="space-y-3">
        {rendasFiltradas.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhuma renda encontrada</p>
              <p className="text-sm text-gray-400 mt-2">
                {filtroUsuario
                  ? 'Tente ajustar os filtros'
                  : 'Adicione uma nova renda clicando no botão "Nova Renda"'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          rendasFiltradas.map((renda) => (
            <Card key={renda.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{renda.descricao}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-medium text-green-600">{formatCurrency(renda.valor)}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span className="mr-1">{getUserIcon(renda.usuario)}</span>
                        {renda.usuario}
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatMonthYear(renda.mes, renda.ano)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      onClick={() => handleEdit(renda)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(renda.id)}
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

      {/* Modal de nova/editar renda */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingRenda ? 'Editar Renda' : 'Nova Renda'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    placeholder="Ex: Salário, Freelance, etc."
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    required
                  />
                </div>

                {/* Valor */}
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', e.target.value)}
                    required
                  />
                </div>

                {/* Usuário */}
                <div className="space-y-2">
                  <Label>Usuário *</Label>
                  <Select value={formData.usuario} onValueChange={(value) => handleInputChange('usuario', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map(usuario => (
                        <SelectItem key={usuario} value={usuario}>
                          <span className="flex items-center">
                            <span className="mr-2">{getUserIcon(usuario)}</span>
                            {usuario}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Informação do período */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Período:</strong> {formatMonthYear(selectedMonth, selectedYear)}
                  </p>
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
                    onClick={handleCloseModal}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </div>
                    ) : (
                      editingRenda ? 'Atualizar' : 'Salvar'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default RendaTab

