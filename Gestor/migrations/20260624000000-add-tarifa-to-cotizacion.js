'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Cotizaciones', 'tarifa_intermediacion', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Cotizaciones', 'tarifa_porcentaje', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('Cotizaciones', 'tarifa_porcentaje');
    await queryInterface.removeColumn('Cotizaciones', 'tarifa_intermediacion');
  },
};