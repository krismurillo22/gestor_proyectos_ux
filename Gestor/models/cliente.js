'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cliente extends Model {
    static associate(models) {
      Cliente.hasMany(models.TelefonoCliente, {
        foreignKey: 'id_cliente',
        as: 'telefonos',
      });
      Cliente.hasMany(models.Solicitud, {
        foreignKey: 'id_cliente',
        as: 'solicitudes',
      });
    }
  }

  Cliente.init(
    {
      id_cliente: {
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
      modelName: 'Cliente',
      tableName: 'Clientes',
    }
  );

  return Cliente;
};