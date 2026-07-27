'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tank',{
      tank_id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
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
      tank_name:{
        type:Sequelize.STRING,
      },
      device_id:{
        type:Sequelize.STRING,
        allowNull:false,
        unique:true
      },
      created_at:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tank')
  }
};
