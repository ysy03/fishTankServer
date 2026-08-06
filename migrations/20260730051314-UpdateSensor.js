'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sensor','record_date',{
      type:Sequelize.DATE,
      allowNull:false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.addColumn('sensor','max_temperature',{
      type:Sequelize.FLOAT,
      allowNull:true
    });
    await queryInterface.addColumn('sensor','max_temperature_at',{
      type:Sequelize.DATE,
      allowNull:true
    });
    await queryInterface.addColumn('sensor','min_temperature',{
      type:Sequelize.FLOAT,
      allowNull:true
    });
    await queryInterface.addColumn('sensor','min_temperature_at',{
      type:Sequelize.DATE,
      allowNull:true
    });
    await queryInterface.addColumn('sensor','updated_at',{
      type: Sequelize.DATE
    });
    await queryInterface.removeColumn('sensor','water_quality');
    await queryInterface.removeColumn('sensor','measured_at')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('sensor','record_date');
    await queryInterface.removeColumn('sensor','max_temperature');
    await queryInterface.removeColumn('sensor','max_temperature_at');
    await queryInterface.removeColumn('sensor','min_temperature');
    await queryInterface.removeColumn('sensor','min_temperature_at');
    await queryInterface.removeColumn('sensor','updated_at');

    await queryInterface.addColumn('sensor','water_quality',{
        type: Sequelize.FLOAT,
        allowNull: true
    });

    await queryInterface.addColumn('sensor','measured_at',{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  }
};
