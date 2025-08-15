import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

// Verificar se as credenciais do Supabase estão configuradas
const isSupabaseConfigured = 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// Dados mock para desenvolvimento/demonstração
const mockData = {
  usuarios: [
    { id: '1', nome: 'Gabriel', senha: 'pg2022' },
    { id: '2', nome: 'Paloma', senha: 'pg2022' }
  ],
  rendas: [],
  despesas: [],
  pedidos: []
}

// Simulação de delay para APIs
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 300))

// Serviços de dados com fallback para mock
export const supabaseService = {
  // Usuários
  async getUsuarios() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
      return { data, error }
    } else {
      await mockDelay()
      return { data: mockData.usuarios, error: null }
    }
  },

  async createUsuario(usuario) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([usuario])
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const newUser = { ...usuario, id: Date.now().toString() }
      mockData.usuarios.push(newUser)
      return { data: [newUser], error: null }
    }
  },

  // Rendas
  async getRendas(usuario = null, mes = null, ano = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('rendas').select('*')
      
      if (usuario && usuario !== 'Ambos') {
        query = query.eq('usuario', usuario)
      }
      if (mes) {
        query = query.eq('mes', mes)
      }
      if (ano) {
        query = query.eq('ano', ano)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    } else {
      await mockDelay()
      let filteredData = [...mockData.rendas]
      
      if (usuario && usuario !== 'Ambos') {
        filteredData = filteredData.filter(r => r.usuario === usuario)
      }
      if (mes) {
        filteredData = filteredData.filter(r => r.mes === mes)
      }
      if (ano) {
        filteredData = filteredData.filter(r => r.ano === ano)
      }
      
      return { data: filteredData, error: null }
    }
  },

  async createRenda(renda) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('rendas')
        .insert([renda])
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const newRenda = { 
        ...renda, 
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      mockData.rendas.unshift(newRenda)
      return { data: [newRenda], error: null }
    }
  },

  async updateRenda(id, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('rendas')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const index = mockData.rendas.findIndex(r => r.id === id)
      if (index !== -1) {
        mockData.rendas[index] = { ...mockData.rendas[index], ...updates }
        return { data: [mockData.rendas[index]], error: null }
      }
      return { data: null, error: { message: 'Renda não encontrada' } }
    }
  },

  async deleteRenda(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('rendas')
        .delete()
        .eq('id', id)
      return { data, error }
    } else {
      await mockDelay()
      const index = mockData.rendas.findIndex(r => r.id === id)
      if (index !== -1) {
        const deleted = mockData.rendas.splice(index, 1)
        return { data: deleted, error: null }
      }
      return { data: null, error: { message: 'Renda não encontrada' } }
    }
  },

  // Despesas
  async getDespesas(usuario = null, mes = null, ano = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('despesas').select('*')
      
      if (usuario && usuario !== 'Ambos') {
        query = query.eq('usuario', usuario)
      }
      if (mes) {
        query = query.eq('mes_cobranca', mes)
      }
      if (ano) {
        query = query.eq('ano_cobranca', ano)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    } else {
      await mockDelay()
      let filteredData = [...mockData.despesas]
      
      if (usuario && usuario !== 'Ambos') {
        filteredData = filteredData.filter(d => d.usuario === usuario)
      }
      if (mes) {
        filteredData = filteredData.filter(d => d.mes_cobranca === mes)
      }
      if (ano) {
        filteredData = filteredData.filter(d => d.ano_cobranca === ano)
      }
      
      return { data: filteredData, error: null }
    }
  },

  async createDespesa(despesa) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('despesas')
        .insert([despesa])
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const newDespesa = { 
        ...despesa, 
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }
      mockData.despesas.unshift(newDespesa)
      return { data: [newDespesa], error: null }
    }
  },

  async updateDespesa(id, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('despesas')
        .update(updates)
        .eq('id', id)
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const index = mockData.despesas.findIndex(d => d.id === id)
      if (index !== -1) {
        mockData.despesas[index] = { ...mockData.despesas[index], ...updates }
        return { data: [mockData.despesas[index]], error: null }
      }
      return { data: null, error: { message: 'Despesa não encontrada' } }
    }
  },

  async deleteDespesa(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id)
      return { data, error }
    } else {
      await mockDelay()
      const index = mockData.despesas.findIndex(d => d.id === id)
      if (index !== -1) {
        const deleted = mockData.despesas.splice(index, 1)
        return { data: deleted, error: null }
      }
      return { data: null, error: { message: 'Despesa não encontrada' } }
    }
  },

  // Pedidos
  async getPedidos(usuario = null) {
    if (isSupabaseConfigured) {
      let query = supabase.from('pedidos').select('*')
      
      if (usuario && usuario !== 'Ambos') {
        query = query.or(`solicitante.eq.${usuario},destinatario.eq.${usuario}`)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    } else {
      await mockDelay()
      let filteredData = [...mockData.pedidos]
      
      if (usuario && usuario !== 'Ambos') {
        filteredData = filteredData.filter(p => 
          p.solicitante === usuario || p.destinatario === usuario
        )
      }
      
      return { data: filteredData, error: null }
    }
  },

  async createPedido(pedido) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .insert([pedido])
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const newPedido = { 
        ...pedido, 
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockData.pedidos.unshift(newPedido)
      return { data: [newPedido], error: null }
    }
  },

  async updatePedido(id, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
      return { data, error }
    } else {
      await mockDelay()
      const index = mockData.pedidos.findIndex(p => p.id === id)
      if (index !== -1) {
        mockData.pedidos[index] = { 
          ...mockData.pedidos[index], 
          ...updates,
          updated_at: new Date().toISOString()
        }
        return { data: [mockData.pedidos[index]], error: null }
      }
      return { data: null, error: { message: 'Pedido não encontrado' } }
    }
  },

  async deletePedido(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', id)
      return { data, error }
    } else {
      await mockDelay()
      const index = mockData.pedidos.findIndex(p => p.id === id)
      if (index !== -1) {
        const deleted = mockData.pedidos.splice(index, 1)
        return { data: deleted, error: null }
      }
      return { data: null, error: { message: 'Pedido não encontrado' } }
    }
  },

  // Limpeza de dados
  async clearAllData() {
    if (isSupabaseConfigured) {
      const tables = ['despesas', 'rendas', 'pedidos']
      const results = []
      
      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records
        results.push({ table, data, error })
      }
      
      return results
    } else {
      await mockDelay()
      mockData.rendas = []
      mockData.despesas = []
      mockData.pedidos = []
      return [
        { table: 'rendas', data: [], error: null },
        { table: 'despesas', data: [], error: null },
        { table: 'pedidos', data: [], error: null }
      ]
    }
  },

  // Verificar se está usando dados mock
  isMockMode: () => !isSupabaseConfigured
}

