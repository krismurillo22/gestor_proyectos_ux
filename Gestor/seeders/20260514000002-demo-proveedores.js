'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Proveedores', [
      {
        nombre: 'Materiales y Construcción Flores',
        rtn: '0501-1992-00321',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Suministros Industriales Aguilar',
        rtn: '0801-1998-00654',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Pinturas y Acabados Zelaya',
        rtn: '0101-2005-00987',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Electricidad Total Reyes',
        rtn: '0901-2003-01111',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Plomería Orellana',
        rtn: '0301-1999-01222',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Carpintería Fina Núñez',
        rtn: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Proveedores', null, {});
  },
};
