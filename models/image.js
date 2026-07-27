const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes) =>{
    class Image extends Model{
        static associate(db){
            db.Image.belongsTo(db.Post,{foreignKey:'post_id',targetKey:'post_id'})
        }
    }

    Image.init({
        Image_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        Image_url:{
            type:DataTypes.STRING
        },
        post_id:{
            type:DataTypes.INTEGER
        }
    },{
        sequelize,
        tableName:'image',
        modelName:'Image',
        timestamps:false
    })

    return Image
}