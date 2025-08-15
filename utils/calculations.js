import { addMonths, format, parseISO } from 'date-fns'

// Datas de fechamento dos cartões
export const FECHAMENTO_CARTOES = {
  'Bradesco': 5,
  'Nubank': 5,
  'Itaú': 28
}

// Calcula o mês de cobrança baseado na data da compra e forma de pagamento
export const calcularMesCobranca = (dataCompra, formaPagamento, iniciarProximoMes = false) => {
  const data = typeof dataCompra === 'string' ? parseISO(dataCompra) : dataCompra
  const diaCompra = data.getDate()
  const mesCompra = data.getMonth() + 1
  const anoCompra = data.getFullYear()
  
  // Se for dinheiro ou Pix, sempre no mês da compra (ou próximo se selecionado)
  if (formaPagamento === 'Dinheiro' || formaPagamento === 'Pix') {
    if (iniciarProximoMes) {
      const proximoMes = addMonths(data, 1)
      return {
        mes: proximoMes.getMonth() + 1,
        ano: proximoMes.getFullYear()
      }
    }
    return { mes: mesCompra, ano: anoCompra }
  }
  
  // Para cartões, verificar data de fechamento
  const diaFechamento = FECHAMENTO_CARTOES[formaPagamento]
  
  if (!diaFechamento) {
    // Se não tem data de fechamento definida, tratar como dinheiro
    if (iniciarProximoMes) {
      const proximoMes = addMonths(data, 1)
      return {
        mes: proximoMes.getMonth() + 1,
        ano: proximoMes.getFullYear()
      }
    }
    return { mes: mesCompra, ano: anoCompra }
  }
  
  let mesCobranca = mesCompra
  let anoCobranca = anoCompra
  
  // Se a compra foi feita após o fechamento, vai para o próximo mês
  if (diaCompra >= diaFechamento) {
    const proximaFatura = addMonths(data, 1)
    mesCobranca = proximaFatura.getMonth() + 1
    anoCobranca = proximaFatura.getFullYear()
  }
  
  // Se selecionou iniciar no próximo mês, adiciona mais um mês
  if (iniciarProximoMes) {
    const proximoMes = addMonths(new Date(anoCobranca, mesCobranca - 1, 1), 1)
    mesCobranca = proximoMes.getMonth() + 1
    anoCobranca = proximoMes.getFullYear()
  }
  
  return { mes: mesCobranca, ano: anoCobranca }
}

// Gera as parcelas de uma despesa
export const gerarParcelas = (despesa) => {
  const { valor, parcelas, data_compra, forma_pagamento, iniciar_proximo_mes } = despesa
  const valorParcela = parseFloat(valor) / parseInt(parcelas)
  const parcelasGeradas = []
  
  const { mes: mesInicial, ano: anoInicial } = calcularMesCobranca(
    data_compra, 
    forma_pagamento, 
    iniciar_proximo_mes
  )
  
  for (let i = 0; i < parseInt(parcelas); i++) {
    const dataCobranca = addMonths(new Date(anoInicial, mesInicial - 1, 1), i)
    
    parcelasGeradas.push({
      ...despesa,
      valor: valorParcela.toFixed(2),
      parcela_atual: i + 1,
      mes_cobranca: dataCobranca.getMonth() + 1,
      ano_cobranca: dataCobranca.getFullYear(),
      id: `${despesa.id || 'temp'}_parcela_${i + 1}`
    })
  }
  
  return parcelasGeradas
}

// Calcula o progresso do parcelamento
export const calcularProgressoParcelas = (parcelaAtual, totalParcelas) => {
  return (parcelaAtual / totalParcelas) * 100
}

// Calcula quando o parcelamento será finalizado
export const calcularMesFinalizacao = (mesInicial, anoInicial, totalParcelas) => {
  const dataInicial = new Date(anoInicial, mesInicial - 1, 1)
  const dataFinal = addMonths(dataInicial, totalParcelas - 1)
  
  return {
    mes: dataFinal.getMonth() + 1,
    ano: dataFinal.getFullYear(),
    texto: format(dataFinal, 'MM/yyyy')
  }
}

// Calcula totais por categoria
export const calcularTotaisPorCategoria = (despesas) => {
  return despesas.reduce((acc, despesa) => {
    const categoria = despesa.categoria
    acc[categoria] = (acc[categoria] || 0) + parseFloat(despesa.valor)
    return acc
  }, {})
}

// Calcula totais por forma de pagamento
export const calcularTotaisPorPagamento = (despesas) => {
  return despesas.reduce((acc, despesa) => {
    const forma = despesa.forma_pagamento
    acc[forma] = (acc[forma] || 0) + parseFloat(despesa.valor)
    return acc
  }, {})
}

// Calcula gastos por mês da compra (não da cobrança)
export const calcularGastosPorMesCompra = (despesas, mes, ano) => {
  return despesas.filter(despesa => {
    const dataCompra = typeof despesa.data_compra === 'string' 
      ? parseISO(despesa.data_compra) 
      : despesa.data_compra
    
    return dataCompra.getMonth() + 1 === mes && dataCompra.getFullYear() === ano
  })
}

// Calcula valor total parcelado futuro para um cartão
export const calcularParceladoFuturo = (despesas, formaPagamento, mesAtual, anoAtual) => {
  return despesas
    .filter(despesa => {
      if (despesa.forma_pagamento !== formaPagamento) return false
      if (despesa.parcelas <= 1) return false
      
      // Verifica se ainda há parcelas futuras
      const dataCobranca = new Date(despesa.ano_cobranca, despesa.mes_cobranca - 1, 1)
      const dataAtual = new Date(anoAtual, mesAtual - 1, 1)
      
      return dataCobranca > dataAtual
    })
    .reduce((total, despesa) => total + parseFloat(despesa.valor), 0)
}

// Calcula previsão para próximo mês
export const calcularPrevisaoProximoMes = (despesas, formaPagamento, mesAtual, anoAtual) => {
  const proximoMes = mesAtual === 12 ? 1 : mesAtual + 1
  const proximoAno = mesAtual === 12 ? anoAtual + 1 : anoAtual
  
  return despesas
    .filter(despesa => {
      return despesa.forma_pagamento === formaPagamento &&
             despesa.mes_cobranca === proximoMes &&
             despesa.ano_cobranca === proximoAno
    })
    .reduce((total, despesa) => total + parseFloat(despesa.valor), 0)
}

// Calcula nível de alerta baseado no consumo
export const calcularNivelAlerta = (totalDespesas, totalRenda) => {
  if (totalRenda === 0) return { nivel: 'green', percentual: 0 }
  
  const percentual = (totalDespesas / totalRenda) * 100
  
  let nivel = 'green'
  if (percentual >= 95) nivel = 'red'
  else if (percentual >= 75) nivel = 'orange'
  else if (percentual >= 65) nivel = 'yellow'
  
  return { nivel, percentual: percentual.toFixed(1) }
}

// Calcula distribuição de gastos por perfil
export const calcularGastosPorPerfil = (despesas) => {
  return despesas.reduce((acc, despesa) => {
    const perfil = despesa.quem_efetuou
    acc[perfil] = (acc[perfil] || 0) + parseFloat(despesa.valor)
    return acc
  }, {})
}

// Calcula média de gastos mensais
export const calcularMediaGastos = (despesas, meses = 3) => {
  if (despesas.length === 0) return 0
  
  const totalGastos = despesas.reduce((total, despesa) => total + parseFloat(despesa.valor), 0)
  return totalGastos / meses
}

// Calcula economia ou déficit
export const calcularEconomia = (totalRenda, totalDespesas) => {
  const diferenca = totalRenda - totalDespesas
  return {
    valor: Math.abs(diferenca),
    tipo: diferenca >= 0 ? 'economia' : 'deficit',
    percentual: totalRenda > 0 ? (Math.abs(diferenca) / totalRenda) * 100 : 0
  }
}

// Calcula projeção de gastos baseada no histórico
export const calcularProjecaoGastos = (despesas, diasRestantes) => {
  if (despesas.length === 0) return 0
  
  const hoje = new Date()
  const diaAtual = hoje.getDate()
  const diasPassados = diaAtual
  
  const gastoAteMomento = despesas
    .filter(despesa => {
      const dataCompra = typeof despesa.data_compra === 'string' 
        ? parseISO(despesa.data_compra) 
        : despesa.data_compra
      return dataCompra.getDate() <= diaAtual
    })
    .reduce((total, despesa) => total + parseFloat(despesa.valor), 0)
  
  const mediaDiaria = gastoAteMomento / diasPassados
  return mediaDiaria * diasRestantes
}

