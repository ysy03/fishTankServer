'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('image',{
      Image_id:{
        type:Sequelize.INTEGER,
        allowNull:true,
        primaryKey:true,
        autoIncrement:true
      },
      Image_url:{
        type:Sequelize.STRING,
        allowNull:true,
        unique:true
      },
      post_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'post',
          key:'post_id'
        },
        onDelete:'CASCADE'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('image')
  }
};
