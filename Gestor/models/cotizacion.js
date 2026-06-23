'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cotizacion extends Model {
    static associate(models) {
      Cotizacion.belongsTo(models.Solicitud, {
        foreignKey: 'id_solicitud',
        as: 'solicitud',
      });
      Cotizacion.belongsTo(models.Proveedor, {
        foreignKey: 'id_proveedor',
        as: 'proveedor',
      });
      Cotizacion.hasMany(models.DetalleCotizacion, {
        foreignKey: 'id_cotizacion',
        as: 'detalles',
      });
      Cotizacion.hasOne(models.Proyecto, {
        foreignKey: 'id_cotizacion',
        as: 'proyecto',
      });
    }
  }

  Cotizacion.init(
    {
      id_cotizacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_solicitud: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Solicitudes',
          key: 'id_solicitud',
        },
      },
      id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Proveedores',
          key: 'id_proveedor',
        },
      },
      total: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      // Estados sugeridos: 'pendiente', 'aprobada', 'rechazada'
      // Cambiar los valores del ENUM según lógica de negocio
      estado: {
        type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Marca la cotización elegida para enviar al cliente (solo una por solicitud).
      enviada_cliente: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Permite "descartar" una cotización en la vista de comparación sin borrarla.
      descartada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Cotizacion',
      tableName: 'Cotizaciones',
    }
  );

  return Cotizacion;
};
