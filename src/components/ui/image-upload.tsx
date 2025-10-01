import { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Progress } from './progress';
import { Card, CardContent } from './card';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '@/lib/cloudinary';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  folder?: string;
  maxFiles?: number;
  accept?: string;
  className?: string;
  required?: boolean;
}

export function ImageUpload({ 
  onUpload, 
  multiple = false, 
  folder = 'diocese',
  maxFiles = 10, 
  accept = 'image/png,image/jpeg,image/jpg,image/webp',
  className,
  required = false
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    if (multiple && files.length > maxFiles) {
      toast({
        title: "Muitos arquivos",
        description: `Máximo de ${maxFiles} arquivos permitidos.`,
        variant: "destructive",
      });
      return;
    }

    const validTypes = accept.split(',').map(type => type.trim());
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Apenas arquivos PNG, JPEG, JPG, WebP e PDF são permitidos.",
        variant: "destructive",
      }); 
      return;
    }

    // Criar previews
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);

    setUploading(true);
    setProgress(0);

    try {
      let uploadedUrls: string[];
      
      if (multiple) {
        // Upload múltiplo com progresso
        uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadToCloudinary(files[i], folder);
          uploadedUrls.push(url);
          setProgress(((i + 1) / files.length) * 100);
        }
      } else {
        // Upload único
        const url = await uploadToCloudinary(files[0], folder);
        uploadedUrls = [url];
        setProgress(100);
      }

      onUpload(uploadedUrls);
      
      toast({
        title: "Upload concluído",
        description: `${uploadedUrls.length} imagem(ns) enviada(s) com sucesso!`,
      });

      // Limpar previews
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Erro ao enviar imagem(ns). Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removePreview = (index: number) => {
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newPreviews);
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        <div>
          <Label>Upload de Imagem{multiple ? 's' : ''}</Label>
          <div className="mt-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Enviando...' : `Selecionar ${accept.includes('image/') ? 'Imagem' : accept.includes('pdf') ? 'PDF' : 'Arquivo'}${multiple ? 's' : ''}`}
            </Button>
          </div>
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              {progress.toFixed(0)}% concluído
            </p>
          </div>
        )}

        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewUrls.map((url, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-2">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removePreview(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}