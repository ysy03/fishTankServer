'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /*await queryInterface.addColumn('waterquality','updated_at',{
      type:Sequelize.DATE,
      allowNull:false,
      defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
    })*/
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('waterquality','updated_at')
  }
};
