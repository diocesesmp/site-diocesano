import { supabase } from '@/integrations/supabase/client';

// Função para buscar configurações do Cloudinary do banco de dados
const getCloudinarySettings = async () => {
  try {
    const { data, error } = await supabase
      .from('cloudinary_settings')
      .select('cloud_name, upload_preset, folder_structure')
      .single();

    if (error) {
      throw new Error('Configurações do Cloudinary não encontradas. Configure no painel administrativo.');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar configurações do Cloudinary:', error);
    throw error;
  }
};

// Função para gerar estrutura de pasta baseada na configuração
const generateFolderPath = (folderStructure: string, baseFolder: string) => {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  return folderStructure
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('diocese', baseFolder);
};

// Função para upload de imagem usando unsigned upload
export const uploadToCloudinary = async (file: File, folder: string = 'diocese'): Promise<string> => {
  try {
    // Buscar configurações do Cloudinary
    const settings = await getCloudinarySettings();
    
    if (!settings.cloud_name) {
      throw new Error('Cloud Name não configurado');
    }

    // Gerar caminho da pasta
    const folderPath = generateFolderPath(settings.folder_structure, folder);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', settings.upload_preset);
    formData.append('folder', folderPath);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${settings.cloud_name}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro no upload: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
};

// Função para upload múltiplo
export const uploadMultipleToCloudinary = async (files: File[], folder: string = 'diocese'): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file, folder));
  return Promise.all(uploadPromises);
};