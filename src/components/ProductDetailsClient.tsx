'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

interface Variation {
  id: string;
  nome: string; // e.g. "P / Azul", "M / Natural"
  preco: number;
  custo: number;
}

interface ProductDetailsClientProps {
  produtoNome: string;
  artesaoNome: string;
  artesaoWhatsapp: string | null;
  artesaoAceitarWhats: boolean;
  artesaoMostrarPreco: boolean;
  basePreco: number | null;
  variacoesJson: string | null;
}

export default function ProductDetailsClient({
  produtoNome,
  artesaoNome,
  artesaoWhatsapp,
  artesaoAceitarWhats,
  artesaoMostrarPreco,
  basePreco,
  variacoesJson,
}: ProductDetailsClientProps) {
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVarId, setSelectedVarId] = useState<string>('');

  useEffect(() => {
    if (variacoesJson) {
      try {
        const parsed = JSON.parse(variacoesJson);
        if (Array.isArray(parsed)) {
          setVariations(parsed);
        }
      } catch (e) {
        console.error('Erro ao ler variações:', e);
      }
    }
  }, [variacoesJson]);

  const selectedVar = variations.find((v) => v.id === selectedVarId);

  // Price determination
  const currentPrice = selectedVar ? selectedVar.preco : basePreco;

  // WhatsApp link composition
  const cleanPhone = artesaoWhatsapp ? artesaoWhatsapp.replace(/\D/g, '') : '';
  const whatsAppPhone = cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
  
  const varSuffix = selectedVar ? ` (Variação: ${selectedVar.nome})` : '';
  const whatsAppMessage = encodeURIComponent(
    `Olá! Vi o produto ${produtoNome}${varSuffix} no catálogo da FIOSA e gostaria de saber mais informações sobre valores, frete ou sob encomenda.`
  );
  const whatsAppUrl = `https://wa.me/${whatsAppPhone}?text=${whatsAppMessage}`;

  return (
    <div className="space-y-6">
      
      {/* 1. Variations Selector (if they exist) */}
      {variations.length > 0 && (
        <div className="space-y-2 bg-[#F3EFE9] border border-[#8D7F73]/20 p-4 rounded-xl font-sans text-xs">
          <label className="block font-bold text-[#2B2D2F]/70 uppercase tracking-wide">
            Selecione uma Variação (Tamanho / Cor):
          </label>
          <select
            value={selectedVarId}
            onChange={(e) => setSelectedVarId(e.target.value)}
            className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#8D7F73]/30 rounded font-sans text-xs text-[#2B2D2F]"
          >
            <option value="">Preço Padrão (Sem variação)</option>
            {variations.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome} {artesaoMostrarPreco ? `- R$ ${v.preco.toFixed(2).replace('.', ',')}` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Pricing block */}
      <div className="py-4 border-t border-b border-fiosa-marrom/20">
        {artesaoMostrarPreco && currentPrice ? (
          <div className="space-y-1">
            <span className="font-sans text-xs font-bold text-fiosa-grafite/40 uppercase tracking-wide">Valor aproximado</span>
            <p className="font-sans text-3xl font-extrabold text-fiosa-terracota">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="font-sans text-xs font-bold text-fiosa-grafite/40 uppercase tracking-wide">Valor</span>
            <p className="font-sans text-lg font-bold italic text-fiosa-grafite/50">Preço sob consulta</p>
          </div>
        )}
      </div>

      {/* 3. Primary CTA Button */}
      {artesaoAceitarWhats && artesaoWhatsapp && (
        <div className="pt-2">
          <Link
            href={whatsAppUrl}
            target="_blank"
            className="flex items-center justify-center gap-2 w-full bg-fiosa-terracota hover:bg-fiosa-terracota/95 text-white py-4 rounded font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-md"
          >
            <MessageSquare size={16} />
            Quero saber mais
          </Link>
          <p className="text-[10px] font-sans text-center text-fiosa-grafite/50 mt-2 font-semibold">
            Você será direcionado diretamente ao WhatsApp do artesão responsável.
          </p>
        </div>
      )}
      
    </div>
  );
}
