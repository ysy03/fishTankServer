'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /*await queryInterface.addColumn('waterquality','record_date',{
      type:Sequelize.DATEONLY,
      allowNull:true,
    });
    await queryInterface.addColumn('waterquality','count',{
      type:Sequelize.INTEGER,
      allowNull:false,
      defaultValue:0
    });
    await queryInterface.addColumn('waterquality','waterquality_sum',{
      type:Sequelize.INTEGER,
      allowNull:false,
      defaultValue:0
    })
    await queryInterface.addColumn('waterquality','waterquality_avg',{
      type:Sequelize.DOUBLE,
      allowNull:true
    })*/
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('waterquality','record_date');
    await queryInterface.removeColumn('waterquality','count');
    await queryInterface.removeColumn('waterquality','waterquality_sum')
  }
};
