import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { DollarSign, User, Lock } from 'lucide-react'
import useStoreSimple from '../store/useStoreSimple'

const LoginSimple = () => {
  const [selectedUser, setSelectedUser] = useState('Gabriel')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useStoreSimple()

  const users = [
    { name: 'Gabriel', icon: '👨‍💼', color: 'bg-blue-500' },
    { name: 'Paloma', icon: '👩‍💼', color: 'bg-purple-500' }
  ]

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular loading
      
      const success = login(selectedUser, password)
      
      if (!success) {
        setError('Senha incorreta. Tente novamente.')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600 mt-2">Gabriel & Paloma</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Fazer Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Seleção de usuário */}
              <div className="space-y-3">
                <Label>Selecione seu perfil:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {users.map((user) => (
                    <button
                      key={user.name}
                      type="button"
                      onClick={() => setSelectedUser(user.name)}
                      className={`
                        p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2
                        ${selectedUser === user.name 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`w-12 h-12 ${user.color} rounded-full flex items-center justify-center text-white text-xl`}>
                        {user.icon}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de senha */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha:</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Erro */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botão de login */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Entrar</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Informações */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-xs text-gray-500">
                Sistema de Gestão Financeira
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Gabriel & Paloma
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginSimple

