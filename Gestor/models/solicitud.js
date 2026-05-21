'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Solicitud extends Model {
    static associate(models) {
      Solicitud.belongsTo(models.Cliente, {
        foreignKey: 'id_cliente',
        as: 'cliente',
      });
      Solicitud.hasMany(models.Cotizacion, {
        foreignKey: 'id_solicitud',
        as: 'cotizaciones',
      });
    }
  }

  Solicitud.init(
    {
      id_solicitud: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Clientes',
          key: 'id_cliente',
        },
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Solicitud',
      tableName: 'Solicitudes',
    }
  );

  return Solicitud;
};