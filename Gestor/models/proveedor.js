'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Proveedor extends Model {
    static associate(models) {
      Proveedor.hasMany(models.TelefonoProveedor, {
        foreignKey: 'id_proveedor',
        as: 'telefonos',
      });
      Proveedor.hasMany(models.Cotizacion, {
        foreignKey: 'id_proveedor',
        as: 'cotizaciones',
      });
    }
  }

  Proveedor.init(
    {
      id_proveedor: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rtn: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Proveedor',
      tableName: 'Proveedores',
      timestamps: false,
    }
  );

  return Proveedor;
};