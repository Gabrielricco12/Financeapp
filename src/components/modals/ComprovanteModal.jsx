import React, { useState } from 'react'
import { 
  X, 
  Download, 
  FileText, 
  Image, 
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

const ComprovanteModal = ({ isOpen, onClose, comprovante, despesaInfo }) => {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  if (!isOpen || !comprovante) return null

  const isImage = comprovante.type?.startsWith('image/') || 
                  comprovante.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
  
  const isPDF = comprovante.type === 'application/pdf' || 
                comprovante.name?.endsWith('.pdf')

  const handleDownload = () => {
    if (comprovante.url) {
      // Se é uma URL (arquivo já salvo)
      const link = document.createElement('a')
      link.href = comprovante.url
      link.download = comprovante.name || 'comprovante'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (comprovante instanceof File) {
      // Se é um arquivo File object
      const url = URL.createObjectURL(comprovante)
      const link = document.createElement('a')
      link.href = url
      link.download = comprovante.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const getFileUrl = () => {
    if (comprovante.url) {
      return comprovante.url
    } else if (comprovante instanceof File) {
      return URL.createObjectURL(comprovante)
    }
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Comprovante de Pagamento</CardTitle>
            {despesaInfo && (
              <p className="text-sm text-gray-600 mt-1">
                {despesaInfo.descricao} - {despesaInfo.valor ? `R$ ${despesaInfo.valor.toFixed(2)}` : ''}
              </p>
            )}
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {/* Barra de ferramentas */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {comprovante.name || 'Comprovante'}
              </span>
              <span className="text-xs text-gray-400">
                ({comprovante.size ? `${(comprovante.size / 1024).toFixed(1)} KB` : 'Tamanho desconhecido'})
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {isImage && (
                <>
                  <Button onClick={handleZoomOut} variant="outline" size="sm">
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <Button onClick={handleZoomIn} variant="outline" size="sm">
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleRotate} variant="outline" size="sm">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Área de visualização */}
          <div className="p-4 bg-gray-100 min-h-[400px] max-h-[60vh] overflow-auto flex items-center justify-center">
            {isImage ? (
              <img
                src={getFileUrl()}
                alt="Comprovante"
                className="max-w-full max-h-full object-contain shadow-lg"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
                onLoad={() => {
                  // Limpar URL object se necessário
                  if (comprovante instanceof File) {
                    return () => URL.revokeObjectURL(getFileUrl())
                  }
                }}
              />
            ) : isPDF ? (
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Arquivo PDF</p>
                <p className="text-sm text-gray-500 mb-4">
                  Clique em "Download" para baixar e visualizar o arquivo
                </p>
                <Button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Arquivo não suportado para visualização</p>
                <p className="text-sm text-gray-500 mb-4">
                  Tipo: {comprovante.type || 'Desconhecido'}
                </p>
                <Button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Arquivo
                </Button>
              </div>
            )}
          </div>

          {/* Informações do arquivo */}
          <div className="p-4 border-t bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Nome:</span>
                <p className="font-medium truncate">{comprovante.name || 'Sem nome'}</p>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{comprovante.type || 'Desconhecido'}</p>
              </div>
              <div>
                <span className="text-gray-500">Tamanho:</span>
                <p className="font-medium">
                  {comprovante.size ? `${(comprovante.size / 1024).toFixed(1)} KB` : 'Desconhecido'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Modificado:</span>
                <p className="font-medium">
                  {comprovante.lastModified 
                    ? new Date(comprovante.lastModified).toLocaleDateString('pt-BR')
                    : 'Desconhecido'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ComprovanteModal

