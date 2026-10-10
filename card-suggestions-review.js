(() => {
  const $ = id => document.getElementById(id);
  const status = $('reviewStatus');
  const loginRequired = $('reviewLoginRequired');
  const panel = $('reviewPanel');
  const list = $('reviewList');
  const empty = $('reviewEmpty');
  const actionMessage = $('reviewActionMessage');
  const loadMoreButton = $('reviewLoadMore');
  const pageSize = 10;
  const apiOrigin = location.protocol === 'file:'
    ? 'http://127.0.0.1:3000'
    : location.hostname === 'localhost' && location.port === '8080'
      ? 'http://localhost:3000'
      : '';
  const config = window.SUPABASE_CONFIG;
  const supabase = window.tidslinjenSupabase || (
    window.supabase?.createClient && config?.url && config.publishableKey &&
    !config.publishableKey.startsWith('PASTE_')
      ? window.supabase.createClient(config.url, config.publishableKey)
      : null
  );
  let cursor = null;
  let hasMore = true;
  let loading = false;

  function usernameKey(user) {
    const username = user?.username ||
      user?.user_metadata?.username ||
      user?.email?.split('@')[0] ||
      '';
    return window.UsernamePolicy.keyFor(username);
  }

  async function currentUser() {
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    }
    const response = await fetch(`${apiOrigin}/api/session`, {
      credentials: 'include',
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Innloggingen kunne ikke kontrolleres.');
    return result.user;
  }

  function showError(error) {
    const missingTable = ['42P01', 'PGRST205'].includes(error?.code);
    actionMessage.textContent = missingTable
      ? 'Vurderingskøen er ikke satt opp. Administratoren må kjøre supabase-card-suggestions.sql.'
      : error?.message || 'Kunne ikke utføre handlingen. Prøv igjen.';
    actionMessage.dataset.error = 'true';
  }

  function createSuggestionCard(suggestion) {
    const entry = document.createElement('li');
    entry.className = 'review-entry';
    entry.dataset.id = String(suggestion.id);

    const card = document.createElement('article');
    card.className = 'event-card review-card';
    if (suggestion.imageDataUrl) {
      const image = document.createElement('img');
      image.src = suggestion.imageDataUrl;
      image.alt = `Bilde til ${suggestion.title}`;
      const imageSection = document.createElement('div');
      imageSection.className = 'event-image review-image';
      imageSection.append(image);
      card.append(imageSection);
    } else {
      const imageSection = document.createElement('div');
      imageSection.className = 'event-image review-image';
      imageSection.setAttribute('aria-hidden', 'true');
      imageSection.textContent = '🗂️';
      card.append(imageSection);
    }

    const text = document.createElement('div');
    text.className = 'card-text';
    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = suggestion.title;
    const description = document.createElement('p');
    description.className = 'review-description';
    description.textContent = suggestion.description;
    const createdAt = document.createElement('small');
    createdAt.className = 'review-date';
    createdAt.textContent = `Sendt inn ${new Intl.DateTimeFormat('nb-NO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(suggestion.createdAt))}`;
    text.append(title, description, createdAt);
    card.append(text);

    const actions = document.createElement('div');
    actions.className = 'review-actions';
    const approve = document.createElement('button');
    approve.className = 'primary';
    approve.type = 'button';
    approve.dataset.action = 'approve';
    approve.textContent = 'Godkjenn';
    const remove = document.createElement('button');
    remove.className = 'remove-suggestion';
    remove.type = 'button';
    remove.dataset.action = 'remove';
    remove.textContent = 'Fjern';
    actions.append(approve, remove);
    entry.append(card, actions);
    return entry;
  }

  async function fetchSuggestions() {
    if (supabase) {
      let query = supabase.from('card_suggestions')
        .select('id,title,description,image_data,created_at')
        .eq('status', 'pending')
        .order('id', { ascending: true })
        .limit(pageSize + 1);
      if (cursor) query = query.gt('id', cursor);
      const { data, error } = await query;
      if (error) throw error;
      const page = data.slice(0, pageSize).map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        imageDataUrl: row.image_data,
        createdAt: row.created_at
      }));
      return {
        suggestions: page,
        nextAfter: data.length > pageSize ? page[page.length - 1]?.id || null : null
      };
    }

    const params = new URLSearchParams();
    if (cursor !== null) params.set('after', cursor);
    const suffix = params.size ? `?${params}` : '';
    const response = await fetch(`${apiOrigin}/api/card-suggestions${suffix}`, {
      credentials: 'include',
      signal: AbortSignal.timeout(30000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Kunne ikke hente kortforslagene.');
    return result;
  }

  async function loadSuggestions(append = false) {
    if (loading || !hasMore) return;
    loading = true;
    $('reviewRefresh').disabled = true;
    loadMoreButton.disabled = true;
    if (!append) status.textContent = 'Henter forslag …';
    try {
      const result = await fetchSuggestions();
      if (!append) list.replaceChildren();
      result.suggestions.forEach(suggestion => list.append(createSuggestionCard(suggestion)));
      cursor = result.nextAfter;
      hasMore = cursor !== null;
      loadMoreButton.classList.toggle('hidden', !hasMore);
      empty.classList.toggle('hidden', list.children.length > 0);
      status.textContent = `${list.children.length} forslag vises${hasMore ? ' · flere finnes' : ''}`;
      actionMessage.textContent = '';
      actionMessage.dataset.error = 'false';
    } catch (error) {
      showError(error);
      status.textContent = 'Kunne ikke hente kortforslagene.';
    } finally {
      loading = false;
      $('reviewRefresh').disabled = false;
      loadMoreButton.disabled = false;
    }
  }

  async function processSuggestion(button) {
    const entry = button.closest('.review-entry');
    const id = entry.dataset.id;
    const action = button.dataset.action;
    if (action === 'remove' && !window.confirm('Fjerne dette forslaget permanent?')) return;
    entry.querySelectorAll('button').forEach(control => { control.disabled = true; });
    actionMessage.textContent = action === 'approve' ? 'Godkjenner …' : 'Fjerner …';
    actionMessage.dataset.error = 'false';
    try {
      if (supabase) {
        const query = supabase.from('card_suggestions');
        const result = action === 'approve'
          ? await query.update({ status: 'accepted' }).eq('id', id).eq('status', 'pending').select('id')
          : await query.delete().eq('id', id).eq('status', 'pending').select('id');
        if (result.error) throw result.error;
        if (!result.data?.length) throw new Error('Forslaget finnes ikke eller er allerede behandlet.');
      } else {
        const response = await fetch(`${apiOrigin}/api/card-suggestions/${encodeURIComponent(id)}/${action}`, {
          method: 'POST',
          credentials: 'include',
          signal: AbortSignal.timeout(15000)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Kunne ikke behandle forslaget.');
      }
      entry.remove();
      empty.classList.toggle('hidden', list.children.length > 0 || hasMore);
      status.textContent = `${list.children.length} forslag vises${hasMore ? ' · flere finnes' : ''}`;
      actionMessage.textContent = action === 'approve'
        ? 'Forslaget er godkjent for videre arbeid.'
        : 'Forslaget er fjernet.';
    } catch (error) {
      showError(error);
      entry.querySelectorAll('button').forEach(control => { control.disabled = false; });
    }
  }

  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (button) processSuggestion(button);
  });
  $('reviewRefresh').addEventListener('click', () => {
    cursor = null;
    hasMore = true;
    loadSuggestions();
  });
  loadMoreButton.addEventListener('click', () => loadSuggestions(true));

  currentUser().then(user => {
    if (!user) {
      status.textContent = 'Du spiller som gjest';
      loginRequired.classList.remove('hidden');
      return;
    }
    if (usernameKey(user) !== 'nils') {
      status.textContent = 'Denne siden er bare tilgjengelig for Nils.';
      loginRequired.querySelector('h2').textContent = 'Du har ikke tilgang til vurderingskøen';
      loginRequired.querySelector('p').textContent = 'Bare Nils-kontoen kan godkjenne eller fjerne forslag.';
      loginRequired.classList.remove('hidden');
      return;
    }
    status.textContent = 'Logget inn som Nils';
    panel.classList.remove('hidden');
    loadSuggestions();
  }).catch(error => {
    status.textContent = `Innloggingen kunne ikke kontrolleres: ${error.message}`;
    loginRequired.classList.remove('hidden');
  });
})();
