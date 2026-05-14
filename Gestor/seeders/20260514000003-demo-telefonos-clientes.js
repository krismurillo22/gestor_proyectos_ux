'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TelefonoClientes', [
      {
        telefono: '9901-2345',
        id_cliente: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '2234-5678',
        id_cliente: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '9812-3456',
        id_cliente: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '9723-4567',
        id_cliente: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '2345-6789',
        id_cliente: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '9634-5678',
        id_cliente: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TelefonoClientes', null, {});
  },
};
