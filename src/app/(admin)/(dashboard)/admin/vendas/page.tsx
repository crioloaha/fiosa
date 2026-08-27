'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle2,
  X,
  History
} from 'lucide-react';

interface Product {
  id: string;
  nome: string;
  preco: number | null;
}

interface Sale {
  id: string;
  quantidade: number;
  valorVenda: number;
  custoTotal: number;
  contribuicaoFiosa: number;
  dataVenda: string;
  produto: {
    nome: string;
    codigo: string | null;
  };
}

interface NewSaleForm {
  produtoId: string;
  quantidade: string;
  valorVenda: string;
  dataVenda: string;
}

const initialForm: NewSaleForm = {
  produtoId: '',
  quantidade: '1',
  valorVenda: '',
  dataVenda: new Date().toISOString().split('T')[0],
};

export default function VendasPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form overlay controller
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<NewSaleForm>(initialForm);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/vendas').then((res) => res.json()),
      fetch('/api/produtos?admin=true').then((res) => res.json()),
    ])
      .then(([salesData, productsData]) => {
        if (Array.isArray(salesData)) setSales(salesData);
        if (Array.isArray(productsData)) {
          setProducts(productsData);
          if (productsData.length > 0 && !form.produtoId) {
            setForm((prev) => ({
              ...prev,
              produtoId: productsData[0].id,
              valorVenda: productsData[0].preco ? productsData[0].preco.toString() : '',
            }));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Erro ao carregar dados de vendas.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenForm = () => {
    setForm({
      ...initialForm,
      produtoId: products.length > 0 ? products[0].id : '',
      valorVenda: products.length > 0 && products[0].preco ? products[0].preco.toString() : '',
    });
    setIsFormOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Auto-fill price when product changes
    if (name === 'produtoId') {
      const selectedProd = products.find((p) => p.id === value);
      setForm((prev) => ({
        ...prev,
        produtoId: value,
        valorVenda: selectedProd?.preco ? selectedProd.preco.toString() : '',
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produtoId || !form.quantidade || !form.valorVenda) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Calculate total price based on quantity * unit price
    const totalSaleValue = parseFloat(form.valorVenda) * parseInt(form.quantidade);

    try {
      const res = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: form.produtoId,
          quantidade: form.quantidade,
          valorVenda: totalSaleValue,
          dataVenda: form.dataVenda,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar venda.');

      showSuccess('Venda registrada com sucesso.');
      setIsFormOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar venda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro de venda? Esta ação recalculará seus lucros.')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/vendas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir venda.');

      showSuccess('Registro de venda excluído.');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao excluir venda.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#2B2D2F]">Controle de Vendas</h1>
          <p className="font-sans text-xs text-[#2B2D2F]/50 mt-1">
            Registre suas vendas manuais para calcular seus ganhos líquidos e ver sua contribuição para a FIOSA.
          </p>
        </div>
        {!isFormOpen && products.length > 0 && (
          <button
            onClick={handleOpenForm}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-4 py-2.5 rounded font-sans text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            <Plus size={14} />
            Registrar Venda
          </button>
        )}
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

      {/* Conditionally render Sales List or Register Form */}
      {isFormOpen ? (
        /* ==================== FORM OVERLAY ==================== */
        <div className="bg-[#F3EFE9] border border-[#8D7F73]/20 rounded-xl p-6 md:p-8 space-y-6 max-w-xl">
          <div className="flex justify-between items-center border-b border-[#8D7F73]/20 pb-4">
            <h2 className="font-serif text-xl font-bold text-[#2B2D2F] flex items-center gap-2">
              <TrendingUp size={20} className="text-[#C15C3D]" />
              Registrar Nova Venda
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-[#2B2D2F]/60 hover:text-red-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Product */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Selecione o Produto Vendido <span className="text-[#C15C3D]">*</span>
              </label>
              <select
                name="produtoId"
                required
                value={form.produtoId}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs text-[#2B2D2F]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Quantidade <span className="text-[#C15C3D]">*</span>
                </label>
                <input
                  type="number"
                  name="quantidade"
                  min="1"
                  required
                  value={form.quantidade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
                />
              </div>

              {/* Unit Price */}
              <div className="space-y-1">
                <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                  Preço Unitário Praticado (R$) <span className="text-[#C15C3D]">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="valorVenda"
                  required
                  value={form.valorVenda}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs font-bold"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Date of Sale */}
            <div className="space-y-1">
              <label className="block font-sans text-[10px] font-bold uppercase tracking-wider text-[#2B2D2F]/70">
                Data da Venda <span className="text-[#C15C3D]">*</span>
              </label>
              <input
                type="date"
                name="dataVenda"
                required
                value={form.dataVenda}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded focus:outline-none focus:border-[#C15C3D] font-sans text-xs"
              />
            </div>

            {/* Total projection info */}
            {form.valorVenda && form.quantidade && (
              <div className="bg-[#FDFBF7] p-4 rounded border border-[#8D7F73]/20 space-y-1 font-sans text-xs">
                <span className="block text-[10px] font-bold text-[#2B2D2F]/55 uppercase tracking-wider">
                  Projeção do Lançamento
                </span>
                <div className="flex justify-between">
                  <span>Faturamento Bruto:</span>
                  <strong className="text-[#2B2D2F]">
                    R$ {(parseFloat(form.valorVenda) * parseInt(form.quantidade)).toFixed(2).replace('.', ',')}
                  </strong>
                </div>
                <div className="text-[10px] text-[#2B2D2F]/50 italic">
                  A contribuição FIOSA e custo líquido (CVM) serão deduzidos automaticamente baseados nas taxas da categoria do produto selecionado.
                </div>
              </div>
            )}

            {/* Form buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-[#8D7F73]/20">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
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
                    REGISTRANDO...
                  </>
                ) : (
                  'Registrar Venda'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ==================== LIST VIEW ==================== */
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="text-[#C15C3D] animate-spin" size={32} />
            </div>
          ) : (
            <div className="bg-[#FDFBF7] border border-[#8D7F73]/25 rounded-xl overflow-hidden shadow-sm">
              {sales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead className="bg-[#F3EFE9] text-[#2B2D2F]/60 font-bold uppercase text-[9px] tracking-wider border-b border-[#8D7F73]/20">
                      <tr>
                        <th className="py-4 px-6">Data</th>
                        <th className="py-4 px-3">Peça Vendida</th>
                        <th className="py-4 px-3 text-center">Quantidade</th>
                        <th className="py-4 px-3 text-right">Valor Total Venda</th>
                        <th className="py-4 px-3 text-right">CVM Total</th>
                        <th className="py-4 px-3 text-right text-[#C15C3D]">Contribuição FIOSA</th>
                        <th className="py-4 px-3 text-right text-[#606C38]">Ganho Líquido</th>
                        <th className="py-4 px-6 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#8D7F73]/15 text-[#2B2D2F]/80">
                      {sales.map((sale) => {
                        const dateFormatted = new Date(sale.dataVenda).toLocaleDateString('pt-BR');
                        const netRevenue = sale.valorVenda - sale.custoTotal - sale.contribuicaoFiosa;
                        return (
                          <tr key={sale.id} className="hover:bg-[#F3EFE9]/30 transition-colors">
                            {/* Date */}
                            <td className="py-4 px-6 font-semibold flex items-center gap-1.5 text-[#2B2D2F]/70">
                              <Calendar size={14} className="text-[#8D7F73]" />
                              {dateFormatted}
                            </td>

                            {/* Product */}
                            <td className="py-4 px-3 font-serif text-sm font-bold text-[#2B2D2F]">
                              {sale.produto.nome}
                              {sale.produto.codigo && (
                                <span className="block font-sans text-[10px] text-[#2B2D2F]/50 font-normal">
                                  SKU: {sale.produto.codigo}
                                </span>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="py-4 px-3 text-center font-bold text-[#2B2D2F]/70">
                              {sale.quantidade}
                            </td>

                            {/* Total sale price */}
                            <td className="py-4 px-3 text-right font-extrabold text-[#2B2D2F]">
                              R$ {sale.valorVenda.toFixed(2).replace('.', ',')}
                            </td>

                            {/* CVM total cost */}
                            <td className="py-4 px-3 text-right font-bold text-[#2B2D2F]/65">
                              R$ {sale.custoTotal.toFixed(2).replace('.', ',')}
                            </td>

                            {/* FIOSA Contribution */}
                            <td className="py-4 px-3 text-right font-extrabold text-[#C15C3D]">
                              -R$ {sale.contribuicaoFiosa.toFixed(2).replace('.', ',')}
                            </td>

                            {/* Net Revenue */}
                            <td className="py-4 px-3 text-right font-extrabold text-[#606C38]">
                              R$ {netRevenue.toFixed(2).replace('.', ',')}
                            </td>

                            {/* Action */}
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => handleDelete(sale.id)}
                                className="p-1.5 bg-[#F3EFE9] text-[#2B2D2F] border border-[#8D7F73]/30 hover:border-red-600 hover:text-red-600 rounded transition-all"
                                title="Excluir lançamento de venda"
                              >
                                <Trash2 size={12} />
                              </button>
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
                    <History size={20} />
                  </div>
                  <p className="font-serif text-base text-[#2B2D2F] font-bold">Nenhuma venda registrada</p>
                  <p className="font-sans text-xs text-[#2B2D2F]/50 max-w-sm mx-auto leading-relaxed">
                    Você ainda não registrou nenhuma venda manual. Registre suas vendas para alimentar o painel financeiro e precificar melhor suas peças.
                  </p>
                  {products.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-bold font-sans">
                      * Nota: É necessário cadastrar pelo menos um produto antes de registrar uma venda.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
