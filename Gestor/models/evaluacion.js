'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Evaluacion extends Model {
    static associate(models) {
      Evaluacion.belongsTo(models.Proyecto, {
        foreignKey: 'id_proyecto',
        as: 'proyecto',
      });
    }
  }

  Evaluacion.init(
    {
      // id_proyecto es PK y FK al mismo tiempo (relación 1:1)
      id_proyecto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Proyectos',
          key: 'id_proyecto',
        },
      },
      // Rating sugerido: 1 a 5 estrellitas y asi
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      descripcion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Evaluacion',
      tableName: 'Evaluaciones',
      timestamps: false,
    }
  );

  return Evaluacion;
};