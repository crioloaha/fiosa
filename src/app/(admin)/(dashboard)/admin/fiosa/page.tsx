'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FolderTree,
  Compass,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  Lock,
  Settings,
  Upload
} from 'lucide-react';
import ImageCropperModal from '@/components/ImageCropperModal';

async function compressImage(file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

const PRESETS = {
  ORIGINAL: {
    corPrimaria: '#C15C3D',
    corSecundaria: '#606C38',
    corFundo: '#FDFBF7',
    corFundoAlternativo: '#F3EFE9',
    corTexto: '#2B2D2F',
    corBorda: '#8D7F73',
  },
  TERRA: {
    corPrimaria: '#A75D5D',
    corSecundaria: '#4C6793',
    corFundo: '#FFFBE9',
    corFundoAlternativo: '#F1DEC9',
    corTexto: '#2C3639',
    corBorda: '#D5B4B4',
  },
  OCEANO: {
    corPrimaria: '#0284C7',
    corSecundaria: '#0D9488',
    corFundo: '#F8FAFC',
    corFundoAlternativo: '#F1F5F9',
    corTexto: '#0F172A',
    corBorda: '#CBD5E1',
  },
  FLORESTA: {
    corPrimaria: '#1E5128',
    corSecundaria: '#4E9F3D',
    corFundo: '#F6FBF4',
    corFundoAlternativo: '#EBF4EC',
    corTexto: '#191A19',
    corBorda: '#D8E9A8',
  },
  MONOCROMATICA: {
    corPrimaria: '#18181B',
    corSecundaria: '#52525B',
    corFundo: '#FAFAFA',
    corFundoAlternativo: '#F4F4F5',
    corTexto: '#09090B',
    corBorda: '#D4D4D8',
  }
};

interface Artisan {
  id: string;
  nome: string;
  marca: string | null;
  slug: string;
  whatsapp: string | null;
  perfilAtivo: boolean;
  visualizacoesPerfil: number;
  cliquesWhats: number;
  usuario: {
    email: string;
    status: string;
  };
  vendas?: {
    valorVenda: number;
    contribuicaoFiosa: number;
  }[];
}

interface Category {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  percentualFiosa: number;
  status: string;
}

interface Experience {
  id: string;
  titulo: string;
  descricao: string;
  localizacao: string;
  duracao: string | null;
  preco: number | null;
  imagem: string | null;
  status: string;
}

interface Product {
  id: string;
  nome: string;
  artesao: {
    nome: string;
  };
  visualizacoes: number;
}

export default function FiosaAdminPage() {
  const [activeTab, setActiveTab] = useState<'stats' | 'artisan' | 'category' | 'experience' | 'settings'>('stats');
  
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    logoTexto: '',
    logoSubtitulo: '',
    logoImagem: '',
    logoTextoImagem: '',
    favicon: '',
    heroTag: '',
    heroTitulo: '',
    heroSubtitulo: '',
    heroImagem: '',
    fiosaTag: '',
    fiosaTitulo: '',
    fiosaTexto1: '',
    fiosaTexto2: '',
    fiosaImagem: '',
    paletaNome: 'ORIGINAL',
    corPrimaria: '#C15C3D',
    corSecundaria: '#606C38',
    corFundo: '#FDFBF7',
    corFundoAlternativo: '#F3EFE9',
    corTexto: '#2B2D2F',
    corBorda: '#8D7F73',
    rodapeSlogan: '',
    rodapeDescricao: '',
    contatoEndereco: '',
    contatoAtendimento: '',
    contatoWhatsapp: '',
    contatoTelefone: '',
    contatoEmail: '',
    contatoInstagram: '',
    contatoMapaIframe: '',
    sobreResendeCostaTitulo: '',
    sobreResendeCostaTexto1: '',
    sobreResendeCostaTexto2: '',
    sobreResendeCostaImagem: '',
    visiteIntroTitulo: '',
    visiteIntroTexto: '',
    visiteSecao1Titulo: '',
    visiteSecao1Texto: '',
    visiteSecao1Imagem: '',
    visiteSecao2Titulo: '',
    visiteSecao2Texto: '',
    visiteSecao2Imagem: '',
    visiteBannerImagem: '',
    visiteBannerTag: '',
    visiteBannerTitulo: '',
    visiteBannerSubtitulo: '',
    visiteGuiaFazer: '',
    visiteGuiaComer: '',
    visiteGuiaFicar: '',
    experienciasIntroTitulo: '',
    experienciasIntroTexto: '',
    contatoIntroTitulo: '',
    contatoIntroTexto: '',
    ctaTitulo: '',
    ctaSubtitulo: '',
  });

  // Overlays / Forms States
  const [isArtisanFormOpen, setIsArtisanFormOpen] = useState(false);
  const [artisanForm, setArtisanForm] = useState({
    nome: '',
    email: '',
    senha: '',
  });

  // Artisan Edit State
  const [isEditingArtisan, setIsEditingArtisan] = useState(false);
  const [editingArtisanId, setEditingArtisanId] = useState<string | null>(null);
  const [editArtisanForm, setEditArtisanForm] = useState({
    nome: '',
    email: '',
    senha: '', // blank if no change
    perfilAtivo: true,
  });

  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    nome: '',
    descricao: '',
    percentualFiosa: '10',
    status: 'ATIVO',
  });

  const [isExperienceFormOpen, setIsExperienceFormOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
  const [experienceForm, setExperienceForm] = useState({
    titulo: '',
    descricao: '',
    localizacao: '',
    duracao: '',
    preco: '',
    contato: '',
    imagem: '',
    status: 'ATIVO',
  });

  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState('');
  const [cropperAspect, setCropperAspect] = useState<'1:1' | '3:1' | '16:9'>('16:9');
  const [cropperTarget, setCropperTarget] = useState<string>('');

  const handleConfigImageSelect = (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const src = URL.createObjectURL(file);
    setCropperSrc(src);
    if (targetField === 'logoImagem' || targetField === 'favicon') {
      setCropperAspect('1:1');
    } else if (targetField === 'logoTextoImagem') {
      setCropperAspect('3:1');
    } else {
      setCropperAspect('16:9');
    }
    setCropperTarget(targetField);
    setCropperOpen(true);
  };

  const handleCroppedImageUpload = async (blob: Blob) => {
    setCropperOpen(false);
    setSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', blob, `config-${cropperTarget}-${Date.now()}.jpg`);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload.');

      if (cropperTarget === 'experiencia') {
        setExperienceForm((prev) => ({ ...prev, imagem: data.url }));
      } else {
        setSettingsForm((prev) => ({ ...prev, [cropperTarget]: data.url }));
      }
      showSuccess('Imagem carregada com sucesso.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar imagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadAllData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/artesao?admin=true').then((res) => res.json()),
      fetch('/api/categorias?admin=true').then((res) => res.json()),
      fetch('/api/experiencias?admin=true').then((res) => res.json()),
      fetch('/api/produtos?admin=true').then((res) => res.json()),
      fetch('/api/configuracao').then((res) => res.json()),
    ])
      .then(([artData, catData, expData, prodData, configData]) => {
        if (Array.isArray(artData)) setArtisans(artData);
        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(expData)) setExperiences(expData);
        if (Array.isArray(prodData)) setProducts(prodData);
        if (configData && !configData.error) {
          setSettingsForm({
            logoTexto: configData.logoTexto || '',
            logoSubtitulo: configData.logoSubtitulo || '',
            logoImagem: configData.logoImagem || '',
            logoTextoImagem: configData.logoTextoImagem || '',
            favicon: configData.favicon || '',
            heroTag: configData.heroTag || '',
            heroTitulo: configData.heroTitulo || '',
            heroSubtitulo: configData.heroSubtitulo || '',
            heroImagem: configData.heroImagem || '',
            fiosaTag: configData.fiosaTag || '',
            fiosaTitulo: configData.fiosaTitulo || '',
            fiosaTexto1: configData.fiosaTexto1 || '',
            fiosaTexto2: configData.fiosaTexto2 || '',
            fiosaImagem: configData.fiosaImagem || '',
            paletaNome: configData.paletaNome || 'ORIGINAL',
            corPrimaria: configData.corPrimaria || '#C15C3D',
            corSecundaria: configData.corSecundaria || '#606C38',
            corFundo: configData.corFundo || '#FDFBF7',
            corFundoAlternativo: configData.corFundoAlternativo || '#F3EFE9',
            corTexto: configData.corTexto || '#2B2D2F',
            corBorda: configData.corBorda || '#8D7F73',
            rodapeSlogan: configData.rodapeSlogan || '',
            rodapeDescricao: configData.rodapeDescricao || '',
            contatoEndereco: configData.contatoEndereco || '',
            contatoAtendimento: configData.contatoAtendimento || '',
            contatoWhatsapp: configData.contatoWhatsapp || '',
            contatoTelefone: configData.contatoTelefone || '',
            contatoEmail: configData.contatoEmail || '',
            contatoInstagram: configData.contatoInstagram || '',
            contatoMapaIframe: configData.contatoMapaIframe || '',
            sobreResendeCostaTitulo: configData.sobreResendeCostaTitulo || '',
            sobreResendeCostaTexto1: configData.sobreResendeCostaTexto1 || '',
            sobreResendeCostaTexto2: configData.sobreResendeCostaTexto2 || '',
            sobreResendeCostaImagem: configData.sobreResendeCostaImagem || '',
            visiteIntroTitulo: configData.visiteIntroTitulo || '',
            visiteIntroTexto: configData.visiteIntroTexto || '',
            visiteSecao1Titulo: configData.visiteSecao1Titulo || '',
            visiteSecao1Texto: configData.visiteSecao1Texto || '',
            visiteSecao1Imagem: configData.visiteSecao1Imagem || '',
            visiteSecao2Titulo: configData.visiteSecao2Titulo || '',
            visiteSecao2Texto: configData.visiteSecao2Texto || '',
            visiteSecao2Imagem: configData.visiteSecao2Imagem || '',
            visiteBannerImagem: configData.visiteBannerImagem || '',
            visiteBannerTag: configData.visiteBannerTag || '',
            visiteBannerTitulo: configData.visiteBannerTitulo || '',
            visiteBannerSubtitulo: configData.visiteBannerSubtitulo || '',
            visiteGuiaFazer: configData.visiteGuiaFazer || '',
            visiteGuiaComer: configData.visiteGuiaComer || '',
            visiteGuiaFicar: configData.visiteGuiaFicar || '',
            experienciasIntroTitulo: configData.experienciasIntroTitulo || '',
            experienciasIntroTexto: configData.experienciasIntroTexto || '',
            contatoIntroTitulo: configData.contatoIntroTitulo || '',
            contatoIntroTexto: configData.contatoIntroTexto || '',
            ctaTitulo: configData.ctaTitulo || '',
            ctaSubtitulo: configData.ctaSubtitulo || '',
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Erro ao carregar dados do superadmin.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4500);
  };

  const handlePaletteChange = (paletteName: string) => {
    if (paletteName !== 'PERSONALIZADA') {
      const preset = PRESETS[paletteName as keyof typeof PRESETS];
      if (preset) {
        setSettingsForm(prev => ({
          ...prev,
          paletaNome: paletteName,
          ...preset
        }));
        return;
      }
    }
    setSettingsForm(prev => ({
      ...prev,
      paletaNome: paletteName
    }));
  };

  const handleSettingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoImagem' | 'logoTextoImagem' | 'favicon' | 'heroImagem' | 'fiosaImagem') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const compressedBlob = await compressImage(file);
      const uploadForm = new FormData();
      uploadForm.append('file', compressedBlob, file.name);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload.');

      setSettingsForm(prev => ({
        ...prev,
        [fieldName]: data.url
      }));
      showSuccess('Imagem enviada com sucesso.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao enviar imagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/configuracao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar configurações.');

      showSuccess('Configurações salvas com sucesso. Recarregue o site para ver as novas configurações e cores aplicadas.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar configurações.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- ARTISAN OPERATIONS ---
  const handleCreateArtisan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisanForm.nome || !artisanForm.email || !artisanForm.senha) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/artesao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artisanForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar artesão.');

      showSuccess(`Artesão "${data.nome}" registrado com sucesso.`);
      setIsArtisanFormOpen(false);
      setArtisanForm({ nome: '', email: '', senha: '' });
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar artesão.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenArtisanEdit = (artesao: any) => {
    setEditArtisanForm({
      nome: artesao.nome,
      email: artesao.usuario.email,
      senha: '',
      perfilAtivo: artesao.perfilAtivo,
    });
    setEditingArtisanId(artesao.id);
    setIsEditingArtisan(true);
    setIsArtisanFormOpen(false);
  };

  const handleEditArtisanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editArtisanForm.nome || !editArtisanForm.email) return;
    setSubmitting(true);
    setErrorMsg('');

    try {
      const body: any = {
        nome: editArtisanForm.nome,
        email: editArtisanForm.email,
        perfilAtivo: editArtisanForm.perfilAtivo,
        status: editArtisanForm.perfilAtivo ? 'ATIVO' : 'INATIVO',
      };
      if (editArtisanForm.senha) {
        body.senha = editArtisanForm.senha;
      }

      const res = await fetch(`/api/artesao/${editingArtisanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar artesão.');

      showSuccess(`Artesão "${data.nome}" atualizado com sucesso.`);
      setIsEditingArtisan(false);
      setEditingArtisanId(null);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao atualizar artesão.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleArtisanStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/artesao/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perfilAtivo: !currentStatus }),
      });
      if (!res.ok) throw new Error('Falha ao alterar status.');
      showSuccess('Status do artesão atualizado.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao alterar status.');
    }
  };

  const handleDeleteArtisan = async (id: string) => {
    if (!confirm('Deseja realmente excluir definitivamente este artesão e sua conta vinculada?')) return;
    try {
      const res = await fetch(`/api/artesao/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir.');
      showSuccess('Artesão excluído com sucesso.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir artesão.');
    }
  };

  // --- CATEGORY OPERATIONS ---
  const handleOpenCategoryEdit = (cat: Category) => {
    setCategoryForm({
      nome: cat.nome,
      descricao: cat.descricao || '',
      percentualFiosa: cat.percentualFiosa.toString(),
      status: cat.status,
    });
    setEditingCategory(cat.id);
    setIsCategoryFormOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const url = editingCategory ? `/api/categorias/${editingCategory}` : '/api/categorias';
    const method = editingCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar categoria.');

      showSuccess(editingCategory ? 'Categoria atualizada.' : 'Categoria criada com sucesso.');
      setIsCategoryFormOpen(false);
      setCategoryForm({ nome: '', descricao: '', percentualFiosa: '10', status: 'ATIVO' });
      setEditingCategory(null);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar categoria.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deseja excluir esta categoria?')) return;
    try {
      const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir.');
      showSuccess('Categoria excluída.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir categoria.');
    }
  };

  // --- EXPERIENCE OPERATIONS ---
  const handleOpenExperienceEdit = (exp: Experience) => {
    setExperienceForm({
      titulo: exp.titulo,
      descricao: exp.descricao,
      localizacao: exp.localizacao,
      duracao: exp.duracao || '',
      preco: exp.preco ? exp.preco.toString() : '',
      contato: (exp as any).contato || '',
      imagem: exp.imagem || '',
      status: exp.status,
    });
    setEditingExperience(exp.id);
    setIsExperienceFormOpen(true);
  };

  const handleExperienceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const url = editingExperience ? `/api/experiencias/${editingExperience}` : '/api/experiencias';
    const method = editingExperience ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experienceForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar experiência.');

      showSuccess(editingExperience ? 'Experiência atualizada.' : 'Experiência criada com sucesso.');
      setIsExperienceFormOpen(false);
      setExperienceForm({ titulo: '', descricao: '', localizacao: '', duracao: '', preco: '', contato: '', imagem: '', status: 'ATIVO' });
      setEditingExperience(null);
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar experiência.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Deseja excluir esta experiência?')) return;
    try {
      const res = await fetch(`/api/experiencias/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir.');
      showSuccess('Experiência excluída.');
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir experiência.');
    }
  };

  // Global Statistics aggregation
  const globalProfileViews = artisans.reduce((acc, a) => acc + a.visualizacoesPerfil, 0);
  const globalWhatsClicks = artisans.reduce((acc, a) => acc + a.cliquesWhats, 0);

  // Sorting products by views
  const topProducts = [...products].sort((a, b) => b.visualizacoes - a.visualizacoes).slice(0, 5);

  return (
    <div className="space-y-8 pb-12">
      {/* Superadmin Header */}
      <div className="flex items-center justify-between border-b border-[#8D7F73]/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#606C38] text-white p-2 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2B2D2F]">Painel de Controle FIOSA</h1>
            <p className="font-sans text-xs text-[#2B2D2F]/50 mt-0.5">
              Superadministrador Geral — Moderação e configurações globais do portal.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-fiosa-marrom/20 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stats'
              ? 'border-fiosa-terracota text-fiosa-terracota'
              : 'border-transparent text-fiosa-grafite/50 hover:text-fiosa-grafite'
          }`}
        >
          <TrendingUp size={16} />
          Estatísticas Gerais
        </button>
        <button
          onClick={() => setActiveTab('artisan')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'artisan'
              ? 'border-fiosa-terracota text-fiosa-terracota'
              : 'border-transparent text-fiosa-grafite/50 hover:text-fiosa-grafite'
          }`}
        >
          <Users size={16} />
          Gerenciar Artesãos
        </button>
        <button
          onClick={() => setActiveTab('category')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'category'
              ? 'border-fiosa-terracota text-fiosa-terracota'
              : 'border-transparent text-fiosa-grafite/50 hover:text-fiosa-grafite'
          }`}
        >
          <FolderTree size={16} />
          Categorias Globais
        </button>
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'experience'
              ? 'border-fiosa-terracota text-fiosa-terracota'
              : 'border-transparent text-fiosa-grafite/50 hover:text-fiosa-grafite'
          }`}
        >
          <Compass size={16} />
          Experiências
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-fiosa-terracota text-fiosa-terracota'
              : 'border-transparent text-fiosa-grafite/50 hover:text-fiosa-grafite'
          }`}
        >
          <Settings size={16} />
          Configurações Gerais
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-[#606C38]/10 border-l-4 border-[#606C38] p-4 text-xs text-[#606C38] font-sans font-bold rounded">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-[#C15C3D]/10 border-l-4 border-[#C15C3D] p-4 text-xs text-[#C15C3D] font-sans font-bold rounded">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="text-[#C15C3D] animate-spin" size={32} />
        </div>
      ) : (
        <>
          {/* TAB 1: STATISTICS OVERVIEW */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1">
                  <Eye className="text-[#C15C3D] mb-1" size={24} />
                  <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/50 uppercase tracking-wider">Acessos Totais a Perfis</span>
                  <span className="font-sans text-2xl font-extrabold text-[#2B2D2F]">{globalProfileViews}</span>
                </div>

                <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1">
                  <TrendingUp className="text-[#606C38] mb-1" size={24} />
                  <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/50 uppercase tracking-wider">Total de Peças Cadastradas</span>
                  <span className="font-sans text-2xl font-extrabold text-[#2B2D2F]">{products.length}</span>
                </div>

                <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-6 rounded-xl space-y-1">
                  <Users className="text-[#C15C3D] mb-1" size={24} />
                  <span className="block font-sans text-[10px] font-bold text-[#2B2D2F]/50 uppercase tracking-wider">Cliques Totais WhatsApp</span>
                  <span className="font-sans text-2xl font-extrabold text-[#2B2D2F]">{globalWhatsClicks}</span>
                </div>
              </div>

              {/* Ranking of products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Viewed Products */}
                <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#2B2D2F]">
                    Peças Mais Visualizadas
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead className="bg-[#F3EFE9] text-[#2B2D2F]/50 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                        <tr>
                          <th className="py-2.5 px-4">Peça</th>
                          <th className="py-2.5 px-3">Artesão</th>
                          <th className="py-2.5 px-3 text-right">Visualizações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8D7F73]/10">
                        {topProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-[#F3EFE9]/20">
                            <td className="py-2 px-4 font-bold text-[#2B2D2F]">{p.nome}</td>
                            <td className="py-2 px-3 text-[#2B2D2F]/70">{p.artesao.nome}</td>
                            <td className="py-2 px-3 text-right font-bold text-[#C15C3D]">{p.visualizacoes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Viewed Artisans */}
                <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#2B2D2F]">
                    Artesãos Mais Acessados
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead className="bg-[#F3EFE9] text-[#2B2D2F]/50 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                        <tr>
                          <th className="py-2.5 px-4">Artesão</th>
                          <th className="py-2.5 px-3 text-center">Cliques Whats</th>
                          <th className="py-2.5 px-3 text-right">Visitas Perfil</th>
                          <th className="py-2.5 px-3 text-right">Faturamento Total</th>
                          <th className="py-2.5 px-3 text-right text-[#C15C3D]">Repasse FIOSA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#8D7F73]/10">
                        {[...artisans]
                          .sort((a, b) => b.visualizacoesPerfil - a.visualizacoesPerfil)
                          .slice(0, 5)
                          .map((a) => {
                            const faturamento = a.vendas?.reduce((sum, v) => sum + v.valorVenda, 0) || 0;
                            const repasse = a.vendas?.reduce((sum, v) => sum + v.contribuicaoFiosa, 0) || 0;
                            return (
                              <tr key={a.id} className="hover:bg-[#F3EFE9]/20">
                                <td className="py-2 px-4 font-bold text-[#2B2D2F]">
                                  {a.nome}
                                  {a.marca && <span className="block font-sans text-[9px] text-[#8D7F73] font-normal">{a.marca}</span>}
                                </td>
                                <td className="py-2 px-3 text-center text-[#606C38] font-bold">{a.cliquesWhats}</td>
                                <td className="py-2 px-3 text-right font-bold text-[#C15C3D]">{a.visualizacoesPerfil}</td>
                                <td className="py-2 px-3 text-right font-bold text-[#2B2D2F]">R$ {faturamento.toFixed(2).replace('.', ',')}</td>
                                <td className="py-2 px-3 text-right font-bold text-[#C15C3D]">R$ {repasse.toFixed(2).replace('.', ',')}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTISAN MANAGEMENT */}
          {activeTab === 'artisan' && (
            <div className="space-y-6">
              {/* Form trigger overlay */}
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-[#2B2D2F]">Cadastro de Parceiros</h3>
                {!isArtisanFormOpen && (
                  <button
                    onClick={() => setIsArtisanFormOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <UserPlus size={14} />
                    Novo Artesão
                  </button>
                )}
              </div>

              {isArtisanFormOpen && (
                <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 max-w-lg">
                  <h4 className="font-serif text-base font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2 mb-4">
                    Cadastrar Novo Artesão
                  </h4>
                  <form onSubmit={handleCreateArtisan} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={artisanForm.nome}
                        onChange={(e) => setArtisanForm({ ...artisanForm, nome: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                        E-mail de Acesso
                      </label>
                      <input
                        type="email"
                        required
                        value={artisanForm.email}
                        onChange={(e) => setArtisanForm({ ...artisanForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                        Senha Inicial do Painel
                      </label>
                      <input
                        type="text"
                        required
                        value={artisanForm.senha}
                        onChange={(e) => setArtisanForm({ ...artisanForm, senha: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-[#8D7F73]/20">
                      <button
                        type="button"
                        onClick={() => setIsArtisanFormOpen(false)}
                        className="px-4 py-2 border border-[#8D7F73]/40 rounded text-[#2B2D2F] font-sans text-xs font-bold uppercase hover:bg-white/40"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase disabled:opacity-75"
                      >
                        Registrar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {isEditingArtisan && (
                <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 max-w-lg">
                  <h4 className="font-serif text-base font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2 mb-4">
                    Editar Dados do Artesão
                  </h4>
                  <form onSubmit={handleEditArtisanSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={editArtisanForm.nome}
                        onChange={(e) => setEditArtisanForm({ ...editArtisanForm, nome: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                        E-mail de Acesso
                      </label>
                      <input
                        type="email"
                        required
                        value={editArtisanForm.email}
                        onChange={(e) => setEditArtisanForm({ ...editArtisanForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                        Nova Senha (Deixe em branco para manter a atual)
                      </label>
                      <input
                        type="text"
                        value={editArtisanForm.senha}
                        onChange={(e) => setEditArtisanForm({ ...editArtisanForm, senha: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs"
                        placeholder="Mínimo 6 caracteres se alterado"
                      />
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="editPerfilAtivo"
                        checked={editArtisanForm.perfilAtivo}
                        onChange={(e) => setEditArtisanForm({ ...editArtisanForm, perfilAtivo: e.target.checked })}
                        className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
                      />
                      <label htmlFor="editPerfilAtivo" className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70 cursor-pointer">
                        Perfil Ativo no Site
                      </label>
                    </div>
                    <div className="flex gap-2 justify-end pt-3 border-t border-[#8D7F73]/20">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingArtisan(false);
                          setEditingArtisanId(null);
                        }}
                        className="px-4 py-2 border border-[#8D7F73]/40 rounded text-[#2B2D2F] font-sans text-xs font-bold uppercase hover:bg-white/40"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase disabled:opacity-75"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Artisans list table */}
              <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                    <tr>
                      <th className="py-3 px-4">Nome / Marca</th>
                      <th className="py-3 px-3">E-mail</th>
                      <th className="py-3 px-3">WhatsApp</th>
                      <th className="py-3 px-3 text-center">Status Público</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8D7F73]/15">
                    {artisans.map((a) => (
                      <tr key={a.id} className="hover:bg-[#F3EFE9]/20">
                        <td className="py-3 px-4">
                          <strong className="font-serif text-sm text-[#2B2D2F]">{a.nome}</strong>
                          {a.marca && <span className="block text-[10px] text-[#8D7F73] font-bold uppercase">{a.marca}</span>}
                        </td>
                        <td className="py-3 px-3 text-[#2B2D2F]/70">{a.usuario.email}</td>
                        <td className="py-3 px-3 font-semibold text-[#2B2D2F]/70">{a.whatsapp || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleToggleArtisanStatus(a.id, a.perfilAtivo)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold font-sans uppercase transition-all ${
                              a.perfilAtivo
                                ? 'bg-[#606C38]/10 text-[#606C38]'
                                : 'bg-[#C15C3D]/10 text-[#C15C3D]'
                            }`}
                          >
                            {a.perfilAtivo ? 'ATIVO' : 'INATIVO'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenArtisanEdit(a)}
                              className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-[#C15C3D] rounded transition-all"
                              title="Editar artesão"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteArtisan(a.id)}
                              className="p-1.5 bg-[#F3EFE9] text-red-600 border border-[#8D7F73]/30 hover:border-red-600 rounded transition-all"
                              title="Remover artesão"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORIES CONFIGURATION */}
          {activeTab === 'category' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-[#2B2D2F]">Categorias Globais e Taxas</h3>
                {!isCategoryFormOpen && (
                  <button
                    onClick={() => {
                      setCategoryForm({ nome: '', descricao: '', percentualFiosa: '10', status: 'ATIVO' });
                      setEditingCategory(null);
                      setIsCategoryFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    Nova Categoria
                  </button>
                )}
              </div>

              {isCategoryFormOpen && (
                <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 max-w-lg">
                  <h4 className="font-serif text-base font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2 mb-4">
                    {editingCategory ? 'Editar Categoria' : 'Criar Nova Categoria'}
                  </h4>
                  <form onSubmit={handleCategorySubmit} className="space-y-4 font-sans text-xs">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="block font-bold text-[#2B2D2F]/70 uppercase">Nome da Categoria</label>
                        <input
                          type="text"
                          required
                          value={categoryForm.nome}
                          onChange={(e) => setCategoryForm({ ...categoryForm, nome: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs"
                          placeholder="Ex: Tapetes"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-[#C15C3D] uppercase">Retenção FIOSA (%)</label>
                        <input
                          type="number"
                          required
                          value={categoryForm.percentualFiosa}
                          onChange={(e) => setCategoryForm({ ...categoryForm, percentualFiosa: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#C15C3D]/40 border rounded text-xs font-bold text-[#C15C3D]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-[#2B2D2F]/70 uppercase">Descrição</label>
                      <textarea
                        name="descricao"
                        rows={3}
                        value={categoryForm.descricao}
                        onChange={(e) => setCategoryForm({ ...categoryForm, descricao: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-[#8D7F73]/20">
                      <button
                        type="button"
                        onClick={() => setIsCategoryFormOpen(false)}
                        className="px-4 py-2 border border-[#8D7F73]/40 rounded text-[#2B2D2F] font-bold uppercase hover:bg-white/40"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-bold uppercase"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories list table */}
              <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                    <tr>
                      <th className="py-3 px-4">Nome</th>
                      <th className="py-3 px-3">Descrição</th>
                      <th className="py-3 px-3 text-right text-[#C15C3D]">Retenção FIOSA</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8D7F73]/15">
                    {categories.map((c) => (
                      <tr key={c.id} className="hover:bg-[#F3EFE9]/20">
                        <td className="py-3 px-4 font-serif text-sm font-bold text-[#2B2D2F]">{c.nome}</td>
                        <td className="py-3 px-3 text-[#2B2D2F]/60 leading-relaxed max-w-sm">{c.descricao || '-'}</td>
                        <td className="py-3 px-3 text-right font-extrabold text-[#C15C3D]">{c.percentualFiosa}%</td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-[#606C38]/10 text-[#606C38] px-2 py-0.5 rounded font-bold text-[9px]">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenCategoryEdit(c)}
                              className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-[#C15C3D] rounded transition-all"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-1.5 bg-[#F3EFE9] text-red-600 border border-[#8D7F73]/30 hover:border-red-600 rounded transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCES */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-lg font-bold text-[#2B2D2F]">Oficinas e Vivências</h3>
                {!isExperienceFormOpen && (
                  <button
                    onClick={() => {
                      setExperienceForm({ titulo: '', descricao: '', localizacao: '', duracao: '', preco: '', contato: '', imagem: '', status: 'ATIVO' });
                      setEditingExperience(null);
                      setIsExperienceFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                    Nova Experiência
                  </button>
                )}
              </div>

              {isExperienceFormOpen && (
                <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 max-w-xl">
                  <h4 className="font-serif text-base font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2 mb-4">
                    {editingExperience ? 'Editar Experiência' : 'Criar Nova Experiência'}
                  </h4>
                  <form onSubmit={handleExperienceSubmit} className="space-y-4 font-sans text-xs text-[#2B2D2F]">
                    <div className="space-y-1">
                      <label className="block font-bold text-[#2B2D2F]/70 uppercase">Título da Vivência</label>
                      <input
                        type="text"
                        required
                        value={experienceForm.titulo}
                        onChange={(e) => setExperienceForm({ ...experienceForm, titulo: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-[#2B2D2F]/70 uppercase">Descrição da Atividade</label>
                      <textarea
                        rows={4}
                        required
                        value={experienceForm.descricao}
                        onChange={(e) => setExperienceForm({ ...experienceForm, descricao: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs leading-relaxed"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-[#2B2D2F]/70 uppercase">Localização / Ponto de Encontro</label>
                        <input
                          type="text"
                          required
                          value={experienceForm.localizacao}
                          onChange={(e) => setExperienceForm({ ...experienceForm, localizacao: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-[#2B2D2F]/70 uppercase">Duração (Ex: 3 horas)</label>
                        <input
                          type="text"
                          value={experienceForm.duracao}
                          onChange={(e) => setExperienceForm({ ...experienceForm, duracao: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-[#2B2D2F]/70 uppercase">Preço individual (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={experienceForm.preco}
                          onChange={(e) => setExperienceForm({ ...experienceForm, preco: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs font-bold"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-[#2B2D2F]/70 uppercase">WhatsApp para Reserva</label>
                        <input
                          type="text"
                          value={experienceForm.contato}
                          onChange={(e) => setExperienceForm({ ...experienceForm, contato: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded text-xs"
                          placeholder="Ex: 32999991111"
                        />
                      </div>

                      <div className="space-y-1 col-span-2">
                        <label className="block font-bold text-[#2B2D2F]/70 uppercase">Imagem da Vivência</label>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="relative h-14 w-24 rounded overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0 shadow-inner">
                            {experienceForm.imagem ? (
                              <img src={experienceForm.imagem} alt="Experiência" className="object-cover h-full w-full" />
                            ) : (
                              <div className="h-full w-full bg-slate-200" />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#2B2D2F] hover:bg-[#C15C3D] text-white px-3.5 py-1.5 rounded text-[10px] font-sans font-bold tracking-wider uppercase transition-colors">
                              <Upload size={12} />
                              Enviar Capa
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleConfigImageSelect(e, 'experiencia')}
                                className="hidden"
                              />
                            </label>
                            <p className="text-[9px] text-[#2B2D2F]/55">Formatos aceitos: JPG, PNG (16:9 crop)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-3 border-t border-[#8D7F73]/20">
                      <button
                        type="button"
                        onClick={() => setIsExperienceFormOpen(false)}
                        className="px-4 py-2 border border-[#8D7F73]/40 rounded text-[#2B2D2F] font-bold uppercase hover:bg-white/40"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2 rounded font-bold uppercase"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Experiences list table */}
              <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left font-sans text-xs">
                  <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                    <tr>
                      <th className="py-3 px-4">Vivência</th>
                      <th className="py-3 px-3">Localização</th>
                      <th className="py-3 px-3">Duração</th>
                      <th className="py-3 px-3 text-right">Preço</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#8D7F73]/15">
                    {experiences.map((exp) => (
                      <tr key={exp.id} className="hover:bg-[#F3EFE9]/20">
                        <td className="py-3 px-4">
                          <strong className="font-serif text-sm text-[#2B2D2F]">{exp.titulo}</strong>
                        </td>
                        <td className="py-3 px-3 text-[#2B2D2F]/70">{exp.localizacao}</td>
                        <td className="py-3 px-3 font-semibold text-[#2B2D2F]/60">{exp.duracao || '-'}</td>
                        <td className="py-3 px-3 text-right font-bold text-[#606C38]">
                          {exp.preco ? `R$ ${exp.preco.toFixed(2).replace('.', ',')}` : 'Sob consulta'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="bg-[#606C38]/10 text-[#606C38] px-2 py-0.5 rounded font-bold text-[9px]">
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenExperienceEdit(exp)}
                              className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-[#C15C3D] rounded transition-all"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="p-1.5 bg-[#F3EFE9] text-red-600 border border-[#8D7F73]/30 hover:border-red-600 rounded transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: GENERAL SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsSubmit} className="space-y-8 font-sans text-xs text-fiosa-grafite">
              
              {/* Section 1: Visual Identity and Colors */}
              <div className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold border-b border-fiosa-marrom/20 pb-2 text-fiosa-grafite">
                  Identidade e Cores do Site
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Nome / Título da Logo</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.logoTexto}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoTexto: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Slogan da Logo (Subtítulo)</label>
                    <input
                      type="text"
                      value={settingsForm.logoSubtitulo}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logoSubtitulo: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                    />
                    <p className="text-[10px] text-fiosa-grafite/50 italic mt-0.5">
                      Deixe em branco para ocultar o descritivo e exibir o logotipo em layout único e ampliado.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Ícone de Marca / Identidade Visual (Esquerda do Título)</label>
                  <div className="flex items-center gap-4">
                    {settingsForm.logoImagem && (
                      <div className="h-10 w-10 relative border border-fiosa-marrom/30 bg-fiosa-linho rounded overflow-hidden flex items-center justify-center">
                        <img src={settingsForm.logoImagem} alt="Logo preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-fiosa-linho hover:bg-fiosa-marrom/10 border border-fiosa-marrom/30 px-3 py-2 rounded font-bold uppercase transition-colors text-fiosa-grafite text-xs">
                      <Upload size={14} />
                      Carregar Ícone de Marca
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleConfigImageSelect(e, 'logoImagem')}
                        className="hidden"
                      />
                    </label>
                    {settingsForm.logoImagem && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoImagem: '' })}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Limpar Ícone
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Favicon do Site (Aba do Navegador)</label>
                  <div className="flex items-center gap-4">
                    {settingsForm.favicon && (
                      <div className="h-10 w-10 relative border border-fiosa-marrom/30 bg-fiosa-linho rounded overflow-hidden flex items-center justify-center">
                        <img src={settingsForm.favicon} alt="Favicon preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-fiosa-linho hover:bg-fiosa-marrom/10 border border-fiosa-marrom/30 px-3 py-2 rounded font-bold uppercase transition-colors text-fiosa-grafite text-xs">
                      <Upload size={14} />
                      Carregar Favicon
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleConfigImageSelect(e, 'favicon')}
                        className="hidden"
                      />
                    </label>
                    {settingsForm.favicon && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, favicon: '' })}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Limpar Favicon
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Imagem Substituta do Título / Wordmark (Substitui o texto 'FIOSA')</label>
                  <div className="flex items-center gap-4">
                    {settingsForm.logoTextoImagem && (
                      <div className="h-10 w-28 relative border border-fiosa-marrom/30 bg-fiosa-linho rounded overflow-hidden flex items-center justify-center">
                        <img src={settingsForm.logoTextoImagem} alt="Wordmark preview" className="h-full w-full object-contain" />
                      </div>
                    )}
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-fiosa-linho hover:bg-fiosa-marrom/10 border border-fiosa-marrom/30 px-3 py-2 rounded font-bold uppercase transition-colors text-fiosa-grafite text-xs">
                      <Upload size={14} />
                      Carregar Imagem do Título
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleConfigImageSelect(e, 'logoTextoImagem')}
                        className="hidden"
                      />
                    </label>
                    {settingsForm.logoTextoImagem && (
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, logoTextoImagem: '' })}
                        className="text-red-600 font-bold hover:underline"
                      >
                        Limpar Imagem
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-fiosa-marrom/10 pt-4 space-y-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-terracota uppercase">Paleta de Cores do Site</label>
                    <select
                      value={settingsForm.paletaNome}
                      onChange={(e) => handlePaletteChange(e.target.value)}
                      className="w-full md:w-1/3 px-3 py-2 bg-fiosa-cru border border-fiosa-terracota/40 rounded font-bold text-fiosa-terracota text-xs"
                    >
                      <option value="ORIGINAL">Original (Terracota & Oliva)</option>
                      <option value="TERRA">Earthy (Terra & Azul Slate)</option>
                      <option value="OCEANO">Costal (Azul Oceano & Teal)</option>
                      <option value="FLORESTA">Forest (Verde & Menta)</option>
                      <option value="MONOCROMATICA">Monocromática (Preto & Cinza)</option>
                      <option value="PERSONALIZADA">Personalizada (Escolher Cores)</option>
                    </select>
                    <p className="text-[10px] text-fiosa-grafite/50 italic mt-0.5">
                      Ao selecionar uma paleta predefinida, as cores individuais serão bloqueadas e preenchidas automaticamente.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Cor Principal</label>
                      <input
                        type="color"
                        disabled={settingsForm.paletaNome !== 'PERSONALIZADA'}
                        value={settingsForm.corPrimaria}
                        onChange={(e) => setSettingsForm({ ...settingsForm, corPrimaria: e.target.value })}
                        className="w-full h-8 p-0 border border-fiosa-marrom/30 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="block text-center font-mono text-[10px]">{settingsForm.corPrimaria}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Cor Secundária</label>
                      <input
                        type="color"
                        disabled={settingsForm.paletaNome !== 'PERSONALIZADA'}
                        value={settingsForm.corSecundaria}
                        onChange={(e) => setSettingsForm({ ...settingsForm, corSecundaria: e.target.value })}
                        className="w-full h-8 p-0 border border-fiosa-marrom/30 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="block text-center font-mono text-[10px]">{settingsForm.corSecundaria}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Cor Fundo Principal</label>
                      <input
                        type="color"
                        disabled={settingsForm.paletaNome !== 'PERSONALIZADA'}
                        value={settingsForm.corFundo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, corFundo: e.target.value })}
                        className="w-full h-8 p-0 border border-fiosa-marrom/30 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="block text-center font-mono text-[10px]">{settingsForm.corFundo}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Fundo Alternativo</label>
                      <input
                        type="color"
                        disabled={settingsForm.paletaNome !== 'PERSONALIZADA'}
                        value={settingsForm.corFundoAlternativo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, corFundoAlternativo: e.target.value })}
                        className="w-full h-8 p-0 border border-fiosa-marrom/30 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="block text-center font-mono text-[10px]">{settingsForm.corFundoAlternativo}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Cor Texto Geral</label>
                      <input
                        type="color"
                        disabled={settingsForm.paletaNome !== 'PERSONALIZADA'}
                        value={settingsForm.corTexto}
                        onChange={(e) => setSettingsForm({ ...settingsForm, corTexto: e.target.value })}
                        className="w-full h-8 p-0 border border-fiosa-marrom/30 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="block text-center font-mono text-[10px]">{settingsForm.corTexto}</span>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Cor Bordas/Linhas</label>
                      <input
                        type="color"
                        disabled={settingsForm.paletaNome !== 'PERSONALIZADA'}
                        value={settingsForm.corBorda}
                        onChange={(e) => setSettingsForm({ ...settingsForm, corBorda: e.target.value })}
                        className="w-full h-8 p-0 border border-fiosa-marrom/30 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="block text-center font-mono text-[10px]">{settingsForm.corBorda}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Landing Page Hero Banner */}
              <div className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold border-b border-fiosa-marrom/20 pb-2 text-fiosa-grafite">
                  Banner Principal (Hero da Home)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1 md:col-span-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Etiqueta/Tag de Categoria</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.heroTag}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTag: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Imagem de Fundo (Banner)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={settingsForm.heroImagem}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroImagem: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded font-mono text-[10px] text-fiosa-grafite"
                      />
                      <label className="cursor-pointer shrink-0 inline-flex items-center gap-1 bg-fiosa-linho border border-fiosa-marrom/30 px-3.5 py-2 rounded font-bold uppercase transition-colors hover:bg-fiosa-marrom/10 text-fiosa-grafite text-xs">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleConfigImageSelect(e, 'heroImagem')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Título Grande (Hero)</label>
                  <textarea
                    rows={2}
                    required
                    value={settingsForm.heroTitulo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroTitulo: e.target.value })}
                    className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded font-serif text-sm leading-relaxed text-fiosa-grafite"
                  />
                  <p className="text-[10px] text-fiosa-grafite/50 italic">Dica: Use quebras de linha para formatar o título da home page.</p>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Subtítulo (Hero)</label>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.heroSubtitulo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitulo: e.target.value })}
                    className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                  />
                </div>
              </div>

              {/* Section 3: Nosso Propósito / A FIOSA */}
              <div className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold border-b border-fiosa-marrom/20 pb-2 text-fiosa-grafite">
                  Seção "A FIOSA" (Nosso Propósito)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1 md:col-span-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Mini-título (Tag)</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.fiosaTag}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fiosaTag: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Imagem Conceitual Lateral</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={settingsForm.fiosaImagem}
                        onChange={(e) => setSettingsForm({ ...settingsForm, fiosaImagem: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded font-mono text-[10px] text-fiosa-grafite"
                      />
                      <label className="cursor-pointer shrink-0 inline-flex items-center gap-1 bg-fiosa-linho border border-fiosa-marrom/30 px-3.5 py-2 rounded font-bold uppercase transition-colors hover:bg-fiosa-marrom/10 text-fiosa-grafite text-xs">
                        <Upload size={14} />
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleConfigImageSelect(e, 'fiosaImagem')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Título da Seção</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.fiosaTitulo}
                    onChange={(e) => setSettingsForm({ ...settingsForm, fiosaTitulo: e.target.value })}
                    className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded font-serif text-sm text-fiosa-grafite"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Parágrafo 1</label>
                    <textarea
                      rows={5}
                      required
                      value={settingsForm.fiosaTexto1}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fiosaTexto1: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Parágrafo 2</label>
                    <textarea
                      rows={5}
                      required
                      value={settingsForm.fiosaTexto2}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fiosaTexto2: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Contact & Footer */}
              <div className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold border-b border-fiosa-marrom/20 pb-2 text-fiosa-grafite">
                  Contatos e Rodapé
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Frase Efeito/Slogan (Rodapé)</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.rodapeSlogan}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rodapeSlogan: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Instagram (Usuário sem @)</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.contatoInstagram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contatoInstagram: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded font-mono text-fiosa-grafite text-xs"
                      placeholder="fiosa.colaborativa"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Texto Institucional (Rodapé)</label>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.rodapeDescricao}
                    onChange={(e) => setSettingsForm({ ...settingsForm, rodapeDescricao: e.target.value })}
                    className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-fiosa-marrom/10 pt-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Endereço de Contato</label>
                    <textarea
                      rows={3}
                      required
                      value={settingsForm.contatoEndereco}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contatoEndereco: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Horário de Funcionamento</label>
                    <textarea
                      rows={3}
                      required
                      value={settingsForm.contatoAtendimento}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contatoAtendimento: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">WhatsApp (DDD + Número)</label>
                    <input
                      type="text"
                      required
                      value={settingsForm.contatoWhatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contatoWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      placeholder="32999991111"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">Telefone Fixo</label>
                    <input
                      type="text"
                      value={settingsForm.contatoTelefone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contatoTelefone: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      placeholder="(32) 3354-1111"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase">E-mail para Contato</label>
                    <input
                      type="email"
                      required
                      value={settingsForm.contatoEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contatoEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-4">
                  <label className="block font-bold text-fiosa-grafite/70 uppercase">Google Maps (URL ou Iframe Embed)</label>
                  <p className="text-[10px] text-fiosa-grafite/50 mb-1 leading-tight">Cole o código HTML do iframe gerado pelo Google Maps ou diretamente o link (URL) do mapa (src).</p>
                  <textarea
                    rows={3}
                    required
                    value={settingsForm.contatoMapaIframe}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contatoMapaIframe: e.target.value })}
                    className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded font-mono text-[10px] text-fiosa-grafite"
                    placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                  />
                </div>
              </div>

              {/* Section 5: Dynamic Page Content Editor */}
              <div className="bg-fiosa-cru border border-fiosa-marrom/20 rounded-xl p-6 shadow-sm space-y-6">
                <h3 className="font-serif text-lg font-bold border-b border-fiosa-marrom/20 pb-2 text-fiosa-grafite">
                  Conteúdos das Páginas do Site
                </h3>

                {/* Sub-section: Home Page: Sobre Resende Costa */}
                <div className="space-y-4">
                  <h4 className="font-serif text-sm font-bold text-fiosa-terracota border-b border-fiosa-marrom/10 pb-1">
                    Home Page: Seção "Sobre Resende Costa"
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Título da Seção</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.sobreResendeCostaTitulo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sobreResendeCostaTitulo: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Imagem Ilustrativa</label>
                      <div className="flex gap-3 items-center">
                        <div className="relative h-10 w-16 rounded overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0">
                          {settingsForm.sobreResendeCostaImagem ? (
                            <img src={settingsForm.sobreResendeCostaImagem} alt="Resende Costa" className="object-cover h-full w-full" />
                          ) : (
                            <div className="h-full w-full bg-slate-200" />
                          )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 bg-fiosa-linho border border-fiosa-marrom/30 px-3.5 py-1.5 rounded font-bold uppercase transition-colors hover:bg-fiosa-marrom/10 text-fiosa-grafite text-[10px]">
                          <Upload size={12} />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleConfigImageSelect(e, 'sobreResendeCostaImagem')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Parágrafo de Texto 1</label>
                      <textarea
                        rows={4}
                        required
                        value={settingsForm.sobreResendeCostaTexto1}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sobreResendeCostaTexto1: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Parágrafo de Texto 2</label>
                      <textarea
                        rows={4}
                        required
                        value={settingsForm.sobreResendeCostaTexto2}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sobreResendeCostaTexto2: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-section: Visite Resende Costa Page */}
                <div className="space-y-4 pt-4 border-t border-fiosa-marrom/10">
                  <h4 className="font-serif text-sm font-bold text-fiosa-terracota border-b border-fiosa-marrom/10 pb-1">
                    Página: Visite Resende Costa
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Tag do Banner</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.visiteBannerTag}
                        onChange={(e) => setSettingsForm({ ...settingsForm, visiteBannerTag: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Título do Banner</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.visiteBannerTitulo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, visiteBannerTitulo: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Subtítulo/Frase do Banner</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.visiteBannerSubtitulo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, visiteBannerSubtitulo: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Título de Introdução</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.visiteIntroTitulo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, visiteIntroTitulo: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Texto de Introdução</label>
                      <textarea
                        rows={2}
                        required
                        value={settingsForm.visiteIntroTexto}
                        onChange={(e) => setSettingsForm({ ...settingsForm, visiteIntroTexto: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                      />
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div className="space-y-1 pt-2">
                    <label className="block font-bold text-fiosa-grafite/70 uppercase text-xs">Imagem de Banner da Página</label>
                    <div className="flex gap-4 items-center">
                      <div className="relative h-20 w-40 rounded overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0 shadow-inner">
                        {settingsForm.visiteBannerImagem ? (
                          <img src={settingsForm.visiteBannerImagem} alt="Banner Resende Costa" className="object-cover h-full w-full" />
                        ) : (
                          <div className="h-full w-full bg-slate-200" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 bg-fiosa-linho border border-fiosa-marrom/30 px-4 py-2 rounded text-xs font-bold uppercase transition-colors hover:bg-fiosa-marrom/10">
                          <Upload size={14} />
                          Enviar Banner
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleConfigImageSelect(e, 'visiteBannerImagem')}
                            className="hidden"
                          />
                        </label>
                        {settingsForm.visiteBannerImagem && (
                          <button
                            type="button"
                            onClick={() => setSettingsForm({ ...settingsForm, visiteBannerImagem: '' })}
                            className="text-red-600 font-bold hover:underline text-[11px] text-left"
                          >
                            Remover Imagem (usar padrão)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Secao 1 (Tradicao do tear) */}
                    <div className="space-y-3 bg-[#F3EFE9]/40 p-4 rounded-lg border border-fiosa-marrom/10">
                      <span className="block font-bold text-fiosa-grafite/80 text-[10px] uppercase">Seção 1: A Tradição do Tear</span>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Título</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.visiteSecao1Titulo}
                            onChange={(e) => setSettingsForm({ ...settingsForm, visiteSecao1Titulo: e.target.value })}
                            className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Imagem</label>
                          <div className="flex gap-2 items-center">
                            <div className="relative h-8 w-14 rounded overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0">
                              {settingsForm.visiteSecao1Imagem ? (
                                <img src={settingsForm.visiteSecao1Imagem} alt="Tear" className="object-cover h-full w-full" />
                              ) : (
                                <div className="h-full w-full bg-slate-200" />
                              )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-fiosa-linho border border-fiosa-marrom/30 px-3 py-1 rounded font-bold uppercase transition-colors hover:bg-fiosa-marrom/10 text-[9px]">
                              <Upload size={10} />
                              Subir
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleConfigImageSelect(e, 'visiteSecao1Imagem')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Texto</label>
                          <textarea
                            rows={3}
                            required
                            value={settingsForm.visiteSecao1Texto}
                            onChange={(e) => setSettingsForm({ ...settingsForm, visiteSecao1Texto: e.target.value })}
                            className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secao 2 (Artesanato local) */}
                    <div className="space-y-3 bg-[#F3EFE9]/40 p-4 rounded-lg border border-fiosa-marrom/10">
                      <span className="block font-bold text-fiosa-grafite/80 text-[10px] uppercase">Seção 2: O Artesanato Local</span>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Título</label>
                          <input
                            type="text"
                            required
                            value={settingsForm.visiteSecao2Titulo}
                            onChange={(e) => setSettingsForm({ ...settingsForm, visiteSecao2Titulo: e.target.value })}
                            className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Imagem</label>
                          <div className="flex gap-2 items-center">
                            <div className="relative h-8 w-14 rounded overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0">
                              {settingsForm.visiteSecao2Imagem ? (
                                <img src={settingsForm.visiteSecao2Imagem} alt="Artesanato" className="object-cover h-full w-full" />
                              ) : (
                                <div className="h-full w-full bg-slate-200" />
                              )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-1 bg-fiosa-linho border border-fiosa-marrom/30 px-3 py-1 rounded font-bold uppercase transition-colors hover:bg-fiosa-marrom/10 text-[9px]">
                              <Upload size={10} />
                              Subir
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleConfigImageSelect(e, 'visiteSecao2Imagem')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Texto</label>
                          <textarea
                            rows={3}
                            required
                            value={settingsForm.visiteSecao2Texto}
                            onChange={(e) => setSettingsForm({ ...settingsForm, visiteSecao2Texto: e.target.value })}
                            className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>
                  
                  {/* Secao: Guia do Viajante */}
                  <div className="space-y-3 pt-2">
                    <span className="block font-bold text-fiosa-grafite/80 text-[12px] uppercase">Seção: Guia do Viajante</span>
                    <p className="text-[10px] text-fiosa-grafite/60 -mt-1 leading-tight mb-2">Para criar a lista de tópicos, digite cada item em uma nova linha.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/70 uppercase">O Que Fazer</label>
                        <textarea
                          rows={6}
                          required
                          value={settingsForm.visiteGuiaFazer}
                          onChange={(e) => setSettingsForm({ ...settingsForm, visiteGuiaFazer: e.target.value })}
                          className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/70 uppercase">Onde Comer</label>
                        <textarea
                          rows={6}
                          required
                          value={settingsForm.visiteGuiaComer}
                          onChange={(e) => setSettingsForm({ ...settingsForm, visiteGuiaComer: e.target.value })}
                          className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/70 uppercase">Onde Ficar</label>
                        <textarea
                          rows={6}
                          required
                          value={settingsForm.visiteGuiaFicar}
                          onChange={(e) => setSettingsForm({ ...settingsForm, visiteGuiaFicar: e.target.value })}
                          className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded leading-relaxed text-xs text-fiosa-grafite"
                        />
                      </div>
                    </div>
                  </div>

                {/* Sub-section: Experiencias and Contato Page Intros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-fiosa-marrom/10">
                  <div className="space-y-3 bg-[#F3EFE9]/40 p-4 rounded-lg border border-fiosa-marrom/10">
                    <span className="block font-bold text-fiosa-grafite/80 text-[10px] uppercase">Página: Experiências (Introdução)</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Título de Entrada</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.experienciasIntroTitulo}
                          onChange={(e) => setSettingsForm({ ...settingsForm, experienciasIntroTitulo: e.target.value })}
                          className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Texto de Entrada</label>
                        <textarea
                          rows={3}
                          required
                          value={settingsForm.experienciasIntroTexto}
                          onChange={(e) => setSettingsForm({ ...settingsForm, experienciasIntroTexto: e.target.value })}
                          className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-[#F3EFE9]/40 p-4 rounded-lg border border-fiosa-marrom/10">
                    <span className="block font-bold text-fiosa-grafite/80 text-[10px] uppercase">Página: Fale Conosco (Introdução)</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Título de Entrada</label>
                        <input
                          type="text"
                          required
                          value={settingsForm.contatoIntroTitulo}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contatoIntroTitulo: e.target.value })}
                          className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-fiosa-grafite/60 uppercase text-[9px]">Texto de Entrada</label>
                        <textarea
                          rows={3}
                          required
                          value={settingsForm.contatoIntroTexto}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contatoIntroTexto: e.target.value })}
                          className="w-full px-3 py-1.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-section: Home CTA Final */}
                <div className="space-y-4 pt-4 border-t border-fiosa-marrom/10">
                  <h4 className="font-serif text-sm font-bold text-fiosa-terracota border-b border-fiosa-marrom/10 pb-1">
                    Home Page: Chamada Final (CTA)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Título do Bloco</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.ctaTitulo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ctaTitulo: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold text-fiosa-grafite/70 uppercase">Subtítulo / Descrição</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.ctaSubtitulo}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ctaSubtitulo: e.target.value })}
                        className="w-full px-3 py-2 bg-fiosa-cru border border-fiosa-marrom/30 rounded text-fiosa-grafite text-xs"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Action buttons */}
              <div className="flex gap-2 justify-end border-t border-fiosa-marrom/20 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-fiosa-terracota hover:bg-fiosa-terracota/95 text-white px-8 py-3 rounded text-xs font-bold uppercase transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm inline-flex items-center gap-1.5"
                >
                  {submitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperSrc}
        aspectRatio={cropperAspect}
        onClose={() => setCropperOpen(false)}
        onCrop={handleCroppedImageUpload}
        exportType={cropperTarget === 'logoImagem' || cropperTarget === 'logoTextoImagem' || cropperTarget === 'favicon' ? 'image/png' : 'image/jpeg'}
      />
    </div>
  );
}
