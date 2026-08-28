'use client';

import { useState, useEffect, useMemo } from 'react';
import type { jsPDF } from 'jspdf';
import {
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Square,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  nome: string;
  slug: string;
  categoriaId: string;
  categoria: { nome: string };
  preco: number | null;
  fotos: string;
  descricao: string | null;
  materiais: string | null;
  tecnica: string | null;
  dimensoes: string | null;
  status: string;
  artesaoId: string;
  artesao: { id: string; nome: string; slug: string };
}

interface Artesao {
  id: string;
  nome: string;
  marca: string | null;
  slug: string;
  foto: string | null;
  capa: string | null;
  whatsapp: string | null;
  instagram: string | null;
  emailContato: string | null;
}

interface UserSession {
  authenticated: boolean;
  user: {
    nome: string;
    tipo: string;
    artesao: Artesao | null;
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Design Tokens (matching FIOSA brand palette)
// ──────────────────────────────────────────────────────────────────────────────

const COLORS = {
  terracota: [193, 92, 61] as [number, number, number],
  terracotaLight: [220, 140, 110] as [number, number, number],
  olive: [96, 108, 56] as [number, number, number],
  dark: [43, 45, 47] as [number, number, number],
  mid: [141, 127, 115] as [number, number, number],
  light: [238, 231, 222] as [number, number, number], // Neutral light background for descriptive card
  cream: [253, 251, 247] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

const FIOSA_URL = 'https://fiosa.com.br';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 18;

// ──────────────────────────────────────────────────────────────────────────────
// PDF Helper Utilities
// ──────────────────────────────────────────────────────────────────────────────

function setFill(doc: jsPDF, rgb: [number, number, number]) {
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
}

function setStroke(doc: jsPDF, rgb: [number, number, number]) {
  doc.setDrawColor(rgb[0], rgb[1], rgb[2]);
}

function setColor(doc: jsPDF, rgb: [number, number, number]) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

/** Draw the terracota vertical accent stripe on the left side of a page */
function drawSideStripe(doc: jsPDF) {
  setFill(doc, COLORS.terracota);
  doc.rect(0, 0, 9, PAGE_H, 'F');
  setFill(doc, COLORS.terracotaLight);
  doc.rect(8, 0, 1, PAGE_H, 'F');
}

/** Draw subtle page header bar */
function drawPageHeader(doc: jsPDF, artesaoNome: string, pageLabel: string) {
  setFill(doc, COLORS.light);
  doc.rect(10, 0, PAGE_W - 10, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setColor(doc, COLORS.mid);
  doc.text(artesaoNome.toUpperCase(), 16, 9);
  doc.setFont('helvetica', 'normal');
  doc.text(pageLabel, PAGE_W - MARGIN, 9, { align: 'right' });
}

/** Draw footer with page number and clickable FIOSA link */
function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number) {
  setStroke(doc, COLORS.mid);
  doc.setLineWidth(0.2);
  doc.line(10, PAGE_H - 12, PAGE_W, PAGE_H - 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(doc, COLORS.mid);
  const footerText = 'FIOSA — Loja Colaborativa de Artesãos de Resende Costa / MG';
  doc.text(footerText, 16, PAGE_H - 7);
  doc.text(`${pageNum} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 7, { align: 'right' });
  doc.link(16, PAGE_H - 11, 120, 6, { url: FIOSA_URL });
}

/** Decorative double-line ornament with diamond center */
function drawOrnament(doc: jsPDF, x: number, y: number, width: number) {
  const mid = x + width / 2;
  setStroke(doc, COLORS.mid);
  doc.setLineWidth(0.25);
  doc.line(x, y, mid - 5, y);
  doc.line(mid + 5, y, x + width, y);
  doc.line(x, y + 3, mid - 5, y + 3);
  doc.line(mid + 5, y + 3, x + width, y + 3);
  setFill(doc, COLORS.terracota);
  setStroke(doc, COLORS.terracota);
  doc.setLineWidth(0.8);
  doc.line(mid - 2, y + 1.5, mid, y - 0.5);
  doc.line(mid, y - 0.5, mid + 2, y + 1.5);
  doc.line(mid + 2, y + 1.5, mid, y + 3.5);
  doc.line(mid, y + 3.5, mid - 2, y + 1.5);
}

/** Convert image URL to base64 data URL */
async function imageToBase64(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) {
    return url;
  }

  const absoluteUrl = url.startsWith('/') 
    ? typeof window !== 'undefined' 
      ? window.location.origin + url 
      : url 
    : url;

  try {
    const res = await fetch(absoluteUrl, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch (e) {
    console.warn('Fetch method failed in imageToBase64, trying canvas fallback:', e);
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
          return;
        }
      } catch (err) {
        console.error('Canvas conversion failed in imageToBase64:', err);
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = absoluteUrl;
  });
}

/**
 * Add an image to the PDF preserving its aspect ratio (object-contain).
 * The image is centered inside the given bounding box without distortion.
 */
async function addImageContain(
  doc: jsPDF,
  imgB64: string,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      const scale = Math.min(boxW / naturalW, boxH / naturalH);
      const fw = naturalW * scale;
      const fh = naturalH * scale;
      const cx = boxX + (boxW - fw) / 2;
      const cy = boxY + (boxH - fh) / 2;
      setFill(doc, COLORS.mid);
      doc.rect(cx + 1, cy + 1, fw, fh, 'F');
      doc.addImage(imgB64, 'JPEG', cx, cy, fw, fh);
      resolve();
    };
    img.onerror = () => {
      doc.addImage(imgB64, 'JPEG', boxX, boxY, boxW, boxH);
      resolve();
    };
    img.src = imgB64;
  });
}

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

export default function CatalogoPdfPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allArtesaos, setAllArtesaos] = useState<Artesao[]>([]);

  // Admin: which artisans are checked
  const [selectedArtesaoIds, setSelectedArtesaoIds] = useState<string[]>([]);
  // Expand/collapse artisan product groups
  const [artesaoExpanded, setArtesaoExpanded] = useState<Record<string, boolean>>({});

  // Which product IDs are checked for PDF
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAdmin = session?.user?.tipo === 'ADMIN';

  const [options, setOptions] = useState({
    showPhotos: true,
    showName: true,
    showDescription: true,
    showValue: true,
    showCategory: true,
    showMaterials: true,
    showDimensions: true,
    showTechnique: true,
    showContacts: true,
  });

  // ────────────────────────────────────────────────────────────────────────────
  // Load data
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(async (sessionData) => {
        if (!sessionData.authenticated) throw new Error('Não autenticado.');
        setSession(sessionData);

        if (sessionData.user?.tipo === 'ADMIN') {
          const [artesaosRes, prodRes] = await Promise.all([
            fetch('/api/artesao?admin=true'),
            fetch('/api/produtos?admin=true'),
          ]);
          const artesaosData: Artesao[] = await artesaosRes.json();
          const prodData: Product[] = await prodRes.json();

          if (Array.isArray(artesaosData)) {
            setAllArtesaos(artesaosData);
            setSelectedArtesaoIds(artesaosData.map((a) => a.id));
          }
          if (Array.isArray(prodData)) {
            const published = prodData.filter((p) => p.status === 'PUBLICADO');
            setAllProducts(published);
            setSelectedProductIds(published.map((p) => p.id));
          }
        } else {
          const prodRes = await fetch('/api/produtos?admin=true');
          const prodData: Product[] = await prodRes.json();
          if (Array.isArray(prodData)) {
            const published = prodData.filter((p) => p.status === 'PUBLICADO');
            setAllProducts(published);
            setSelectedProductIds(published.map((p) => p.id));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg('Erro ao carregar dados do catálogo.');
        setLoading(false);
      });
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // Derived state
  // ────────────────────────────────────────────────────────────────────────────

  const visibleProducts = useMemo(() => {
    if (!isAdmin) return allProducts;
    if (selectedArtesaoIds.length === 0) return [];
    return allProducts.filter((p) => selectedArtesaoIds.includes(p.artesaoId));
  }, [allProducts, selectedArtesaoIds, isAdmin]);

  const productsForPDF = useMemo(
    () => visibleProducts.filter((p) => selectedProductIds.includes(p.id)),
    [visibleProducts, selectedProductIds]
  );

  const selectedArtesaos = useMemo(
    () => allArtesaos.filter((a) => selectedArtesaoIds.includes(a.id)),
    [allArtesaos, selectedArtesaoIds]
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Toggle helpers
  // ────────────────────────────────────────────────────────────────────────────

  const toggleArtesao = (id: string) => {
    setSelectedArtesaoIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!next.includes(id)) {
        const artesaoProductIds = allProducts
          .filter((p) => p.artesaoId === id)
          .map((p) => p.id);
        setSelectedProductIds((prevP) => prevP.filter((x) => !artesaoProductIds.includes(x)));
      } else {
        const artesaoProductIds = allProducts
          .filter((p) => p.artesaoId === id && p.status === 'PUBLICADO')
          .map((p) => p.id);
        setSelectedProductIds((prevP) => [...new Set([...prevP, ...artesaoProductIds])]);
      }
      return next;
    });
  };

  const toggleAllArtesaos = () => {
    if (selectedArtesaoIds.length === allArtesaos.length) {
      setSelectedArtesaoIds([]);
      setSelectedProductIds([]);
    } else {
      setSelectedArtesaoIds(allArtesaos.map((a) => a.id));
      setSelectedProductIds(allProducts.map((p) => p.id));
    }
  };

  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAllProducts = () =>
    setSelectedProductIds(
      selectedProductIds.length === visibleProducts.length
        ? []
        : visibleProducts.map((p) => p.id)
    );

  const toggleOption = (name: keyof typeof options) =>
    setOptions((prev) => ({ ...prev, [name]: !prev[name] }));

  const toggleArtesaoExpanded = (id: string) =>
    setArtesaoExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // ────────────────────────────────────────────────────────────────────────────
  // Resolve artisan for PDF cover
  // ────────────────────────────────────────────────────────────────────────────

  function resolveArtesaoForPDF(): Artesao | null {
    if (!isAdmin) return session?.user.artesao ?? null;
    if (selectedArtesaos.length === 1) return selectedArtesaos[0];
    return {
      id: 'fiosa',
      nome: 'FIOSA',
      marca: 'Loja Colaborativa de Artesãos',
      slug: 'fiosa',
      foto: null,
      capa: null,
      whatsapp: null,
      instagram: null,
      emailContato: null,
    };
  }

  // ────────────────────────────────────────────────────────────────────────────
  // PDF Generation
  // ────────────────────────────────────────────────────────────────────────────

  const generatePDF = async () => {
    if (productsForPDF.length === 0) {
      alert('Selecione pelo menos um produto para o catálogo.');
      return;
    }

    const artesao = resolveArtesaoForPDF();
    if (!artesao) return;

    setGenerating(true);
    setErrorMsg('');
    setSuccessMsg('Compilando imagens e gerando PDF...');

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

      // ── PAGE 1 — COVER ────────────────────────────────────────────────────
      setFill(doc, COLORS.cream);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

      setFill(doc, COLORS.terracota);
      doc.rect(0, 0, PAGE_W, 18, 'F');

      setFill(doc, COLORS.dark);
      doc.rect(0, PAGE_H - 18, PAGE_W, 18, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      setColor(doc, COLORS.white);
      doc.text('CATÁLOGO DIGITAL DE PEÇAS ARTESANAIS', PAGE_W / 2, 10.5, { align: 'center' });

      doc.setFont('times', 'bold');
      doc.setFontSize(54);
      setColor(doc, COLORS.dark);
      doc.text('FIOSA', PAGE_W / 2, 72, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setColor(doc, COLORS.mid);
      doc.text('LOJA COLABORATIVA DE ARTESÃOS DE RESENDE COSTA', PAGE_W / 2, 80, { align: 'center' });

      drawOrnament(doc, 45, 86, 120);

      doc.setFont('times', 'italic');
      doc.setFontSize(26);
      setColor(doc, COLORS.dark);
      doc.text(artesao.nome, PAGE_W / 2, 118, { align: 'center' });

      if (artesao.marca) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        setColor(doc, COLORS.terracota);
        doc.text(artesao.marca.toUpperCase(), PAGE_W / 2, 126, { align: 'center' });
      }

      // Multiple artisan names on cover
      if (isAdmin && selectedArtesaos.length > 1) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setColor(doc, COLORS.mid);
        const artesaoNames = selectedArtesaos.map((a) => a.nome).join('  ·  ');
        const nameLines = doc.splitTextToSize(artesaoNames, PAGE_W - 60);
        doc.text(nameLines.slice(0, 3), PAGE_W / 2, 132, { align: 'center' });
      }

      // Profile photo (single artisan only)
      if (options.showPhotos && artesao.foto && selectedArtesaos.length <= 1) {
        const avatarB64 = await imageToBase64(artesao.foto);
        if (avatarB64) {
          setFill(doc, COLORS.light);
          doc.circle(PAGE_W / 2, 165, 27, 'F');
          setStroke(doc, COLORS.terracota);
          doc.setLineWidth(0.8);
          doc.circle(PAGE_W / 2, 165, 27, 'S');
          doc.addImage(avatarB64, 'JPEG', PAGE_W / 2 - 24, 141, 48, 48);
        } else {
          setFill(doc, COLORS.light);
          doc.circle(PAGE_W / 2, 165, 27, 'F');
          setStroke(doc, COLORS.mid);
          doc.setLineWidth(0.4);
          doc.circle(PAGE_W / 2, 165, 27, 'S');
          doc.setFont('times', 'bold');
          doc.setFontSize(30);
          setColor(doc, COLORS.mid);
          doc.text(artesao.nome.charAt(0).toUpperCase(), PAGE_W / 2, 170, { align: 'center' });
        }
      }

      drawOrnament(doc, 45, 245, 120);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      setColor(doc, COLORS.mid);
      doc.text('Catálogo de Peças Têxteis e Artesanato', PAGE_W / 2, 254, { align: 'center' });

      const today = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      doc.setFontSize(7.5);
      doc.text(`Emitido em ${today}`, PAGE_W / 2, 261, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      setColor(doc, COLORS.light);
      doc.text('FIOSA — Capital do Tear Manual — Resende Costa / MG', PAGE_W / 2, PAGE_H - 7, { align: 'center' });
      doc.link(30, PAGE_H - 12, 150, 7, { url: FIOSA_URL });

      // ── PRODUCT FLOW RENDER (DYNAMIC PAGINATION WITH 90x90 IMAGES) ────────

      const Y_START = 18;
      const Y_MAX = 278;
      let yCursor = Y_START;

      // Keep track of page indices for headers and footers post-processing
      const contentPageIndices: number[] = [];

      // Add the first content page
      doc.addPage();
      const firstPageNum = doc.getNumberOfPages();
      contentPageIndices.push(firstPageNum);
      doc.setPage(firstPageNum);
      
      // Paint background & side stripe once for the first content page
      setFill(doc, COLORS.cream);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
      drawSideStripe(doc);

      for (let i = 0; i < productsForPDF.length; i++) {
        const p = productsForPDF[i];

        // 1. Image dimensions: original size 90x90mm
        const imgSize = options.showPhotos ? 90 : 0;
        const mainX = imgSize > 0 ? 16 + imgSize + 10 : 16; // 16 + 90 + 10 = 116
        const mainW = PAGE_W - mainX - MARGIN; // 210 - 116 - 18 = 76mm

        // Calculate text height in the right-side info column
        let rightColHeight = 0;
        if (options.showCategory) rightColHeight += 10;
        if (options.showName) {
          const nameLines = doc.splitTextToSize(p.nome, mainW);
          rightColHeight += nameLines.slice(0, 2).length * 6.5 + 2;
        }
        if (isAdmin && selectedArtesaos.length > 1) rightColHeight += 6;
        if (options.showValue) rightColHeight += 8;

        type Spec = { label: string; val: string };
        const specs: Spec[] = [];
        if (options.showTechnique && p.tecnica) specs.push({ label: 'Técnica', val: p.tecnica });
        if (options.showMaterials && p.materiais) specs.push({ label: 'Materiais', val: p.materiais });
        if (options.showDimensions && p.dimensoes) specs.push({ label: 'Dimensões', val: p.dimensoes });

        if (specs.length > 0) {
          // Compact specs block (6.5mm per item)
          rightColHeight += specs.length * 6.5 + 6;
        }

        // Height of the primary block (Image side-by-side with Info)
        const mainBlockH = Math.max(imgSize, rightColHeight + 5);

        // 2. Calculate description block ("SOBRE ESTA PEÇA") with dynamic height
        let descBlockH = 0;
        let descLines: string[] = [];
        const descBoxW = PAGE_W - 16 - MARGIN; // 176mm
        const descTextW = descBoxW - 10; // 166mm (paddings)

        if (options.showDescription && p.descricao) {
          descLines = doc.splitTextToSize(p.descricao, descTextW);
          // 4mm header, 4.2mm per text line, 6mm dynamic box margins
          descBlockH = 5 + descLines.length * 4.2 + 6;
        }

        const buttonBlockH = 9; // 7mm button + 2mm top margin
        const dividerH = 8; // Margin between products on the same page

        // Total vertical height required by this product
        const totalProductH = mainBlockH + (descBlockH > 0 ? descBlockH + 4 : 0) + buttonBlockH + dividerH;

        // If it doesn't fit on the page, create a new page
        if (yCursor + totalProductH > Y_MAX && yCursor > Y_START) {
          doc.addPage();
          const newPageNum = doc.getNumberOfPages();
          contentPageIndices.push(newPageNum);
          doc.setPage(newPageNum);

          // Paint background & side stripe once for the new content page
          setFill(doc, COLORS.cream);
          doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
          drawSideStripe(doc);

          yCursor = Y_START;
        }

        // Target content page
        doc.setPage(contentPageIndices[contentPageIndices.length - 1]);

        // Page side stripe
        drawSideStripe(doc);

        const currentY = yCursor;

        // ── Render Product Image (90x90mm) ──
        if (options.showPhotos && imgSize > 0) {
          const imgX = 16;
          const imgY = currentY;

          let imgB64: string | null = null;
          try {
            const fotosArray: string[] = JSON.parse(p.fotos || '[]');
            if (fotosArray[0]) {
              imgB64 = await imageToBase64(fotosArray[0]);
            }
          } catch {
            imgB64 = null;
          }

          if (imgB64) {
            setFill(doc, COLORS.light);
            doc.rect(imgX, imgY, imgSize, imgSize, 'F');
            await addImageContain(doc, imgB64, imgX, imgY, imgSize, imgSize);
            setStroke(doc, COLORS.mid);
            doc.setLineWidth(0.25);
            doc.rect(imgX, imgY, imgSize, imgSize, 'S');
            doc.link(imgX, imgY, imgSize, imgSize, { url: `${FIOSA_URL}/produto/${p.slug}` });
          } else {
            setFill(doc, COLORS.light);
            doc.rect(imgX, imgY, imgSize, imgSize, 'F');
            setStroke(doc, COLORS.mid);
            doc.setLineWidth(0.25);
            doc.rect(imgX, imgY, imgSize, imgSize, 'S');
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            setColor(doc, COLORS.mid);
            doc.text('[sem foto]', imgX + imgSize / 2, imgY + imgSize / 2, { align: 'center' });
            doc.link(imgX, imgY, imgSize, imgSize, { url: `${FIOSA_URL}/produto/${p.slug}` });
          }
        }

        // ── Render Right-side Information Column ──
        let ty = currentY + 4;

        if (options.showCategory) {
          setFill(doc, COLORS.olive);
          doc.roundedRect(mainX, ty - 4, Math.min(mainW, 55), 6.5, 1.5, 1.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6);
          setColor(doc, COLORS.white);
          doc.text(p.categoria.nome.toUpperCase(), mainX + 3.5, ty + 0.5);
          ty += 8;
        }

        if (options.showName) {
          doc.setFont('times', 'bold');
          doc.setFontSize(15);
          setColor(doc, COLORS.dark);
          const nameLines = doc.splitTextToSize(p.nome, mainW);
          doc.text(nameLines.slice(0, 2), mainX, ty);
          const nameH = nameLines.slice(0, 2).length * 6.5;
          doc.link(mainX, ty - 5, mainW, nameH, { url: `${FIOSA_URL}/produto/${p.slug}` });
          ty += nameLines.slice(0, 2).length * 6 + 2;
        }

        if (isAdmin && selectedArtesaos.length > 1) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          setColor(doc, COLORS.terracota);
          doc.text(`por ${p.artesao.nome}`, mainX, ty);
          ty += 6;
        }

        if (options.showValue) {
          const priceStr = p.preco
            ? `R$ ${p.preco.toFixed(2).replace('.', ',')}`
            : 'Sob consulta';
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          setColor(doc, COLORS.terracota);
          doc.text(priceStr, mainX, ty);
          ty += 7;
        }

        if (specs.length > 0) {
          setFill(doc, COLORS.light);
          const specsBlockH = specs.length * 6 + 4;
          doc.roundedRect(mainX, ty - 2, mainW, specsBlockH, 1.5, 1.5, 'F');
          ty += 2;
          specs.forEach((spec) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            setColor(doc, COLORS.mid);
            doc.text(`${spec.label}:`, mainX + 2, ty);
            doc.setFont('helvetica', 'normal');
            setColor(doc, COLORS.dark);
            const valLines = doc.splitTextToSize(spec.val, mainW - 24);
            doc.text(valLines[0], mainX + 24, ty);
            ty += 6;
          });
        }

        yCursor = currentY + mainBlockH;

        // ── Render Dynamic Description Box below Image ──
        if (descBlockH > 0 && descLines.length > 0) {
          yCursor += 3;
          let detailY = yCursor;

          // Title
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          setColor(doc, COLORS.mid);
          doc.text('SOBRE ESTA PEÇA', 16, detailY + 4);

          // Dynamic Box (Height matches the description text lines perfectly)
          setFill(doc, COLORS.light);
          doc.roundedRect(16, detailY + 6, descBoxW, descLines.length * 4.2 + 5, 2, 2, 'F');

          // Text content
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          setColor(doc, COLORS.dark);
          doc.text(descLines, 21, detailY + 11, { lineHeightFactor: 1.4 });

          yCursor += descBlockH;
        }

        // ── Render Button "Ver no catálogo virtual" ──
        yCursor += 2;
        const btnX = 16;
        const btnY = yCursor;
        const btnW = 60; // 60mm wide button
        const btnH = 7;  // 7mm high button

        // Draw rounded filled rect for button
        setFill(doc, COLORS.terracota);
        doc.roundedRect(btnX, btnY, btnW, btnH, 1.5, 1.5, 'F');

        // Draw button text centered
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        setColor(doc, COLORS.white);
        const btnText = 'Ver no Catálogo Virtual ↗';
        const textWidth = doc.getTextWidth(btnText);
        const textX = btnX + (btnW - textWidth) / 2;
        doc.text(btnText, textX, btnY + 4.6);

        // Add link over the entire button area
        doc.link(btnX, btnY, btnW, btnH, { url: `${FIOSA_URL}/produto/${p.slug}` });

        yCursor += btnH;

        // Apply bottom spacing
        yCursor += dividerH;

        // Draw dotted/subtle separation line if the next item fits on the same page
        if (i < productsForPDF.length - 1) {
          const nextProduct = productsForPDF[i + 1];
          let nextSpecsCount = 0;
          if (options.showTechnique && nextProduct.tecnica) nextSpecsCount++;
          if (options.showMaterials && nextProduct.materiais) nextSpecsCount++;
          if (options.showDimensions && nextProduct.dimensoes) nextSpecsCount++;

          const nextMainH = Math.max(imgSize, (options.showCategory ? 10 : 0) + 16 + (nextSpecsCount * 6 + 6));
          let nextDescH = 0;
          if (options.showDescription && nextProduct.descricao) {
            const nextLines = doc.splitTextToSize(nextProduct.descricao, descTextW);
            nextDescH = 5 + nextLines.length * 4.2 + 6;
          }
          const nextTotalH = nextMainH + (nextDescH > 0 ? nextDescH + 4 : 0) + 9 + dividerH;

          // Dotted divisor line
          if (yCursor + nextTotalH <= Y_MAX) {
            setStroke(doc, COLORS.mid);
            doc.setLineWidth(0.15);
            doc.line(16, yCursor - 4, PAGE_W - MARGIN, yCursor - 4);
          }
        }
      }

      // ── LAST PAGE — CONTACT ───────────────────────────────────────────────
      doc.addPage();
      const contactPageIndex = doc.getNumberOfPages();
      doc.setPage(contactPageIndex);

      setFill(doc, COLORS.cream);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

      drawSideStripe(doc);

      setFill(doc, COLORS.terracota);
      doc.rect(9, 0, PAGE_W - 9, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      setColor(doc, COLORS.white);
      doc.text('CONTATO & ENCOMENDAS', PAGE_W / 2 + 4.5, 11, { align: 'center' });

      doc.setFont('times', 'bold');
      doc.setFontSize(24);
      setColor(doc, COLORS.dark);
      doc.text('Entre em Contato', PAGE_W / 2, 45, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setColor(doc, COLORS.mid);
      doc.text('Tire dúvidas, confira disponibilidade ou solicite peças personalizadas.', PAGE_W / 2, 53, { align: 'center' });

      drawOrnament(doc, 45, 58, 120);

      const contactArtesaos = isAdmin ? selectedArtesaos : (artesao ? [artesao] : []);

      if (contactArtesaos.length === 1) {
        const a = contactArtesaos[0];
        const cardX = 30;
        const cardY = 70;
        const cardW = PAGE_W - 60;
        const cardH = 130;

        setFill(doc, COLORS.white);
        doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'F');
        setStroke(doc, COLORS.light);
        doc.setLineWidth(0.5);
        doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'S');

        setFill(doc, COLORS.terracota);
        doc.roundedRect(cardX, cardY, cardW, 12, 4, 4, 'F');
        doc.rect(cardX, cardY + 6, cardW, 6, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        setColor(doc, COLORS.white);
        doc.text('INFORMAÇÕES DO ARTESÃO', cardX + cardW / 2, cardY + 8, { align: 'center' });

        let cy = cardY + 24;
        doc.setFont('times', 'bold');
        doc.setFontSize(18);
        setColor(doc, COLORS.dark);
        doc.text(a.nome, cardX + cardW / 2, cy, { align: 'center' });
        cy += 7;

        if (a.marca) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          setColor(doc, COLORS.terracota);
          doc.text(a.marca.toUpperCase(), cardX + cardW / 2, cy, { align: 'center' });
          cy += 10;
        }

        setStroke(doc, COLORS.light);
        doc.setLineWidth(0.4);
        doc.line(cardX + 15, cy, cardX + cardW - 15, cy);
        cy += 8;

        if (options.showContacts) {
          const items: { label: string; value: string }[] = [];
          if (a.whatsapp) items.push({ label: 'WhatsApp', value: a.whatsapp });
          if (a.instagram) items.push({ label: 'Instagram', value: `@${a.instagram.replace(/^@/, '')}` });
          if (a.emailContato) items.push({ label: 'E-mail', value: a.emailContato });
          items.forEach((item) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setColor(doc, COLORS.mid);
            doc.text(`${item.label}:`, cardX + 18, cy);
            doc.setFont('helvetica', 'normal');
            setColor(doc, COLORS.dark);
            doc.text(item.value, cardX + 48, cy);
            cy += 9;
          });
        }

        cy += 4;
        setStroke(doc, COLORS.light);
        doc.setLineWidth(0.3);
        doc.line(cardX + 15, cy, cardX + cardW - 15, cy);
        cy += 8;

        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        setColor(doc, COLORS.dark);
        doc.text('FIOSA', cardX + cardW / 2, cy, { align: 'center' });
        cy += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        setColor(doc, COLORS.mid);
        doc.text('LOJA COLABORATIVA DE ARTESÃOS', cardX + cardW / 2, cy, { align: 'center' });
        cy += 7;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        setColor(doc, COLORS.terracota);
        doc.text(FIOSA_URL, cardX + cardW / 2, cy, { align: 'center' });
        const urlTextW = doc.getTextWidth(FIOSA_URL);
        doc.link(cardX + cardW / 2 - urlTextW / 2, cy - 4, urlTextW, 6, { url: FIOSA_URL });
      } else {
        // Multiple artisans: compact cards grid with dynamic pagination
        let contactY = 70;
        const colW = (PAGE_W - 20 - MARGIN * 2) / 2;
        let currentPageNum = contactPageIndex;
        let currentPageRow = 0;
        let itemsOnLastPage = 0;

        contactArtesaos.forEach((a, idx) => {
          const col = idx % 2;
          const cardTop = contactY + currentPageRow * 52;

          // Check if it fits on the current page. Limit is PAGE_H - 35
          if (cardTop + 46 > PAGE_H - 30) {
            // It doesn't fit on the current page. Add a new page!
            doc.addPage();
            currentPageNum = doc.getNumberOfPages();
            contentPageIndices.push(currentPageNum);
            doc.setPage(currentPageNum);

            // Paint background & side stripe once for the new content page
            setFill(doc, COLORS.cream);
            doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
            drawSideStripe(doc);

            // Redraw top banner on new page
            setFill(doc, COLORS.terracota);
            doc.rect(9, 0, PAGE_W - 9, 18, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            setColor(doc, COLORS.white);
            doc.text('CONTATO & ENCOMENDAS (CONT.)', PAGE_W / 2 + 4.5, 11, { align: 'center' });

            currentPageRow = 0;
            contactY = 30; // Start higher up since cover elements are not here
            itemsOnLastPage = 0; // reset counter for this page
          }

          itemsOnLastPage++;
          const cx = MARGIN + col * (colW + 8);
          const currentCardTop = contactY + currentPageRow * 52;

          setFill(doc, COLORS.white);
          doc.roundedRect(cx, currentCardTop, colW, 46, 3, 3, 'F');
          setStroke(doc, COLORS.light);
          doc.setLineWidth(0.4);
          doc.roundedRect(cx, currentCardTop, colW, 46, 3, 3, 'S');

          setFill(doc, COLORS.terracota);
          doc.roundedRect(cx, currentCardTop, colW, 9, 3, 3, 'F');
          doc.rect(cx, currentCardTop + 5, colW, 4, 'F');

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          setColor(doc, COLORS.white);
          doc.text(a.nome.toUpperCase(), cx + colW / 2, currentCardTop + 6, { align: 'center' });

          let iy = currentCardTop + 16;
          if (a.marca) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            setColor(doc, COLORS.terracota);
            doc.text(a.marca, cx + colW / 2, iy, { align: 'center' });
            iy += 7;
          }
          if (options.showContacts) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            setColor(doc, COLORS.dark);
            if (a.whatsapp) { doc.text(`✆ ${a.whatsapp}`, cx + 6, iy); iy += 6; }
            if (a.instagram) { doc.text(`⊙ @${a.instagram.replace(/^@/, '')}`, cx + 6, iy); iy += 6; }
            if (a.emailContato) { doc.text(`✉ ${a.emailContato}`, cx + 6, iy); }
          }

          if (col === 1) {
            currentPageRow++;
          }
        });

        // Ensure we are set to the last contact page for footer and slogan rendering
        const lastPage = doc.getNumberOfPages();
        doc.setPage(lastPage);

        const rowsOnLastPage = Math.ceil(itemsOnLastPage / 2);
        const fiosaFooterY = contactY + rowsOnLastPage * 52 + 10;
        if (fiosaFooterY < PAGE_H - 40) {
          setStroke(doc, COLORS.mid);
          doc.setLineWidth(0.2);
          doc.line(MARGIN, fiosaFooterY, PAGE_W - MARGIN, fiosaFooterY);
          doc.setFont('times', 'bold');
          doc.setFontSize(14);
          setColor(doc, COLORS.dark);
          doc.text('FIOSA', PAGE_W / 2, fiosaFooterY + 10, { align: 'center' });
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          setColor(doc, COLORS.mid);
          doc.text('LOJA COLABORATIVA DE ARTESÃOS', PAGE_W / 2, fiosaFooterY + 16, { align: 'center' });
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          setColor(doc, COLORS.terracota);
          doc.text(FIOSA_URL, PAGE_W / 2, fiosaFooterY + 23, { align: 'center' });
          const urlW = doc.getTextWidth(FIOSA_URL);
          doc.link(PAGE_W / 2 - urlW / 2, fiosaFooterY + 19, urlW, 6, { url: FIOSA_URL });
        }
      }

      const finalPage = doc.getNumberOfPages();
      doc.setPage(finalPage);
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      setColor(doc, COLORS.mid);
      doc.text('Fios que conectam pessoas, histórias e lugares.', PAGE_W / 2, PAGE_H - 22, { align: 'center' });

      // ── POST-PROCESSING HEADERS & FOOTERS FOR ALL PAGES ────────────────────
      const totalPages = doc.getNumberOfPages();

      for (let pIndex = 1; pIndex <= totalPages; pIndex++) {
        doc.setPage(pIndex);

        if (pIndex === 1) {
          doc.link(30, PAGE_H - 12, 150, 7, { url: FIOSA_URL });
        } else if (pIndex === totalPages) {
          drawPageFooter(doc, totalPages, totalPages);
        } else {
          const headerArtesaoLabel =
            isAdmin && selectedArtesaos.length > 1
              ? 'FIOSA — Catálogo Geral'
              : artesao.nome;

          drawPageHeader(doc, headerArtesaoLabel, `Página ${pIndex} de ${totalPages}`);
          drawPageFooter(doc, pIndex, totalPages);
        }
      }

      // ── Save ──────────────────────────────────────────────────────────────
      const slug =
        isAdmin && selectedArtesaos.length === 1
          ? selectedArtesaos[0].slug
          : 'geral';
      doc.save(`catalogo-fiosa-${slug}.pdf`);
      setSuccessMsg('Catálogo PDF gerado e baixado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (e: unknown) {
      console.error(e);
      setErrorMsg('Erro ao gerar o PDF do catálogo. Verifique o console para detalhes.');
    } finally {
      setGenerating(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────────

  if (loading || !session) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="text-[#C15C3D] animate-spin" size={36} />
      </div>
    );
  }

  const ArtesaoSelectorPanel = () => {
    if (!isAdmin) return null;
    return (
      <div className="bg-[#F3EFE9] border border-[#8D7F73]/25 p-5 rounded-xl space-y-3">
        <div className="flex justify-between items-center border-b border-[#8D7F73]/20 pb-2">
          <h2 className="font-serif text-base font-bold text-[#2B2D2F] flex items-center gap-2">
            <Users size={16} className="text-[#C15C3D]" />
            Artesãos
          </h2>
          <button
            onClick={toggleAllArtesaos}
            className="text-[10px] font-sans font-bold text-[#C15C3D] hover:underline uppercase tracking-wider"
          >
            {selectedArtesaoIds.length === allArtesaos.length ? 'DESMARCAR TODOS' : 'MARCAR TODOS'}
          </button>
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {allArtesaos.map((a) => {
            const isChecked = selectedArtesaoIds.includes(a.id);
            const total = allProducts.filter((p) => p.artesaoId === a.id).length;
            const selected = allProducts.filter(
              (p) => p.artesaoId === a.id && selectedProductIds.includes(p.id)
            ).length;
            return (
              <label
                key={a.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                  isChecked
                    ? 'bg-[#C15C3D]/10 border border-[#C15C3D]/30'
                    : 'bg-[#FDFBF7] border border-[#8D7F73]/15 hover:border-[#8D7F73]/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleArtesao(a.id)}
                  className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D] shrink-0"
                />
                {a.foto && (
                  <img
                    src={a.foto}
                    alt={a.nome}
                    className="h-8 w-8 rounded-full object-cover border border-[#8D7F73]/20 shrink-0"
                  />
                )}
                <div className="flex-grow min-w-0">
                  <span className="block font-serif text-sm font-bold text-[#2B2D2F] truncate">
                    {a.nome}
                  </span>
                  {a.marca && (
                    <span className="block font-sans text-[10px] text-[#8D7F73] truncate">
                      {a.marca}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-sans text-[10px] text-[#8D7F73]">
                  {isChecked ? `${selected}/` : ''}{total} prod.
                </span>
              </label>
            );
          })}
        </div>
        {selectedArtesaoIds.length > 0 && (
          <p className="text-[10px] font-sans text-[#2B2D2F]/50 pt-1">
            {selectedArtesaoIds.length} artesão{selectedArtesaoIds.length !== 1 ? 's' : ''} selecionado{selectedArtesaoIds.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2B2D2F]">Exportar Catálogo PDF</h1>
        <p className="font-sans text-xs text-[#2B2D2F]/50 mt-1">
          Gere um catálogo visual elegante em PDF. Selecione os artesãos e os produtos que deseja incluir.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-[#606C38]/10 border-l-4 border-[#606C38] p-4 text-xs text-[#606C38] font-sans font-bold rounded">
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 bg-[#C15C3D]/10 border-l-4 border-[#C15C3D] p-4 text-xs text-[#C15C3D] font-sans font-bold rounded">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ── Left: Artisan selector + config ─────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          <ArtesaoSelectorPanel />

          <div className="bg-[#F3EFE9] border border-[#8D7F73]/25 p-5 rounded-xl space-y-4">
            <h2 className="font-serif text-base font-bold text-[#2B2D2F] border-b border-[#8D7F73]/20 pb-2">
              Configurar PDF
            </h2>

            <div className="space-y-2.5 font-sans text-xs text-[#2B2D2F]/80">
              {(
                [
                  { key: 'showPhotos', label: 'Exibir Fotos das Peças' },
                  { key: 'showName', label: 'Exibir Nome do Produto' },
                  { key: 'showDescription', label: 'Exibir Descrição' },
                  { key: 'showValue', label: 'Exibir Preço de Venda' },
                  { key: 'showCategory', label: 'Exibir Categoria' },
                  { key: 'showMaterials', label: 'Exibir Materiais' },
                  { key: 'showDimensions', label: 'Exibir Dimensões' },
                  { key: 'showTechnique', label: 'Exibir Técnica Utilizada' },
                  { key: 'showContacts', label: 'Exibir Contatos na Contracapa' },
                ] as { key: keyof typeof options; label: string }[]
              ).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={() => toggleOption(key)}
                    className="h-4 w-4 text-[#C15C3D] border-[#8D7F73]/40 rounded focus:ring-[#C15C3D]"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="bg-[#C15C3D]/8 border border-[#C15C3D]/20 rounded-lg p-3 text-[10px] text-[#2B2D2F]/60 font-sans leading-relaxed">
              <strong className="text-[#C15C3D]">Layout Otimizado:</strong> O PDF agrupa automaticamente múltiplos produtos por folha sempre que houver espaço, reduzindo desperdício e adaptando-se dinamicamente ao tamanho da descrição de cada peça.
            </div>

            <div className="pt-2 border-t border-[#8D7F73]/20">
              <button
                onClick={generatePDF}
                disabled={generating || productsForPDF.length === 0}
                className="flex items-center justify-center gap-2 w-full bg-[#C15C3D] hover:bg-[#C15C3D]/90 text-white py-3.5 rounded font-sans font-bold text-xs tracking-wider uppercase transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    GERANDO PDF...
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    Baixar Catálogo PDF
                  </>
                )}
              </button>
              {productsForPDF.length > 0 && (
                <p className="text-center text-[10px] text-[#2B2D2F]/40 mt-2 font-sans">
                  {productsForPDF.length} produto{productsForPDF.length !== 1 ? 's' : ''} selecionado{productsForPDF.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Products grouped by artisan ──────────────────────────── */}
        <div className="lg:col-span-8 bg-[#FDFBF7] border border-[#8D7F73]/20 p-6 rounded-xl shadow-sm space-y-5">
          <div className="flex justify-between items-baseline border-b border-[#8D7F73]/20 pb-2">
            <h2 className="font-serif text-lg font-bold text-[#2B2D2F]">Selecionar Produtos</h2>
            <button
              onClick={toggleAllProducts}
              className="text-[10px] font-sans font-bold text-[#C15C3D] hover:underline uppercase tracking-wider"
            >
              {selectedProductIds.length === visibleProducts.length && visibleProducts.length > 0
                ? 'DESMARCAR TODOS'
                : 'MARCAR TODOS'}
            </button>
          </div>

          {visibleProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#F3EFE9] rounded border border-[#8D7F73]/10">
              <p className="font-serif text-base text-[#2B2D2F] font-bold">Nenhum artesão selecionado</p>
              <p className="font-sans text-xs text-[#2B2D2F]/50 max-w-sm mx-auto mt-1">
                Selecione ao menos um artesão no painel à esquerda para ver os produtos disponíveis.
              </p>
            </div>
          ) : isAdmin ? (
            /* Grouped by artisan */
            <div className="space-y-4">
              {selectedArtesaos.map((artesao) => {
                const artesaoProducts = visibleProducts.filter(
                  (p) => p.artesaoId === artesao.id
                );
                const selectedInGroup = artesaoProducts.filter((p) =>
                  selectedProductIds.includes(p.id)
                ).length;
                const isExpanded = artesaoExpanded[artesao.id] !== false;

                const toggleGroupAll = () => {
                  if (selectedInGroup === artesaoProducts.length) {
                    setSelectedProductIds((prev) =>
                      prev.filter((id) => !artesaoProducts.map((p) => p.id).includes(id))
                    );
                  } else {
                    setSelectedProductIds((prev) => [
                      ...new Set([...prev, ...artesaoProducts.map((p) => p.id)]),
                    ]);
                  }
                };

                return (
                  <div key={artesao.id} className="border border-[#8D7F73]/20 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between bg-[#F3EFE9] px-4 py-3 border-b border-[#8D7F73]/15">
                      <div className="flex items-center gap-3">
                        {artesao.foto && (
                          <img
                            src={artesao.foto}
                            alt={artesao.nome}
                            className="h-8 w-8 rounded-full object-cover border border-[#8D7F73]/20 shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-serif text-sm font-bold text-[#2B2D2F]">
                            {artesao.nome}
                          </span>
                          {artesao.marca && (
                            <span className="ml-2 font-sans text-[10px] text-[#8D7F73]">
                              {artesao.marca}
                            </span>
                          )}
                        </div>
                        <span className="font-sans text-[10px] text-[#8D7F73] bg-white border border-[#8D7F73]/20 px-2 py-0.5 rounded-full">
                          {selectedInGroup}/{artesaoProducts.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleGroupAll}
                          className="text-[10px] font-sans font-bold text-[#C15C3D] hover:underline uppercase tracking-wider"
                        >
                          {selectedInGroup === artesaoProducts.length ? 'DESMARCAR' : 'MARCAR TODOS'}
                        </button>
                        <button
                          onClick={() => toggleArtesaoExpanded(artesao.id)}
                          className="text-[#8D7F73] hover:text-[#2B2D2F] transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                        {artesaoProducts.length > 0 ? artesaoProducts.map((p) => {
                          const isSelected = selectedProductIds.includes(p.id);
                          let mainFoto = 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=100&q=80';
                          try {
                            const arr: string[] = JSON.parse(p.fotos || '[]');
                            if (arr[0]) mainFoto = arr[0];
                          } catch { /* keep default */ }
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleProduct(p.id)}
                              className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-[#C15C3D] bg-[#C15C3D]/5'
                                  : 'border-[#8D7F73]/15 hover:border-[#8D7F73]/40 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="relative h-10 w-10 rounded overflow-hidden border border-[#8D7F73]/20 shrink-0 bg-[#F3EFE9]">
                                  <img src={mainFoto} alt={p.nome} className="object-cover h-full w-full" />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="block font-serif text-xs font-bold text-[#2B2D2F] line-clamp-1">
                                    {p.nome}
                                  </span>
                                  <span className="block font-sans text-[9px] text-[#2B2D2F]/50">
                                    {p.categoria.nome}{p.preco ? ` · R$ ${p.preco.toFixed(2).replace('.', ',')}` : ' · Sob consulta'}
                                  </span>
                                </div>
                              </div>
                              <div className="shrink-0 ml-1">
                                {isSelected ? (
                                  <CheckSquare className="text-[#C15C3D]" size={18} />
                                ) : (
                                  <Square className="text-[#8D7F73]/40" size={18} />
                                )}
                              </div>
                            </div>
                          );
                        }) : (
                          <p className="col-span-2 text-center py-4 font-sans text-xs text-[#2B2D2F]/40 italic">
                            Nenhum produto publicado para este artesão.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Non-admin: flat list */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibleProducts.map((p) => {
                const isSelected = selectedProductIds.includes(p.id);
                let mainFoto = 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=100&q=80';
                try {
                  const arr: string[] = JSON.parse(p.fotos || '[]');
                  if (arr[0]) mainFoto = arr[0];
                } catch { /* keep default */ }
                return (
                  <div
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C15C3D] bg-[#C15C3D]/5'
                        : 'border-[#8D7F73]/20 hover:border-[#8D7F73]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden border border-[#8D7F73]/30 shrink-0 bg-[#F3EFE9]">
                        <img src={mainFoto} alt={p.nome} className="object-cover h-full w-full" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="block font-serif text-sm font-bold text-[#2B2D2F] line-clamp-1">
                          {p.nome}
                        </span>
                        <span className="block font-sans text-[10px] text-[#2B2D2F]/50">
                          {p.categoria.nome}{p.preco ? ` · R$ ${p.preco.toFixed(2).replace('.', ',')}` : ' · Sob consulta'}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <CheckSquare className="text-[#C15C3D]" size={20} />
                      ) : (
                        <Square className="text-[#8D7F73]/40" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
