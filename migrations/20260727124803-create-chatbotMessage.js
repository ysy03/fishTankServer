'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('chatbotmessage',{
      chatbotmessage_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
      },
      chatbotroom_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'chatbotroom',
          key:'chatbotroom_id'
        },
        onDelete:'CASCADE'
      },
      message:{
        type:Sequelize.TEXT,
        allowNull:false
      },
      role:{
        type:Sequelize.ENUM('model','user'),
        allowNull:false
      },
      created_at:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('chatbotmessage');
  }
};
