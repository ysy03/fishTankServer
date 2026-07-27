'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('waterchangelog',{
      waterchangelog_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
      },
      device_id:{
        type:Sequelize.STRING,
        references:{
          model:'tank',
          key:'device_id'
        },
        onDelete:'CASCADE'
      },
      status:{
        type:Sequelize.BOOLEAN
      },
      started_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ended_at:{
        type:Sequelize.DATE,
        allowNull:true,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('waterchangelog');
  }
};
