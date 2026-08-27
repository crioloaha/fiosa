'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.email || !formData.mensagem) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);

    // Simulate sending form email/message
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: '',
      });
    }, 1500);
  };

  return (
    <div className="lg:col-span-7 bg-fiosa-cru border border-fiosa-marrom/20 p-8 rounded-xl shadow-sm">
      {submitted ? (
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center bg-fiosa-oliva/15 h-16 w-16 rounded-full text-fiosa-oliva mb-2 animate-bounce">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-fiosa-grafite">Mensagem Enviada!</h2>
          <p className="font-sans text-xs text-fiosa-grafite/60 max-w-sm mx-auto leading-relaxed">
            Agradecemos o seu contato. A equipe da FIOSA analisará a sua mensagem e responderá no e-mail informado o mais rápido possível.
          </p>
          <div className="pt-4">
            <button
              onClick={() => setSubmitted(false)}
              className="bg-fiosa-grafite hover:bg-fiosa-terracota text-white px-6 py-3 rounded text-xs font-sans font-bold uppercase tracking-wider transition-colors"
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="font-serif text-2xl text-fiosa-grafite font-bold border-b border-fiosa-marrom/20 pb-4">
            Mande uma mensagem
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="space-y-1">
              <label htmlFor="nome" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-fiosa-grafite/70">
                Nome Completo <span className="text-fiosa-terracota">*</span>
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded focus:outline-none focus:border-fiosa-terracota font-sans text-xs text-fiosa-grafite"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-fiosa-grafite/70">
                E-mail <span className="text-fiosa-terracota">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded focus:outline-none focus:border-fiosa-terracota font-sans text-xs text-fiosa-grafite"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <label htmlFor="telefone" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-fiosa-grafite/70">
                Telefone / Celular
              </label>
              <input
                type="text"
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded focus:outline-none focus:border-fiosa-terracota font-sans text-xs text-fiosa-grafite"
                placeholder="(32) 99999-9999"
              />
            </div>

            {/* Assunto */}
            <div className="space-y-1">
              <label htmlFor="assunto" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-fiosa-grafite/70">
                Assunto
              </label>
              <select
                id="assunto"
                name="assunto"
                value={formData.assunto}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded focus:outline-none focus:border-fiosa-terracota font-sans text-xs text-fiosa-grafite"
              >
                <option value="">Selecione um assunto</option>
                <option value="Dúvidas sobre produtos">Dúvidas sobre produtos</option>
                <option value="Dúvidas sobre experiências">Dúvidas sobre experiências</option>
                <option value="Quero me cadastrar como artesão">Quero me cadastrar como artesão</option>
                <option value="Parcerias ou Imprensa">Parcerias ou Imprensa</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          {/* Mensagem */}
          <div className="space-y-1">
            <label htmlFor="mensagem" className="block font-sans text-[10px] font-bold uppercase tracking-wider text-fiosa-grafite/70">
              Mensagem <span className="text-fiosa-terracota">*</span>
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              required
              rows={6}
              value={formData.mensagem}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-fiosa-cru border border-fiosa-marrom/30 rounded focus:outline-none focus:border-fiosa-terracota font-sans text-xs leading-relaxed text-fiosa-grafite"
              placeholder="Escreva sua mensagem aqui..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-fiosa-terracota hover:bg-fiosa-terracota/90 text-white font-sans font-bold text-xs tracking-wider px-8 py-3.5 rounded uppercase transition-colors shadow-sm disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Send size={14} />
                Enviar Mensagem
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
