'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('fishinfo',{
      fish_id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
      },
      fish_type:{
        type:Sequelize.STRING,
        allowNull:false
      },
      fish_count:{
        type:Sequelize.INTEGER,
        allowNull:false
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
    await queryInterface.dropTable('fishinfo')
  }
};
