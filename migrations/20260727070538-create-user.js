'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user',{
      user_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true
      },
      nickname:{
        type:Sequelize.STRING,
        allowNull:true,
        unique:true
      },
      sns_id:{
        type:Sequelize.STRING,
        allowNull:false
      },
      provider:{
        type:Sequelize.ENUM('kakao','google'),
        allowNull:false
      },
      token:{
        type:Sequelize.STRING,
        allowNull:true
      }
  })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user');
  }
};
