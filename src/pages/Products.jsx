// src/pages/Products.jsx
import { useState, useEffect, useRef } from 'react'
import {
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  AlertCircle, X, Upload, Package, Zap, Battery,
  Volume2, Shield, CheckCircle
} from 'lucide-react'
import { productAPI } from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import styles from './Products.module.css'

const CATEGORIES = ['cover', 'charger', 'powerbank', 'earphone', 'tempered glass']

const CAT_ICONS = {
  cover:           <Package size={28}/>,
  charger:         <Zap     size={28}/>,
  powerbank:       <Battery size={28}/>,
  earphone:        <Volume2 size={28}/>,
  'tempered glass':<Shield  size={28}/>,
}

const CAT_COLORS = {
  cover:           '#EFF6FF',
  charger:         '#FFFBEB',
  powerbank:       '#F0FDF4',
  earphone:        '#FDF4FF',
  'tempered glass':'#F0F9FF',
}

const BLANK = { name: '', category: '', description: '', available: true }

export default function Products() {
  const { token } = useAuth()
  const [products,  setProducts]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState(null)  // product object or null
  const [form,      setForm]       = useState(BLANK)
  const [formErr,   setFormErr]    = useState({})
  const [image,     setImage]      = useState(null)
  const [imageUrl,  setImageUrl]   = useState('')
  const [imgTab,    setImgTab]     = useState('url') // 'url' | 'file'
  const [saving,    setSaving]     = useState(false)
  const [deleteId,  setDeleteId]   = useState(null)
  const [deleting,  setDeleting]   = useState(false)
  const [toggling,  setToggling]   = useState(null)
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    try {
      const data = await productAPI.getAll(token)
      setProducts(data.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd  = () => { setEditing(null); setForm(BLANK); setImage(null); setImageUrl(''); setImgTab('url'); setFormErr({}); setModalOpen(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, category: p.category, description: p.description, available: p.available }); setImage(null); setImageUrl(p.image && p.image.startsWith('http') ? p.image : ''); setImgTab('url'); setFormErr({}); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(BLANK); setImage(null); setImageUrl(''); setImgTab('url'); setFormErr({}) }

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFormErr(e => ({ ...e, [k]: '' })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name        = 'Product name is required'
    if (!form.category)           e.category    = 'Select a category'
    if (!form.description.trim()) e.description = 'Description is required'
    else if (form.description.trim().length < 10) e.description = 'Min 10 characters'
    setFormErr(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name',        form.name)
      fd.append('category',    form.category)
      fd.append('description', form.description)
      fd.append('available',   form.available)
      if (image) fd.append('image', image)
      // If URL provided and no file selected, send URL as imageUrl
      if (!image && imageUrl.trim()) fd.append('imageUrl', imageUrl.trim())

      if (editing) {
        await productAPI.update(editing._id, fd, token)
      } else {
        await productAPI.create(fd, token)
      }
      closeModal()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productAPI.delete(deleteId, token)
      setDeleteId(null)
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = async (id) => {
    setToggling(id)
    try {
      await productAPI.toggleAvailability(id, token)
      setProducts(ps => ps.map(p => p._id === id ? { ...p, available: !p.available } : p))
    } catch (err) {
      setError(err.message)
    } finally {
      setToggling(null)
    }
  }

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Images only'); return }
    if (file.size > 5 * 1024 * 1024)    { alert('Max 5 MB');    return }
    setImage(file)
  }

  return (
    <div>
      {/* Header row */}
      <div className={styles.toolbar}>
        <div>
          <h2 className={styles.count}>{products.length} Products</h2>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16}/> Add Product
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={15}/> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)' }}>✕</button>
        </div>
      )}

      {/* Product grid */}
      {loading ? (
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`card ${styles.skelCard}`}>
              <div className="skeleton" style={{ height: 110, borderRadius: 'var(--r-md)', marginBottom: 14 }}/>
              <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 8 }}/>
              <div className="skeleton" style={{ height: 15, marginBottom: 6 }}/>
              <div className="skeleton" style={{ height: 13, width: '70%' }}/>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className={styles.empty}>
          <Package size={44}/>
          <p>No products yet. Add your first one!</p>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16}/>Add Product</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {products.map((p, i) => (
            <div key={p._id} className={`card ${styles.prodCard} anim-fade-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              {/* Image area */}
              <div className={styles.prodImg} style={{ background: CAT_COLORS[p.category] || '#F8FAFC' }}>
                {p.image
                  ? <img src={p.image?.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.image}`} alt={p.name}/>
                  : <div style={{ color: '#94A3B8', opacity: .5 }}>{CAT_ICONS[p.category] || <Package size={28}/>}</div>
                }
                <span className={`badge ${p.available ? 'badge-green' : 'badge-gray'} ${styles.availBadge}`}>
                  {p.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className={styles.prodBody}>
                <span className={styles.prodCat}>{p.category}</span>
                <h3 className={styles.prodName}>{p.name}</h3>
                <p className={styles.prodDesc}>{p.description}</p>
              </div>

              {/* Actions */}
              <div className={styles.prodActions}>
                <button
                  className={`btn btn-xs ${p.available ? 'btn-ghost' : 'btn-success'}`}
                  onClick={() => handleToggle(p._id)}
                  disabled={toggling === p._id}
                  title={p.available ? 'Mark unavailable' : 'Mark available'}
                >
                  {toggling === p._id
                    ? <div className="spinner spinner-blue" style={{ width: 12, height: 12 }}/>
                    : p.available
                      ? <><ToggleRight size={13}/> Available</>
                      : <><ToggleLeft  size={13}/> Unavailable</>
                  }
                </button>
                <button className="btn btn-ghost btn-xs" onClick={() => openEdit(p)} title="Edit">
                  <Edit2 size={13}/>
                </button>
                <button
                  className="btn btn-xs"
                  style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none' }}
                  onClick={() => setDeleteId(p._id)}
                  title="Delete"
                >
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal} style={{ padding: '4px 8px' }}>
                <X size={16}/>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  className={`form-input ${formErr.name ? 'error' : ''}`}
                  placeholder="e.g. 9H Tempered Glass"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
                {formErr.name && <span className="form-error">{formErr.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className={`form-select ${formErr.category ? 'error' : ''}`}
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                >
                  <option value="">— Select category —</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
                {formErr.category && <span className="form-error">{formErr.category}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className={`form-textarea ${formErr.description ? 'error' : ''}`}
                  placeholder="Describe the product…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                />
                {formErr.description && <span className="form-error">{formErr.description}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <div className={styles.toggleRow}>
                  <button
                    type="button"
                    className={`btn btn-sm ${form.available ? 'btn-success' : 'btn-ghost'}`}
                    onClick={() => set('available', true)}
                  >
                    <CheckCircle size={14}/> In Stock
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${!form.available ? 'btn-danger' : 'btn-ghost'}`}
                    onClick={() => set('available', false)}
                  >
                    Out of Stock
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Product Image</label>

                {/* Tab switcher */}
                <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${imgTab==='url' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setImgTab('url'); setImage(null) }}
                  >
                    🔗 Image URL
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${imgTab==='file' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => { setImgTab('file'); setImageUrl('') }}
                  >
                    📁 Upload File
                  </button>
                </div>

                {/* URL input tab */}
                {imgTab === 'url' && (
                  <div>
                    <input
                      className="form-input"
                      placeholder="Paste image URL — e.g. https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                    />
                    {imageUrl && imageUrl.startsWith('http') && (
                      <div className={styles.imgPreview} style={{ marginTop:10 }}>
                        <img
                          src={imageUrl}
                          alt="preview"
                          onError={e => e.target.style.opacity=0.3}
                        />
                        <span style={{ fontSize:12, color:'var(--muted)', flex:1 }}>URL preview</span>
                        <button onClick={() => setImageUrl('')} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer' }}>
                          <X size={14}/>
                        </button>
                      </div>
                    )}
                    <p style={{ fontSize:11, color:'var(--subtle)', marginTop:6 }}>
                      💡 Find free images at unsplash.com, pexels.com or google images → right-click → Copy image address
                    </p>
                  </div>
                )}

                {/* File upload tab */}
                {imgTab === 'file' && (
                  <div>
                    <div className={styles.uploadZone} onClick={() => fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files[0])}/>
                      <Upload size={20} style={{ color:'var(--blue-mid)', marginBottom:6 }}/>
                      <p style={{ fontSize:13, color:'var(--muted)' }}>
                        {image ? image.name : 'Click to upload image'}
                      </p>
                      <p style={{ fontSize:11, color:'var(--subtle)' }}>JPG, PNG, WebP · Max 5 MB</p>
                    </div>
                    {image && (
                      <div className={styles.imgPreview}>
                        <img src={URL.createObjectURL(image)} alt="preview"/>
                        <button onClick={() => setImage(null)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer' }}>
                          <X size={14}/>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {editing && !image && !imageUrl && editing.image && (
                  <p style={{ fontSize:11, color:'var(--subtle)', marginTop:6 }}>
                    ✅ Current image will be kept if nothing selected
                  </p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><div className="spinner"/> Saving…</>
                  : editing ? 'Save Changes' : 'Add Product'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <ConfirmModal
          title="Delete Product"
          message="Permanently delete this product? This cannot be undone."
          confirmLabel="Yes, Delete"
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
