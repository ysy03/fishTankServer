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
      user_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'user',
          key:'user_id'
        },
        onDelete:'CASCADE'
      },
      min_temperature:{
        type:Sequelize.FLOAT,
        allowNull:false
      },
      max_temperature:{
        type:Sequelize.FLOAT,
        allowNull:false
      },
      avg_temperature:{
        type:Sequelize.FLOAT,
        allowNull:false
      },
      water_quality:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      daily:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('daily');
  }
};
