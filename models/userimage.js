const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes)=>{
    class UserImage extends Model{
        static associate(db){
            db.UserImage.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'})
        }
    }
    UserImage.init({
        Image_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        Image_url:{
            type:DataTypes.STRING
        },
        user_id:{
            type:DataTypes.INTEGER
        }
    },{
        sequelize,
        modelName:'UserImage',
        tableName:'userimage',
        timestamps:false
    })

    return UserImage;
}