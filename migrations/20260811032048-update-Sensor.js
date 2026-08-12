'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('sensor','created_at',{
      type:Sequelize.DATE,
      allowNull:false,
      defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
    }),
    await queryInterface.removeColumn('sensor','updated_at');
    await queryInterface.removeColumn('sensor','count');
    await queryInterface.removeColumn('sensor','temp_sum');
    await queryInterface.removeColumn('sensor','temp_avg');
    await queryInterface.removeColumn('sensor','record_date');
    await queryInterface.removeColumn('sensor','user_id');

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('sensor', 'created_at');

    await queryInterface.addColumn('sensor', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('sensor', 'count', {
        type: Sequelize.INTEGER,
        allowNull: true,
    });

    await queryInterface.addColumn('sensor', 'temp_sum', {
        type: Sequelize.FLOAT,
        allowNull: true
    });

    await queryInterface.addColumn('sensor', 'temp_avg', {
        type: Sequelize.FLOAT,
        allowNull: true
    });

    await queryInterface.addColumn('sensor', 'record_date', {
        type: Sequelize.DATE,
        allowNull: true
    });
    await queryInterface.addColumn('sensor','user_id',{
      type:Sequelize.INTEGER,
      allowNull:false,
      references:{
        model:'user',
        key:'user_id'
      },
      onDelete:'CASCADE'
    })
}
};
