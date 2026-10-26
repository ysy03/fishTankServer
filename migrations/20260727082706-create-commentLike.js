'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('commentlike',{
      commentlike_id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
      },
      user_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'user',
          key:'user_id'
        },
        onDelete:'CASCADE'
      },
      comment_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'comment',
          key:'comment_id'
        },
        onDelete:'CASCADE'
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('commentlike');
     
  }
};
