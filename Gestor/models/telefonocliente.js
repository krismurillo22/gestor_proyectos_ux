'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class TelefonoCliente extends Model {
    static associate(models) {
      TelefonoCliente.belongsTo(models.Cliente, {
        foreignKey: 'id_cliente',
        as: 'cliente',
      });
    }
  }

  TelefonoCliente.init(
    {
      telefono: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'Clientes',
          key: 'id_cliente',
        },
      },
    },
    {
      sequelize,
      modelName: 'TelefonoCliente',
      tableName: 'Telefonos_Clientes',
      timestamps: false,
    }
  );

  return TelefonoCliente;
};