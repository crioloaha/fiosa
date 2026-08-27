'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Upload, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import ImageCropperModal from '@/components/ImageCropperModal';

interface ProfileData {
  id: string;
  slug?: string;
  nome: string;
  marca: string;
  bio: string;
  historia: string;
  foto: string;
  capa: string;
  whatsapp: string;
  telefone: string;
  emailContato: string;
  endereco: string;
  cidade: string;
  cep: string;
  localizacaoMapa: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
  perfilAtivo: boolean;
  mostrarTelefone: boolean;
  mostrarEndereco: boolean;
  mostrarPreco: boolean;
  aceitarWhats: boolean;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get artisan details linked to session user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((sessionData) => {
        if (sessionData.authenticated && sessionData.user.artesao) {
          const { slug } = sessionData.user.artesao;
          return fetch(`/api/artesao/${slug}`);
        } else {
          throw new Error('Nenhum perfil de artesão vinculado.');
        }
      })
      .then((res) => res.json())
      .then((artesaoData) => {
        setProfile(artesaoData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Não foi possível carregar seu perfil de artesão.');
        setLoading(false);
      });
  }, []);

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!profile) return;
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setProfile({ ...profile, [name]: finalValue });
  };

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState('');
  const [cropperAspect, setCropperAspect] = useState<'1:1' | '3:1' | '16:9'>('1:1');
  const [cropperTarget, setCropperTarget] = useState<'foto' | 'capa'>('foto');

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'foto' | 'capa') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const src = URL.createObjectURL(file);
    setCropperSrc(src);
    setCropperAspect(targetField === 'foto' ? '1:1' : '3:1');
    setCropperTarget(targetField);
    setCropperOpen(true);
  };

  const handleCroppedImage = async (blob: Blob) => {
    if (!profile) return;
    setCropperOpen(false);

    const formData = new FormData();
    formData.append('file', blob, `${profile.slug}-${cropperTarget}.jpg`);

    try {
      setSaving(true);
      setError('');
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload.');

      setProfile({ ...profile, [cropperTarget]: data.url });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar imagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/artesao/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar perfil.');

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="text-[#C15C3D] animate-spin" size={36} />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-[#C15C3D]/10 border-l-4 border-[#C15C3D] p-4 text-xs text-[#C15C3D] font-sans font-semibold rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2B2D2F]">Editar Meu Perfil</h1>
        <p className="font-sans text-xs text-[#2B2D2F]/50 mt-1">
          Mantenha seus dados de contato, história e preferências de privacidade atualizados.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Status Alerts */}
        {success && (
          <div className="flex items-center gap-2 bg-[#606C38]/10 border-l-4 border-[#606C38] p-4 text-xs text-[#606C38] font-sans font-bold rounded">
            <CheckCircle2 size={16} />
            Perfil salvo com sucesso! As alterações já estão públicas no site.
          </div>
        )}
        {error && (
          <div className="bg-[#C15C3D]/10 border-l-4 border-[#C15C3D] p-4 text-xs text-[#C15C3D] font-sans font-bold rounded">
            {error}
          </div>
        )}

        {/* 1. Capa & Avatar Upload Row */}
        <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 space-y-6">
          <h3 className="font-serif text-lg font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
            Identidade Visual (Fotos)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Foto de Perfil */}
            <div className="space-y-3">
              <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Foto de Perfil / Logotipo
              </span>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0 shadow-inner">
                  {profile?.foto ? (
                    <img src={profile.foto} alt="Avatar" className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#2B2D2F] hover:bg-[#C15C3D] text-white px-4 py-2 rounded text-xs font-sans font-bold tracking-wider uppercase transition-colors">
                    <Upload size={14} />
                    Enviar Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileSelect(e, 'foto')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-[#2B2D2F]/55">Recomendado: Imagem quadrada (ex: 400x400px)</p>
                </div>
              </div>
            </div>
 
            {/* Foto de Capa */}
            <div className="space-y-3">
              <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Foto de Capa do Perfil
              </span>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-32 rounded overflow-hidden border border-[#8D7F73]/40 bg-white shrink-0 shadow-inner">
                  {profile?.capa ? (
                    <img src={profile.capa} alt="Capa" className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full bg-slate-200" />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 bg-[#2B2D2F] hover:bg-[#C15C3D] text-white px-4 py-2 rounded text-xs font-sans font-bold tracking-wider uppercase transition-colors">
                    <Upload size={14} />
                    Enviar Capa
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileSelect(e, 'capa')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-[#2B2D2F]/55">Recomendado: Banner retangular largo (ex: 1200x400px)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Informações Gerais */}
        <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
            Informações Gerais
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Nome do Artesão / Ateliê <span className="text-[#C15C3D]">*</span>
              </label>
              <input
                type="text"
                name="nome"
                required
                value={profile?.nome || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Nome da Marca (Opcional)
              </label>
              <input
                type="text"
                name="marca"
                value={profile?.marca || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: Tear de Minas"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
              Resumo Profissional / Especialidade <span className="text-[#C15C3D]">*</span>
            </label>
            <input
              type="text"
              name="bio"
              required
              value={profile?.bio || ''}
              onChange={handleFieldChange}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
              placeholder="Ex: Especialista em tecer tapetes e colchas pesadas de pedal com fios reciclados."
            />
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
              História de Vida / Trajetória (Biografia Longa)
            </label>
            <textarea
              name="historia"
              rows={8}
              value={profile?.historia || ''}
              onChange={handleFieldChange}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs leading-relaxed"
              placeholder="Conte como aprendeu a tecer, a história do seu ateliê, tradição familiar e inspirações..."
            />
          </div>
        </div>

        {/* 3. Contato & Endereço */}
        <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
            Contatos e Localização
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                WhatsApp <span className="text-[#C15C3D]">*</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                required
                value={profile?.whatsapp || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: 32999991111 (apenas números)"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Telefone Fixo (Opcional)
              </label>
              <input
                type="text"
                name="telefone"
                value={profile?.telefone || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: 3233541111 (apenas números)"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                E-mail de Contato
              </label>
              <input
                type="email"
                name="emailContato"
                value={profile?.emailContato || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Endereço Ateliê (Rua, Número, Bairro)
              </label>
              <input
                type="text"
                name="endereco"
                value={profile?.endereco || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: Rua São Sebastião, 145, Centro"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                CEP
              </label>
              <input
                type="text"
                name="cep"
                value={profile?.cep || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: 36340-000"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
              Link de Incorporação do Google Maps (iframe `src`)
            </label>
            <input
              type="text"
              name="localizacaoMapa"
              value={profile?.localizacaoMapa || ''}
              onChange={handleFieldChange}
              className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-[11px]"
              placeholder="Cole o endereço HTTPS do embed do Google Maps"
            />
          </div>
        </div>

        {/* 4. Redes Sociais */}
        <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
            Redes Sociais & Links
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Instagram (Usuário sem o @)
              </label>
              <input
                type="text"
                name="instagram"
                value={profile?.instagram || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: teardeouro.decor"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Facebook (Identificador da página)
              </label>
              <input
                type="text"
                name="facebook"
                value={profile?.facebook || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                TikTok (Usuário)
              </label>
              <input
                type="text"
                name="tiktok"
                value={profile?.tiktok || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Website Próprio
              </label>
              <input
                type="text"
                name="website"
                value={profile?.website || ''}
                onChange={handleFieldChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                placeholder="Ex: www.meuatelie.com.br"
              />
            </div>
          </div>
        </div>

        {/* 5. Configurações de Privacidade / Exibição */}
        <div className="bg-[#FDFBF7] border border-[#8D7F73]/20 rounded-xl p-6 space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
            Privacidade e Configurações de Exibição
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-xs text-[#2B2D2F]/80">
            {/* Perfil Ativo */}
            <label className="flex items-center gap-3 p-3 bg-[#F3EFE9] border border-[#8D7F73]/10 rounded cursor-pointer">
              <input
                type="checkbox"
                name="perfilAtivo"
                checked={profile?.perfilAtivo || false}
                onChange={handleFieldChange}
                className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
              />
              <div>
                <strong className="block font-bold">Perfil Público Ativo</strong>
                <span className="text-[10px] text-[#2B2D2F]/65">Se desmarcado, seu perfil ficará invisível para visitantes.</span>
              </div>
            </label>

            {/* Aceitar Contato Whatsapp */}
            <label className="flex items-center gap-3 p-3 bg-[#F3EFE9] border border-[#8D7F73]/10 rounded cursor-pointer">
              <input
                type="checkbox"
                name="aceitarWhats"
                checked={profile?.aceitarWhats || false}
                onChange={handleFieldChange}
                className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
              />
              <div>
                <strong className="block font-bold">Habilitar WhatsApp</strong>
                <span className="text-[10px] text-[#2B2D2F]/65">Mostra o botão de contato do WhatsApp nas peças e perfil.</span>
              </div>
            </label>

            {/* Mostrar Preço */}
            <label className="flex items-center gap-3 p-3 bg-[#F3EFE9] border border-[#8D7F73]/10 rounded cursor-pointer">
              <input
                type="checkbox"
                name="mostrarPreco"
                checked={profile?.mostrarPreco || false}
                onChange={handleFieldChange}
                className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
              />
              <div>
                <strong className="block font-bold">Exibir Preço das Peças</strong>
                <span className="text-[10px] text-[#2B2D2F]/65">Se desmarcado, os preços aparecem como "Sob consulta".</span>
              </div>
            </label>

            {/* Mostrar Telefone */}
            <label className="flex items-center gap-3 p-3 bg-[#F3EFE9] border border-[#8D7F73]/10 rounded cursor-pointer">
              <input
                type="checkbox"
                name="mostrarTelefone"
                checked={profile?.mostrarTelefone || false}
                onChange={handleFieldChange}
                className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
              />
              <div>
                <strong className="block font-bold">Exibir Telefone Fixo</strong>
                <span className="text-[10px] text-[#2B2D2F]/65">Exibe o telefone fixo do ateliê publicamente.</span>
              </div>
            </label>

            {/* Mostrar Endereço */}
            <label className="flex items-center gap-3 p-3 bg-[#F3EFE9] border border-[#8D7F73]/10 rounded cursor-pointer">
              <input
                type="checkbox"
                name="mostrarEndereco"
                checked={profile?.mostrarEndereco || false}
                onChange={handleFieldChange}
                className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
              />
              <div>
                <strong className="block font-bold">Exibir Endereço e Mapa</strong>
                <span className="text-[10px] text-[#2B2D2F]/65">Mostra seu endereço físico e mapa de como chegar.</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Save Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white font-sans font-bold text-xs tracking-wider px-8 py-3.5 rounded uppercase transition-colors shadow-sm disabled:opacity-75"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                SALVANDO...
              </>
            ) : (
              <>
                <Save size={16} />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperSrc}
        aspectRatio={cropperAspect}
        onClose={() => setCropperOpen(false)}
        onCrop={handleCroppedImage}
      />
    </div>
  );
}
