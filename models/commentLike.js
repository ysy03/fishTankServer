const {Model} = require('sequelize');


module.exports = (sequelize,DataTypes) =>{
    class CommentLike extends Model{
        static associate(db){
            db.CommentLike.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
            db.CommentLike.belongsTo(db.Comment,{foreignKey:'comment_id',targetKey:'comment_id',onDelete: 'CASCADE'})
        }
    }
    CommentLike.init({
        commentlike_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        user_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'user',
                key:'user_id'
            }
        },
        comment_id:{
            type:DataTypes.INTEGER,
            references:{
                model:'comment',
                key:'comment_id'
            }
        }
    },{
            sequelize,
            modelName:'CommentLike',
            tableName:'commentlike',
            timestamps:false
        })

    return CommentLike;
}