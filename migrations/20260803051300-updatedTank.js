'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tank','min_temp',{
      type:Sequelize.FLOAT,
      allowNull:true
    });
    await queryInterface.addColumn('tank','max_temp',{
      type:Sequelize.FLOAT,
      allowNull:true
    })
    await queryInterface.addColumn('tank','normal_waterquality',{
      type:Sequelize.INTEGER,
      allowNull:true
    })
    await queryInterface.addColumn('tank','warning_waterquality',{
      type:Sequelize.FLOAT,
      allowNull:true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tank','min_temp');
    await queryInterface.removeColumn('tank','max_temp');
    await queryInterface.removeColumn('tank','normmal_waterquality');
    await queryInterface.removeColumn('tank','warning_waterquality')
  }
};
