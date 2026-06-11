'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Solicitudes', [
      {
        id_cliente: 1,
        descripcion: 'Remodelación completa de oficinas en el segundo piso',
        fecha: new Date('2026-01-10'),
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cliente: 2,
        descripcion: 'Instalación de sistema eléctrico para nueva bodega',
        fecha: new Date('2026-01-25'),
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cliente: 3,
        descripcion: 'Diseño e instalación de mobiliario para sala de conferencias',
        fecha: new Date('2026-02-05'),
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cliente: 4,
        descripcion: 'Pintura exterior e interior de edificio corporativo',
        fecha: new Date('2026-02-18'),
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cliente: 1,
        descripcion: 'Reparación del sistema de plomería en planta baja',
        fecha: new Date('2026-03-01'),
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_cliente: 5,
        descripcion: 'Construcción de muro perimetral y portón de acceso',
        fecha: new Date('2026-03-15'),
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Solicitudes', null, {});
  },
};