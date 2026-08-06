'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sensor','score');
    await queryInterface.removeColumn('waterquality','score');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('sensor','score',{
      type:Sequelize.ENUM('normal','warning','dangerous'),
      allowNull:false,
      defaultValue:'normal'
    });
    await queryInterface.addColumn('waterquality','score',{
      type:Sequelize.ENUM('normal','warning','dangerous'),
      allowNull:false,
      defaultValue:'normal'
    });
  }
};
