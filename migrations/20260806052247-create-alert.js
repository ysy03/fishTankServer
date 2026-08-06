'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('alert',{
      alert_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:true
      },
      user_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'user',
          key:'user_id'
        },
        allowNull:false,
        onDelete:'CASCADE'
      },
      device_id:{
        type:Sequelize.STRING,
        references:{
          model:'tank',
          key:'device_id'
        },
        allowNull:false,
        onDelete:'CASCADE'
      },
      type:{
        type:Sequelize.ENUM('temp','waterquality','feed','waterChange'),
        allowNull:false
      },
      status:{
        type:Sequelize.STRING,
        allowNull:false
      },
      detail:{
        type:Sequelize.JSON,
        allowNull:false
      },
      created_at:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('alert')
  }
};
