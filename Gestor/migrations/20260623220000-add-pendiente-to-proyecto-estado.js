'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Postgres no permite agregar un valor a un ENUM existente con ALTER
    // COLUMN normal — hay que tocar el tipo directamente. El nombre del tipo
    // lo genera Sequelize como enum_<Tabla>_<columna> cuando no se le da un
    // nombre explícito (ver migrations/20260514053513-create-proyecto.js).
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_Proyectos_estado\" ADD VALUE IF NOT EXISTS 'pendiente';"
    );

    // Las órdenes de trabajo ahora nacen en 'pendiente' (antes 'en_progreso'
    // por default), para que coincidan con el kanban del front.
    await queryInterface.sequelize.query(
      'ALTER TABLE "Proyectos" ALTER COLUMN estado SET DEFAULT \'pendiente\';'
    );
  },

  async down(queryInterface, Sequelize) {
    // Postgres no permite quitar un valor de un ENUM directamente (haría
    // falta recrear el tipo y la columna). No se revierte el ADD VALUE aquí;
    // solo se regresa el default anterior.
    await queryInterface.sequelize.query(
      "ALTER TABLE \"Proyectos\" ALTER COLUMN estado SET DEFAULT 'en_progreso';"
    );
  },
};
