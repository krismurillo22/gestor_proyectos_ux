'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TelefonoProveedor extends Model {
    static associate(models) {
      TelefonoProveedor.belongsTo(models.Proveedor, {
        foreignKey: 'id_proveedor',
        as: 'proveedor',
      });
    }
  }

  TelefonoProveedor.init(
    {
      telefono: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      id_proveedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Proveedores',
          key: 'id_proveedor',
        },
      },
    },
    {
      sequelize,
      modelName: 'TelefonoProveedor',
      tableName: 'TelefonoProveedores',
    }
  );

  return TelefonoProveedor;
};