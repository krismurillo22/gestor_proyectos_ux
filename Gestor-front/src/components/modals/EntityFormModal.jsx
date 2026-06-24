import { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import './EntityFormModal.css';

/**
 * Modal genérico para crear un cliente o un proveedor/taller (los dos
 * comparten los mismos campos básicos de contacto).
 *
 * Todos los campos son obligatorios (nombre, RTN, contacto, correo,
 * teléfono y dirección): antes contacto/correo/teléfono/dirección se
 * mostraban como "(opcional)" pero en la práctica siempre se necesitan para
 * dar seguimiento al cliente/proveedor, así que ahora también se validan
 * para que no se puedan dejar vacíos (a pedido de Jorge, 2026-06-24).
 *
 * @param {{ kind: 'cliente' | 'proveedor', onClose: Function, onSave: Function }} props
 */
const REQUIRED_FIELDS = [
  { key: 'name', label: 'Nombre de la empresa' },
  { key: 'rtn', label: 'RTN' },
  { key: 'contact', label: 'Nombre de contacto' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'address', label: 'Dirección' },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="form-error-text">{message}</p>;
}

const RTN_PATTERN = /^\d{4}-\d{4}-\d{5}$/;

// El backend exige el RTN en formato hondureño 0000-0000-00000 (13 dígitos).
// Si no cumple exactamente ese patrón, responde 400. Por eso formateamos
// mientras el usuario escribe en vez de solo avisar después de enviar.
function formatRtn(rawValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 13);
  const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 13)];
  return parts.filter(Boolean).join('-');
}

export default function EntityFormModal({ kind, onClose, onSave, entity }) {
  const isEditing = Boolean(entity);
  const [name, setName] = useState(entity?.name ?? '');
  const [rtn, setRtn] = useState(entity?.rtn ?? '');
  const [contact, setContact] = useState(entity?.contact ?? '');
  const [email, setEmail] = useState(entity?.email ?? '');
  const [phone, setPhone] = useState(entity?.phone ?? '');
  const [address, setAddress] = useState(entity?.address ?? '');
  const [errors, setErrors] = useState({});

  const values = { name, rtn, contact, email, phone, address };

  function clearError(key) {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const next = {};
    REQUIRED_FIELDS.forEach(({ key, label }) => {
      if (!values[key].trim()) next[key] = `${label} es obligatorio.`;
    });
    if (!next.rtn && rtn.trim() && !RTN_PATTERN.test(rtn.trim())) {
      next.rtn = 'El RTN debe tener el formato 0000-0000-00000.';
    }
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    onSave({
      name: name.trim(),
      rtn: rtn.trim(),
      contact: contact.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <span className="modal-icon">
              <Building2 size={18} />
            </span>
            <h2 className="page-title">{isEditing ? (kind === 'cliente' ? 'Editar Cliente' : 'Editar Proveedor') : (kind === 'cliente' ? 'Nuevo Cliente' : 'Nuevo Proveedor')}</h2>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="entity-name">
                Nombre de la empresa
              </label>
              <input
                id="entity-name"
                className={`form-input${errors.name ? ' form-input-error' : ''}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearError('name');
                }}
                aria-invalid={Boolean(errors.name)}
                required
              />
              <FieldError message={errors.name} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entity-contact">
                Nombre de contacto
              </label>
              <input
                id="entity-contact"
                className={`form-input${errors.contact ? ' form-input-error' : ''}`}
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  clearError('contact');
                }}
                aria-invalid={Boolean(errors.contact)}
                required
              />
              <FieldError message={errors.contact} />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entity-rtn">
                RTN <span className="form-help">(formato 0000-0000-00000)</span>
              </label>
              <input
                id="entity-rtn"
                className={`form-input${errors.rtn ? ' form-input-error' : ''}`}
                value={rtn}
                onChange={(e) => {
                  setRtn(formatRtn(e.target.value));
                  clearError('rtn');
                }}
                placeholder="0801-1990-12345"
                maxLength={15}
                inputMode="numeric"
                aria-invalid={Boolean(errors.rtn)}
                required
              />
              <FieldError message={errors.rtn} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="entity-email">
                  Correo
                </label>
                <input
                  id="entity-email"
                  type="email"
                  className={`form-input${errors.email ? ' form-input-error' : ''}`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError('email');
                  }}
                  aria-invalid={Boolean(errors.email)}
                  required
                />
                <FieldError message={errors.email} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="entity-phone">
                  Teléfono
                </label>
                <input
                  id="entity-phone"
                  className={`form-input${errors.phone ? ' form-input-error' : ''}`}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    clearError('phone');
                  }}
                  aria-invalid={Boolean(errors.phone)}
                  required
                />
                <FieldError message={errors.phone} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entity-address">
                Dirección
              </label>
              <input
                id="entity-address"
                className={`form-input${errors.address ? ' form-input-error' : ''}`}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  clearError('address');
                }}
                aria-invalid={Boolean(errors.address)}
                required
              />
              <FieldError message={errors.address} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
