'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('waterquality',{
      waterquality_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        allowNull:false,
        autoIncrement:true
      },
      user_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'user',
          key:'user_id'
        },
        onDelete:'CASCADE'
      },
      device_id:{
        type:Sequelize.STRING,
        references:{
          model:'tank',
          key:'device_id'
        },
        onDelete:'CASCADE'
      },
      water_quality:{
        type:Sequelize.INTEGER,
        allowNull:false
      },
      score:{
        type:Sequelize.ENUM('normal','warning','dangerous'),
        allowNull:false,
        defaultValue:'normal'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('waterquality');
  }
};
