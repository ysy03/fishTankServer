'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('waterquality','count');
    await queryInterface.removeColumn('waterquality','waterquality_sum');
    await queryInterface.removeColumn('waterquality','waterquality_avg');
    await queryInterface.removeColumn('waterquality','record_date');
    await queryInterface.removeColumn('waterquality','updated_at');
    await queryInterface.addColumn('waterquality','created_at',{
      type:Sequelize.DATE,
      allowNull:false,
      defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
    })
    await queryInterface.removeColumn('sensor','user_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
        'waterquality',
        'created_at'
    );

    await queryInterface.addColumn('waterquality', 'count', {
        type: Sequelize.INTEGER,
        allowNull: true
    });

    await queryInterface.addColumn('waterquality', 'waterquality_sum', {
        type: Sequelize.FLOAT,
        allowNull: true
    });

    await queryInterface.addColumn('waterquality', 'waterquality_avg', {
        type: Sequelize.FLOAT,
        allowNull: true
    });

    await queryInterface.addColumn('waterquality', 'record_date', {
        type: Sequelize.DATE,
        allowNull: true
    });

    await queryInterface.addColumn('waterquality', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
    await queryInterface.removeColumn('sensor','user_id');
}
};
