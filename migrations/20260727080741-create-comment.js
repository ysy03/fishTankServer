'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('comment',{
      comment_id:{
        type:Sequelize.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
      },
      post_id:{
        type:Sequelize.INTEGER,
        allowNull:false,
        references:{
          model:'post',
          key:'post_id'
        },
        onDelete:'CASCADE'
      },
      user_id:{
        type:Sequelize.INTEGER,
        allowNull:true,
        references:{
          model:'user',
          key:'user_id'
        },
        onDelete:'CASCADE'
      },
      content:{
        type:Sequelize.TEXT,
        allowNull:true
      },
      parent_id:{
        type:Sequelize.INTEGER,
        references:{
          model:'comment',
          key:'comment_id'
        }
      },
      is_deleted:{
        type:Sequelize.BOOLEAN,
        allowNull:false,
        defaultValue:false
      },
      created_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at:{
        type:Sequelize.DATE,
        allowNull:false,
        defaultValue:Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('comment');
  }
};
