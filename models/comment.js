const {Model} = require('sequelize');


module.exports = (sequelize,DataTypes) =>{
    class Comment extends Model{
        static associate(db){
            db.Comment.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
            db.Comment.belongsTo(db.Post,{foreignKey:'post_id',targetKey:'post_id',onDelete: 'CASCADE'});
            db.Comment.hasMany(db.CommentLike,{foreignKey:'comment_id',sourceKey:'comment_id',onDelete: 'CASCADE'})
            db.Comment.hasMany(db.Comment,{as:'Replies',foreignKey:'parent_id'});
            db.Comment.belongsTo(db.Comment,{as:'Parent',foreignKey:'parent_id'})
        }
    }

    Comment.init(
        {
            comment_id:{
                type:DataTypes.INTEGER,
                autoIncrement:true,
                primaryKey:true
            },
            post_id:{
                type:DataTypes.INTEGER,
                allowNull:false,
                references:{
                    model:'post',
                    key:'post_id'
                }
            },
            user_id:{
                type:DataTypes.INTEGER,
                allowNull:false,
                references:{
                    model:'user',
                    key:'user_id'
                }
            },
            content:{
                type:DataTypes.TEXT,
                allowNull:false
            },
            parent_id:{
                type:DataTypes.INTEGER
            },
            is_deleted:{
                type:DataTypes.BOOLEAN,
                allowNull:false,
                defaultValue:false
            }
        },{
            sequelize,
            modelName:'Comment',
            tableName:'comment',
            createdAt:'created_at',
            updatedAt:'updated_at'
        } 
    )

    return Comment;
}
