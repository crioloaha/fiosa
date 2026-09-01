'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Printer, Loader2, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';

interface Product {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number | null;
  dimensoes: string | null;
  artesao?: {
    nome: string;
    marca: string | null;
  };
}

interface Config {
  logoTexto: string;
  logoImagem: string | null;
  telefone: string | null;
  site: string | null;
  instagram: string | null;
}

export default function EtiquetasPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, confRes] = await Promise.all([
          fetch('/api/produtos?admin=true'),
          fetch('/api/configuracao')
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
        if (confRes.ok) {
          const confData = await confRes.json();
          setConfig(confData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handlePrint = () => {
    if (selectedProducts.size === 0) return;
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#C15C3D]" size={32} />
      </div>
    );
  }

  const selectedList = products.filter(p => selectedProducts.has(p.id));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (isPrinting) {
    return (
      <div className="print-container text-black bg-white" style={{ fontFamily: 'serif' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            @page {
              margin: 0;
              size: A4;
            }
            body {
              margin: 0;
              background-color: white !important;
            }
            .print-container {
              padding: 10mm;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10mm;
            }
            .tag {
              border: 1px dashed #ccc;
              border-radius: 4px;
              display: flex;
              height: 60mm;
              page-break-inside: avoid;
            }
            .tag-half {
              width: 50%;
              padding: 6mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              box-sizing: border-box;
            }
            .tag-back {
              border-right: 1px dashed #ccc;
            }
            .organic-text {
              font-family: Georgia, serif;
            }
            .product-name {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            .artisan-name {
              font-size: 10pt;
              font-style: italic;
              margin-bottom: 2mm;
            }
            .product-desc {
              font-size: 9pt;
              margin-bottom: 2mm;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .product-price {
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            .product-dim {
              font-size: 8pt;
              margin-bottom: 4mm;
            }
            .brand-name {
              font-size: 18pt;
              font-weight: bold;
              letter-spacing: 2px;
              margin-bottom: 4mm;
            }
            .contact-info {
              font-size: 9pt;
              line-height: 1.4;
            }
          }
          @media screen {
            .print-container {
              display: none;
            }
          }
        `}} />
        
        {selectedList.map(product => {
          const productUrl = `${baseUrl}/produto/${product.slug || product.id}`;
          return (
            <div key={product.id} className="tag">
              {/* BACK OF TAG */}
              <div className="tag-half tag-back">
                <div className="organic-text product-name">{product.nome}</div>
                {product.artesao && (
                  <div className="organic-text artisan-name">
                    Por {product.artesao.marca || product.artesao.nome}
                  </div>
                )}
                {product.descricao && (
                  <div className="organic-text product-desc">{product.descricao}</div>
                )}
                {product.preco != null && (
                  <div className="organic-text product-price">
                    R$ {product.preco.toFixed(2).replace('.', ',')}
                  </div>
                )}
                {product.dimensoes && (
                  <div className="organic-text product-dim">Medidas: {product.dimensoes}</div>
                )}
                <div style={{ marginTop: 'auto' }}>
                  <QRCode value={productUrl} size={50} />
                </div>
              </div>
              
              {/* FRONT OF TAG */}
              <div className="tag-half tag-front">
                {config?.logoImagem ? (
                  <img src={config.logoImagem} alt="Logo" style={{ maxWidth: '40mm', maxHeight: '20mm', objectFit: 'contain', marginBottom: '4mm' }} />
                ) : (
                  <div className="organic-text brand-name">{config?.logoTexto || 'FIOSA'}</div>
                )}
                <div className="organic-text contact-info">
                  {config?.telefone && <div>{config.telefone}</div>}
                  {config?.instagram && <div>{config.instagram}</div>}
                  {config?.site && <div>{config.site}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2B2D2F] flex items-center gap-2">
            <Tag size={24} className="text-[#C15C3D]" />
            Etiquetas
          </h1>
          <p className="text-sm text-[#8D7F73]">
            Selecione os produtos para imprimir as etiquetas (formato tag orgânica).
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2B2D2F] bg-white border border-[#8D7F73]/30 rounded-md hover:bg-[#F3EFE9] transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedProducts.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#C15C3D] text-white text-sm font-bold uppercase rounded-md hover:bg-[#C15C3D]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={16} />
            Imprimir ({selectedProducts.size})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#8D7F73]/20 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#2B2D2F]">
            <thead className="bg-[#F3EFE9]/50 border-b border-[#8D7F73]/20">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedProducts.size === products.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#8D7F73]/40 text-[#C15C3D] focus:ring-[#C15C3D]"
                  />
                </th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Produto</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Preço</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Artesão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8D7F73]/10">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-[#F3EFE9]/30 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-[#8D7F73]/40 text-[#C15C3D] focus:ring-[#C15C3D]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#2B2D2F]">{product.nome}</div>
                  </td>
                  <td className="px-6 py-4">
                    {product.preco != null ? `R$ ${product.preco.toFixed(2).replace('.', ',')}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {product.artesao?.marca || product.artesao?.nome || '-'}
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#8D7F73]">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
