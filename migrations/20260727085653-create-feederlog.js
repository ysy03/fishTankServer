'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('feederlog',{
      feederlog_id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
      },
      device_id:{
        type:Sequelize.STRING,
        references:{
          model:'tank',
          key:'device_id'
        },
        allowNull:false
      },
      status:{
        type:Sequelize.BOOLEAN,
      },
      feed_time:{
        type:Sequelize.DATE,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('feederlog');
  }
};
