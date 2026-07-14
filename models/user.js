const {Model} = require('sequelize');



module.exports = (sequelize,DataTypes) =>{
    class User extends Model{
        static associate(db){
            db.User.hasMany(db.Fishinfo,{foreignKey:'user_id',sourceKey:'user_id'})
            db.User.hasMany(db.Post,{foreignKey:'user_id',sourceKey:'user_id'});
            db.User.hasMany(db.Comment,{foreignKey:'user_id',sourceKey:'user_id'});
            db.User.hasMany(db.CommentLike,{foreignKey:'user_id',sourceKey:'user_id'});
        }
    }

    User.init(
        {
            user_id:{
                type:DataTypes.INTEGER,
                primaryKey:true,
                autoIncrement:true
            }
            ,
            nickname:{
                type:DataTypes.STRING,
                allowNull:false,
                unique:true
            },
            provider:{
                type:DataTypes.ENUM('kakao','google')
            },
            sns_id:{
                type:DataTypes.STRING,
                allowNull:false
            },
            token:{
                type:DataTypes.TEXT
            }
        },{
            sequelize,
            modelName:'User',
            tableName:'user',
            createdAt:'created_at',
            updatedAt:false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        }
    )

    return User;
}

