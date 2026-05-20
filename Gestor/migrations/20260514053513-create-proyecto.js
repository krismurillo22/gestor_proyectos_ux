'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Proyectos', {
      id_proyecto: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_cotizacion: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Cotizaciones',
          key: 'id_cotizacion',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      fecha_fin_real: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      estado: {
        type: Sequelize.ENUM('en_progreso', 'completado', 'cancelado', 'vencido'),
        allowNull: false,
        defaultValue: 'en_progreso',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Proyectos');
  },
};