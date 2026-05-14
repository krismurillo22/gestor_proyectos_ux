'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Evaluaciones', [
      {
        id_proyecto: 1,
        rating: 5,
        descripcion: 'Excelente trabajo, entregado antes de la fecha límite y con acabados impecables.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id_proyecto: 2,
        rating: 3,
        descripcion: 'Buen trabajo en general, aunque hubo retrasos en la entrega del tablero principal.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Evaluacions', null, {});
  },
};
