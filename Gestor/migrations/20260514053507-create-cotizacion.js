'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cotizaciones', {
      id_cotizacion: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_solicitud: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Solicitudes',
          key: 'id_solicitud',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      id_proveedor: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Proveedores',
          key: 'id_proveedor',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      total: {
        type: Sequelize.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada'),
        allowNull: false,
        defaultValue: 'pendiente',
      },
      descripcion: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('Cotizaciones');
  },
};