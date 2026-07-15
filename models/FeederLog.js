const { Model } = require("sequelize");


module.exports = (sequelize,DataTypes) =>{
    class Feederlog extends Model{
        static associate(db){
            db.Feederlog.belongsTo(db.Tank,{foreignKey:'device_id',targetKey:'device_id'})
        }
    }

    Feederlog.init({
        feederlog_id:{
            type:DataTypes.INTEGER,
            autoIncrement:true,
            primaryKey:true
        },
        device_id:{
            type:DataTypes.STRING
        },
        status:{
            type:DataTypes.BOOLEAN
        },
        feed_time:{
            type:DataTypes.DATE,
            defaultValue:DataTypes.NOW
        }
    },{
        sequelize,
        modelName:'Feederlog',
        tableName:'feederlog',
        timestamps:false
    })

    return Feederlog;
}