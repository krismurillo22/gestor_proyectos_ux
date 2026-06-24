import { useEffect, useState } from 'react';
import { X, FileText, Trash2, Plus } from 'lucide-react';
import { getSuppliers } from '../../services/suppliersService';
import './AddQuoteModal.css';

const emptyItem = () => ({ title: '', description: '', quantity: 1, unitPrice: '' });

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Impuesto Sobre Ventas (Honduras) — se cobra sobre el subtotal + tarifa de
// intermediación, igual que en el Word de la cotización (ver utils/quoteDocx.js).
const TAX_RATE = 0.15;

function FieldError({ message }) {
  if (!message) return null;
  return <p className="form-error-text">{message}</p>;
}

/**
 * Modal para registrar la cotización de UN proveedor dentro de una solicitud.
 * Se puede usar varias veces sobre la misma solicitud (una vez por cada
 * proveedor que cotice), para después comparar precios antes de elegir cuál
 * mandar al cliente.
 *
 * Cada línea tiene un título corto (qué es) y una descripción más larga
 * (detalle del trabajo) — ambos se usan en la tarjeta de comparación y en el
 * Word de la cotización (ver utils/quoteDocx.js).
 *
 * Además del subtotal de líneas, se calcula la "Tarifa de Intermediación y
 * Garantía de Servicio" que la empresa cobra encima de lo que cotiza el
 * proveedor: se puede capturar como un valor fijo o como un porcentaje del
 * subtotal, y el otro campo se recalcula solo (ver onChangeFeeValue/Percent).
 *
 * Validación (ver validate()): proveedor, título y descripción de cada línea
 * son obligatorios; cantidad, precio unitario y la tarifa de intermediación
 * deben ser mayores a 0 — no se permiten vacíos, negativos ni en 0. Además
 * cantidad debe ser un número entero (no se permiten decimales).
 *
 * Sobre el subtotal + tarifa de intermediación se calcula el Impuesto Sobre
 * Ventas (ISV) del 15% (TAX_RATE), igual que en el Word descargable.
 *
 * onSave recibe { supplierId, supplier, items, notes, intermediationFee,
 * subtotal, tax, total }.
 */
export default function AddQuoteModal({ onClose, onSave }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Los proveedores se piden al backend al abrir el modal (antes venían de
  // un mock estático) porque el backend necesita el id numérico real del
  // proveedor para crear la cotización.
  useEffect(() => {
    getSuppliers().then((data) => {
      setSuppliers(data);
      setLoadingSuppliers(false);
    });
  }, []);

  // 'value' o 'percent': cuál de los dos campos de la tarifa fue el último
  // que el usuario editó a mano. El otro se recalcula a partir de ese cada
  // vez que cambia el subtotal (p. ej. si agrega una línea después de fijar
  // la tarifa), para no perder lo que sí escribió a propósito.
  const [feeMode, setFeeMode] = useState('value');
  const [feeValue, setFeeValue] = useState('');
  const [feePercent, setFeePercent] = useState('');

  const subtotal = items.reduce((sum, it) => sum + Number(it.quantity || 0) * Number(it.unitPrice || 0), 0);
  const taxBase = subtotal + Number(feeValue || 0);
  const tax = taxBase * TAX_RATE;
  const total = taxBase + tax;

  useEffect(() => {
    if (feeMode === 'percent') {
      setFeeValue(round2((feePercent / 100) * subtotal));
    } else {
      setFeePercent(subtotal > 0 ? round2((feeValue / subtotal) * 100) : 0);
    }
    // Solo cuando cambia el subtotal (líneas), no en cada tecla de los campos
    // de tarifa — esos ya se actualizan directo en sus propios onChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
    setErrors((prev) => {
      if (!prev.items?.[index]?.[field]) return prev;
      const nextItems = prev.items.map((err, i) => (i === index ? { ...err, [field]: undefined } : err));
      return { ...prev, items: nextItems };
    });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
    setErrors((prev) => (prev.items ? { ...prev, items: [...prev.items, {}] } : prev));
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => (prev.items ? { ...prev, items: prev.items.filter((_, i) => i !== index) } : prev));
  }

  function onChangeFeeValue(value) {
    setFeeMode('value');
    setFeeValue(value);
    const numValue = Number(value) || 0;
    setFeePercent(value === '' ? '' : subtotal > 0 ? round2((numValue / subtotal) * 100) : 0);
    if (errors.feeValue) setErrors((prev) => ({ ...prev, feeValue: undefined }));
  }

  function onChangeFeePercent(value) {
    // Limpiar ceros iniciales (ej. "015" -> "15") excepto cuando el campo está vacío
    const clean = value === '' ? '' : String(Number(value) || 0);
    setFeeMode('percent');
    setFeePercent(clean);
    const numPercent = Number(clean) || 0;
    setFeeValue(clean === '' ? '' : round2((numPercent / 100) * subtotal));
    if (errors.feeValue) setErrors((prev) => ({ ...prev, feeValue: undefined }));
  }

  // Proveedor, título y descripción de cada línea no pueden quedar vacíos;
  // cantidad, precio unitario y la tarifa de intermediación tienen que ser
  // mayores a 0 (ni vacíos, ni negativos, ni en 0).
  function validate() {
    const next = {};
    if (!supplierId) next.supplier = 'Selecciona un proveedor.';

    const itemErrors = items.map((item) => {
      const err = {};
      if (!item.title.trim()) err.title = 'El título es obligatorio.';
      if (!item.description.trim()) err.description = 'La descripción es obligatoria.';
      if (!(Number(item.quantity) > 0)) err.quantity = 'Debe ser mayor a 0.';
      else if (!Number.isInteger(Number(item.quantity))) err.quantity = 'Debe ser un número entero (sin decimales).';
      if (!(Number(item.unitPrice) > 0)) err.unitPrice = 'Debe ser mayor a 0.';
      return err;
    });
    if (itemErrors.some((err) => Object.keys(err).length > 0)) next.items = itemErrors;

    if (!(Number(feeValue) > 0)) next.feeValue = 'La tarifa de intermediación debe ser mayor a 0.';

    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const supplier = suppliers.find((s) => String(s.id) === String(supplierId));
    if (!supplier) return;
    onSave({
      supplierId: supplier.id,
      supplier: supplier.name,
      items,
      notes,
      intermediationFee: { value: round2(feeValue), percent: round2(feePercent) },
      subtotal: round2(subtotal),
      tax: round2(tax),
      total: round2(total),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <FileText size={18} />
            </span>
            <h2 className="page-title">Agregar Cotización de Proveedor</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="aq-supplier">
                Proveedor
              </label>
              <select
                id="aq-supplier"
                className={`form-select${errors.supplier ? ' form-select-error' : ''}`}
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  if (errors.supplier) setErrors((prev) => ({ ...prev, supplier: undefined }));
                }}
                aria-invalid={Boolean(errors.supplier)}
                disabled={loadingSuppliers}
                required
              >
                <option value="">{loadingSuppliers ? 'Cargando proveedores…' : 'Selecciona un proveedor…'}</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.supplier} />
            </div>

            <div className="quote-items">
              {items.map((item, index) => {
                const lineSubtotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
                return (
                  <div key={index} className="quote-item-card">
                    <div className="quote-item-card-header">
                      <input
                        className={`form-input${errors.items?.[index]?.title ? ' form-input-error' : ''}`}
                        value={item.title}
                        onChange={(e) => updateItem(index, 'title', e.target.value)}
                        placeholder="Título de la pieza/servicio"
                        aria-invalid={Boolean(errors.items?.[index]?.title)}
                        required
                      />
                      <button
                        type="button"
                        className="btn-icon-danger"
                        onClick={() => removeItem(index)}
                        title="Quitar línea"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <FieldError message={errors.items?.[index]?.title} />

                    <textarea
                      className={`form-textarea quote-item-description${errors.items?.[index]?.description ? ' form-textarea-error' : ''}`}
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Descripción detallada del trabajo a realizar…"
                      aria-invalid={Boolean(errors.items?.[index]?.description)}
                      required
                    />
                    <FieldError message={errors.items?.[index]?.description} />

                    <div className="quote-item-card-footer">
                      <div className="quote-item-field">
                        <label className="form-help">Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className={`form-input${errors.items?.[index]?.quantity ? ' form-input-error' : ''}`}
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value === '' ? '' : Math.round(Number(e.target.value) || 0))}
                          aria-invalid={Boolean(errors.items?.[index]?.quantity)}
                          required
                        />
                        <FieldError message={errors.items?.[index]?.quantity} />
                      </div>
                      <div className="quote-item-field">
                        <label className="form-help">Precio unitario</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className={`form-input${errors.items?.[index]?.unitPrice ? ' form-input-error' : ''}`}
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', e.target.value === '' ? '' : e.target.value)}
                          aria-invalid={Boolean(errors.items?.[index]?.unitPrice)}
                          required
                        />
                        <FieldError message={errors.items?.[index]?.unitPrice} />
                      </div>
                      <div className="quote-item-field quote-item-subtotal">
                        <label className="form-help">Subtotal</label>
                        <p className="cell-strong">${lineSubtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className="btn btn-secondary" onClick={addItem} style={{ marginTop: '0.75rem' }}>
              <Plus size={16} /> Agregar línea
            </button>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label" htmlFor="aq-notes">
                Notas
              </label>
              <textarea
                id="aq-notes"
                className="form-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condiciones, plazos de entrega, observaciones del proveedor…"
              />
            </div>

            <div className="quote-fee-panel">
              <h3 className="section-title quote-fee-title">Tarifa de Intermediación y Garantía de Servicio</h3>
              <div className="quote-fee-row">
                <div className="form-group quote-fee-field">
                  <label className="form-label" htmlFor="aq-fee-value">
                    Valor
                  </label>
                  <input
                    id="aq-fee-value"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={`form-input${errors.feeValue ? ' form-input-error' : ''}`}
                    value={feeValue}
                    onChange={(e) => onChangeFeeValue(e.target.value)}
                    aria-invalid={Boolean(errors.feeValue)}
                    required
                  />
                  <FieldError message={errors.feeValue} />
                </div>
                <div className="form-group quote-fee-field">
                  <label className="form-label" htmlFor="aq-fee-percent">
                    Porcentaje
                  </label>
                  <div className="quote-fee-percent-input">
                    <input
                      id="aq-fee-percent"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={`form-input${errors.feeValue ? ' form-input-error' : ''}`}
                      value={feePercent}
                      onChange={(e) => onChangeFeePercent(e.target.value)}
                      aria-invalid={Boolean(errors.feeValue)}
                      required
                    />
                    <span className="quote-fee-percent-sign">%</span>
                  </div>
                </div>
              </div>
              <p className="form-help">Se calcula automáticamente sobre el subtotal de los artículos de arriba.</p>
            </div>

            <div className="quote-totals-breakdown">
              <div className="quote-totals-line">
                <span className="muted">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="quote-totals-line">
                <span className="muted">Tarifa de intermediación{feePercent ? ` (${feePercent}%)` : ''}</span>
                <span>${Number(feeValue || 0).toFixed(2)}</span>
              </div>
              <div className="quote-totals-line">
                <span className="muted">ISV (15%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="quote-total-row">
                <span className="muted">Total</span>
                <span className="quote-total-value">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Cotización
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
