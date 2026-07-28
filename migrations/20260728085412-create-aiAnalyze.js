'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ai_analyze',{
      analysis_id:{
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
      user_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'user',
          key:'user_id'
        },
        onDelete:'CASCADE'
      },
      activity:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      detections:{
        type:Sequelize.JSON,
        allowNull:false
      },
      analyzed_at:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('ai_analyze');
  }
};
