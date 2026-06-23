'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Clientes', 'contacto', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clientes', 'correo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clientes', 'telefono', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Clientes', 'direccion', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Proveedores', 'contacto', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Proveedores', 'correo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Proveedores', 'telefono', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Proveedores', 'direccion', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Proveedores', 'direccion');
    await queryInterface.removeColumn('Proveedores', 'telefono');
    await queryInterface.removeColumn('Proveedores', 'correo');
    await queryInterface.removeColumn('Proveedores', 'contacto');

    await queryInterface.removeColumn('Clientes', 'direccion');
    await queryInterface.removeColumn('Clientes', 'telefono');
    await queryInterface.removeColumn('Clientes', 'correo');
    await queryInterface.removeColumn('Clientes', 'contacto');
  },
};
