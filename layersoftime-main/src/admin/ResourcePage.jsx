import { useEffect, useRef, useState } from 'react'
import { Field } from './Login.jsx'
import { useNoIndex } from './AdminLayout.jsx'
import { api } from './api.js'

const emptyFor = (cfg) =>
  Object.fromEntries(cfg.fields.map((f) => {
    if (f.type === 'gallery' || f.type === 'taglist') return [f.name, []]
    if (f.type === 'checkbox') return [f.name, f.default ?? true]
    if (f.type === 'select') return [f.name, f.options[0]]
    if (f.type === 'dynamic-select') return [f.name, '']
    return [f.name, '']
  }))

export default function ResourcePage({ cfg }) {
  useNoIndex(cfg.title)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    cfg
      .list(api)
      .then((r) => setItems(r[cfg.listKey]))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [cfg])

  const flash = (t) => {
    setNotice(t)
    setTimeout(() => setNotice(''), 3000)
  }

  const save = async (values, id) => {
    const payload = cfg.toPayload ? cfg.toPayload(values) : values
    try {
      if (id) {
        const r = await cfg.update(api, id, payload)
        const saved = r[cfg.itemKey]
        setItems((l) => l.map((i) => (i.id === id ? saved : i)))
        flash(`${cfg.singular} updated`)
      } else {
        const r = await cfg.create(api, payload)
        const saved = r[cfg.itemKey]
        setItems((l) => [saved, ...l])
        flash(`${cfg.singular} created`)
      }
      setEditing(null)
    } catch (e) {
      throw e
    }
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await cfg.remove(api, toDelete.id)
      setItems((l) => l.filter((i) => i.id !== toDelete.id))
      setToDelete(null)
      flash(`${cfg.singular} deleted`)
    } catch (e) {
      setError(e.message)
      setToDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <header className="adm-head">
        <div>
          <p className="adm-eyebrow">Manage</p>
          <h1 className="adm-title">{cfg.title}</h1>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={() => setEditing('new')}>
          + Add {cfg.singular}
        </button>
      </header>

      {notice && <div className="adm-ok">{notice}</div>}
      {error && <div className="adm-alert">{error}</div>}

      <div className="adm-table-wrap">
        <table className="adm-table" style={{ minWidth: 560 }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              {cfg.columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={cfg.columns.length + 3} className="adm-empty">Loading…</td></tr>
            )}
            {!loading && !items.length && (
              <tr><td colSpan={cfg.columns.length + 3} className="adm-empty">Nothing here yet</td></tr>
            )}
            {items.map((it, n) => {
              const thumb = cfg.thumb ? cfg.thumb(it) : it.thumb
              return (
                <tr key={it.id}>
                  <td className="adm-mono">{n + 1}</td>
                  <td>{thumb ? <img className="adm-thumb" src={thumb} alt="" /> : '—'}</td>
                  {cfg.columns.map((c) => (
                    <td key={c.key}>{it[c.key] || '—'}</td>
                  ))}
                  <td className="adm-row-actions">
                    <button className="adm-link" onClick={() => setEditing(it)}>Edit</button>
                    <button className="adm-link adm-link--danger" onClick={() => setToDelete(it)}>Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <ItemForm
          cfg={cfg}
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}

      {toDelete && (
        <div className="adm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && setToDelete(null)}>
          <div className="adm-card adm-card--narrow">
            <h2 className="adm-title adm-title--sm">Delete {cfg.singular}?</h2>
            <p className="adm-muted"><strong>{toDelete.title || toDelete.name}</strong> will be removed.</p>
            <div className="adm-actions">
              <button className="adm-btn" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function ItemForm({ cfg, item, onClose, onSave }) {
  const initial = item && cfg.toForm
    ? cfg.toForm(item)
    : item
      ? Object.fromEntries(cfg.fields.map((f) => [f.name, item[f.name] ?? (f.type === 'gallery' ? [] : '')]))
      : { ...emptyFor(cfg), coverFile: null, galleryFiles: [], deleteImageIds: [], imageFile: null }

  const [v, setV] = useState(initial)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [dynOptions, setDynOptions] = useState({})
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }))

  useEffect(() => {
    if (cfg.loadOptions) {
      cfg.loadOptions(api).then(setDynOptions).catch(() => {})
    }
  }, [cfg])

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    for (const f of cfg.fields) {
      if (f.required && !String(v[f.name] || '').trim()) errs[f.name] = `${f.label} is required`
    }
    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return
    setBusy(true)
    try {
      await onSave(v, item?.id)
    } catch (err) {
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Split fields: image/gallery go to the right panel; everything else left
  const useImageLayout = cfg.imageLayout === true
  const imageFieldTypes = new Set(['image', 'gallery'])
  const leftFields = useImageLayout ? cfg.fields.filter((f) => !imageFieldTypes.has(f.type)) : cfg.fields
  const rightFields = useImageLayout ? cfg.fields.filter((f) => imageFieldTypes.has(f.type)) : []

  const renderField = (f) => (
    <div key={f.name} className={!useImageLayout && f.wide ? 'adm-span' : ''}>
      <Field label={f.label} error={errors[f.name]}>
        {f.type === 'text' && <input value={v[f.name] || ''} onChange={set(f.name)} />}
        {f.type === 'textarea' && <textarea rows={f.rows || 3} value={v[f.name] || ''} onChange={set(f.name)} />}
        {f.type === 'select' && (
          <select value={v[f.name] || ''} onChange={set(f.name)}>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        )}
        {f.type === 'dynamic-select' && (
          <select value={v[f.name] || ''} onChange={set(f.name)}>
            <option value="">— Select —</option>
            {(dynOptions[f.optionsKey] || []).map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        {f.type === 'checkbox' && (
          <label className="adm-check">
            <input
              type="checkbox"
              checked={v[f.name] !== false}
              onChange={(e) => setV((s) => ({ ...s, [f.name]: e.target.checked }))}
            />
            <span>{f.checkboxLabel || 'Enabled'}</span>
          </label>
        )}
        {f.type === 'taglist' && (
          <TagListInput
            value={v[f.name] || []}
            placeholder={f.placeholder}
            onChange={(next) => setV((s) => ({ ...s, [f.name]: next }))}
          />
        )}
        {f.type === 'image' && (
          <SingleImageInput
            existingUrl={v[f.name] || ''}
            file={v.imageFile || v.coverFile || v.photoFile}
            onFileChange={(file) => {
              const fileKey = f.fileKey || (f.name === 'coverImage' ? 'coverFile' : 'imageFile')
              setV((s) => ({ ...s, [fileKey]: file }))
            }}
            tall={useImageLayout}
          />
        )}
        {f.type === 'gallery' && (
          <GalleryInput
            existingImages={v[f.name] || []}
            newFiles={v.galleryFiles || []}
            deleteIds={v.deleteImageIds || []}
            onAddFiles={(files) => setV((s) => ({ ...s, galleryFiles: [...(s.galleryFiles || []), ...files] }))}
            onRemoveNew={(idx) => setV((s) => {
              const updated = [...(s.galleryFiles || [])]
              URL.revokeObjectURL(updated[idx]._preview)
              updated.splice(idx, 1)
              return { ...s, galleryFiles: updated }
            })}
            onRemoveExisting={(imgId) => setV((s) => ({
              ...s,
              deleteImageIds: [...(s.deleteImageIds || []), imgId],
              [f.name]: (s[f.name] || []).filter((img) => img.id !== imgId),
            }))}
          />
        )}
      </Field>
      {f.hint && <p className="adm-hint">{f.hint}</p>}
    </div>
  )

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className={`adm-card adm-modal__box ${useImageLayout ? 'adm-modal__box--wide' : ''}`}
        onSubmit={submit}
        noValidate
      >
        <h2 className="adm-title adm-title--sm">{item ? `Edit ${cfg.singular}` : `Add ${cfg.singular}`}</h2>
        {formError && <div className="adm-alert">{formError}</div>}

        {useImageLayout ? (
          <div className="adm-form-split">
            {/* Left: metadata fields */}
            <div className="adm-form-split__left">
              <div className="adm-grid">
                {leftFields.map((f) => renderField(f))}
              </div>
            </div>
            {/* Right: image panel */}
            <div className="adm-form-split__right">
              <p className="adm-form-split__label">Media</p>
              {rightFields.map((f) => renderField(f))}
            </div>
          </div>
        ) : (
          <div className="adm-grid">
            {cfg.fields.map((f) => renderField(f))}
          </div>
        )}

        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={onClose}>Cancel</button>
          <button className="adm-btn adm-btn--primary" disabled={busy}>
            {busy ? 'Saving…' : item ? 'Save changes' : `Add ${cfg.singular}`}
          </button>
        </div>
      </form>
    </div>
  )
}

function SingleImageInput({ existingUrl, file, onFileChange, tall }) {
  const inputRef = useRef(null)
  const [localFile, setLocalFile] = useState(file || null)
  const previewUrl = localFile
    ? (localFile._preview || URL.createObjectURL(localFile))
    : existingUrl

  return (
    <div className={`adm-img-upload ${tall ? 'adm-img-upload--tall' : ''}`}>
      <div
        className={`adm-img-upload__zone ${previewUrl ? 'has-image' : ''}`}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="adm-img-upload__preview" />
        ) : (
          <div className="adm-img-upload__empty">
            <span className="adm-img-upload__icon">⬆</span>
            <span>Click to upload image</span>
            <span className="adm-muted" style={{ fontSize: '12px' }}>JPG, PNG, WEBP</span>
          </div>
        )}
      </div>
      <div className="adm-img-upload__bar">
        <button type="button" className="adm-btn" onClick={() => inputRef.current?.click()}>
          {previewUrl ? 'Change image' : 'Choose image'}
        </button>
        {(localFile || file) && (
          <span className="adm-muted" style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(localFile || file)?.name}
          </span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) {
            f._preview = URL.createObjectURL(f)
            setLocalFile(f)
            onFileChange(f)
          }
        }}
      />
    </div>
  )
}

function TagListInput({ value, onChange, placeholder }) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const label = draft.trim()
    if (!label || value.includes(label)) return setDraft('')
    onChange([...value, label])
    setDraft('')
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="adm-taglist">
          {value.map((label, i) => (
            <li key={label}>
              <span>{label}</span>
              <button
                type="button"
                aria-label={`Remove ${label}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >×</button>
            </li>
          ))}
        </ul>
      )}
      <div className="adm-taglist__add">
        <input
          value={draft}
          placeholder={placeholder || 'Add an item and press Enter'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <button type="button" className="adm-btn" onClick={add}>Add</button>
      </div>
    </div>
  )
}

function GalleryInput({ existingImages, newFiles, deleteIds, onAddFiles, onRemoveNew, onRemoveExisting }) {
  const inputRef = useRef(null)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((f) => { f._preview = URL.createObjectURL(f) })
    onAddFiles(files)
    e.target.value = ''
  }

  return (
    <div>
      <div className="adm-previews">
        {existingImages.map((img) => (
          <div key={img.id} className="adm-previews__item">
            <img src={img.url} alt={img.caption || ''} />
            <button type="button" aria-label="Remove image" onClick={() => onRemoveExisting(img.id)}>×</button>
          </div>
        ))}
        {newFiles.map((file, i) => (
          <div key={`new-${i}`} className="adm-previews__item">
            <img src={file._preview} alt={file.name} />
            <button type="button" aria-label="Remove image" onClick={() => onRemoveNew(i)}>×</button>
          </div>
        ))}
        <div
          className="adm-previews__add"
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          +
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />
    </div>
  )
}
