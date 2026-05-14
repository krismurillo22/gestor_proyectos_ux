'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Proyecto extends Model {
    static associate(models) {
      Proyecto.belongsTo(models.Cotizacion, {
        foreignKey: 'id_cotizacion',
        as: 'cotizacion',
      });
      Proyecto.hasOne(models.Evaluacion, {
        foreignKey: 'id_proyecto',
        as: 'evaluacion',
      });
    }
  }

  Proyecto.init(
    {
      id_proyecto: {
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
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      // Puede ser null si el proyecto aun no ha finalizado
      fecha_fin_real: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Estados sugeridos: 'en_progreso', 'completado', 'cancelado', 'vencido'
      estado: {
        type: DataTypes.ENUM('en_progreso', 'completado', 'cancelado', 'vencido'),
        allowNull: false,
        defaultValue: 'en_progreso',
      },
    },
    {
      sequelize,
      modelName: 'Proyecto',
      tableName: 'Proyectos',
      timestamps: false,
    }
  );

  return Proyecto;
};