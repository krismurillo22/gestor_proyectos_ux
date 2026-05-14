'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('TelefonoProveedores', [
      {
        telefono: '9545-1234',
        id_proveedor: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '2256-7890',
        id_proveedor: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '9456-2345',
        id_proveedor: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '9367-3456',
        id_proveedor: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '2378-9012',
        id_proveedor: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        telefono: '9278-4567',
        id_proveedor: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('TelefonoProveedores', null, {});
  },
};
