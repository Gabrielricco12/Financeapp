import React, { useState } from 'react'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import useStore from '../store/useStore'

const Login = () => {
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login, loadMockData } = useStore()

  const profiles = [
    {
      name: 'Gabriel',
      icon: '👨‍💼',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Perfil do Gabriel'
    },
    {
      name: 'Paloma',
      icon: '👩‍💼', 
      color: 'bg-pink-500 hover:bg-pink-600',
      description: 'Perfil da Paloma'
    }
  ]

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile)
    setPassword('')
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 500))

    if (password === 'pg2022') {
      login(selectedProfile.name)
      // Carregar dados mock para demonstração
      loadMockData()
    } else {
      setError('Senha incorreta. Tente novamente.')
    }
    
    setIsLoading(false)
  }

  const handleBack = () => {
    setSelectedProfile(null)
    setPassword('')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!selectedProfile ? (
          // Seleção de perfil
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Gestão Financeira
              </CardTitle>
              <CardDescription className="text-gray-600">
                Selecione seu perfil para continuar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profiles.map((profile) => (
                <Button
                  key={profile.name}
                  onClick={() => handleProfileSelect(profile)}
                  className={`w-full h-16 ${profile.color} text-white text-lg font-semibold transition-all duration-200 transform hover:scale-105`}
                  variant="default"
                >
                  <span className="text-2xl mr-3">{profile.icon}</span>
                  <div className="text-left">
                    <div>{profile.name}</div>
                    <div className="text-sm opacity-90">{profile.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        ) : (
          // Tela de senha
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className={`mx-auto w-16 h-16 ${selectedProfile.color} rounded-full flex items-center justify-center mb-4`}>
                <span className="text-2xl">{selectedProfile.icon}</span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Olá, {selectedProfile.name}!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Digite sua senha para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 text-lg"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className={`w-full h-12 ${selectedProfile.color} text-white text-lg font-semibold`}
                    disabled={isLoading || !password}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleBack}
                    variant="outline"
                    className="w-full h-12 text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Voltar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Sistema de Gestão Financeira</p>
          <p className="mt-1">Gabriel & Paloma</p>
        </div>
      </div>
    </div>
  )
}

export default Login

