(() => {
  const $ = id => document.getElementById(id);
  const form = $('cardSuggestionForm');
  const sessionStatus = $('suggestionSessionStatus');
  const loginRequired = $('suggestionLoginRequired');
  const message = $('suggestionFormMessage');
  const submitButton = $('suggestionSubmit');
  const imageInput = $('suggestionImageInput');
  const imageDropzone = $('suggestionImageDropzone');
  const imagePreview = $('suggestionImagePreview');
  const imagePlaceholder = $('suggestionImagePlaceholder');
  const maxImageBytes = 1024 * 1024;
  const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
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
  let selectedImage = null;
  let previewUrl = null;

  function showMessage(text, state = '') {
    message.textContent = text;
    message.dataset.state = state;
  }

  function setImage(file) {
    if (!file) return false;
    if (!allowedImageTypes.has(file.type)) {
      showMessage('Bildet må være PNG, JPEG eller WebP.', 'error');
      return false;
    }
    if (file.size > maxImageBytes) {
      showMessage('Bildet kan ikke være større enn 1 MB.', 'error');
      return false;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    selectedImage = file;
    previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imagePreview.hidden = false;
    imagePlaceholder.hidden = true;
    showMessage('');
    return true;
  }

  function clearImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    selectedImage = null;
    imagePreview.removeAttribute('src');
    imagePreview.hidden = true;
    imagePlaceholder.hidden = false;
    imageInput.value = '';
  }

  function imageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Bildet kunne ikke leses.'));
      }, { once: true });
      reader.addEventListener('error', () => reject(new Error('Bildet kunne ikke leses.')), { once: true });
      reader.readAsDataURL(file);
    });
  }

  async function currentUser() {
    if (supabase) {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) return null;
      const username = data.user.user_metadata?.username || data.user.email?.split('@')[0] || '';
      if (window.UsernamePolicy?.isBlocked(username)) {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        return null;
      }
      return { id: data.user.id, username };
    }
    const response = await fetch(`${apiOrigin}/api/session`, {
      credentials: 'include',
      signal: AbortSignal.timeout(15000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Innloggingen kunne ikke kontrolleres.');
    return result.user;
  }

  async function submitSuggestion(input) {
    if (supabase) {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) throw sessionError;
      if (!data.user) throw new Error('Logg inn på nytt før du sender inn forslaget.');
      const { error } = await supabase.from('card_suggestions').insert({
        user_id: data.user.id,
        title: input.title,
        description: input.description,
        image_data: input.imageDataUrl
      });
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          throw new Error('Forslagskøen er ikke satt opp ennå. Administratoren må kjøre supabase-card-suggestions.sql.');
        }
        throw error;
      }
      return;
    }
    const response = await fetch(`${apiOrigin}/api/card-suggestions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(30000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Forslaget kunne ikke sendes inn.');
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    submitButton.disabled = true;
    showMessage('Sender inn forslaget …');
    try {
      const input = {
        title: $('suggestionTitle').value.trim(),
        description: $('suggestionDescription').value.trim(),
        imageDataUrl: selectedImage ? await imageAsDataUrl(selectedImage) : null
      };
      await submitSuggestion(input);
      form.reset();
      clearImage();
      showMessage('Forslaget er sendt til vurdering. Det blir ikke lagt til i spillet automatisk.', 'success');
    } catch (error) {
      showMessage(error.message || 'Forslaget kunne ikke sendes inn. Prøv igjen.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });

  imageInput.addEventListener('change', () => {
    if (imageInput.files?.[0]) setImage(imageInput.files[0]);
  });
  imageDropzone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      imageInput.click();
    }
  });
  imageDropzone.addEventListener('dragover', event => {
    event.preventDefault();
    imageDropzone.classList.add('dragging');
  });
  imageDropzone.addEventListener('dragleave', () => imageDropzone.classList.remove('dragging'));
  imageDropzone.addEventListener('drop', event => {
    event.preventDefault();
    imageDropzone.classList.remove('dragging');
    setImage(event.dataTransfer?.files?.[0]);
  });
  document.addEventListener('paste', event => {
    const item = Array.from(event.clipboardData?.items || []).find(entry => entry.type.startsWith('image/'));
    const file = item?.getAsFile();
    if (!file) return;
    event.preventDefault();
    setImage(file);
  });

  currentUser().then(user => {
    sessionStatus.textContent = user
      ? `Logget inn${user.username ? ` som ${user.username}` : ''} · forslagene dine sendes til vurdering`
      : 'Du spiller som gjest';
    form.classList.toggle('hidden', !user);
    loginRequired.classList.toggle('hidden', Boolean(user));
  }).catch(error => {
    sessionStatus.textContent = `Innloggingen kunne ikke kontrolleres: ${error.message}`;
    loginRequired.classList.remove('hidden');
    loginRequired.querySelector('h2').textContent = 'Gå til hovedsiden for å kontrollere innloggingen';
  });
})();
