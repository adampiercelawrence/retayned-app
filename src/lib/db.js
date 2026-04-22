// ============================================================
// RETAYNED — SUPABASE DATA LAYER
// lib/supabase.js
// ============================================================

import { supabase } from './supabase';




// ============================================================
// AUTH
// ============================================================

export const auth = {
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};


// ============================================================
// PROFILE
// ============================================================

export const profile = {
  get: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  }
};


// ============================================================
// CLIENTS
// ============================================================

export const clients = {
  list: async (userId) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('retention_score', { ascending: false, nullsFirst: false });
    return { data: data || [], error };
  },

  get: async (clientId) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    return { data, error };
  },

  create: async (userId, client) => {
    const { data, error } = await supabase
      .from('clients')
      .insert({ user_id: userId, ...client })
      .select()
      .single();
    return { data, error };
  },

  update: async (clientId, updates) => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();
    return { data, error };
  },

  // Move to rolodex (soft delete from clients)
  deactivate: async (clientId) => {
    const { data, error } = await supabase
      .from('clients')
      .update({ is_active: false })
      .eq('id', clientId)
      .select()
      .single();
    return { data, error };
  },

  // Update retention score + profile scores after profile evaluation
  updateScores: async (clientId, retentionScore, profileScores) => {
    const { data, error } = await supabase
      .from('clients')
      .update({
        retention_score: retentionScore,
        profile_scores: profileScores
      })
      .eq('id', clientId)
      .select()
      .single();
    return { data, error };
  },

  // Update drift after health check
  updateDrift: async (clientId, driftStatus, lastHcDate) => {
    const { data, error } = await supabase
      .from('clients')
      .update({
        drift_status: driftStatus,
        last_hc_date: lastHcDate
      })
      .eq('id', clientId)
      .select()
      .single();
    return { data, error };
  }
};


// ============================================================
// TASKS
// ============================================================

export const tasks = {
  list: async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_done', false)
      .order('sort_order', { ascending: true });
    return { data: data || [], error };
  },

  // Get today's tasks (including completed ones for progress count)
  // Recurring tasks always included — they persist across days and auto-reset in app
  listToday: async (userId) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .or(`is_done.eq.false,completed_at.gte.${today},is_recurring.eq.true`)
      .order('sort_order', { ascending: true });
    return { data: data || [], error };
  },

  create: async (userId, task) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, ...task })
      .select()
      .single();
    return { data, error };
  },

  toggle: async (taskId, isDone) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        is_done: isDone,
        completed_at: isDone ? new Date().toISOString() : null
      })
      .eq('id', taskId)
      .select()
      .single();
    return { data, error };
  },

  delete: async (taskId) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    return { error };
  },

  // Reorder tasks (batch update sort_order)
  reorder: async (taskOrders) => {
    // taskOrders = [{ id, sort_order }, ...]
    const promises = taskOrders.map(({ id, sort_order }) =>
      supabase.from('tasks').update({ sort_order }).eq('id', id)
    );
    const results = await Promise.all(promises);
    return { errors: results.filter(r => r.error).map(r => r.error) };
  },

  // Reset recurring tasks (called at start of day)
  resetRecurring: async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_done: false, completed_at: null })
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .eq('is_done', true)
      .select();
    return { data, error };
  }
};


// ============================================================
// HEALTH CHECKS
// ============================================================

export const healthChecks = {
  // Get pending (upcoming + overdue) health checks
  listPending: async (userId) => {
    const { data, error } = await supabase
      .from('health_checks')
      .select('*, client:clients(name, retention_score)')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('due_date', { ascending: true });
    return { data: data || [], error };
  },

  // Get completed health checks for a client
  listForClient: async (clientId) => {
    const { data, error } = await supabase
      .from('health_checks')
      .select('*')
      .eq('client_id', clientId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });
    return { data: data || [], error };
  },

  // Create next health check (scheduled)
  schedule: async (userId, clientId, dueDate) => {
    const { data, error } = await supabase
      .from('health_checks')
      .insert({
        user_id: userId,
        client_id: clientId,
        due_date: dueDate
      })
      .select()
      .single();
    return { data, error };
  },

  // Complete a health check
  complete: async (hcId, answers, driftScore, driftStatus) => {
    const { data, error } = await supabase
      .from('health_checks')
      .update({
        answers,
        drift_score: driftScore,
        drift_status: driftStatus,
        completed_at: new Date().toISOString()
      })
      .eq('id', hcId)
      .select()
      .single();
    return { data, error };
  },

  // Schedule next HC after completing one (default 30 days)
  scheduleNext: async (userId, clientId, daysOut = 30) => {
    const due = new Date();
    due.setDate(due.getDate() + daysOut);
    return healthChecks.schedule(userId, clientId, due.toISOString().split('T')[0]);
  }
};


// ============================================================
// ROLODEX
// ============================================================

export const rolodex = {
  list: async (userId) => {
    const { data, error } = await supabase
      .from('rolodex')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  create: async (userId, entry) => {
    const { data, error } = await supabase
      .from('rolodex')
      .insert({ user_id: userId, ...entry })
      .select()
      .single();
    return { data, error };
  },

  update: async (entryId, updates) => {
    const { data, error } = await supabase
      .from('rolodex')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();
    return { data, error };
  },

  delete: async (entryId) => {
    const { error } = await supabase
      .from('rolodex')
      .delete()
      .eq('id', entryId);
    return { error };
  }
};


// ============================================================
// REFERRALS
// ============================================================

export const referrals = {
  list: async (userId) => {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  create: async (userId, referral) => {
    const { data, error } = await supabase
      .from('referrals')
      .insert({ user_id: userId, ...referral })
      .select()
      .single();
    return { data, error };
  },

  update: async (refId, updates) => {
    const { data, error } = await supabase
      .from('referrals')
      .update(updates)
      .eq('id', refId)
      .select()
      .single();
    return { data, error };
  },

  delete: async (refId) => {
    const { error } = await supabase
      .from('referrals')
      .delete()
      .eq('id', refId);
    return { error };
  },

  // Stats
  getStats: async (userId) => {
    const { data } = await referrals.list(userId);
    if (!data) return { total: 0, active: 0, revenue: 0 };
    const active = data.filter(r => r.status === 'converted');
    const revenue = active.reduce((sum, r) => sum + (r.revenue || 0), 0);
    return { total: data.length, active: active.length, revenue };
  }
};


// ============================================================
// RAI SUGGESTIONS (from daily sweep)
// ============================================================

export const raiSuggestions = {
  listPending: async (userId) => {
    const { data, error } = await supabase
      .from('rai_suggestions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('is_alert', { ascending: false })
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  promote: async (suggestionId, userId) => {
    // Get the suggestion
    const { data: suggestion } = await supabase
      .from('rai_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (!suggestion) return { error: 'Not found' };

    // Create a task from it
    const { data: task, error: taskError } = await tasks.create(userId, {
      client_id: suggestion.client_id,
      client_name: suggestion.client_name,
      text: suggestion.text,
      is_ai_generated: true,
      is_alert: suggestion.is_alert
    });

    // Mark suggestion as promoted
    const { error: updateError } = await supabase
      .from('rai_suggestions')
      .update({ status: 'promoted' })
      .eq('id', suggestionId);

    return { data: task, error: taskError || updateError };
  },

  dismiss: async (suggestionId) => {
    const { error } = await supabase
      .from('rai_suggestions')
      .update({ status: 'dismissed' })
      .eq('id', suggestionId);
    return { error };
  }
};


// ============================================================
// RAI CONVERSATIONS
// ============================================================

export const raiConversations = {
  // Get or create conversation for a client context
  getOrCreate: async (userId, clientId = null) => {
    // Try to find existing conversation for this client
    let query = supabase
      .from('rai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (clientId) {
      query = query.eq('client_id', clientId);
    } else {
      query = query.is('client_id', null);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      return { data: data[0], error: null };
    }

    // Create new conversation
    const { data: newConvo, error } = await supabase
      .from('rai_conversations')
      .insert({
        user_id: userId,
        client_id: clientId,
        messages: []
      })
      .select()
      .single();

    return { data: newConvo, error };
  },

  // Append a message to conversation
  addMessage: async (convoId, role, text) => {
    // Get current messages
    const { data: convo } = await supabase
      .from('rai_conversations')
      .select('messages')
      .eq('id', convoId)
      .single();

    const messages = [...(convo?.messages || []), { role, text, timestamp: new Date().toISOString() }];

    const { data, error } = await supabase
      .from('rai_conversations')
      .update({ messages })
      .eq('id', convoId)
      .select()
      .single();

    return { data, error };
  },

  // Get recent conversations
  listRecent: async (userId, limit = 10) => {
    const { data, error } = await supabase
      .from('rai_conversations')
      .select('*, client:clients(name)')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);
    return { data: data || [], error };
  }
};


// ============================================================
// RAI KNOWLEDGE BASE (pgvector RAG)
// ============================================================

export const raiKnowledge = {
  // Store an embedding
  store: async (userId, clientId, content, embedding, sourceType, sourceId) => {
    const { data, error } = await supabase
      .from('rai_knowledge')
      .insert({
        user_id: userId,
        client_id: clientId,
        content,
        embedding,
        source_type: sourceType,
        source_id: sourceId
      })
      .select()
      .single();
    return { data, error };
  },

  // Search by similarity
  search: async (userId, queryEmbedding, limit = 5, clientId = null) => {
    // Uses Supabase RPC for vector similarity search
    const { data, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_count: limit,
      filter_user_id: userId,
      filter_client_id: clientId
    });
    return { data: data || [], error };
  }
};


// ============================================================
// REALTIME SUBSCRIPTIONS
// ============================================================

export const realtime = {
  // Subscribe to task changes (for multi-device sync)
  onTaskChange: (userId, callback) => {
    return supabase
      .channel('tasks-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to new Rai suggestions
  onNewSuggestion: (userId, callback) => {
    return supabase
      .channel('suggestions-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'rai_suggestions',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};


// ============================================================
// TOUCHPOINTS (client contact log: call, text, meeting, other)
// ============================================================

export const touchpoints = {
  // Today's touchpoints for the user (drives the "Logged Today" pills on Today page)
  listToday: async (userId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('touchpoints')
      .select('*')
      .eq('user_id', userId)
      .gte('occurred_at', today.toISOString())
      .order('occurred_at', { ascending: false });
    return { data: data || [], error };
  },

  // All touchpoints for a specific client (future: client detail timeline)
  listForClient: async (clientId) => {
    const { data, error } = await supabase
      .from('touchpoints')
      .select('*')
      .eq('client_id', clientId)
      .order('occurred_at', { ascending: false });
    return { data: data || [], error };
  },

  // All touchpoints for this user within the last N days (drives cadence calculation)
  list: async (userId, days = 90) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data, error } = await supabase
      .from('touchpoints')
      .select('*, client:clients(name)')
      .eq('user_id', userId)
      .gte('occurred_at', since.toISOString())
      .order('occurred_at', { ascending: false });
    const flat = (data || []).map(t => ({ ...t, client_name: t.client?.name }));
    return { data: flat, error };
  },

  create: async (userId, { client_id, client_name, channel }) => {
    const { data, error } = await supabase
      .from('touchpoints')
      .insert({
        user_id: userId,
        client_id,
        channel,
        occurred_at: new Date().toISOString()
      })
      .select()
      .single();
    // Return with client_name attached for optimistic UI updates
    return { data: data ? { ...data, client_name } : null, error };
  },

  delete: async (touchpointId) => {
    const { error } = await supabase
      .from('touchpoints')
      .delete()
      .eq('id', touchpointId);
    return { error };
  }
};


// ============================================================
// HELPER: Build Rai context for API call
// ============================================================

export const buildRaiContext = async (userId, clientId = null) => {
  // Gather all relevant data for Rai's context window
  const [
    { data: clientList },
    { data: taskList },
    { data: hcList },
    { data: refList }
  ] = await Promise.all([
    clients.list(userId),
    tasks.listToday(userId),
    clientId
      ? healthChecks.listForClient(clientId)
      : supabase.from('health_checks').select('*').eq('user_id', userId).not('completed_at', 'is', null).order('completed_at', { ascending: false }).limit(20).then(r => r),
    referrals.list(userId)
  ]);

  const context = {
    clients: (clientList || []).map(c => ({
      name: c.name,
      contact: c.contact,
      role: c.role,
      revenue: c.revenue,
      months: c.months,
      retention_score: c.retention_score,
      drift: c.drift_status,
      tag: c.tag,
      profile_scores: c.profile_scores
    })),
    tasks_today: (taskList || []).map(t => ({
      text: t.text,
      client: t.client_name,
      done: t.is_done,
      recurring: t.is_recurring
    })),
    recent_health_checks: (hcList || []).slice(0, 10).map(h => ({
      client_id: h.client_id,
      drift: h.drift_status,
      completed: h.completed_at
    })),
    referrals: {
      total: (refList || []).length,
      active: (refList || []).filter(r => r.status === 'converted').length
    }
  };

  // If specific client, add their detail
  if (clientId) {
    const { data: client } = await clients.get(clientId);
    if (client) {
      context.focused_client = {
        name: client.name,
        contact: client.contact,
        role: client.role,
        revenue: client.revenue,
        months: client.months,
        retention_score: client.retention_score,
        drift: client.drift_status,
        profile_scores: client.profile_scores,
        notes: client.notes
      };
    }
  }

  return context;
};
