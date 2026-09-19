(() => {
  const element = id => document.getElementById(id);
  const dialog = element('accountDialog');
  const apiOrigin = location.protocol === 'file:'
    ? 'http://127.0.0.1:3000'
    : location.hostname === 'localhost' && location.port === '8080'
      ? 'http://localhost:3000'
      : '';
  const localOnly = location.hostname.endsWith('github.io');
  const localAccountKey = 'tidslinjen.local-account.v1';
  let action = 'login';
  let busy = false;

  async function passwordHash(password) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function readLocalAccount() {
    try { return JSON.parse(localStorage.getItem(localAccountKey)) || null; }
    catch { return null; }
  }

  async function localRequest(path, credentials) {
    const account = readLocalAccount();
    if (path === 'session') return { user: account?.session || null };
    if (path === 'logout') {
      if (account) {
        account.session = null;
        localStorage.setItem(localAccountKey, JSON.stringify(account));
      }
      return { user: null };
    }
    const username = credentials.username;
    const key = username.toLocaleLowerCase('nb-NO');
    if (path === 'register' && account) throw new Error('Det finnes allerede en lokal konto i denne nettleseren.');
    if (path === 'login' && (!account || account.username.toLocaleLowerCase('nb-NO') !== key || account.passwordHash !== await passwordHash(credentials.password))) {
      throw new Error('Feil brukernavn eller passord.');
    }
    if (path === 'register') {
      const saved = { username, passwordHash: await passwordHash(credentials.password), session: { username } };
      localStorage.setItem(localAccountKey, JSON.stringify(saved));
      return { user: saved.session };
    }
    account.session = { username: account.username };
    localStorage.setItem(localAccountKey, JSON.stringify(account));
    return { user: account.session };
  }

  async function request(path, credentials) {
    if (localOnly) return localRequest(path, credentials);
    if (!apiOrigin && !['http:', 'https:'].includes(location.protocol)) {
      throw new Error('Innlogging er ikke tilgjengelig her ennå. Du kan fortsatt spille som gjest.');
    }
    let response;
    try {
      response = await fetch(`${apiOrigin}/api/${path}`, {
        method: credentials === undefined ? 'GET' : 'POST',
        credentials: 'include',
        headers: credentials === undefined ? {} : { 'Content-Type': 'application/json' },
        body: credentials === undefined ? undefined : JSON.stringify(credentials),
        signal: AbortSignal.timeout(15000)
      });
    } catch { throw new Error('Kunne ikke kontakte kontotjenesten. Prøv igjen om litt.'); }
    if (!response.headers.get('Content-Type')?.includes('application/json')) {
      throw new Error('Innlogging er ikke tilgjengelig her ennå. Du kan fortsatt spille som gjest.');
    }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Noe gikk galt. Prøv igjen.');
    return result;
  }

  function showUser(user) {
    element('accountStatus').textContent = user ? `Logget inn som ${user.username}` : 'Du spiller som gjest';
    element('loginOpen').classList.toggle('hidden', Boolean(user));
    element('registerOpen').classList.toggle('hidden', Boolean(user));
    element('logoutBtn').classList.toggle('hidden', !user);
  }
  function showForm(nextAction) {
    if (busy) return;
    action = nextAction;
    const registering = action === 'register';
    element('accountTitle').textContent = registering ? 'Opprett konto' : 'Logg inn';
    element('accountIntro').textContent = registering ? 'Velg et brukernavn og et passord du husker.' : 'Bruk brukernavnet og passordet ditt.';
    element('accountSubmit').textContent = registering ? 'Opprett konto' : 'Logg inn';
    element('accountSwitch').textContent = registering ? 'Har du konto? Logg inn' : 'Opprett en ny konto';
    element('accountPassword').autocomplete = registering ? 'new-password' : 'current-password';
    element('accountPassword').value = '';
    element('accountMessage').textContent = '';
    element('accountPrivacy').textContent = registering
      ? localOnly
        ? 'Denne nettversjonen lagrer kontoen kun i denne nettleseren. For felles kontoer og scoreboard må serverversjonen brukes.'
        : 'Vi trenger bare brukernavn og passord. Ingen e-post. Ta vare på passordet – det finnes foreløpig ingen passordgjenoppretting.'
      : 'Vi trenger bare brukernavn og passord. Ingen e-post.';
    if (!dialog.open) dialog.showModal();
    element('accountUsername').focus();
  }
  element('loginOpen').addEventListener('click', () => showForm('login'));
  element('registerOpen').addEventListener('click', () => showForm('register'));
  element('accountSwitch').addEventListener('click', () => showForm(action === 'login' ? 'register' : 'login'));
  element('accountClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { element('accountPassword').value = ''; });
  element('accountForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    busy = true;
    element('accountSubmit').disabled = true;
    element('accountSwitch').disabled = true;
    element('accountMessage').textContent = 'Venter …';
    try {
      const result = await request(action, {
        username: element('accountUsername').value.trim(),
        password: element('accountPassword').value
      });
      showUser(result.user);
      window.dispatchEvent(new CustomEvent('tidslinjen:session', { detail: result.user }));
      dialog.close();
    } catch (error) {
      element('accountMessage').textContent = error.message;
    } finally {
      element('accountPassword').value = '';
      element('accountSubmit').disabled = false;
      element('accountSwitch').disabled = false;
      busy = false;
    }
  });
  element('logoutBtn').addEventListener('click', async () => {
    element('logoutBtn').disabled = true;
    try {
      const user = (await request('logout', {})).user;
      showUser(user);
      window.dispatchEvent(new CustomEvent('tidslinjen:session', { detail: user }));
    }
    catch (error) { element('accountStatus').textContent = error.message; }
    finally { element('logoutBtn').disabled = false; }
  });
  request('session').then(result => {
    showUser(result.user);
    window.dispatchEvent(new CustomEvent('tidslinjen:session', { detail: result.user }));
  }).catch(() => {
    element('accountStatus').textContent = 'Du spiller som gjest';
  });
})();
