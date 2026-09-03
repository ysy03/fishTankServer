'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('alert','user_id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('alert','user_id',{
      type:Sequelize.INTEGER,
      references:{
        model:'user',
        key:'user_id'
      },
      allowNull:'false'
    })
  }
};
