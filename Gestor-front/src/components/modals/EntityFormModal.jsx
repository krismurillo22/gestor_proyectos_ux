import { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import './EntityFormModal.css';

/**
 * Modal genérico para crear un cliente o un proveedor/taller (los dos
 * comparten los mismos campos básicos de contacto).
 *
 * @param {{ kind: 'cliente' | 'proveedor', onClose: Function, onSave: Function }} props
 */
export default function EntityFormModal({ kind, onClose, onSave }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !contact) return;
    onSave({ name, contact, email, phone, address });
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
              <input id="entity-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entity-contact">
                Nombre de contacto
              </label>
              <input
                id="entity-contact"
                className="form-input"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="entity-email">
                  Correo
                </label>
                <input
                  id="entity-email"
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="entity-phone">
                  Teléfono
                </label>
                <input id="entity-phone" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="entity-address">
                Dirección
              </label>
              <input
                id="entity-address"
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
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
