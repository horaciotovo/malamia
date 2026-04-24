import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { productsApi, categoriesApi } from '../../services/api';
import { Category, Product } from '../../types';
import Button from '../../components/ui/Button';
import Input, { Textarea } from '../../components/ui/Input';

interface FormState {
  name: string;
  description: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  stock: string;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string;
}

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState<FormState>({
    name: '', description: '', price: '', compareAtPrice: '',
    categoryId: '', stock: '0', isPublished: false, isFeatured: false, tags: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    categoriesApi.list().then((r) => setCategories(r.data.data)).catch(() => {});
    if (isEdit && id) {
      productsApi.getById(id).then((r) => {
        const p: Product = r.data.data;
        setForm({
          name: p.name, description: p.description,
          price: String(p.price), compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
          categoryId: p.categoryId, stock: String(p.stock),
          isPublished: p.isPublished, isFeatured: p.isFeatured,
          tags: p.tags.join(', '),
        });
        setExistingImages(p.images);
      }).catch(() => {});
    }
  }, [id, isEdit]);

  const onDrop = useCallback((accepted: File[]) => {
    setNewImages((prev) => [...prev, ...accepted]);
    accepted.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPreviews((prev) => [...prev, url]);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 8 * 1024 * 1024,
  });

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price required.';
    if (!form.categoryId) e.categoryId = 'Category is required.';
    if (!form.stock || isNaN(Number(form.stock))) e.stock = 'Valid stock required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      if (form.compareAtPrice) fd.append('compareAtPrice', form.compareAtPrice);
      fd.append('categoryId', form.categoryId);
      fd.append('stock', form.stock);
      fd.append('isPublished', String(form.isPublished));
      fd.append('isFeatured', String(form.isFeatured));
      fd.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      if (isEdit) fd.append('existingImages', JSON.stringify(existingImages));
      newImages.forEach((f) => fd.append('images', f));

      if (isEdit && id) {
        await productsApi.update(id, fd);
      } else {
        await productsApi.create(fd);
      }
      navigate('/products');
    } catch {
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-lg">{isEdit ? 'Edit Product' : 'New Product'}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'A price change notification will be sent automatically.' : 'A push notification is sent when published.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/products')}>Cancel</Button>
          <Button type="submit" loading={loading}>{isEdit ? 'Save Changes' : 'Create Product'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="text-white font-medium text-sm">Product Info</h3>
            <Input label="Product name *" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="e.g. Rose Glow Serum" />
            <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe your product…" />
          </div>

          {/* Pricing */}
          <div className="card p-5 space-y-4">
            <h3 className="text-white font-medium text-sm">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price ($) *" type="number" step="0.01" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} error={errors.price} placeholder="0.00" />
              <Input label="Compare at price ($)" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} hint="Original price (for displaying discounts)" placeholder="0.00" />
            </div>
          </div>

          {/* Images */}
          <div className="card p-5 space-y-4">
            <h3 className="text-white font-medium text-sm">Images</h3>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-400 text-sm">
                {isDragActive ? 'Drop images here…' : 'Drag & drop images or click to browse'}
              </p>
              <p className="text-gray-600 text-xs mt-1">JPEG, PNG, WebP — max 8 MB each</p>
            </div>

            {(existingImages.length > 0 || previews.length > 0) && (
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} className="w-20 h-20 rounded-lg object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setExistingImages((p) => p.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))}
                {previews.map((url, i) => (
                  <div key={`new-${i}`} className="relative group">
                    <img src={url} className="w-20 h-20 rounded-lg object-cover ring-2 ring-primary/50" alt="" />
                    <button
                      type="button"
                      onClick={() => {
                        setNewImages((p) => p.filter((_, idx) => idx !== i));
                        setPreviews((p) => p.filter((_, idx) => idx !== i));
                        URL.revokeObjectURL(url);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="text-white font-medium text-sm">Organization</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-300">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                className="input-base"
              >
                <option value="">— Select —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-red-400">{errors.categoryId}</p>}
            </div>
            <Input label="Stock" type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} error={errors.stock} />
            <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="skincare, glow, new" />
          </div>

          <div className="card p-5 space-y-3">
            <h3 className="text-white font-medium text-sm">Visibility</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Published</span>
              <button
                type="button"
                onClick={() => set('isPublished', !form.isPublished)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isPublished ? 'bg-primary' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isPublished ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-300">Featured</span>
              <button
                type="button"
                onClick={() => set('isFeatured', !form.isFeatured)}
                className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-primary' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.isFeatured ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
