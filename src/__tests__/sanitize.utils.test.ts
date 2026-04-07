import { sanitizeText, sanitizeRichText, sanitizeObject } from '../utils/sanitize';

describe('SanitizeUtils', () => {
  describe('sanitizeText', () => {
    it('deve remover tags script', () => {
      const result = sanitizeText('<script>alert("xss")</script>texto');
      expect(result).toBe('texto');
      expect(result).not.toContain('<script>');
    });

    it('deve remover tags img com onerror', () => {
      const result = sanitizeText('<img src=x onerror=alert(1)>texto');
      expect(result).toBe('texto');
      expect(result).not.toContain('<img');
    });

    it('deve remover tags de formatação', () => {
      const result = sanitizeText('<b>negrito</b> normal');
      expect(result).toBe('negrito normal');
      expect(result).not.toContain('<b>');
    });

    it('deve remover links maliciosos', () => {
      const result = sanitizeText('<a href="javascript:void(0)">click</a>');
      expect(result).toBe('click');
      expect(result).not.toContain('<a');
    });

    it('deve preservar texto simples', () => {
      const result = sanitizeText('Candidato com bom perfil técnico');
      expect(result).toBe('Candidato com bom perfil técnico');
    });

    it('deve retornar string vazia para null', () => {
      expect(sanitizeText(null)).toBe('');
    });

    it('deve retornar string vazia para undefined', () => {
      expect(sanitizeText(undefined)).toBe('');
    });

    it('deve fazer trim do texto', () => {
      expect(sanitizeText('  texto  ')).toBe('texto');
    });
  });

  describe('sanitizeRichText', () => {
    it('deve permitir tags de formatação básica', () => {
      const result = sanitizeRichText('<b>negrito</b> e <i>itálico</i>');
      expect(result).toContain('<b>negrito</b>');
      expect(result).toContain('<i>itálico</i>');
    });

    it('deve remover atributos de tags permitidas', () => {
      const result = sanitizeRichText('<b onclick="alert(1)">texto</b>');
      expect(result).toBe('<b>texto</b>');
      expect(result).not.toContain('onclick');
    });

    it('deve remover script mesmo em rich text', () => {
      const result = sanitizeRichText('<script>alert("xss")</script><b>texto</b>');
      expect(result).toContain('<b>texto</b>');
      expect(result).not.toContain('<script>');
    });

    it('deve remover href malicioso', () => {
      const result = sanitizeRichText('<a href="javascript:steal()">link</a>');
      expect(result).toBe('link');
      expect(result).not.toContain('javascript');
    });

    it('deve permitir listas', () => {
      const result = sanitizeRichText('<ul><li>item 1</li><li>item 2</li></ul>');
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });
  });

  describe('sanitizeObject', () => {
    it('deve sanitizar todos os campos string de um objeto', () => {
      const result = sanitizeObject({
        name: 'João <script>xss</script>',
        email: 'joao@email.com',
        age: 30,
      });
      expect(result.name).toBe('João ');
      expect(result.email).toBe('joao@email.com');
      expect(result.age).toBe(30);
    });

    it('deve preservar campos não string', () => {
      const date = new Date();
      const result = sanitizeObject({
        text: 'texto',
        number: 42,
        bool: true,
        date,
      });
      expect(result.number).toBe(42);
      expect(result.bool).toBe(true);
      expect(result.date).toBe(date);
    });
  });
});