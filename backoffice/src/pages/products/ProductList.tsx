import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../../services/api';
import { Product } from '../../types';
import Button from '../../components/ui/Button';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => { load(); }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.list({ page, limit, search: search || undefined });
      setProducts(data.data.data);
      setTotal(data.data.total);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const handleTogglePublish = async (product: Product) => {
    await productsApi.togglePublish(product.id, !product.isPublished);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isPublished: !p.isPublished } : p)),
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await productsApi.delete(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-base w-64"
          />
          <span className="text-gray-500 text-sm">{total} total</span>
        </div>
        <Link to="/products/new">
          <Button>+ New Product</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Price</th>
              <th className="text-right px-4 py-3">Stock</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50 animate-pulse">
                    <td className="px-4 py-3" colSpan={6}>
                      <div className="h-4 bg-gray-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              : products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-800/50 hover:bg-surface-secondary/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] ? `${product.images[0]}${product.images[0].includes('?') ? '&' : '?'}w=40&h=40&fit=crop&q=80&fm=webp` : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%231A1A1A" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23E8448A"%3EM%3C/text%3E%3C/svg%3E'}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-surface-secondary"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            const img = e.currentTarget;
                            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%231A1A1A" width="40" height="40"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23E8448A"%3EM%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          {product.isFeatured && (
                            <span className="badge-pink">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                      {product.compareAtPrice && (
                        <span className="text-gray-500 text-xs line-through ml-2">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock === 0 ? 'text-red-400' : 'text-gray-300'}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(product)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          product.isPublished
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                        }`}
                      >
                        {product.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/products/${product.id}/edit`}
                          className="text-gray-400 hover:text-white transition-colors text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹ Prev</Button>
              <Button variant="ghost" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>Next ›</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
