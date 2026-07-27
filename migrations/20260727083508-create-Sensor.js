'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('sensor',{
      sensor_id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
      },
      device_id:{
        type:Sequelize.STRING,
        allowNull:true,
        references:{
          model:'tank',
          key:'device_id'
        },
        onDelete:'SET NULL'
      },
      user_id:{
        type:Sequelize.INTEGER,
        allowNull:true,
        references:{
          model:'user',
          key:'user_id'
        }
      },
      temperature:{
        type:Sequelize.FLOAT,
        allowNull:false
      },
      water_quality:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      measured_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('sensor')
  }
};
