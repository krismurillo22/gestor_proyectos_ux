'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Clientes', [
      { nombre: 'Constructora Hernández',
        rtn: '0501-1990-00123',
        createdAt: new Date(), 
        updatedAt: new Date() 
        },
      { nombre: 'Grupo Empresarial Torres S.A.', 
        rtn: '0801-2001-00456', 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { nombre: 'Diseños Interiores Medina', 
        rtn: '0101-1985-00789', 
        createdAt: new Date(), 
        updatedAt: new Date()
      },
      { nombre: 'Tecnología y Soluciones Rivera',
        rtn: '0901-2010-01012', 
        createdAt: new Date(), 
        updatedAt: new Date() 
        },
      { nombre: 'Inmobiliaria López', 
        rtn: '0301-1995-01345',
        createdAt: new Date(), 
        updatedAt: new Date() 
        },
      { nombre: 'Servicios Generales Paz',
        rtn: null,
        createdAt: new Date(), 
        updatedAt: new Date() },
    ]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Clientes', null, {});
  },
};
