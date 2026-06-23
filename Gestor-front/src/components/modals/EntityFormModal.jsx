import { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import './EntityFormModal.css';

/**
 * Modal genérico para crear un cliente o un proveedor/taller (los dos
 * comparten los mismos campos básicos de contacto).
 *
 * NOTA backend: los modelos Cliente/Proveedor hoy solo tienen
 * nombre + rtn + activo, y el teléfono es una lista aparte
 * (TelefonoCliente/TelefonoProveedor, varios por cliente) — no existen
 * contacto/email/dirección todavía. Se dejan esos campos en el form porque
 * son información real que la empresa necesita, pero falta agregarlos al
 * modelo (y decidir si el teléfono pasa a ser una lista) antes de conectar
 * esto de verdad. RTN sí existe en el backend.
 *
 * @param {{ kind: 'cliente' | 'proveedor', onClose: Function, onSave: Function }} props
 */
const REQUIRED_FIELDS = [
  { key: 'name', label: 'Nombre de la empresa' },
  { key: 'contact', label: 'Nombre de contacto' },
  { key: 'rtn', label: 'RTN' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'address', label: 'Dirección' },
];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="form-error-text">{message}</p>;
}

export default function EntityFormModal({ kind, onClose, onSave }) {
  const [name, setName] = useState('');
  const [rtn, setRtn] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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
            <h2 className="page-title">{kind === 'cliente' ? 'Nuevo Cliente' : 'Nuevo Proveedor'}</h2>
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
                RTN
              </label>
              <input
                id="entity-rtn"
                className={`form-input${errors.rtn ? ' form-input-error' : ''}`}
                value={rtn}
                onChange={(e) => {
                  setRtn(e.target.value);
                  clearError('rtn');
                }}
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
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
