export interface SearchResult {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string;
  date?: string;
}

export const globalSearch = async (searchTerm: string): Promise<SearchResult[]> => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  const { supabase } = await import('./client');
  const term = `%${searchTerm.trim()}%`;
  const results: SearchResult[] = [];

  try {
    // Buscar em artigos/notícias
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, excerpt, published_at')
      .not('published_at', 'is', null)
      .or(`title.ilike.${term},content.ilike.${term},excerpt.ilike.${term}`)
      .limit(5);

    if (articles) {
      results.push(...articles.map(article => ({
        id: article.id,
        title: article.title,
        type: 'Notícia',
        url: `/noticias/${article.slug}`,
        description: article.excerpt,
        date: article.published_at
      })));
    }

    // Buscar em eventos
    const { data: events } = await supabase
      .from('events')
      .select('id, title, slug, description, event_date')
      .or(`title.ilike.${term},description.ilike.${term},location.ilike.${term}`)
      .limit(5);

    if (events) {
      results.push(...events.map(event => ({
        id: event.id,
        title: event.title,
        type: 'Evento',
        url: `/eventos/${event.slug}`,
        description: event.description,
        date: event.event_date
      })));
    }

    // Buscar em mensagens do pastor
    const { data: messages } = await supabase
      .from('pastor_messages')
      .select('id, title, slug, content, published_at')
      .not('published_at', 'is', null)
      .or(`title.ilike.${term},content.ilike.${term}`)
      .limit(5);

    if (messages) {
      results.push(...messages.map(message => ({
        id: message.id,
        title: message.title,
        type: 'Mensagem do Pastor',
        url: `/mensagens-do-pastor/${message.slug}`,
        description: message.content?.substring(0, 100),
        date: message.published_at
      })));
    }

    // Buscar no clero
    const { data: clergy } = await supabase
      .from('clergy')
      .select('id, name, slug, position, bio')
      .or(`name.ilike.${term},position.ilike.${term},bio.ilike.${term},motto.ilike.${term}`)
      .limit(5);

    if (clergy) {
      results.push(...clergy.map(member => ({
        id: member.id,
        title: member.name,
        type: 'Clero',
        url: `/diretorio/clero/${member.slug}`,
        description: member.position
      })));
    }

    // Buscar em paróquias
    const { data: parishes } = await supabase
      .from('parishes')
      .select('id, name, slug, address, description')
      .or(`name.ilike.${term},address.ilike.${term},description.ilike.${term}`)
      .limit(5);

    if (parishes) {
      results.push(...parishes.map(parish => ({
        id: parish.id,
        title: parish.name,
        type: 'Paróquia',
        url: `/diretorio/paroquias/${parish.slug}`,
        description: parish.address
      })));
    }

    return results;
  } catch (error) {
    console.error('Erro na busca global:', error);
    return [];
  }
};