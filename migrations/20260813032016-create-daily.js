'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('daily',{
      daily_id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
      },
      device_id:{
        type:Sequelize.STRING,
        allowNull:false,
        references:{
          model:'tank',
          key:'device_id'
        },
        onDelete:'CASCADE'
      },
      temp_max:{
        type:Sequelize.DOUBLE,
        allowNull:false
      },
      temp_min:{
        type:Sequelize.DOUBLE,
        allowNull:false
      },
      temp_avg:{
        type:Sequelize.DOUBLE,
        allowNull:false
      },
      water_quality:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      created_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('daily');
  }
};
