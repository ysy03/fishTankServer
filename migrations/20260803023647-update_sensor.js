'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sensor','count',{
      type:Sequelize.INTEGER,
      allowNull:false,
      defaultValue:0
    }),
    await queryInterface.addColumn('sensor','temp_sum',{
      type:Sequelize.DOUBLE,
      allowNull:false,
      defaultValue:0
    }),
    await queryInterface.addColumn('sensor','temp_avg',{
      type:Sequelize.DOUBLE,
      allowNull:true,
    }),
    await queryInterface.addColumn('sensor','score',{
      type:Sequelize.ENUM('normal','warning','dangerous'),
      allowNull:false,
      defaultValue:'normal'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sensor','count');
    await queryInterface.removeColumn('sensor','temp_sum');
    await queryInterface.removeColumn('sensor','temp_avg');
    await queryInterface.removeColumn('sensor','score');
  }
};
