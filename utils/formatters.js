import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Formatação de valores monetários
export const formatCurrency = (value) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(numValue)) return 'R$ 0,00'
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue)
}

// Formatação de datas
export const formatDate = (date, pattern = 'dd/MM/yyyy') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, pattern, { locale: ptBR })
}

// Formatação de mês/ano
export const formatMonthYear = (month, year) => {
  const date = new Date(year, month - 1, 1)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

// Lista de meses
export const getMonthsList = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })
  }))
}

// Lista de anos (últimos 5 anos + próximos 2)
export const getYearsList = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push({ value: i, label: i.toString() })
  }
  
  return years
}

// Formatação de percentual
export const formatPercentage = (value, total) => {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1)}%`
}

// Formatação de número de parcelas
export const formatParcelas = (atual, total) => {
  return `${atual}/${total}`
}

// Validação de CPF (se necessário no futuro)
export const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '')
  
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  
  let remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  
  remainder = 11 - (sum % 11)
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false
  
  return true
}

// Formatação de telefone
export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

// Capitalização de texto
export const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Formatação de status
export const formatStatus = (status) => {
  const statusMap = {
    'pendente': 'Pendente',
    'aprovado': 'Aprovado',
    'negado': 'Negado',
    'ativo': 'Ativo',
    'inativo': 'Inativo'
  }
  
  return statusMap[status] || capitalize(status)
}

// Cores para alertas
export const getAlertColor = (level) => {
  const colors = {
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200'
  }
  
  return colors[level] || colors.green
}

// Cores para categorias
export const getCategoryColor = (categoria) => {
  const colors = {
    'Despesa': 'bg-blue-500',
    'Lazer': 'bg-purple-500',
    'Fixo': 'bg-green-500'
  }
  
  return colors[categoria] || 'bg-gray-500'
}

// Ícones para formas de pagamento
export const getPaymentIcon = (formaPagamento) => {
  const icons = {
    'Pix': '💳',
    'Bradesco': '🏦',
    'Itaú': '🏦',
    'Nubank': '💜',
    'Dinheiro': '💵'
  }
  
  return icons[formaPagamento] || '💳'
}

// Cores para formas de pagamento
export const getPaymentColor = (formaPagamento) => {
  const colors = {
    'Pix': 'bg-teal-500',
    'Bradesco': 'bg-red-600',
    'Itaú': 'bg-orange-500',
    'Nubank': 'bg-purple-600',
    'Dinheiro': 'bg-green-600'
  }
  
  return colors[formaPagamento] || 'bg-gray-500'
}

