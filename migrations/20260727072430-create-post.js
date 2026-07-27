'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('post',{
    post_id:{
      type:Sequelize.INTEGER,
      autoIncrement:true,
      allowNull:false,
      primaryKey:true
    },
    user_id:{
      type:Sequelize.INTEGER,
      references:{
        model:'user',
        key:'user_id'
      },
      onDelete:'CASCADE'
    },
    title:{
      type:Sequelize.STRING,
      allowNull:false
    },
    fish_type:{
      type:Sequelize.STRING,
      allowNull:false
    },
    content:{
      type:Sequelize.TEXT,
      allowNull:false
    },
    created_at:{
      type:Sequelize.DATE,
      allowNull:true,
      defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at:{
      type:Sequelize.DATE,
      allowNull:true,
      defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
    }
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('post');
  }
};
