const {Model} = require('sequelize');


module.exports = (sequelize,DataTypes) =>{
    class Post extends Model{
        static associate(db){
            db.Post.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
            db.Post.hasMany(db.Comment,{foreignKey:'post_id',sourceKey:'post_id',onDelete: 'CASCADE'});
            db.Post.hasMany(db.Image,{foreignKey:'post_id',sourceKey:'post_id'});
        }
    }

    Post.init({
        post_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:'users',
                key:'user_id'
            }
        },
        title:{
            type:DataTypes.STRING,
            allowNull:false
        },
        fish_type:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        content:{
            type:DataTypes.TEXT,
            allowNull:false
        }
    },{
        sequelize,
        modelName:'Post',
        tableName:'post',
        createdAt:'created_at',
        updatedAt:'updated_at'
    })

    return Post;
}