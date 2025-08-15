import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Estado de autenticação
      isAuthenticated: false,
      user: null,
      
      // Estado da interface
      currentTab: 'geral',
      selectedProfile: 'Gabriel',
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      showNewExpenseModal: false,
      
      // Dados
      rendas: [],
      despesas: [],
      despesasFixas: [],
      pedidos: [],
      
      // Ações de autenticação
      login: (user) => set({ 
        isAuthenticated: true, 
        user: user,
        selectedProfile: user
      }),
      
      logout: () => set({ 
        isAuthenticated: false, 
        user: null,
        currentTab: 'geral',
        rendas: [],
        despesas: [],
        despesasFixas: [],
        pedidos: []
      }),
      
      // Ações da interface
      setCurrentTab: (tab) => set({ currentTab: tab }),
      setSelectedProfile: (profile) => set({ selectedProfile: profile }),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setSelectedYear: (year) => set({ selectedYear: year }),
      setShowNewExpenseModal: (show) => set({ showNewExpenseModal: show }),
      
      // Ações de dados - Rendas
      setRendas: (rendas) => set({ rendas }),
      addRenda: (renda) => {
        const newRenda = {
          ...renda,
          id: Date.now().toString(),
          mes: get().selectedMonth,
          ano: get().selectedYear,
          created_at: new Date().toISOString()
        }
        set((state) => ({ 
          rendas: [newRenda, ...state.rendas] 
        }))
        return { success: true, data: newRenda }
      },
      updateRenda: (id, updatedRenda) => set((state) => ({
        rendas: state.rendas.map(renda => 
          renda.id === id ? { ...renda, ...updatedRenda } : renda
        )
      })),
      removeRenda: (id) => set((state) => ({
        rendas: state.rendas.filter(renda => renda.id !== id)
      })),
      deleteRenda: (id) => set((state) => ({
        rendas: state.rendas.filter(renda => renda.id !== id)
      })),
      
      // Ações de dados - Despesas (CORRIGIDAS)
      setDespesas: (despesas) => set({ despesas }),
      addDespesa: (despesa) => {
        try {
          const state = get()
          
          // Criar nova despesa com campos obrigatórios
          const newDespesa = {
            ...despesa,
            id: Date.now().toString(),
            mes: state.selectedMonth,
            ano: state.selectedYear,
            mes_cobranca: state.selectedMonth,
            ano_cobranca: state.selectedYear,
            created_at: new Date().toISOString(),
            
            // Novos campos com valores padrão
            parcelas: despesa.parcelas || 1,
            parcela_atual: despesa.parcela_atual || 1,
            dia_vencimento: despesa.dia_vencimento || null,
            tipo_despesa: despesa.tipo_despesa || 'variavel',
            data_compra: despesa.data_compra || new Date().toISOString().split('T')[0],
            banco: despesa.banco || despesa.forma_pagamento || null,
            status_pagamento: despesa.status_pagamento || 'pago',
            observacoes: despesa.observacoes || null,
            
            // Manter compatibilidade com campos antigos
            forma_pagamento: despesa.forma_pagamento || despesa.banco,
            quem_efetuou: despesa.usuario || despesa.quem_efetuou,
            valor_total: despesa.parcelas > 1 ? despesa.valor * despesa.parcelas : despesa.valor
          }
          
          set((state) => ({ 
            despesas: [newDespesa, ...state.despesas] 
          }))
          
          return { success: true, data: newDespesa }
        } catch (error) {
          console.error('Erro ao adicionar despesa:', error)
          return { success: false, error: { message: error.message } }
        }
      },
      updateDespesa: (id, updatedDespesa) => set((state) => ({
        despesas: state.despesas.map(despesa => 
          despesa.id === id ? { ...despesa, ...updatedDespesa } : despesa
        )
      })),
      removeDespesa: (id) => set((state) => ({
        despesas: state.despesas.filter(despesa => despesa.id !== id)
      })),
      deleteDespesa: (id) => set((state) => ({
        despesas: state.despesas.filter(despesa => despesa.id !== id)
      })),
      
      // Ações de dados - Despesas Fixas (CORRIGIDAS)
      setDespesasFixas: (despesasFixas) => set({ despesasFixas }),
      addDespesaFixa: (despesaFixa) => {
        try {
          const state = get()
          
          const newDespesaFixa = {
            ...despesaFixa,
            id: Date.now().toString(),
            mes: state.selectedMonth,
            ano: state.selectedYear,
            mes_referencia: state.selectedMonth,
            ano_referencia: state.selectedYear,
            created_at: new Date().toISOString(),
            ativa: true,
            data_pagamento: null,
            comprovante_pagamento: null,
            
            // Garantir campos obrigatórios
            categoria: despesaFixa.categoria || 'Fixo',
            status_pagamento: despesaFixa.status_pagamento || 'pendente',
            dia_vencimento: despesaFixa.dia_vencimento || 1
          }
          
          set((state) => ({ 
            despesasFixas: [newDespesaFixa, ...state.despesasFixas] 
          }))
          
          return { success: true, data: newDespesaFixa }
        } catch (error) {
          console.error('Erro ao adicionar despesa fixa:', error)
          return { success: false, error: { message: error.message } }
        }
      },
      updateDespesaFixa: (id, updatedDespesaFixa) => set((state) => ({
        despesasFixas: state.despesasFixas.map(despesa => 
          despesa.id === id ? { ...despesa, ...updatedDespesaFixa } : despesa
        )
      })),
      removeDespesaFixa: (id) => set((state) => ({
        despesasFixas: state.despesasFixas.filter(despesa => despesa.id !== id)
      })),
      deleteDespesaFixa: (id) => set((state) => ({
        despesasFixas: state.despesasFixas.filter(despesa => despesa.id !== id)
      })),
      
      // Ações de dados - Pedidos
      setPedidos: (pedidos) => set({ pedidos }),
      addPedido: (pedido) => {
        const newPedido = {
          ...pedido,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          status: pedido.status || 'pendente'
        }
        set((state) => ({ 
          pedidos: [newPedido, ...state.pedidos] 
        }))
        return { success: true, data: newPedido }
      },
      updatePedido: (id, updatedPedido) => set((state) => ({
        pedidos: state.pedidos.map(pedido => 
          pedido.id === id ? { ...pedido, ...updatedPedido } : pedido
        )
      })),
      removePedido: (id) => set((state) => ({
        pedidos: state.pedidos.filter(pedido => pedido.id !== id)
      })),
      deletePedido: (id) => set((state) => ({
        pedidos: state.pedidos.filter(pedido => pedido.id !== id)
      })),
      
      // Funções de cálculo (CORRIGIDAS)
      getTotalRendas: () => {
        const state = get()
        return state.rendas
          .filter(renda => {
            if (state.selectedProfile === 'Ambos') return true
            return renda.usuario === state.selectedProfile || renda.usuario === 'Casa'
          })
          .filter(renda => renda.mes === state.selectedMonth && renda.ano === state.selectedYear)
          .reduce((total, renda) => total + (renda.valor || 0), 0)
      },
      
      getTotalDespesas: () => {
        const state = get()
        return state.despesas
          .filter(despesa => {
            if (state.selectedProfile === 'Ambos') return true
            return despesa.usuario === state.selectedProfile || 
                   despesa.quem_efetuou === state.selectedProfile || 
                   despesa.usuario === 'Casa' || 
                   despesa.quem_efetuou === 'Casa'
          })
          .filter(despesa => {
            // Verificar tanto mes/ano quanto mes_cobranca/ano_cobranca
            const mes = despesa.mes_cobranca || despesa.mes
            const ano = despesa.ano_cobranca || despesa.ano
            return mes === state.selectedMonth && ano === state.selectedYear
          })
          .reduce((total, despesa) => total + (despesa.valor || 0), 0)
      },
      
      getTotalDespesasFixas: () => {
        const state = get()
        return state.despesasFixas
          .filter(despesa => {
            if (state.selectedProfile === 'Ambos') return true
            return despesa.usuario === state.selectedProfile || despesa.usuario === 'Casa'
          })
          .filter(despesa => {
            // Para despesas fixas, verificar se está ativa e no mês/ano correto
            const mes = despesa.mes_referencia || despesa.mes || state.selectedMonth
            const ano = despesa.ano_referencia || despesa.ano || state.selectedYear
            return despesa.ativa !== false && mes === state.selectedMonth && ano === state.selectedYear
          })
          .reduce((total, despesa) => total + (despesa.valor || 0), 0)
      },
      
      getSaldoRestante: () => {
        const state = get()
        return state.getTotalRendas() - state.getTotalDespesas() - state.getTotalDespesasFixas()
      },
      
      getFinancialStatus: () => {
        const state = get()
        const totalRenda = state.getTotalRendas()
        const totalDespesas = state.getTotalDespesas() + state.getTotalDespesasFixas()
        
        if (totalRenda === 0) return 'Sem dados'
        
        const percentualGasto = (totalDespesas / totalRenda) * 100
        
        if (percentualGasto <= 50) return 'Excelente'
        if (percentualGasto <= 70) return 'Bom'
        if (percentualGasto <= 85) return 'Atenção'
        return 'Crítico'
      },
      
      getDespesasByCategory: () => {
        const state = get()
        return state.despesas
          .filter(despesa => {
            if (state.selectedProfile === 'Ambos') return true
            return despesa.usuario === state.selectedProfile || 
                   despesa.quem_efetuou === state.selectedProfile || 
                   despesa.usuario === 'Casa' || 
                   despesa.quem_efetuou === 'Casa'
          })
          .filter(despesa => {
            const mes = despesa.mes_cobranca || despesa.mes
            const ano = despesa.ano_cobranca || despesa.ano
            return mes === state.selectedMonth && ano === state.selectedYear
          })
      },
      
      // Novas funções para suportar as funcionalidades
      getDespesasByBank: (banco) => {
        const state = get()
        return state.despesas
          .filter(despesa => {
            const despesaBanco = despesa.banco || despesa.forma_pagamento
            return despesaBanco === banco
          })
          .filter(despesa => {
            if (state.selectedProfile === 'Ambos') return true
            return despesa.usuario === state.selectedProfile || 
                   despesa.quem_efetuou === state.selectedProfile || 
                   despesa.usuario === 'Casa' || 
                   despesa.quem_efetuou === 'Casa'
          })
          .filter(despesa => {
            const mes = despesa.mes_cobranca || despesa.mes
            const ano = despesa.ano_cobranca || despesa.ano
            return mes === state.selectedMonth && ano === state.selectedYear
          })
      },
      
      getDespesasFixasByBank: (banco) => {
        const state = get()
        return state.despesasFixas
          .filter(despesa => despesa.banco === banco)
          .filter(despesa => {
            if (state.selectedProfile === 'Ambos') return true
            return despesa.usuario === state.selectedProfile || despesa.usuario === 'Casa'
          })
          .filter(despesa => {
            const mes = despesa.mes_referencia || despesa.mes || state.selectedMonth
            const ano = despesa.ano_referencia || despesa.ano || state.selectedYear
            return despesa.ativa !== false && mes === state.selectedMonth && ano === state.selectedYear
          })
      },
      
      getDespesasPendentes: () => {
        const state = get()
        return state.despesasFixas
          .filter(despesa => despesa.status_pagamento === 'pendente')
          .filter(despesa => {
            if (state.selectedProfile === 'Ambos') return true
            return despesa.usuario === state.selectedProfile || despesa.usuario === 'Casa'
          })
          .filter(despesa => {
            const mes = despesa.mes_referencia || despesa.mes || state.selectedMonth
            const ano = despesa.ano_referencia || despesa.ano || state.selectedYear
            return despesa.ativa !== false && mes === state.selectedMonth && ano === state.selectedYear
          })
      },
      
      // Função para carregar dados mock (ATUALIZADA)
      loadMockData: () => {
        const currentMonth = new Date().getMonth() + 1
        const currentYear = new Date().getFullYear()
        
        const mockRendas = [
          {
            id: '1',
            descricao: 'Salário Gabriel',
            valor: 5500,
            usuario: 'Gabriel',
            categoria: 'Salário',
            mes: currentMonth,
            ano: currentYear,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            descricao: 'Salário Paloma',
            valor: 4200,
            usuario: 'Paloma',
            categoria: 'Salário',
            mes: currentMonth,
            ano: currentYear,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            descricao: 'Freelance',
            valor: 1000,
            usuario: 'Casa',
            categoria: 'Renda Extra',
            mes: currentMonth,
            ano: currentYear,
            created_at: new Date().toISOString()
          }
        ]
        
        const mockDespesas = [
          {
            id: '1',
            descricao: 'Supermercado',
            valor: 350,
            categoria: 'Alimentação',
            usuario: 'Gabriel',
            banco: 'Bradesco',
            forma_pagamento: 'Bradesco',
            data_compra: new Date().toISOString().split('T')[0],
            quem_efetuou: 'Gabriel',
            parcelas: 1,
            parcela_atual: 1,
            valor_total: 350,
            tipo_despesa: 'variavel',
            status_pagamento: 'pago',
            mes: currentMonth,
            ano: currentYear,
            mes_cobranca: currentMonth,
            ano_cobranca: currentYear,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            descricao: 'Netflix',
            valor: 45,
            categoria: 'Lazer',
            usuario: 'Paloma',
            banco: 'Nubank',
            forma_pagamento: 'Nubank',
            data_compra: new Date().toISOString().split('T')[0],
            quem_efetuou: 'Paloma',
            parcelas: 1,
            parcela_atual: 1,
            valor_total: 45,
            tipo_despesa: 'variavel',
            status_pagamento: 'pago',
            mes: currentMonth,
            ano: currentYear,
            mes_cobranca: currentMonth,
            ano_cobranca: currentYear,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            descricao: 'Celular Novo (3/12)',
            valor: 125,
            categoria: 'Despesa',
            usuario: 'Gabriel',
            banco: 'Itaú',
            forma_pagamento: 'Itaú',
            data_compra: new Date().toISOString().split('T')[0],
            quem_efetuou: 'Gabriel',
            parcelas: 12,
            parcela_atual: 3,
            valor_total: 1500,
            tipo_despesa: 'variavel',
            status_pagamento: 'pago',
            mes: currentMonth,
            ano: currentYear,
            mes_cobranca: currentMonth,
            ano_cobranca: currentYear,
            created_at: new Date().toISOString()
          }
        ]

        const mockDespesasFixas = [
          {
            id: '1',
            descricao: 'Aluguel',
            valor: 1200,
            categoria: 'Fixo',
            usuario: 'Casa',
            banco: 'Pix',
            dia_vencimento: 10,
            ativa: true,
            status_pagamento: 'pendente',
            data_pagamento: null,
            comprovante_pagamento: null,
            tipo_despesa: 'fixa',
            mes: currentMonth,
            ano: currentYear,
            mes_referencia: currentMonth,
            ano_referencia: currentYear,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            descricao: 'Internet',
            valor: 89.90,
            categoria: 'Fixo',
            usuario: 'Casa',
            banco: 'Bradesco',
            dia_vencimento: 15,
            ativa: true,
            status_pagamento: 'pago',
            data_pagamento: new Date().toISOString().split('T')[0],
            comprovante_pagamento: 'comprovante_internet_jan2025.pdf',
            tipo_despesa: 'fixa',
            mes: currentMonth,
            ano: currentYear,
            mes_referencia: currentMonth,
            ano_referencia: currentYear,
            created_at: new Date().toISOString()
          }
        ]
        
        const mockPedidos = [
          {
            id: '1',
            solicitante: 'Paloma',
            destinatario: 'Gabriel',
            tipo: 'compra',
            valor: 150,
            descricao: 'Comprar ingredientes para jantar especial',
            status: 'pendente',
            created_at: new Date().toISOString()
          }
        ]
        
        set({
          rendas: mockRendas,
          despesas: mockDespesas,
          despesasFixas: mockDespesasFixas,
          pedidos: mockPedidos
        })
      }
    }),
    {
      name: 'gestao-financeira-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        selectedProfile: state.selectedProfile,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
        rendas: state.rendas,
        despesas: state.despesas,
        despesasFixas: state.despesasFixas,
        pedidos: state.pedidos
      })
    }
  )
)

export default useStore

