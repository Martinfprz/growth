/* ============================================================
   SUPABASE CLIENT + DB OPERATIONS
   ============================================================
   1. Go to https://supabase.com and create a free project.
   2. Run schema.sql in the Supabase SQL Editor.
   3. Fill in SUPABASE_URL and SUPABASE_ANON_KEY below.
      Dashboard → Project Settings → API → Project URL & anon key
   ============================================================ */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// ── Your project credentials ──────────────────────────────────
const SUPABASE_URL  = 'https://iwckpwcehzwsuwqauqwl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y2twd2NlaHp3c3V3cWF1cXdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTMyNjYsImV4cCI6MjA5MTU4OTI2Nn0.CZ0Ojz4ymlhJAFsIEsvLZ_PbXypv3ClIFyMYVKrl_bM';
// ─────────────────────────────────────────────────────────────

const client = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ── Row mappers: DB columns → app state shape ──────────────── */
const toTask    = r => ({ id: r.id, title: r.title, done: r.done, today: r.today, cat: r.cat });
const toExpense = r => ({ id: r.id, amount: Number(r.amount), cat: r.cat, desc: r.description, date: r.date });
const toHabit   = r => ({ id: r.id, name: r.name, icon: r.icon, goal: r.goal, current: r.current, unit: r.unit, color: r.color });
const toNote    = r => ({ id: r.id, title: r.title, body: r.body, updated: Number(r.updated_at) });

/* ============================================================
   DB — all CRUD operations used by app.js
   Every method throws on error so callers can catch + rollback.
   ============================================================ */
export const db = {

  /* ── TASKS ────────────────────────────────────────────────── */
  async loadTasks() {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toTask);
  },

  async addTask(task) {
    const { error } = await client.from('tasks').insert({
      id: task.id, title: task.title, done: task.done,
      today: task.today, cat: task.cat,
    });
    if (error) throw error;
  },

  async updateTask(id, fields) {
    const row = {};
    if ('done'  in fields) row.done  = fields.done;
    if ('today' in fields) row.today = fields.today;
    if ('title' in fields) row.title = fields.title;
    if ('cat'   in fields) row.cat   = fields.cat;
    const { error } = await client.from('tasks').update(row).eq('id', id);
    if (error) throw error;
  },

  async deleteTask(id) {
    const { error } = await client.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  /* ── EXPENSES ─────────────────────────────────────────────── */
  async loadExpenses() {
    const { data, error } = await client
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data.map(toExpense);
  },

  async addExpense(expense) {
    const { error } = await client.from('expenses').insert({
      id: expense.id, amount: expense.amount, cat: expense.cat,
      description: expense.desc, date: expense.date,
    });
    if (error) throw error;
  },

  async deleteExpense(id) {
    const { error } = await client.from('expenses').delete().eq('id', id);
    if (error) throw error;
  },

  /* ── HABITS ───────────────────────────────────────────────── */
  async loadHabits() {
    const { data, error } = await client
      .from('habits')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(toHabit);
  },

  async addHabit(habit) {
    const { error } = await client.from('habits').insert({
      id: habit.id, name: habit.name, icon: habit.icon, goal: habit.goal,
      current: habit.current, unit: habit.unit, color: habit.color,
    });
    if (error) throw error;
  },

  async updateHabit(id, fields) {
    const { error } = await client.from('habits').update(fields).eq('id', id);
    if (error) throw error;
  },

  async deleteHabit(id) {
    const { error } = await client.from('habits').delete().eq('id', id);
    if (error) throw error;
  },

  /* ── NOTES ────────────────────────────────────────────────── */
  async loadNotes() {
    const { data, error } = await client
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data.map(toNote);
  },

  // upsert: insert or update (handles both create and save)
  async upsertNote(note) {
    const { error } = await client.from('notes').upsert({
      id: note.id, title: note.title, body: note.body, updated_at: note.updated,
    });
    if (error) throw error;
  },

  async deleteNote(id) {
    const { error } = await client.from('notes').delete().eq('id', id);
    if (error) throw error;
  },

  /* ── LOAD ALL ─────────────────────────────────────────────── */
  async loadAll() {
    const [tasks, expenses, habits, notes] = await Promise.all([
      this.loadTasks(),
      this.loadExpenses(),
      this.loadHabits(),
      this.loadNotes(),
    ]);
    return { tasks, expenses, habits, notes };
  },
};
