const { Model } = require("sequelize");



module.exports = (sequelize,DataTypes)=>{
    class Sensor extends Model{
        static associate(db){
            
            db.Sensor.belongsTo(db.User,{foreignKey:'user_id',targetKey:'user_id'});
        }
    }
    
    Sensor.init({
        sensor_id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        device_id:{
            type:DataTypes.STRING,
            allowNull:false
        },
        user_id:{
            type:DataTypes.INTEGER,
        },
        temperature:{
            type:DataTypes.FLOAT
        },
        water_quality:{
            type:DataTypes.INTEGER
        },
        measured_at:{
            type:DataTypes.DATE,
            defaultValue:DataTypes.NOW
        }
    },{
        sequelize,
        modelName:'Sensor',
        tableName:'sensor',
        timestamps:false
    })
    
    return Sensor;

}