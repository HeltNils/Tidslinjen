(() => {
  const $ = id => document.getElementById(id);
  const message = $('matchmakingMessage');
  const queueButton = $('joinQueueBtn');
  const leaveQueueButton = $('leaveQueueBtn');
  const inviteForm = $('inviteForm');
  const roomPanel = $('duelPanel');
  const eventMap = new Map((window.TIMELINE_EVENTS || []).map(event => [event.bankId, event]));
  let supabase;
  let user;
  let roomId = null;
  let queuePolling = false;
  let roomPolling = false;
  let actionPending = false;
  let timeoutPending = false;
  let countdownTimer = null;
  let pollTimer = null;
  let roomSignature = '';
  let latestRoom = null;

  function setMessage(text, isError = false) {
    message.replaceChildren();
    message.classList.toggle('error', isError);
    message.append(document.createTextNode(text));
  }

  function showLoginLink() {
    setMessage('Du må være logget inn med en Supabase-konto for å finne motstander eller sende invitasjoner. ');
    const link = document.createElement('a');
    link.href = './index.html#accountStatus';
    link.textContent = 'Logg inn på hjemmesiden';
    message.append(link);
  }

  function setActionsEnabled(enabled) {
    queueButton.disabled = !enabled;
    inviteForm.querySelector('button[type="submit"]').disabled = !enabled;
  }

  function describeError(error, fallback) {
    const text = error?.message || fallback;
    if (/function .* does not exist|schema cache/i.test(text)) {
      return 'Duellbasen er ikke satt opp ennå. Kjør supabase-matchmaking.sql i Supabase SQL Editor, og prøv igjen.';
    }
    return text;
  }

  async function rpc(name, args = {}) {
    const { data, error } = await supabase.rpc(name, args);
    if (error) throw error;
    return data;
  }

  function formatUserName(userId, room) {
    return userId === room.player_one_id ? room.player_one_name : room.player_two_name;
  }

  function setQueueState(waiting) {
    queueButton.classList.toggle('hidden', waiting);
    leaveQueueButton.classList.toggle('hidden', !waiting);
    if (waiting) setMessage('Søker etter en rated motstander med lignende Elo …');
  }

  async function readQueue() {
    const { data, error } = await supabase.from('duel_queue')
      .select('status,room_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (data?.status === 'matched' && data.room_id) {
      setQueueState(false);
      await openRoom(data.room_id);
    } else if (data?.status === 'waiting') {
      setQueueState(true);
    } else {
      setQueueState(false);
    }
  }

  async function joinQueue() {
    if (actionPending || roomId) return;
    actionPending = true;
    queueButton.disabled = true;
    try {
      const result = await rpc('duel_queue_join');
      if (result?.status === 'matched' && result.room_id) {
        setQueueState(false);
        await openRoom(result.room_id);
      } else {
        setQueueState(true);
      }
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke starte matchmaking.'), true);
    } finally {
      actionPending = false;
      queueButton.disabled = Boolean(roomId);
    }
  }

  async function leaveQueue() {
    if (actionPending) return;
    actionPending = true;
    leaveQueueButton.disabled = true;
    try {
      await rpc('duel_queue_leave');
      setQueueState(false);
      setMessage('Søket er avbrutt.');
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke avbryte søket.'), true);
    } finally {
      actionPending = false;
      leaveQueueButton.disabled = false;
    }
  }

  async function sendInvite(event) {
    event.preventDefault();
    if (actionPending) return;
    const username = $('inviteUsername').value.trim();
    if (!username) return;
    actionPending = true;
    inviteForm.querySelector('button[type="submit"]').disabled = true;
    try {
      const result = await rpc('duel_send_invite', {
        p_username: username,
        p_rated: $('inviteRating').value === 'true'
      });
      $('inviteUsername').value = '';
      setMessage(`Invitasjon sendt til ${result.invitee_name}. Den utløper om ti minutter.`);
      await refreshInvites();
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke sende invitasjonen.'), true);
    } finally {
      actionPending = false;
      inviteForm.querySelector('button[type="submit"]').disabled = false;
    }
  }

  function makeInviteRow(invite, incoming) {
    const item = document.createElement('li');
    const row = document.createElement('div');
    row.className = 'duel-invite-row';
    const label = document.createElement('span');
    label.textContent = incoming
      ? `${invite.inviter_name} inviterer til en ${invite.rated ? 'rated' : 'uformell'} duell`
      : `Venter på ${invite.invitee_name} · ${invite.rated ? 'rated' : 'uformell'}`;
    row.append(label);
    if (incoming) {
      const actions = document.createElement('div');
      actions.className = 'duel-invite-actions';
      const accept = document.createElement('button');
      accept.type = 'button';
      accept.className = 'primary';
      accept.textContent = 'Godta';
      accept.addEventListener('click', () => respondToInvite(invite.id, true));
      const decline = document.createElement('button');
      decline.type = 'button';
      decline.className = 'secondary';
      decline.textContent = 'Avslå';
      decline.addEventListener('click', () => respondToInvite(invite.id, false));
      actions.append(accept, decline);
      row.append(actions);
    }
    item.append(row);
    return item;
  }

  async function refreshInvites() {
    if (!user || document.hidden) return;
    try {
      const [incomingResult, sentResult] = await Promise.all([
        supabase.rpc('duel_invites_inbox'),
        supabase.from('duel_invites')
          .select('id,invitee_name,rated,expires_at')
          .eq('inviter_id', user.id)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
      ]);
      if (incomingResult.error) throw incomingResult.error;
      if (sentResult.error) throw sentResult.error;
      const inbox = $('inviteInbox');
      inbox.replaceChildren();
      const incoming = incomingResult.data || [];
      if (!incoming.length) {
        const empty = document.createElement('li');
        empty.className = 'duel-list-empty';
        empty.textContent = 'Ingen nye invitasjoner.';
        inbox.append(empty);
      } else {
        incoming.forEach(invite => inbox.append(makeInviteRow(invite, true)));
      }
      const sent = $('sentInvites');
      sent.replaceChildren();
      const outgoing = sentResult.data || [];
      if (!outgoing.length) {
        const empty = document.createElement('li');
        empty.className = 'duel-list-empty';
        empty.textContent = 'Ingen ventende invitasjoner.';
        sent.append(empty);
      } else {
        outgoing.forEach(invite => sent.append(makeInviteRow(invite, false)));
      }
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke laste invitasjonene.'), true);
    }
  }

  async function respondToInvite(inviteId, accept) {
    if (actionPending) return;
    actionPending = true;
    try {
      const result = await rpc('duel_invite_respond', { p_invite_id: inviteId, p_accept: accept });
      if (result.status === 'matched' && result.room_id) {
        setMessage('Invitasjonen ble godtatt. Kampen starter nå.');
        await openRoom(result.room_id);
      } else {
        setMessage(accept ? 'Invitasjonen er utløpt.' : 'Invitasjonen ble avslått.');
        await refreshInvites();
      }
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke behandle invitasjonen.'), true);
    } finally {
      actionPending = false;
    }
  }

  async function openRoom(id) {
    roomId = id;
    setActionsEnabled(false);
    roomPanel.classList.remove('hidden');
    roomPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await refreshRoom(true);
  }

  function appendTimelineCard(list, cardId) {
    const item = document.createElement('li');
    const card = eventMap.get(cardId);
    const title = document.createElement('strong');
    title.textContent = card?.title || cardId;
    const year = document.createElement('time');
    year.textContent = card?.displayYear || (Number.isInteger(card?.year) ? String(card.year) : '');
    item.append(title, year);
    list.append(item);
  }

  function updatePlacementOptions(room) {
    const select = $('movePosition');
    const previous = select.value;
    select.replaceChildren();
    const timeline = room.timeline_cards || [];
    for (let position = 0; position <= timeline.length; position++) {
      let label;
      if (position === 0) {
        label = `Før ${eventMap.get(timeline[0])?.title || 'første kort'}`;
      } else if (position === timeline.length) {
        label = `Etter ${eventMap.get(timeline[position - 1])?.title || 'siste kort'}`;
      } else {
        const left = eventMap.get(timeline[position - 1])?.title || timeline[position - 1];
        const right = eventMap.get(timeline[position])?.title || timeline[position];
        label = `Mellom ${left} og ${right}`;
      }
      const option = document.createElement('option');
      option.value = String(position);
      option.textContent = label;
      select.append(option);
    }
    if ([...select.options].some(option => option.value === previous)) select.value = previous;
  }

  function updateTurnTimer(room) {
    if (!room?.turn_deadline) {
      $('turnTimer').textContent = '—';
      timeoutPending = false;
      return;
    }
    const remaining = Math.max(0, Math.ceil((Date.parse(room.turn_deadline) - Date.now()) / 1000));
    $('turnTimer').textContent = String(remaining);
    if (remaining === 0 && !timeoutPending && room.status === 'active') {
      timeoutPending = true;
      rpc('duel_timeout', { p_room_id: room.id })
        .then(() => refreshRoom(true))
        .catch(error => setMessage(describeError(error, 'Kunne ikke avslutte turen på tid.'), true))
        .finally(() => { timeoutPending = false; });
    }
  }

  function renderRoom(room) {
    latestRoom = room;
    roomPanel.classList.remove('hidden');
    $('playerOneName').textContent = room.player_one_name;
    $('playerTwoName').textContent = room.player_two_name;
    $('playerOneLives').textContent = String(room.player_one_lives);
    $('playerTwoLives').textContent = String(room.player_two_lives);
    $('playerOnePoints').textContent = Number(room.player_one_points).toLocaleString('nb-NO');
    $('playerTwoPoints').textContent = Number(room.player_two_points).toLocaleString('nb-NO');
    $('playerOneRating').textContent = `Elo ${room.player_one_rating}`;
    $('playerTwoRating').textContent = `Elo ${room.player_two_rating}`;
    $('playerOneCard').classList.toggle('active', room.status === 'active' && room.current_turn_id === room.player_one_id);
    $('playerTwoCard').classList.toggle('active', room.status === 'active' && room.current_turn_id === room.player_two_id);
    const myTurn = room.status === 'active' && room.current_turn_id === user.id;
    setActionsEnabled(room.status !== 'active');
    $('duelStatus').textContent = room.status === 'completed'
      ? 'Kampen er ferdig.'
      : myTurn
        ? 'Det er din tur – du har 60 sekunder på å plassere kortet.'
        : `${formatUserName(room.current_turn_id, room)} har tur.`;

    const timeline = $('duelTimeline');
    timeline.replaceChildren();
    (room.timeline_cards || []).forEach(cardId => appendTimelineCard(timeline, cardId));
    updatePlacementOptions(room);

    const event = eventMap.get(room.current_card_id);
    $('duelEventTitle').textContent = event?.title || (room.status === 'completed' ? 'Kampen er over' : 'Kortet kunne ikke lastes');
    $('duelEventInfo').textContent = event?.info || '';
    const image = $('duelEventImage');
    image.replaceChildren();
    if (event?.image) {
      const img = document.createElement('img');
      img.src = event.image;
      img.alt = '';
      image.append(img);
    } else {
      image.textContent = event?.emoji || '🕰️';
    }

    $('submitMoveBtn').disabled = !myTurn || actionPending || !event;
    $('movePosition').disabled = !myTurn || actionPending || !event;
    $('forfeitDuelBtn').classList.toggle('hidden', room.status !== 'active');
    $('duelResult').classList.toggle('hidden', room.status !== 'completed');
    if (room.last_move) {
      const playerName = room.last_move.player_name;
      const card = eventMap.get(room.last_move.card_id);
      const year = card?.displayYear || String(room.last_move.answer_year);
      const result = room.last_move.timed_out
        ? `Tiden gikk ut for ${playerName}. Kortet var fra ${year}.`
        : room.last_move.correct
          ? `${playerName} plasserte ${card?.title || 'kortet'} riktig (+${room.last_move.score_delta} poeng).`
          : `${playerName} plasserte feil. Kortet var fra ${year}.`;
      $('lastMove').textContent = result;
    } else {
      $('lastMove').textContent = '';
    }
    if (room.status === 'completed') {
      renderResult(room);
      roomId = null;
      setActionsEnabled(true);
    } else {
      $('duelResult').replaceChildren();
    }
    updateTurnTimer(room);
  }

  function renderResult(room) {
    const result = $('duelResult');
    result.replaceChildren();
    const title = document.createElement('strong');
    if (!room.winner_id) title.textContent = 'Uavgjort!';
    else title.textContent = room.winner_id === user.id
      ? 'Du vant duellen!'
      : `${formatUserName(room.winner_id, room)} vant duellen.`;
    const detail = document.createElement('p');
    if (room.rated) {
      const delta = user.id === room.player_one_id ? room.elo_delta_one : room.elo_delta_two;
      detail.textContent = `Din Elo-endring: ${delta > 0 ? '+' : ''}${delta} · separat fra den vanlige topplisten.`;
      loadRating().catch(error => setMessage(describeError(error, 'Kunne ikke oppdatere Elo-ratingen.'), true));
    } else {
      detail.textContent = 'Uformell kamp – ratingen ble ikke endret.';
    }
    result.append(title, detail);
  }

  async function refreshRoom(forceRender = false) {
    if (!roomId || roomPolling || document.hidden) return;
    roomPolling = true;
    try {
      const { data, error } = await supabase.from('duel_rooms')
        .select('*')
        .eq('id', roomId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        roomId = null;
        roomPanel.classList.add('hidden');
        setMessage('Kampen ble ikke funnet eller du har ikke tilgang til den.', true);
        return;
      }
      const signature = JSON.stringify([
        data.status, data.current_turn_id, data.current_card_id, data.turn_deadline,
        data.timeline_cards, data.player_one_lives, data.player_two_lives,
        data.player_one_points, data.player_two_points, data.last_move,
        data.winner_id, data.elo_delta_one, data.elo_delta_two
      ]);
      if (forceRender || signature !== roomSignature) {
        roomSignature = signature;
        renderRoom(data);
      } else {
        latestRoom = data;
        updateTurnTimer(data);
      }
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke hente kampstatus.'), true);
    } finally {
      roomPolling = false;
    }
  }

  async function loadRating() {
    const rating = await rpc('duel_my_rating');
    $('ratingValue').textContent = String(rating.rating);
    $('ratingRecord').textContent = `${rating.wins} seire · ${rating.losses} tap · ${rating.draws} uavgjort`;
  }

  async function initialize() {
    const config = window.SUPABASE_CONFIG;
    if (!window.supabase?.createClient || !config?.url || !config.publishableKey ||
        config.publishableKey.startsWith('PASTE_')) {
      setMessage('Felles matchmaking krever at Supabase er konfigurert for appen.', true);
      return;
    }
    supabase = window.supabase.createClient(config.url, config.publishableKey);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      user = data.session?.user || null;
      if (!user) {
        showLoginLink();
        return;
      }
      setActionsEnabled(true);
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'spiller';
      setMessage(`Logget inn som ${username}. Kamper og rating er adskilt fra den vanlige topplisten.`);
      await loadRating();
      const active = await rpc('duel_my_active_room');
      if (active) await openRoom(active);
      else await readQueue();
      await refreshInvites();
      pollTimer = window.setInterval(() => {
        if (!user || document.hidden) return;
        if (roomId) refreshRoom();
        else if (queueButton.classList.contains('hidden')) readQueue().catch(error =>
          setMessage(describeError(error, 'Kunne ikke oppdatere søket.'), true));
        refreshInvites();
      }, 2000);
      countdownTimer = window.setInterval(() => {
        if (latestRoom?.status === 'active') updateTurnTimer(latestRoom);
      }, 250);
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke kontrollere Supabase-innloggingen.'), true);
      setActionsEnabled(false);
    }
  }

  queueButton.addEventListener('click', joinQueue);
  leaveQueueButton.addEventListener('click', leaveQueue);
  inviteForm.addEventListener('submit', sendInvite);
  $('moveForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!roomId || !latestRoom || latestRoom.current_turn_id !== user?.id || actionPending) return;
    actionPending = true;
    $('submitMoveBtn').disabled = true;
    try {
      await rpc('duel_move', { p_room_id: roomId, p_position: Number($('movePosition').value) });
      await refreshRoom(true);
    } catch (error) {
      setMessage(describeError(error, 'Trekket kunne ikke registreres.'), true);
      if (/Tiden er ute/i.test(error.message || '')) {
        rpc('duel_timeout', { p_room_id: roomId }).then(() => refreshRoom(true))
          .catch(timeoutError => setMessage(describeError(timeoutError, 'Turen kunne ikke avsluttes.'), true));
      }
    } finally {
      actionPending = false;
      if (latestRoom) renderRoom(latestRoom);
    }
  });
  $('forfeitDuelBtn').addEventListener('click', async () => {
    if (!roomId || actionPending || !window.confirm('Er du sikker på at du vil gi opp kampen?')) return;
    actionPending = true;
    try {
      await rpc('duel_forfeit', { p_room_id: roomId });
      await refreshRoom(true);
    } catch (error) {
      setMessage(describeError(error, 'Kunne ikke avslutte kampen.'), true);
    } finally {
      actionPending = false;
      if (latestRoom) renderRoom(latestRoom);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
