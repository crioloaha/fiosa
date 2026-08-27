'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  FolderOpen,
  Sparkles
} from 'lucide-react';

interface Category {
  id: string;
  nome: string;
}

interface Product {
  id: string;
  nome: string;
  categoriaId: string;
  categoria: {
    nome: string;
  };
  preco: number | null;
  custo: number | null;
  fotos: string; // JSON array
  materiais: string | null;
  tecnica: string | null;
  dimensoes: string | null;
  peso: number | null;
  disponibilidade: string;
  status: string;
  codigo: string | null;
  tags: string | null;
  visualizacoes: number;
}

interface VariationItem {
  id: string;
  nome: string;
  preco: number;
  custo: number;
}

interface MaterialItem {
  id: string;
  nome: string;
  valor: number;
}

interface FormData {
  id?: string;
  nome: string;
  categoriaId: string;
  descricao: string;
  preco: string;
  custo: string;
  fotos: string[];
  materiais: string;
  tecnica: string;
  dimensoes: string;
  peso: string;
  disponibilidade: string;
  status: string;
  codigo: string;
  tags: string;
  variacoes?: VariationItem[];
  custoMateriais?: MaterialItem[];
}

const initialFormData: FormData = {
  nome: '',
  categoriaId: '',
  descricao: '',
  preco: '',
  custo: '',
  fotos: [],
  materiais: '',
  tecnica: '',
  dimensoes: '',
  peso: '',
  disponibilidade: 'DISPONIVEL',
  status: 'PUBLICADO',
  codigo: '',
  tags: '',
  variacoes: [],
  custoMateriais: [],
};

export default function GerenciarProdutosPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const actionParam = searchParams.get('action');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [search, setSearch] = useState('');

  // Form & view controllers
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  // AI Scenarios Studio States
  const [isIaModalOpen, setIsIaModalOpen] = useState(false);
  const [selectedIaPhoto, setSelectedIaPhoto] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('casa-mineira');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaStep, setIaStep] = useState(0);
  const [generatedPhoto, setGeneratedPhoto] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleOpenIaModal = () => {
    if (formData.fotos.length === 0) return;
    setSelectedIaPhoto(formData.fotos[0]);
    setSelectedScenario('casa-mineira');
    setGeneratedPhoto(null);
    setIaLoading(false);
    setIaStep(0);
    setShowComparison(false);
    setIsIaModalOpen(true);
  };

  const handleGenerateIaImage = () => {
    setIaLoading(true);
    setIaStep(0);
    setGeneratedPhoto(null);

    const steps = [
      'Analisando estrutura tridimensional da peça...',
      'Isolando texturas e tramas de fio...',
      'Mesclando iluminação natural do cenário...',
      'Compondo sombras tridimensionais e acabamentos...',
      'Finalizando renderização em alta definição...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setIaStep(currentStep);
      if (currentStep >= 4) {
        clearInterval(interval);
        
        const activeCategory = categories.find(c => c.id === formData.categoriaId)?.nome || '';
        
        const iaImagesMap: { [key: string]: { [key: string]: string } } = {
          'Mantas': {
            'casa-mineira': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
            'atelie-tear': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
            'minas-contemporanea': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&q=80',
            'editorial': 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=600&q=80',
          },
          'Tapetes': {
            'casa-mineira': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&q=80',
            'atelie-tear': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&q=80',
            'minas-contemporanea': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80',
            'editorial': 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=600&q=80',
          },
          'Caminhos de Mesa': {
            'casa-mineira': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80',
            'atelie-tear': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
            'minas-contemporanea': 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=600&q=80',
            'editorial': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80',
          },
          'Bolsas': {
            'casa-mineira': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
            'atelie-tear': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
            'minas-contemporanea': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
            'editorial': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
          },
        };

        const defaultIaImages: { [key: string]: string } = {
          'casa-mineira': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80',
          'atelie-tear': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=80',
          'minas-contemporanea': 'https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=600&q=80',
          'editorial': 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
        };

        const selectedCategoryMap = iaImagesMap[activeCategory] || defaultIaImages;
        const resultImg = selectedCategoryMap[selectedScenario] || defaultIaImages['editorial'];

        setGeneratedPhoto(resultImg);
        setIaLoading(false);
        setShowComparison(true);
      }
    }, 850);
  };

  const handleApplyIaPhoto = () => {
    if (!generatedPhoto) return;
    setFormData((prev) => ({
      ...prev,
      fotos: [...prev.fotos, generatedPhoto],
    }));
    setIsIaModalOpen(false);
    showSuccess('Cenário gerado com IA aplicado ao produto!');
  };

  // Load products and categories
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/produtos?admin=true').then((res) => res.json()),
      fetch('/api/categorias?admin=true').then((res) => res.json()),
    ])
      .then(([prodData, catData]) => {
        if (Array.isArray(prodData)) setProducts(prodData);
        if (Array.isArray(catData)) {
          setCategories(catData);
          // Set default category on form if empty
          if (catData.length > 0 && !formData.categoriaId) {
            setFormData((prev) => ({ ...prev, categoriaId: catData[0].id }));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Erro ao carregar dados do catálogo.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle trigger if "?action=new" is present
  useEffect(() => {
    if (actionParam === 'new' && !isFormOpen) {
      handleOpenNewForm();
    }
  }, [actionParam]);

  const handleOpenNewForm = () => {
    setFormData({
      ...initialFormData,
      categoriaId: categories.length > 0 ? categories[0].id : '',
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (p: Product) => {
    setFormData({
      nome: p.nome,
      categoriaId: p.categoriaId,
      descricao: (p as any).descricao || '',
      preco: p.preco ? p.preco.toString() : '',
      custo: p.custo ? p.custo.toString() : '',
      fotos: JSON.parse(p.fotos || '[]'),
      materiais: p.materiais || '',
      tecnica: p.tecnica || '',
      dimensoes: p.dimensoes || '',
      peso: p.peso ? p.peso.toString() : '',
      disponibilidade: p.disponibilidade,
      status: p.status,
      codigo: p.codigo || '',
      tags: p.tags || '',
      variacoes: (p as any).variacoes ? JSON.parse((p as any).variacoes) : [],
      custoMateriais: (p as any).custoMateriais ? JSON.parse((p as any).custoMateriais) : [],
    });
    setEditingId(p.id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
    // Clear URL search params
    router.push('/admin/produtos');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Local helper states for materials and variations inputs
  const [newMatName, setNewMatName] = useState('');
  const [newMatValue, setNewMatValue] = useState('');

  const [newVarName, setNewVarName] = useState('');
  const [newVarPreco, setNewVarPreco] = useState('');
  const [newVarCusto, setNewVarCusto] = useState('');

  const handleAddMaterial = () => {
    if (!newMatName || !newMatValue) return;
    const parsedVal = parseFloat(newMatValue);
    if (isNaN(parsedVal)) return;

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      nome: newMatName,
      valor: parsedVal,
    };

    const updatedMaterials = [...(formData.custoMateriais || []), newItem];
    const sumCusto = updatedMaterials.reduce((acc, cur) => acc + cur.valor, 0);

    setFormData((prev) => ({
      ...prev,
      custoMateriais: updatedMaterials,
      custo: sumCusto.toFixed(2), // auto-fill CMV
    }));

    setNewMatName('');
    setNewMatValue('');
  };

  const handleRemoveMaterial = (id: string) => {
    const updatedMaterials = (formData.custoMateriais || []).filter((m) => m.id !== id);
    const sumCusto = updatedMaterials.reduce((acc, cur) => acc + cur.valor, 0);

    setFormData((prev) => ({
      ...prev,
      custoMateriais: updatedMaterials,
      custo: sumCusto.toFixed(2), // auto-fill CMV
    }));
  };

  const handleAddVariation = () => {
    if (!newVarName || !newVarPreco) return;
    const parsedPreco = parseFloat(newVarPreco);
    const parsedCusto = newVarCusto ? parseFloat(newVarCusto) : 0;
    if (isNaN(parsedPreco) || isNaN(parsedCusto)) return;

    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      nome: newVarName,
      preco: parsedPreco,
      custo: parsedCusto,
    };

    setFormData((prev) => ({
      ...prev,
      variacoes: [...(prev.variacoes || []), newItem],
    }));

    setNewVarName('');
    setNewVarPreco('');
    setNewVarCusto('');
  };

  const handleRemoveVariation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      variacoes: (prev.variacoes || []).filter((v) => v.id !== id),
    }));
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadForm = new FormData();
    uploadForm.append('file', file);

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadForm,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload.');

      setFormData((prev) => ({
        ...prev,
        fotos: [...prev.fotos, data.url],
      }));
      showSuccess('Foto adicionada com sucesso.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar imagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((url) => url !== photoUrl),
    }));
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Create or Update submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const url = editingId ? `/api/produtos/${editingId}` : '/api/produtos';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar produto.');

      showSuccess(editingId ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
      setIsFormOpen(false);
      loadData();
      router.push('/admin/produtos');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar produto.');
    } finally {
      setSubmitting(false);
    }
  };

  // Duplicate handler
  const handleDuplicate = async (id: string) => {
    if (!confirm('Deseja duplicar este produto? Será gerada uma cópia em modo Rascunho.')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao duplicar.');

      showSuccess(`Cópia criada: "${data.nome}"`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao duplicar produto.');
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza de que deseja excluir definitivamente este produto? Esta ação não pode ser desfeita.')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir.');

      showSuccess('Produto excluído com sucesso.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir produto.');
      setLoading(false);
    }
  };

  // Filter products by search text
  const filteredProducts = products.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.nome.toLowerCase().includes(search.toLowerCase()) ||
      (p.codigo && p.codigo.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2D2F]">Meus Produtos</h1>
          <p className="font-sans text-xs text-[#2B2D2F]/50 mt-1">
            Cadastre novas peças, gerencie status de rascunhos, duplique ou edite preços.
          </p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenNewForm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2.5 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus size={14} />
            Cadastrar Produto
          </button>
        )}
      </div>

      {/* Status Alerts */}
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

      {/* Conditionally render List View or Form View */}
      {isFormOpen ? (
        /* ==================== FORM VIEW ==================== */
        <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-[#8D7F73]/20 pb-4">
            <h2 className="font-serif text-xl font-bold text-[#2B2D2F]">
              {editingId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h2>
            <button
              onClick={handleCloseForm}
              className="text-[#2B2D2F]/60 hover:text-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Identification row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Nome da Peça <span className="text-[#C15C3D]">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="Ex: Manta Jacquard Areia"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Categoria <span className="text-[#C15C3D]">*</span>
                </label>
                <select
                  name="categoriaId"
                  required
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs text-[#2B2D2F]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Descrição Detalhada
              </label>
              <textarea
                name="descricao"
                rows={4}
                value={formData.descricao}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs leading-relaxed"
                placeholder="Insira detalhes sobre a trama, caimento, dicas de lavagem, inspiração do desenho..."
              />
            </div>

            {/* Pricing and CVM Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 bg-[#FDFBF7] p-5 rounded-xl border border-[#8D7F73]/15">
              <div className="space-y-1 col-span-2">
                <h4 className="font-serif text-sm font-bold text-[#2B2D2F] mb-1">Precificação & Custo (CVM)</h4>
                <p className="text-[10px] text-[#2B2D2F]/60">Configure o valor final e o custo de fabricação para alimentar seus gráficos financeiros.</p>
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Preço de Venda (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="preco"
                  value={formData.preco}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs font-bold"
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#C15C3D] font-bold">
                  CVM (Custo de Venda)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="custo"
                  value={formData.custo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#C15C3D]/30 border focus:border-[#C15C3D] rounded focus:outline-none font-sans text-xs font-bold"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Composição de Custos de Materiais (CMV) */}
            <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#8D7F73]/15 space-y-4">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#2B2D2F]">Composição do CMV (Materiais Gasto)</h4>
                <p className="text-[10px] text-[#2B2D2F]/60">A soma dos valores dos materiais atualizará automaticamente o campo CVM acima.</p>
              </div>

              {/* Materiais cadastrados list */}
              {formData.custoMateriais && formData.custoMateriais.length > 0 ? (
                <div className="overflow-x-auto border border-[#8D7F73]/20 rounded bg-white">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] border-b border-[#8D7F73]/20">
                      <tr>
                        <th className="py-2 px-3">Material / Item</th>
                        <th className="py-2 px-3 text-right">Valor Gasto</th>
                        <th className="py-2 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8D7F73]/15">
                      {formData.custoMateriais.map((mat) => (
                        <tr key={mat.id} className="hover:bg-[#F3EFE9]/10">
                          <td className="py-2 px-3 font-semibold text-[#2B2D2F]">{mat.nome}</td>
                          <td className="py-2 px-3 text-right text-[#606C38] font-bold">
                            R$ {mat.valor.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(mat.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                              aria-label="Remover material"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[10px] text-fiosa-grafite/50 italic py-2">Nenhum material adicionado à composição de custo.</p>
              )}

              {/* Adicionar novo material form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-2 border-t border-[#8D7F73]/10">
                <div className="space-y-1">
                  <label className="block font-sans text-[9px] font-bold uppercase text-[#2B2D2F]/70">Nome do Material</label>
                  <input
                    type="text"
                    value={newMatName}
                    onChange={(e) => setNewMatName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#8D7F73]/30 rounded text-xs"
                    placeholder="Ex: Algodão Cru"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-sans text-[9px] font-bold uppercase text-[#2B2D2F]/70">Valor Gasto (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMatValue}
                    onChange={(e) => setNewMatValue(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#8D7F73]/30 rounded text-xs font-bold"
                    placeholder="0,00"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="bg-[#606C38] hover:bg-[#606C38]/95 text-white py-1.5 px-3 rounded font-sans font-bold uppercase text-[10px] tracking-wider transition-colors shadow-sm"
                >
                  Adicionar Material
                </button>
              </div>
            </div>

            {/* Variações de Produto */}
            <div className="bg-[#FDFBF7] p-5 rounded-xl border border-[#8D7F73]/15 space-y-4">
              <div>
                <h4 className="font-serif text-sm font-bold text-[#2B2D2F]">Variações de Produto (Tamanho / Cor)</h4>
                <p className="text-[10px] text-[#2B2D2F]/60">Cadastre opções de tamanho ou cor que alterem o preço final ou o custo de fabricação.</p>
              </div>

              {/* Variações list */}
              {formData.variacoes && formData.variacoes.length > 0 ? (
                <div className="overflow-x-auto border border-[#8D7F73]/20 rounded bg-white">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] border-b border-[#8D7F73]/20">
                      <tr>
                        <th className="py-2 px-3">Variação (Tamanho / Cor)</th>
                        <th className="py-2 px-3 text-right">Preço de Venda</th>
                        <th className="py-2 px-3 text-right">Custo (CVM)</th>
                        <th className="py-2 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8D7F73]/15">
                      {formData.variacoes.map((v) => (
                        <tr key={v.id} className="hover:bg-[#F3EFE9]/10">
                          <td className="py-2 px-3 font-semibold text-[#2B2D2F]">{v.nome}</td>
                          <td className="py-2 px-3 text-right text-fiosa-terracota font-bold">
                            R$ {v.preco.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-2 px-3 text-right text-[#2B2D2F]/60">
                            R$ {v.custo.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariation(v.id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-1"
                              aria-label="Remover variação"
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[10px] text-fiosa-grafite/50 italic py-2">Nenhuma variação cadastrada para este produto.</p>
              )}

              {/* Adicionar variação form */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2 border-t border-[#8D7F73]/10">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block font-sans text-[9px] font-bold uppercase text-[#2B2D2F]/70">Nome da Variação (Ex: P / Cru, M / Terracota)</label>
                  <input
                    type="text"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#8D7F73]/30 rounded text-xs"
                    placeholder="Tamanho e/ou Cor"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-sans text-[9px] font-bold uppercase text-[#2B2D2F]/70">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVarPreco}
                    onChange={(e) => setNewVarPreco(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#8D7F73]/30 rounded text-xs font-bold"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-sans text-[9px] font-bold uppercase text-[#2B2D2F]/70">Custo da Opção (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newVarCusto}
                    onChange={(e) => setNewVarCusto(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-[#8D7F73]/30 rounded text-xs"
                    placeholder="0,00"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddVariation}
                  className="bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white py-1.5 px-3 rounded font-sans font-bold uppercase text-[10px] tracking-wider transition-colors shadow-sm sm:col-span-4"
                >
                  Adicionar Variação
                </button>
              </div>
            </div>

            {/* Technical specifications */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Dimensões (Ex: 1,50m x 2,00m)
                </label>
                <input
                  type="text"
                  name="dimensoes"
                  value={formData.dimensoes}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="1.50m x 2.20m"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Técnica Utilizada
                </label>
                <input
                  type="text"
                  name="tecnica"
                  value={formData.tecnica}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="Ex: Tear Manual de Pedal"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Materiais / Fios
                </label>
                <input
                  type="text"
                  name="materiais"
                  value={formData.materiais}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="Ex: 100% Algodão Cru"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Código SKU / Produto
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="Ex: MT-ARE-01"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="peso"
                  value={formData.peso}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="1.2"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Disponibilidade
                </label>
                <select
                  name="disponibilidade"
                  value={formData.disponibilidade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs text-[#2B2D2F]"
                >
                  <option value="DISPONIVEL">Disponível imediato</option>
                  <option value="SOB_ENCOMENDA">Sob Encomenda</option>
                  <option value="ESGOTADO">Esgotado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Tags (Separadas por vírgula)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                  placeholder="manta, decoracao, areia"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Status de Publicação
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs text-[#2B2D2F]"
                >
                  <option value="PUBLICADO">Publicado (Visível no site)</option>
                  <option value="RASCUNHO">Rascunho (Apenas você visualiza)</option>
                  <option value="OCULTO">Oculto (Fica guardado)</option>
                </select>
              </div>
            </div>

            {/* Photos upload area */}
            <div className="space-y-3 bg-[#FDFBF7] border border-[#8D7F73]/15 p-6 rounded-xl">
              <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Fotos do Produto
              </span>
              
              {/* Thumbnails of already added photos */}
              <div className="flex flex-wrap gap-4 items-center">
                {formData.fotos.map((url, idx) => (
                  <div
                    key={url}
                    className="relative h-20 w-20 rounded-lg overflow-hidden border border-[#8D7F73]/30 bg-slate-100 group"
                  >
                    <img src={url} alt="Produto" className="object-cover h-full w-full" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(url)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
                      title="Remover foto"
                    >
                      <X size={10} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-[#606C38]/90 text-[8px] text-white text-center font-sans uppercase font-bold py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                ))}

                {/* Upload Button */}
                <label className="cursor-pointer flex flex-col justify-center items-center h-20 w-20 rounded-lg border-2 border-dashed border-[#8D7F73]/35 hover:border-[#C15C3D] transition-colors">
                  <Upload size={18} className="text-[#8D7F73]" />
                  <span className="text-[8px] font-sans font-bold text-[#8D7F73] mt-1">ADD FOTO</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                {/* AI Studio trigger */}
                {formData.fotos.length > 0 && (
                  <button
                    type="button"
                    onClick={handleOpenIaModal}
                    className="flex flex-col justify-center items-center h-20 w-20 rounded-lg border-2 border-[#C15C3D]/40 border-dashed hover:border-[#C15C3D] hover:bg-[#C15C3D]/5 transition-colors cursor-pointer"
                  >
                    <Sparkles size={16} className="text-[#C15C3D] animate-pulse" />
                    <span className="text-[8px] font-sans font-bold text-[#C15C3D] mt-1">CENÁRIO IA</span>
                  </button>
                )}
              </div>
              <p className="text-[9px] text-[#2B2D2F]/50">Dica: A primeira foto da lista será a imagem principal da vitrine. Você pode enviar várias fotos.</p>
            </div>

            {/* Form actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#8D7F73]/20">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-6 py-2.5 border border-[#8D7F73]/40 text-[#2B2D2F] rounded font-sans text-xs font-bold uppercase tracking-wider hover:bg-white/40 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-6 py-2.5 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-75"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    SALVANDO...
                  </>
                ) : (
                  'Salvar Produto'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ==================== LIST VIEW ==================== */
        <>
          {/* Controls: Search and Filter */}
          <div className="bg-[#F3EFE9] border border-[#8D7F73]/15 p-4 rounded-xl flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 text-[#2B2D2F]/40" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome, categoria ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/20 rounded font-sans text-xs"
              />
            </div>
            <span className="font-sans text-[10px] font-bold text-[#2B2D2F]/50 uppercase tracking-wider">
              {filteredProducts.length} itens no total
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="text-[#C15C3D] animate-spin" size={32} />
            </div>
          ) : (
            /* Products List Table */
            <div className="bg-[#FDFBF7] border border-[#8D7F73]/25 rounded-xl overflow-hidden shadow-sm">
              {filteredProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                      <tr>
                        <th className="py-4 px-6">Peça</th>
                        <th className="py-4 px-3">Categoria</th>
                        <th className="py-4 px-3">Cód / SKU</th>
                        <th className="py-4 px-3 text-right">Preço Venda</th>
                        <th className="py-4 px-3 text-right">Custo (CVM)</th>
                        <th className="py-4 px-3">Status</th>
                        <th className="py-4 px-3 text-center">Visualizações</th>
                        <th className="py-4 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8D7F73]/15 text-[#2B2D2F]/80">
                      {filteredProducts.map((p) => {
                        const fotosArray = JSON.parse(p.fotos || '[]');
                        const mainFoto = fotosArray[0] || 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=100&q=80';
                        return (
                          <tr key={p.id} className="hover:bg-[#F3EFE9]/30 transition-colors">
                            {/* Photo and Name */}
                            <td className="py-3.5 px-6 flex items-center gap-3">
                              <div className="relative h-10 w-10 rounded overflow-hidden border border-[#8D7F73]/30 shrink-0 bg-slate-100">
                                <img src={mainFoto} alt={p.nome} className="object-cover h-full w-full" />
                              </div>
                              <span className="font-serif text-sm font-bold text-[#2B2D2F] line-clamp-1">
                                {p.nome}
                              </span>
                            </td>
                            
                            {/* Category */}
                            <td className="py-3.5 px-3">
                              <span className="bg-[#606C38]/10 text-[#606C38] px-2 py-0.5 rounded font-bold text-[10px]">
                                {p.categoria.nome}
                              </span>
                            </td>

                            {/* SKU */}
                            <td className="py-3.5 px-3 font-semibold text-[#2B2D2F]/65">
                              {p.codigo || '-'}
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-3 text-right font-extrabold text-[#C15C3D]">
                              {p.preco ? `R$ ${p.preco.toFixed(2).replace('.', ',')}` : 'Sob consulta'}
                            </td>

                            {/* Cost */}
                            <td className="py-3.5 px-3 text-right font-bold text-[#2B2D2F]/60">
                              {p.custo ? `R$ ${p.custo.toFixed(2).replace('.', ',')}` : '0,00'}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-3">
                              {p.status === 'PUBLICADO' && (
                                <span className="inline-flex items-center gap-1 text-[#606C38] font-bold">
                                  <Eye size={12} />
                                  Publicado
                                </span>
                              )}
                              {p.status === 'RASCUNHO' && (
                                <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                  <EyeOff size={12} />
                                  Rascunho
                                </span>
                              )}
                              {p.status === 'OCULTO' && (
                                <span className="inline-flex items-center gap-1 text-[#2B2D2F]/40 font-bold">
                                  <EyeOff size={12} />
                                  Oculto
                                </span>
                              )}
                            </td>

                            {/* Views */}
                            <td className="py-3.5 px-3 text-center font-bold text-[#2B2D2F]/60">
                              {p.visualizacoes}
                            </td>

                            {/* Actions buttons */}
                            <td className="py-3.5 px-6 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditForm(p)}
                                  className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-[#C15C3D] hover:text-[#C15C3D] rounded transition-all"
                                  title="Editar produto"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDuplicate(p.id)}
                                  className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-[#606C38] hover:text-[#606C38] rounded transition-all"
                                  title="Duplicar produto"
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete(p.id)}
                                  className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-red-600 hover:text-red-600 rounded transition-all"
                                  title="Excluir produto"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 p-6 space-y-3">
                  <div className="inline-flex items-center justify-center bg-[#F3EFE9] h-12 w-12 rounded-full text-[#8D7F73] mb-1">
                    <FolderOpen size={20} />
                  </div>
                  <p className="font-serif text-base text-[#2B2D2F] font-bold">Nenhum produto cadastrado</p>
                  <p className="font-sans text-xs text-[#2B2D2F]/50 max-w-sm mx-auto leading-relaxed">
                    Você ainda não possui produtos no seu catálogo. Clique em "Cadastrar Produto" para adicionar suas peças.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ==================== ESTÚDIO IA MODAL ==================== */}
      {isIaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#FDFBF7] border border-[#8D7F73]/25 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-[#2B2D2F] text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#C15C3D]" size={20} />
                <h3 className="font-serif text-lg font-bold">Estúdio de Cenários IA — FIOSA</h3>
              </div>
              <button onClick={() => setIsIaModalOpen(false)} className="text-white hover:text-red-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Photo picker & Scenario picker */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Pick Image */}
                <div className="space-y-3">
                  <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/60">
                    Passo 1: Escolha a Foto do Produto
                  </span>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {formData.fotos.map((url) => (
                      <button
                        key={url}
                        type="button"
                        onClick={() => setSelectedIaPhoto(url)}
                        className={`relative h-14 w-14 rounded-lg overflow-hidden border-2 shrink-0 bg-slate-100 cursor-pointer ${
                          selectedIaPhoto === url ? 'border-[#C15C3D] scale-95 shadow-sm' : 'border-transparent opacity-75'
                        }`}
                      >
                        <img src={url} alt="Thumbnail" className="object-cover h-full w-full" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Pick Scenario */}
                <div className="space-y-3">
                  <span className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/60">
                    Passo 2: Escolha o Cenário de IA
                  </span>
                  <div className="space-y-2.5 font-sans text-xs">
                    
                    {/* Scenario 01 */}
                    <label className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScenario === 'casa-mineira' ? 'border-[#C15C3D] bg-[#C15C3D]/5' : 'border-[#8D7F73]/20 hover:border-[#8D7F73]/50'
                    }`}>
                      <input
                        type="radio"
                        name="scenario"
                        checked={selectedScenario === 'casa-mineira'}
                        onChange={() => setSelectedScenario('casa-mineira')}
                        className="hidden"
                      />
                      <strong className="block text-[#2B2D2F] font-bold">Cenário 01 — Casa Mineira Contemporânea</strong>
                      <span className="block text-[10px] text-[#2B2D2F]/65 mt-0.5 leading-relaxed">
                        Madeira natural, parede de cal/argila clara, luz natural suave, cerâmica artesanal e fibras.
                      </span>
                    </label>

                    {/* Scenario 02 */}
                    <label className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScenario === 'atelie-tear' ? 'border-[#C15C3D] bg-[#C15C3D]/5' : 'border-[#8D7F73]/20 hover:border-[#8D7F73]/50'
                    }`}>
                      <input
                        type="radio"
                        name="scenario"
                        checked={selectedScenario === 'atelie-tear'}
                        onChange={() => setSelectedScenario('atelie-tear')}
                        className="hidden"
                      />
                      <strong className="block text-[#2B2D2F] font-bold">Cenário 02 — Ateliê do Tear</strong>
                      <span className="block text-[10px] text-[#2B2D2F]/65 mt-0.5 leading-relaxed">
                        Ambiente de ateliê artesanal sofisticado, madeira envelhecida, tear ao fundo e ferramentas tradicionais.
                      </span>
                    </label>

                    {/* Scenario 03 */}
                    <label className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScenario === 'minas-contemporanea' ? 'border-[#C15C3D] bg-[#C15C3D]/5' : 'border-[#8D7F73]/20 hover:border-[#8D7F73]/50'
                    }`}>
                      <input
                        type="radio"
                        name="scenario"
                        checked={selectedScenario === 'minas-contemporanea'}
                        onChange={() => setSelectedScenario('minas-contemporanea')}
                        className="hidden"
                      />
                      <strong className="block text-[#2B2D2F] font-bold">Cenário 03 — Minas Contemporânea</strong>
                      <span className="block text-[10px] text-[#2B2D2F]/65 mt-0.5 leading-relaxed">
                        Arquitetura mineira reinterpretada, paredes em tons de areia/terracota, pedra, madeira e plantas.
                      </span>
                    </label>

                    {/* Scenario 04 */}
                    <label className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedScenario === 'editorial' ? 'border-[#C15C3D] bg-[#C15C3D]/5' : 'border-[#8D7F73]/20 hover:border-[#8D7F73]/50'
                    }`}>
                      <input
                        type="radio"
                        name="scenario"
                        checked={selectedScenario === 'editorial'}
                        onChange={() => setSelectedScenario('editorial')}
                        className="hidden"
                      />
                      <strong className="block text-[#2B2D2F] font-bold">Cenário 04 — Editorial FIOSA</strong>
                      <span className="block text-[10px] text-[#2B2D2F]/65 mt-0.5 leading-relaxed">
                        Fundo neutro de linho/algodão cru, composição minimalista, iluminação editorial sofisticada.
                      </span>
                    </label>

                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateIaImage}
                  disabled={iaLoading || !selectedIaPhoto}
                  className="w-full bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white py-3 rounded font-sans font-bold text-xs tracking-wider uppercase transition-colors shadow-sm disabled:opacity-75 cursor-pointer"
                >
                  {iaLoading ? 'Processando Imagem...' : 'Aplicar Cenário IA'}
                </button>
              </div>

              {/* Right Column: Comparison / Output Render */}
              <div className="lg:col-span-7 bg-[#F3EFE9] rounded-2xl border border-[#8D7F73]/15 p-6 flex flex-col justify-center items-center relative min-h-[350px]">
                
                {/* 1. Idle state */}
                {!iaLoading && !generatedPhoto && (
                  <div className="text-center space-y-3 p-6 max-w-sm">
                    <Sparkles size={36} className="text-[#C15C3D] mx-auto animate-pulse" />
                    <h4 className="font-serif text-base font-bold text-[#2B2D2F]">Estúdio Fotográfico IA</h4>
                    <p className="font-sans text-xs text-[#2B2D2F]/65 leading-relaxed">
                      Selecione uma foto e o cenário desejado à esquerda. A inteligência artificial irá extrair o produto e recriar o fundo preservando as texturas tridimensionais do tear.
                    </p>
                  </div>
                )}

                {/* 2. Loading state with animated progress steps */}
                {iaLoading && (
                  <div className="text-center space-y-4 w-full">
                    <Loader2 size={32} className="text-[#C15C3D] animate-spin mx-auto" />
                    <h4 className="font-serif text-sm font-bold text-[#2B2D2F]">Processando Imagem com IA</h4>
                    <div className="space-y-1.5 font-sans text-left max-w-xs mx-auto">
                      {[
                        'Analisando estrutura tridimensional da peça...',
                        'Isolando texturas e tramas de fio...',
                        'Mesclando iluminação natural do cenário...',
                        'Compondo sombras tridimensionais e acabamentos...',
                        'Finalizando renderização em alta definição...'
                      ].map((stepText, idx) => (
                        <div
                          key={idx}
                          className={`text-[10px] flex items-center gap-2 ${
                            iaStep > idx
                              ? 'text-[#606C38] font-bold'
                              : iaStep === idx
                              ? 'text-[#C15C3D] font-bold animate-pulse'
                              : 'text-[#2B2D2F]/40'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                          <span>{stepText}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Output state: Comparison preview */}
                {showComparison && generatedPhoto && (
                  <div className="w-full space-y-4 flex flex-col items-center">
                    <h4 className="font-serif text-sm font-bold text-[#2B2D2F]">Visualização Prévia do Resultado</h4>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {/* Before */}
                      <div className="space-y-1 text-center">
                        <span className="font-sans text-[8px] font-bold uppercase tracking-wider text-[#2B2D2F]/50">Antes</span>
                        <div className="relative h-52 w-full rounded-xl overflow-hidden border border-[#8D7F73]/20 bg-white shadow-sm">
                          <img src={selectedIaPhoto} alt="Original" className="object-cover h-full w-full" />
                        </div>
                      </div>

                      {/* After */}
                      <div className="space-y-1 text-center">
                        <span className="font-sans text-[8px] font-bold uppercase tracking-wider text-[#606C38]">Resultado IA</span>
                        <div className="relative h-52 w-full rounded-xl overflow-hidden border-2 border-[#606C38] bg-white shadow-md">
                          <img src={generatedPhoto} alt="IA Output" className="object-cover h-full w-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 w-full max-w-sm justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setGeneratedPhoto(null);
                          setShowComparison(false);
                        }}
                        className="px-5 py-2 border border-[#8D7F73]/40 text-[#2B2D2F] rounded text-xs font-sans font-bold uppercase hover:bg-white transition-colors cursor-pointer"
                      >
                        Refazer
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyIaPhoto}
                        className="bg-[#606C38] hover:bg-[#606C38]/95 text-white px-5 py-2 rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                      >
                        Aplicar no Produto
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
