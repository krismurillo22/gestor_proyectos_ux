'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class DetalleCotizacion extends Model {
    static associate(models) {
      DetalleCotizacion.belongsTo(models.Cotizacion, {
        foreignKey: 'id_cotizacion',
        as: 'cotizacion',
      });
    }
  }

  DetalleCotizacion.init(
    {
      id_detalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_cotizacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Cotizaciones',
          key: 'id_cotizacion',
        },
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valor: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'DetalleCotizacion',
      tableName: 'DetalleCotizaciones',
    }
  );

  return DetalleCotizacion;
};