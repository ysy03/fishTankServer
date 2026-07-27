'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('userimage',{
      Image_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:true
      },
      Image_url:{
        type:Sequelize.STRING,
        allowNull:true,
        unique:true
      },
      user_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'user',
          key:'user_id'
        },
        onDelete:'CASCADE'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('userimage')
  }
};
