'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/lib/blog';
import { ChevronDown } from 'lucide-react';

type PostStatus = 'DRAFT' | 'PUBLISHED';

const EMPTY_FORM = {
  title: '',
  keyword: '',
  excerpt: '',
  contentText: '',
  status: 'DRAFT' as PostStatus,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const contentLines = useMemo(
    () =>
      form.contentText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    [form.contentText]
  );

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Impossible de charger les articles');
      setPosts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        keyword: form.keyword.trim(),
        excerpt: form.excerpt.trim(),
        content: contentLines,
        status: form.status,
      };
      const url = editingId ? `/api/admin/blog/${editingId}` : '/api/admin/blog';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur lors de l’enregistrement');
      await fetchPosts();
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l’enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setFormOpen(true);
    setForm({
      title: post.title,
      keyword: post.keyword,
      excerpt: post.excerpt,
      contentText: post.content.join('\n'),
      status: post.status,
    });
  };

  const deletePost = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Suppression impossible');
      setPosts((prev) => prev.filter((post) => post.id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-2">Blog</h1>
      <p className="text-muted-foreground mb-6">Gestion des articles affichés sur la page publique du blog.</p>

      <div className="mb-6">
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setFormOpen((open) => !open)}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${formOpen ? 'rotate-180' : 'rotate-0'}`}
          />
          {formOpen
            ? editingId
              ? 'Masquer le formulaire de modification'
              : 'Masquer le formulaire d’ajout'
            : editingId
            ? 'Afficher le formulaire de modification'
            : 'Afficher le formulaire d’ajout'}
        </Button>
      </div>

      {formOpen ? (
        <Card className="mb-6">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    value={form.title}
                    onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mot-clé</label>
                  <input
                    className="w-full rounded-md border px-3 py-2"
                    value={form.keyword}
                    onChange={(e) => setForm((s) => ({ ...s, keyword: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Extrait</label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 min-h-[80px]"
                  value={form.excerpt}
                  onChange={(e) => setForm((s) => ({ ...s, excerpt: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contenu (1 ligne = 1 point)</label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 min-h-[120px]"
                  value={form.contentText}
                  onChange={(e) => setForm((s) => ({ ...s, contentText: e.target.value }))}
                  required
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  className="h-10 rounded-md border px-3"
                  value={form.status}
                  onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as PostStatus }))}
                >
                  <option value="DRAFT">Brouillon</option>
                  <option value="PUBLISHED">Publié</option>
                </select>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer un article'}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler l’édition
                  </Button>
                ) : null}
              </div>
            </form>
            {error ? <p className="text-sm text-destructive mt-3">{error}</p> : null}
          </CardContent>
        </Card>
      ) : null}

      {loading ? <p>Chargement...</p> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="border-gc-forest/20">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-block rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                  Mot-clé: {post.keyword}
                </span>
                <span className="text-xs text-muted-foreground">
                  {post.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <h2 className="font-heading text-lg font-semibold leading-snug">{post.title}</h2>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {post.content.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => startEdit(post)}>
                  Modifier
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deletePost(post.id)}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
